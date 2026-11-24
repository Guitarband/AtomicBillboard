CREATE TABLE "AtomicTaskSourceRow" (
    "workbook" TEXT NOT NULL,
    "sheet" TEXT NOT NULL,
    "sourceRow" INTEGER NOT NULL,
    "fields" JSONB NOT NULL,
    CONSTRAINT "AtomicTaskSourceRow_pkey" PRIMARY KEY ("workbook", "sheet", "sourceRow")
);
