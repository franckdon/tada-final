-- CreateEnum
CREATE TYPE "AdminSubRole" AS ENUM ('super_admin', 'operations_admin', 'customer_admin', 'content_moderator', 'finance_admin', 'auditor');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "adminSubRole" "AdminSubRole";
