import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiDataGenerator1752573370000 implements MigrationInterface {
  name = 'AiDataGenerator1752573370000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_data_generator_message" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "accountId" varchar, "conversationId" varchar, "type" varchar NOT NULL, "content" blob NOT NULL, "steps" blob, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_015bdc6c771cd9154b2b20658d" ON "ai_data_generator_message" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd7f221456b2f20ec9de9e0940" ON "ai_data_generator_message" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775a5b54b6cb1a08d33cc98f59" ON "ai_data_generator_message" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_775a5b54b6cb1a08d33cc98f59"`);
    await queryRunner.query(`DROP INDEX "IDX_cd7f221456b2f20ec9de9e0940"`);
    await queryRunner.query(`DROP INDEX "IDX_015bdc6c771cd9154b2b20658d"`);
    await queryRunner.query(`DROP TABLE "ai_data_generator_message"`);
  }
} 