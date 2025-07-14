import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiExtended1752489082051 implements MigrationInterface {
  name = 'AiExtended1752489082051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_extended_message" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "accountId" varchar, "conversationId" varchar, "type" varchar NOT NULL, "content" blob NOT NULL, "steps" blob, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_015bdc6c771cd9154b2b20658c" ON "ai_extended_message" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd7f221456b2f20ec9de9e0939" ON "ai_extended_message" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775a5b54b6cb1a08d33cc98f58" ON "ai_extended_message" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_775a5b54b6cb1a08d33cc98f58"`);
    await queryRunner.query(`DROP INDEX "IDX_cd7f221456b2f20ec9de9e0939"`);
    await queryRunner.query(`DROP INDEX "IDX_015bdc6c771cd9154b2b20658c"`);
    await queryRunner.query(`DROP TABLE "ai_extended_message"`);
  }
}
