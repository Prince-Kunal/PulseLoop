import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up database...");

  // Delete in order of dependency to prevent foreign key constraint issues
  await prisma.userReward.deleteMany({});
  await prisma.reward.deleteMany({});
  await prisma.donationHistory.deleteMany({});
  await prisma.donorProfile.deleteMany({});
  await prisma.bloodRequest.deleteMany({});
  await prisma.hospitalProfile.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.bloodDrive.deleteMany({});
  await prisma.bloodBankProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.badge.deleteMany({});

  console.log("Seeding Badges...");
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: "First Donation",
        description: "Awarded for completing your first blood donation.",
        icon: "award",
        requirementType: "DONATIONS_COUNT",
        requirementValue: 1,
      },
    }),
    prisma.badge.create({
      data: {
        name: "Life Saver",
        description: "Awarded for donating blood 5 times.",
        icon: "heart",
        requirementType: "DONATIONS_COUNT",
        requirementValue: 5,
      },
    }),
    prisma.badge.create({
      data: {
        name: "Elite Hero",
        description: "Awarded for donating blood 10 times.",
        icon: "shield",
        requirementType: "DONATIONS_COUNT",
        requirementValue: 10,
      },
    }),
    prisma.badge.create({
      data: {
        name: "Streak Master",
        description: "Awarded for achieving a 3-donation streak.",
        icon: "zap",
        requirementType: "STREAK_COUNT",
        requirementValue: 3,
      },
    }),
  ]);

  console.log("Seeding Rewards...");
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: "Free Coffee Voucher",
        description: "Get a free hot beverage at any partner coffee shop.",
        pointsCost: 100,
        code: "COFFEE100",
      },
    }),
    prisma.reward.create({
      data: {
        name: "PulseLoop T-Shirt",
        description: "Show your donor pride with an exclusive PulseLoop cotton T-shirt.",
        pointsCost: 500,
        code: "TSHIRT500",
      },
    }),
    prisma.reward.create({
      data: {
        name: "Movie Ticket Discount",
        description: "Receive a 50% discount code for your next cinema booking.",
        pointsCost: 250,
        code: "MOVIE250",
      },
    }),
    prisma.reward.create({
      data: {
        name: "$10 Amazon Gift Card",
        description: "Claim a $10 digital gift card sent directly to your email.",
        pointsCost: 1000,
        code: "AMZN1000",
      },
    }),
  ]);

  console.log("Seeding Users & Profiles...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Seed Blood Banks
  const bank1User = await prisma.user.create({
    data: {
      email: "redcross@pulseloop.org",
      password: hashedPassword,
      role: Role.BLOOD_BANK,
      bloodBankProfile: {
        create: {
          bloodBankName: "City Red Cross Hub",
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
    },
    include: { bloodBankProfile: true },
  });

  const bank2User = await prisma.user.create({
    data: {
      email: "metrobank@pulseloop.org",
      password: hashedPassword,
      role: Role.BLOOD_BANK,
      bloodBankProfile: {
        create: {
          bloodBankName: "Metro Blood Supply Center",
          latitude: 40.7589,
          longitude: -73.9851,
        },
      },
    },
    include: { bloodBankProfile: true },
  });
  
  // Seeding inventories for blood banks
  console.log("Seeding Inventories...");
  if (bank1User.bloodBankProfile) {
    const baseStock = [
      { group: "A+", units: 14 },
      { group: "A-", units: 5 },
      { group: "B+", units: 18 },
      { group: "B-", units: 3 },
      { group: "AB+", units: 8 },
      { group: "AB-", units: 2 },
      { group: "O+", units: 25 },
      { group: "O-", units: 9 },
    ];
    for (const item of baseStock) {
      await prisma.inventory.create({
        data: {
          bloodBankId: bank1User.bloodBankProfile!.id,
          bloodGroup: item.group,
          units: item.units,
        },
      });
    }
  }

  if (bank2User.bloodBankProfile) {
    const baseStock = [
      { group: "A+", units: 10 },
      { group: "A-", units: 3 },
      { group: "B+", units: 12 },
      { group: "B-", units: 2 },
      { group: "AB+", units: 6 },
      { group: "AB-", units: 1 },
      { group: "O+", units: 15 },
      { group: "O-", units: 5 },
    ];
    for (const item of baseStock) {
      await prisma.inventory.create({
        data: {
          bloodBankId: bank2User.bloodBankProfile!.id,
          bloodGroup: item.group,
          units: item.units,
        },
      });
    }
  }

  // Seeding blood drives
  console.log("Seeding Blood Drives...");
  if (bank1User.bloodBankProfile) {
    await prisma.bloodDrive.create({
      data: {
        title: "Summer LifeSaver Drive",
        description: "Join us for our annual Summer LifeSaver blood drive. All successful donors will receive free coffee and custom badges. Spread the word and save lives!",
        date: new Date("2026-07-15T09:00:00Z"),
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        latitude: 40.7128,
        longitude: -74.006,
        capacity: 50,
        organizerId: bank1User.bloodBankProfile.id,
      },
    });

    await prisma.bloodDrive.create({
      data: {
        title: "Metro Plaza Emergency Drive",
        description: "Urgent drive to replenish O negative and B negative blood group inventory. Walk-ins welcome.",
        date: new Date("2026-07-28T10:00:00Z"),
        startTime: "10:00 AM",
        endTime: "04:00 PM",
        latitude: 40.7306,
        longitude: -73.9352,
        capacity: 35,
        organizerId: bank1User.bloodBankProfile.id,
      },
    });
    
    await prisma.bloodDrive.create({
      data: {
        title: "Spring Hope Donation Camp",
        description: "Spring camp organized by City Red Cross Hub.",
        date: new Date("2026-04-10T09:00:00Z"),
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        latitude: 40.7128,
        longitude: -74.006,
        capacity: 60,
        organizerId: bank1User.bloodBankProfile.id,
      },
    });
  }

  // 2. Seed Hospitals
  const hospital1User = await prisma.user.create({
    data: {
      email: "stmary@pulseloop.org",
      password: hashedPassword,
      role: Role.HOSPITAL,
      hospitalProfile: {
        create: {
          hospitalName: "St. Mary General Hospital",
          latitude: 40.7306,
          longitude: -73.9352,
        },
      },
    },
    include: { hospitalProfile: true },
  });

  const hospital2User = await prisma.user.create({
    data: {
      email: "childrens@pulseloop.org",
      password: hashedPassword,
      role: Role.HOSPITAL,
      hospitalProfile: {
        create: {
          hospitalName: "Children's Emergency Clinic",
          latitude: 40.6782,
          longitude: -73.9442,
        },
      },
    },
    include: { hospitalProfile: true },
  });

  // Seeding Blood Requests
  console.log("Seeding Blood Requests...");
  if (hospital1User.hospitalProfile) {
    // 1. Pending Request
    await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital1User.hospitalProfile.id,
        bloodGroup: "O-",
        unitsRequired: 3,
        urgency: "CRITICAL",
        notes: "Emergency ICU patient requiring immediate O negative blood transfusion due to severe internal trauma. Please expedite.",
        patientAge: 45,
        status: "PENDING",
      },
    });

    // 2. Accepted/In Progress Request
    await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital1User.hospitalProfile.id,
        bloodGroup: "A+",
        unitsRequired: 5,
        urgency: "HIGH",
        notes: "Patient undergoing planned cardiovascular bypass procedure tomorrow morning.",
        patientAge: 62,
        status: "IN_PROGRESS",
        bloodBankId: bank1User.bloodBankProfile?.id,
      },
    });

    // 3. Fulfilled Request
    await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital1User.hospitalProfile.id,
        bloodGroup: "AB-",
        unitsRequired: 1,
        urgency: "MEDIUM",
        notes: "Oncology ward replenishment.",
        patientAge: 29,
        status: "FULFILLED",
        bloodBankId: bank1User.bloodBankProfile?.id,
      },
    });
  }

  if (hospital2User.hospitalProfile) {
    // 4. Pending request for hospital 2
    await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital2User.hospitalProfile.id,
        bloodGroup: "B+",
        unitsRequired: 2,
        urgency: "LOW",
        notes: "Anemia treatment replacement units.",
        patientAge: 12,
        status: "PENDING",
      },
    });
  }

  // 3. Seed Donors
  const donor1User = await prisma.user.create({
    data: {
      email: "prince@pulseloop.org",
      password: hashedPassword,
      role: Role.DONOR,
      donorProfile: {
        create: {
          fullName: "Prince Kunal",
          dateOfBirth: new Date("1998-05-15"),
          phone: "+1 (555) 019-2834",
          latitude: 40.7128,
          longitude: -74.006,
          bloodGroup: "O+",
          bloodGroupVerified: true,
          lastDonationDate: new Date("2026-05-10"),
          totalDonations: 12,
          livesImpacted: 36,
          currentStreak: 4,
          longestStreak: 4,
          nextEligibleDate: new Date("2026-07-05"),
        },
      },
    },
    include: { donorProfile: true },
  });

  const donor2User = await prisma.user.create({
    data: {
      email: "sarah@pulseloop.org",
      password: hashedPassword,
      role: Role.DONOR,
      donorProfile: {
        create: {
          fullName: "Sarah Jenkins",
          dateOfBirth: new Date("1995-11-22"),
          phone: "+1 (555) 014-9988",
          latitude: 40.7484,
          longitude: -73.9857,
          bloodGroup: "AB-",
          bloodGroupVerified: true,
          lastDonationDate: new Date("2026-06-01"),
          totalDonations: 2,
          livesImpacted: 6,
          currentStreak: 1,
          longestStreak: 2,
          nextEligibleDate: new Date("2026-07-27"),
        },
      },
    },
    include: { donorProfile: true },
  });

  const donor3User = await prisma.user.create({
    data: {
      email: "john@pulseloop.org",
      password: hashedPassword,
      role: Role.DONOR,
      donorProfile: {
        create: {
          fullName: "John Doe",
          dateOfBirth: new Date("2000-01-01"),
          phone: "+1 (555) 012-3456",
          latitude: 40.7061,
          longitude: -73.9969,
          bloodGroup: "A+",
          bloodGroupVerified: false,
          totalDonations: 0,
          livesImpacted: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
    include: { donorProfile: true },
  });

  console.log("Seeding Donation Histories...");
  // Create history for Prince Kunal
  if (donor1User.donorProfile && bank1User.bloodBankProfile && bank2User.bloodBankProfile) {
    await prisma.donationHistory.create({
      data: {
        donorId: donor1User.donorProfile.id,
        bloodBankId: bank1User.bloodBankProfile.id,
        donationDate: new Date("2026-01-10"),
        bloodType: "O+",
        units: 1,
        status: "COMPLETED",
      },
    });

    await prisma.donationHistory.create({
      data: {
        donorId: donor1User.donorProfile.id,
        bloodBankId: bank2User.bloodBankProfile.id,
        donationDate: new Date("2026-03-05"),
        bloodType: "O+",
        units: 1,
        status: "COMPLETED",
      },
    });

    await prisma.donationHistory.create({
      data: {
        donorId: donor1User.donorProfile.id,
        bloodBankId: bank1User.bloodBankProfile.id,
        donationDate: new Date("2026-05-10"),
        bloodType: "O+",
        units: 1,
        status: "COMPLETED",
      },
    });
  }

  // Create history for Sarah Jenkins
  if (donor2User.donorProfile && bank1User.bloodBankProfile) {
    await prisma.donationHistory.create({
      data: {
        donorId: donor2User.donorProfile.id,
        bloodBankId: bank1User.bloodBankProfile.id,
        donationDate: new Date("2026-06-01"),
        bloodType: "AB-",
        units: 1,
        status: "COMPLETED",
      },
    });
  }

  console.log("Seeding Earned Badges...");
  // Associate Badges to Prince Kunal
  if (donor1User.donorProfile) {
    await prisma.donorProfile.update({
      where: { id: donor1User.donorProfile.id },
      data: {
        badges: {
          connect: [
            { id: badges[0].id }, // First Donation
            { id: badges[1].id }, // Life Saver
            { id: badges[3].id }, // Streak Master
          ],
        },
      },
    });
  }

  // Associate Badges to Sarah Jenkins
  if (donor2User.donorProfile) {
    await prisma.donorProfile.update({
      where: { id: donor2User.donorProfile.id },
      data: {
        badges: {
          connect: [
            { id: badges[0].id }, // First Donation
          ],
        },
      },
    });
  }

  console.log("Seeding Redeemed Rewards...");
  // Create a redeemed reward for Prince Kunal
  if (donor1User.donorProfile) {
    await prisma.userReward.create({
      data: {
        donorId: donor1User.donorProfile.id,
        rewardId: rewards[0].id, // Free Coffee Voucher
        status: "REDEEMED",
      },
    });
  }

  console.log("Seeding database complete! 🎉");
}

main()
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
