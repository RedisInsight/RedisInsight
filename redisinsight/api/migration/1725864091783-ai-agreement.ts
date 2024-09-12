import { MigrationInterface, QueryRunner } from "typeorm";

export class AiAgreement1725864091783 implements MigrationInterface {
    name = 'AiAgreement1725864091783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ai_agreement" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar, "accountId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE INDEX "IDX_3b7c275162b60d28dcdce4981d" ON "ai_agreement" ("databaseId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_3b7c275162b60d28dcdce4981d"`);
        await queryRunner.query(`DROP TABLE "ai_agreement"`);
    }

}
