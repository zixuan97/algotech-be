-- AlterTable
ALTER TABLE "EmployeeLeaveRecord" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "EmployeeLeaveRecord_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LeaveQuota" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "LeaveQuota_pkey" PRIMARY KEY ("id");
