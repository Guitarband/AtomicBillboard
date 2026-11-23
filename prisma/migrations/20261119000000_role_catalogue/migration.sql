-- CreateTable
CREATE TABLE "BusinessArea" (
    "name" TEXT NOT NULL,

    CONSTRAINT "BusinessArea_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Department" (
    "businessArea" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("businessArea","name")
);

-- CreateTable
CREATE TABLE "RolePackage" (
    "rolePackageId" TEXT NOT NULL,
    "businessArea" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "roleFamily" TEXT,
    "levelledTitle" TEXT NOT NULL,
    "jobGrade" TEXT,
    "gradeDescription" TEXT,

    CONSTRAINT "RolePackage_pkey" PRIMARY KEY ("rolePackageId")
);

-- CreateTable
CREATE TABLE "RoleTask" (
    "rolePackageId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "RoleTask_pkey" PRIMARY KEY ("rolePackageId","taskId")
);

-- CreateTable
CREATE TABLE "RoleSubtask" (
    "rolePackageId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "subtaskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "RoleSubtask_pkey" PRIMARY KEY ("rolePackageId","taskId","subtaskId")
);

-- CreateTable
CREATE TABLE "AtomicTask" (
    "rolePackageId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "subtaskId" TEXT NOT NULL,
    "atomicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "sfiaLevel" TEXT,
    "automationPropensity" TEXT,
    "humanInvolvement" TEXT,
    "workResult" TEXT,
    "evidence" TEXT,
    "controlQuality" TEXT,
    "riskIfFailed" TEXT,
    "actionType" TEXT,
    "recordBasis" TEXT,
    "validationStatus" TEXT,

    CONSTRAINT "AtomicTask_pkey" PRIMARY KEY ("rolePackageId","taskId","subtaskId","atomicId")
);

-- CreateIndex
CREATE INDEX "RolePackage_businessArea_department_levelledTitle_idx" ON "RolePackage"("businessArea", "department", "levelledTitle");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_businessArea_fkey" FOREIGN KEY ("businessArea") REFERENCES "BusinessArea"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePackage" ADD CONSTRAINT "RolePackage_businessArea_department_fkey" FOREIGN KEY ("businessArea", "department") REFERENCES "Department"("businessArea", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleTask" ADD CONSTRAINT "RoleTask_rolePackageId_fkey" FOREIGN KEY ("rolePackageId") REFERENCES "RolePackage"("rolePackageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSubtask" ADD CONSTRAINT "RoleSubtask_rolePackageId_taskId_fkey" FOREIGN KEY ("rolePackageId", "taskId") REFERENCES "RoleTask"("rolePackageId", "taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtomicTask" ADD CONSTRAINT "AtomicTask_rolePackageId_taskId_subtaskId_fkey" FOREIGN KEY ("rolePackageId", "taskId", "subtaskId") REFERENCES "RoleSubtask"("rolePackageId", "taskId", "subtaskId") ON DELETE CASCADE ON UPDATE CASCADE;
