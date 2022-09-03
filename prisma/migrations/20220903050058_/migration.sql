-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INTERN', 'PARTTIME', 'FULLTIME', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
