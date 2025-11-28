-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userRole" TEXT,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "detail" TEXT,
    "metadataJson" TEXT,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);
