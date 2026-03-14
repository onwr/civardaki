-- AlterTable
ALTER TABLE `employee` ADD COLUMN `departmentId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `employee_department` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmployeeDepartment_businessId_isActive_idx`(`businessId`, `isActive`),
    UNIQUE INDEX `EmployeeDepartment_businessId_name_key`(`businessId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_leave_request` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `leaveType` ENUM('ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'OTHER') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `days` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `requestedByUserId` VARCHAR(191) NULL,
    `approvedByUserId` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmployeeLeaveRequest_businessId_status_idx`(`businessId`, `status`),
    INDEX `EmployeeLeaveRequest_businessId_startDate_idx`(`businessId`, `startDate`),
    INDEX `EmployeeLeaveRequest_employeeId_status_idx`(`employeeId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Employee_departmentId_idx` ON `employee`(`departmentId`);

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `employee_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_department` ADD CONSTRAINT `EmployeeDepartment_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_leave_request` ADD CONSTRAINT `EmployeeLeaveRequest_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_leave_request` ADD CONSTRAINT `EmployeeLeaveRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_leave_request` ADD CONSTRAINT `EmployeeLeaveRequest_requestedByUserId_fkey` FOREIGN KEY (`requestedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_leave_request` ADD CONSTRAINT `EmployeeLeaveRequest_approvedByUserId_fkey` FOREIGN KEY (`approvedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
