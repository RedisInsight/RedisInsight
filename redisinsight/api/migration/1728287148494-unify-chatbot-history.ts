import { MigrationInterface, QueryRunner } from "typeorm";

export class UnifyChatbotHistory1728287148494 implements MigrationInterface {
    name = 'UnifyChatbotHistory1728287148494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ai_message" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar, "accountId" varchar NOT NULL, "conversationId" varchar, "type" varchar NOT NULL, "content" blob NOT NULL, "steps" blob, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar)`);
        await queryRunner.query(`CREATE INDEX "IDX_59cda4467412f727b23abd085f" ON "ai_message" ("databaseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a107c5f5ee126196d4d4a7a92d" ON "ai_message" ("accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a1207b482145caa6ed5a8889e" ON "ai_message" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "ai_agreement" ("accountId" varchar PRIMARY KEY NOT NULL, "consent" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "ai_database_agreement" ("accountId" varchar NOT NULL, "databaseId" varchar NOT NULL, "dataConsent" boolean NOT NULL DEFAULT (0), CONSTRAINT "UQ_dba22c2d40b7265d8ec970388a2" UNIQUE ("accountId", "databaseId"), PRIMARY KEY ("accountId", "databaseId"))`);
        await queryRunner.query(`CREATE TABLE "temporary_ai_database_agreement" ("accountId" varchar NOT NULL, "databaseId" varchar NOT NULL, "dataConsent" boolean NOT NULL DEFAULT (0), CONSTRAINT "UQ_dba22c2d40b7265d8ec970388a2" UNIQUE ("accountId", "databaseId"), CONSTRAINT "FK_8f69450c6ba31100d7696a06e62" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("accountId", "databaseId"))`);
        await queryRunner.query(`INSERT INTO "temporary_ai_database_agreement"("accountId", "databaseId", "dataConsent") SELECT "accountId", "databaseId", "dataConsent" FROM "ai_database_agreement"`);
        await queryRunner.query(`DROP TABLE "ai_database_agreement"`);
        await queryRunner.query(`ALTER TABLE "temporary_ai_database_agreement" RENAME TO "ai_database_agreement"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_database_agreement" RENAME TO "temporary_ai_database_agreement"`);
        await queryRunner.query(`CREATE TABLE "ai_database_agreement" ("accountId" varchar NOT NULL, "databaseId" varchar NOT NULL, "dataConsent" boolean NOT NULL DEFAULT (0), CONSTRAINT "UQ_dba22c2d40b7265d8ec970388a2" UNIQUE ("accountId", "databaseId"), PRIMARY KEY ("accountId", "databaseId"))`);
        await queryRunner.query(`INSERT INTO "ai_database_agreement"("accountId", "databaseId", "dataConsent") SELECT "accountId", "databaseId", "dataConsent" FROM "temporary_ai_database_agreement"`);
        await queryRunner.query(`DROP TABLE "temporary_ai_database_agreement"`);
        await queryRunner.query(`DROP TABLE "ai_database_agreement"`);
        await queryRunner.query(`DROP TABLE "ai_agreement"`);
        await queryRunner.query(`DROP INDEX "IDX_4a1207b482145caa6ed5a8889e"`);
        await queryRunner.query(`DROP INDEX "IDX_a107c5f5ee126196d4d4a7a92d"`);
        await queryRunner.query(`DROP INDEX "IDX_59cda4467412f727b23abd085f"`);
        await queryRunner.query(`DROP TABLE "ai_message"`);
    }

}
