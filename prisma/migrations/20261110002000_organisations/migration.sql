CREATE TABLE "Organisation" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OrganisationMember" ("id" TEXT NOT NULL,"organisationId" TEXT NOT NULL,"userId" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'contributor',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "OrganisationMember_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "OrganisationMember_organisationId_userId_key" ON "OrganisationMember"("organisationId", "userId");
ALTER TABLE "OrganisationMember" ADD CONSTRAINT "OrganisationMember_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganisationMember" ADD CONSTRAINT "OrganisationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
