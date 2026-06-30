import { prisma } from "@/lib/db";

interface RecordDonationInput {
  donorId: string; // The ID of the DonorProfile
  bloodBankId?: string;
  donationDate?: Date;
  units?: number;
  status?: string;
  notes?: string;
}

export async function recordDonation(input: RecordDonationInput) {
  const donationDate = input.donationDate ? new Date(input.donationDate) : new Date();
  const units = input.units ?? 1;
  const status = input.status ?? "COMPLETED";

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch the donor profile with related badges and rewards
    const donor = await tx.donorProfile.findUnique({
      where: { id: input.donorId },
      include: {
        badges: true,
        userRewards: true,
      },
    });

    if (!donor) {
      throw new Error(`Donor profile not found for ID: ${input.donorId}`);
    }

    // 2. Validate eligibility
    if (donor.nextEligibleDate && donationDate < donor.nextEligibleDate) {
      const formatDate = donor.nextEligibleDate.toLocaleDateString();
      throw new Error(
        `Donor is not eligible to donate yet. Next eligible date is ${formatDate}.`
      );
    }

    // Ensure donationDate is not before the last donation date
    if (donor.lastDonationDate && donationDate < donor.lastDonationDate) {
      throw new Error("Donation date cannot be earlier than the last donation date.");
    }

    // 3. Calculate streak
    let currentStreak = 1;
    if (donor.lastDonationDate) {
      const diffTime = donationDate.getTime() - donor.lastDonationDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 56) {
        throw new Error("Must wait at least 56 days between donations.");
      }

      // If donation is within 56 to 90 days, increment the streak
      if (diffDays >= 56 && diffDays <= 90) {
        currentStreak = donor.currentStreak + 1;
      } else {
        // Reset streak to 1 if they waited longer than 90 days
        currentStreak = 1;
      }
    }

    const longestStreak = Math.max(currentStreak, donor.longestStreak);

    // 4. Calculate donation statistics
    const totalDonations = donor.totalDonations + 1;
    const livesImpacted = donor.livesImpacted + (units * 3);
    const nextEligibleDate = new Date(donationDate.getTime() + 56 * 24 * 60 * 60 * 1000);

    // 5. Create donation history record
    const donation = await tx.donationHistory.create({
      data: {
        donorId: donor.id,
        bloodBankId: input.bloodBankId || null,
        donationDate,
        bloodType: donor.bloodGroup,
        units,
        status,
      },
    });

    // 6. Check and unlock badges
    const allBadges = await tx.badge.findMany();
    const earnedBadgeIds = new Set(donor.badges.map((b) => b.id));
    const badgesToUnlock = allBadges.filter((badge) => {
      if (earnedBadgeIds.has(badge.id)) return false;

      if (badge.requirementType === "DONATIONS_COUNT") {
        return totalDonations >= badge.requirementValue;
      }
      if (badge.requirementType === "STREAK_COUNT") {
        return currentStreak >= badge.requirementValue;
      }
      return false;
    });

    // 7. Check and unlock rewards
    const allRewards = await tx.reward.findMany();
    const earnedRewardIds = new Set(donor.userRewards.map((ur) => ur.rewardId));
    const rewardsToUnlock = [];

    const coffeeReward = allRewards.find((r) => r.code === "COFFEE100");
    const movieReward = allRewards.find((r) => r.code === "MOVIE250");
    const tshirtReward = allRewards.find((r) => r.code === "TSHIRT500");

    if (totalDonations >= 1 && coffeeReward && !earnedRewardIds.has(coffeeReward.id)) {
      rewardsToUnlock.push(coffeeReward);
    }
    if (totalDonations >= 5 && movieReward && !earnedRewardIds.has(movieReward.id)) {
      rewardsToUnlock.push(movieReward);
    }
    if (totalDonations >= 10 && tshirtReward && !earnedRewardIds.has(tshirtReward.id)) {
      rewardsToUnlock.push(tshirtReward);
    }

    // 8. Update donor profile and connect unlocked badges
    await tx.donorProfile.update({
      where: { id: donor.id },
      data: {
        totalDonations,
        livesImpacted,
        lastDonationDate: donationDate,
        nextEligibleDate,
        currentStreak,
        longestStreak,
        badges: {
          connect: badgesToUnlock.map((b) => ({ id: b.id })),
        },
      },
    });

    // 9. Create user rewards for unlocked items
    if (rewardsToUnlock.length > 0) {
      await Promise.all(
        rewardsToUnlock.map((reward) =>
          tx.userReward.create({
            data: {
              donorId: donor.id,
              rewardId: reward.id,
              status: "REDEEMED",
            },
          })
        )
      );
    }

    // 10. Increase inventory for the donor's blood group (if blood bank is linked)
    if (input.bloodBankId) {
      await tx.inventory.upsert({
        where: {
          bloodBankId_bloodGroup: {
            bloodBankId: input.bloodBankId,
            bloodGroup: donor.bloodGroup,
          },
        },
        update: {
          units: { increment: units },
        },
        create: {
          bloodBankId: input.bloodBankId,
          bloodGroup: donor.bloodGroup,
          units: units,
        },
      });
    }

    return {
      donation,
      stats: {
        totalDonations,
        livesImpacted,
        currentStreak,
        longestStreak,
        nextEligibleDate,
      },
      unlockedBadges: badgesToUnlock,
      unlockedRewards: rewardsToUnlock,
    };
  });
}
