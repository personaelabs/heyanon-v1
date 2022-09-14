-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "joint_group" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joint_name" TEXT;
