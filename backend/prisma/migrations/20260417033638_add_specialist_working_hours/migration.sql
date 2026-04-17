-- AlterTable
ALTER TABLE "Specialist" ADD COLUMN     "workDays" TEXT DEFAULT '1,2,3,4,5,6',
ADD COLUMN     "workEndTime" TEXT DEFAULT '18:00',
ADD COLUMN     "workStartTime" TEXT DEFAULT '09:00';
