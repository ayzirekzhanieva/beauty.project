-- CreateTable
CREATE TABLE "SpecialistWork" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "specialistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialistWork_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SpecialistWork" ADD CONSTRAINT "SpecialistWork_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
