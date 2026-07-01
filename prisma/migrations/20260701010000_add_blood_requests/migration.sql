-- CreateTable
CREATE TABLE "BloodRequest" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "unitsRequired" INTEGER NOT NULL,
    "urgency" TEXT NOT NULL,
    "notes" TEXT,
    "patientAge" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bloodBankId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "HospitalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_bloodBankId_fkey" FOREIGN KEY ("bloodBankId") REFERENCES "BloodBankProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

