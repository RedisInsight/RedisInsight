import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiRdi1752489082051 implements MigrationInterface {
  name = 'AiRdi1752489082051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_rdi_message" ("id" varchar PRIMARY KEY NOT NULL, "targetId" varchar NOT NULL, "accountId" varchar, "conversationId" varchar, "type" varchar NOT NULL, "content" blob NOT NULL, "steps" blob, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_015bdc6c771cd9154b2b20658drdi" ON "ai_rdi_message" ("targetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd7f221456b2f20ec9de9e093ardi" ON "ai_rdi_message" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775a5b54b6cb1a08d33cc98f59rdi" ON "ai_rdi_message" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_775a5b54b6cb1a08d33cc98f59rdi"`);
    await queryRunner.query(`DROP INDEX "IDX_cd7f221456b2f20ec9de9e093ardi"`);
    await queryRunner.query(`DROP INDEX "IDX_015bdc6c771cd9154b2b20658drdi"`);
    await queryRunner.query(`DROP TABLE "ai_rdi_message"`);
  }
}
