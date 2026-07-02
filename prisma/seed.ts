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
  await prisma.emergencyResponse.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.requestTimeline.deleteMany({});
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
  let req1: any, req2: any, req3: any, req4: any;
  if (hospital1User.hospitalProfile) {
    // 1. Pending Request
    req1 = await prisma.bloodRequest.create({
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
    req2 = await prisma.bloodRequest.create({
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
    req3 = await prisma.bloodRequest.create({
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
    req4 = await prisma.bloodRequest.create({
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

  console.log("Seeding 50 additional serial donors...");
  const bloodGroupsList = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const citiesList = ["New York", "Brooklyn", "Queens", "Bronx", "Staten Island"];

  for (let i = 1; i <= 50; i++) {
    const email = `donor${i}@gmail.com`;
    const fullName = `Donor Number ${i}`;
    const bloodGroup = bloodGroupsList[i % bloodGroupsList.length];
    
    // Determine type: 
    // - i % 3 === 0: Often donor (5-8 donations)
    // - i % 3 === 1: Occasional donor (1-3 donations)
    // - i % 3 === 2: New donor (0 donations)
    const type = i % 3;
    let totalDonations = 0;
    let lastDonationDate: Date | null = null;
    let nextEligibleDate: Date | null = null;
    let currentStreak = 0;
    let longestStreak = 0;
    let livesImpacted = 0;

    if (type === 0) { // Often
      totalDonations = 5 + (i % 4); // 5 to 8
      livesImpacted = totalDonations * 3;
      currentStreak = 2 + (i % 3);
      longestStreak = currentStreak + 1;
      
      if (i % 2 === 0) {
        lastDonationDate = new Date("2026-06-15");
        nextEligibleDate = new Date("2026-08-10");
      } else {
        lastDonationDate = new Date("2026-04-10");
        nextEligibleDate = new Date("2026-06-05");
      }
    } else if (type === 1) { // Occasional
      totalDonations = 1 + (i % 3); // 1 to 3
      livesImpacted = totalDonations * 3;
      currentStreak = 1;
      longestStreak = 1;
      
      if (i % 2 === 0) {
        lastDonationDate = new Date("2026-06-28");
        nextEligibleDate = new Date("2026-08-23");
      } else {
        lastDonationDate = new Date("2026-02-15");
        nextEligibleDate = new Date("2026-04-12");
      }
    }

    // Coordinates: minor offset from center of New York
    const latOffset = Math.sin(i) * 0.08;
    const lonOffset = Math.cos(i) * 0.08;
    const latitude = 40.7128 + latOffset;
    const longitude = -74.0060 + lonOffset;
    const city = citiesList[i % citiesList.length];

    const donorUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.DONOR,
        donorProfile: {
          create: {
            fullName,
            dateOfBirth: new Date(`1990-0${(i % 9) + 1}-15`),
            phone: `+1 (555) 999-00${i.toString().padStart(2, "0")}`,
            latitude,
            longitude,
            city,
            state: "NY",
            bloodGroup,
            bloodGroupVerified: i % 4 !== 0,
            lastDonationDate,
            totalDonations,
            livesImpacted,
            currentStreak,
            longestStreak,
            nextEligibleDate,
            lastActiveAt: new Date(),
          },
        },
      },
      include: { donorProfile: true },
    });

    if (donorUser.donorProfile && totalDonations > 0 && lastDonationDate) {
      for (let d = 0; d < totalDonations; d++) {
        const donationDate = new Date(lastDonationDate);
        donationDate.setDate(donationDate.getDate() - (d * 60));

        await prisma.donationHistory.create({
          data: {
            donorId: donorUser.donorProfile.id,
            bloodBankId: bank1User.bloodBankProfile?.id || null,
            donationDate,
            bloodType: bloodGroup,
            units: 1,
            status: "COMPLETED",
          },
        });
      }
    }
  }

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

  console.log("Seeding Priority Eligible Donors (O-)...");
  // 1. Emma Watson (O-)
  const donor4User = await prisma.user.create({
    data: {
      email: "emma@pulseloop.org",
      password: hashedPassword,
      role: Role.DONOR,
      donorProfile: {
        create: {
          fullName: "Emma Watson",
          dateOfBirth: new Date("1996-04-15"),
          phone: "+1 (555) 018-7253",
          latitude: 40.7306,
          longitude: -73.9352,
          bloodGroup: "O-",
          bloodGroupVerified: true,
          totalDonations: 6,
          livesImpacted: 18,
          currentStreak: 2,
          longestStreak: 3,
          nextEligibleDate: new Date("2026-06-10"), // Eligible
          lastActiveAt: new Date("2026-06-25"), // Active recently (bonus)
        },
      },
    },
    include: { donorProfile: true },
  });

  // 2. Robert Downey (O-)
  const donor5User = await prisma.user.create({
    data: {
      email: "robert@pulseloop.org",
      password: hashedPassword,
      role: Role.DONOR,
      donorProfile: {
        create: {
          fullName: "Robert Downey",
          dateOfBirth: new Date("1990-08-08"),
          phone: "+1 (555) 011-8899",
          latitude: 40.7589,
          longitude: -73.9851,
          bloodGroup: "O-",
          bloodGroupVerified: true,
          totalDonations: 11,
          livesImpacted: 33,
          currentStreak: 5,
          longestStreak: 5,
          nextEligibleDate: new Date("2026-05-20"), // Eligible
          lastActiveAt: new Date("2026-06-29"), // Active recently (bonus)
        },
      },
    },
    include: { donorProfile: true },
  });

  console.log("Seeding Timelines for Blood Requests...");
  // req1 (O- Pending)
  if (req1) {
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req1.id,
        event: "HOSPITAL_CREATED_REQUEST",
        timestamp: new Date("2026-07-01T08:00:00Z"),
      },
    });
  }

  // req2 (A+ In Progress)
  if (req2) {
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req2.id,
        event: "HOSPITAL_CREATED_REQUEST",
        timestamp: new Date("2026-07-01T09:00:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req2.id,
        event: "BLOOD_BANK_ACCEPTED",
        timestamp: new Date("2026-07-01T09:30:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req2.id,
        event: "INVENTORY_CHECKED",
        timestamp: new Date("2026-07-01T09:31:00Z"),
      },
    });
  }

  // req3 (AB- Fulfilled)
  if (req3) {
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req3.id,
        event: "HOSPITAL_CREATED_REQUEST",
        timestamp: new Date("2026-07-01T10:00:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req3.id,
        event: "BLOOD_BANK_ACCEPTED",
        timestamp: new Date("2026-07-01T10:15:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req3.id,
        event: "INVENTORY_CHECKED",
        timestamp: new Date("2026-07-01T10:16:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req3.id,
        event: "PRIORITY_LIST_GENERATED",
        timestamp: new Date("2026-07-01T10:20:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req3.id,
        event: "NOTIFICATIONS_SENT",
        timestamp: new Date("2026-07-01T10:21:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req3.id,
        event: "DONOR_ACCEPTED",
        timestamp: new Date("2026-07-01T10:45:00Z"),
      },
    });
    await prisma.requestTimeline.create({
      data: {
        bloodRequestId: req3.id,
        event: "REQUEST_FULFILLED",
        timestamp: new Date("2026-07-01T11:00:00Z"),
      },
    });
  }

  console.log("Seeding Test Notifications and Responses...");
  // Emma Watson test notification response rate (AVAILABLE -> 100%)
  if (donor4User.donorProfile && req3 && hospital1User.hospitalProfile) {
    const testNotif = await prisma.notification.create({
      data: {
        donorId: donor4User.donorProfile.id,
        bloodRequestId: req3.id,
        hospitalId: hospital1User.hospitalProfile.id,
        title: "Emergency Alert",
        message: "Test notification message",
        status: "RESPONDED",
      },
    });

    await prisma.emergencyResponse.create({
      data: {
        notificationId: testNotif.id,
        donorId: donor4User.donorProfile.id,
        response: "AVAILABLE",
      },
    });
  }

  console.log("Updating profile locations...");
  await prisma.donorProfile.updateMany({
    data: { city: "New York", state: "NY" },
  });
  await prisma.hospitalProfile.updateMany({
    data: { city: "New York", state: "NY" },
  });
  await prisma.bloodBankProfile.updateMany({
    data: { city: "New York", state: "NY" },
  });

  console.log("Seeding Community Posts...");
  await prisma.communityPost.create({
    data: {
      title: "Annual Summer Blood Drive Scheduling",
      description: "Join us this Friday at Central Park. Each donor receives a free health screening voucher and 200 PulseLoop reward points!",
      imageUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600&auto=format&fit=crop",
      authorName: "Red Cross Metro Center",
      authorRole: "BLOOD_BANK",
    },
  });
  await prisma.communityPost.create({
    data: {
      title: "Severe O- Inventory Alert",
      description: "Local hospitals are reporting an acute shortage of O negative blood. If you are eligible, please schedule an appointment today.",
      imageUrl: null,
      authorName: "Metro General Hospital",
      authorRole: "BLOOD_BANK",
    },
  });

  console.log("Seeding User Notifications...");
  const allUsers = await prisma.user.findMany();
  for (const u of allUsers) {
    await prisma.userNotification.create({
      data: {
        userId: u.id,
        type: "DRIVE_ANNOUNCEMENT",
        title: "Upcoming Community Drive",
        message: "A local blood drive has been scheduled in your area for this Friday. Tap to see locations.",
        isRead: false,
      },
    });
    await prisma.userNotification.create({
      data: {
        userId: u.id,
        type: "REWARD_UNLOCK",
        title: "Voucher Unlocked!",
        message: "Congratulations! You have completed a milestone. Check your rewards catalog to claim your gift voucher.",
        isRead: true,
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
