import { MigrationInterface, QueryRunner } from "typeorm";

export class AiUnifyHistory1725029452055 implements MigrationInterface {
    name = 'AiUnifyHistory1725029452055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ai_message" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar, "accountId" varchar NOT NULL, "conversationId" varchar, "tool" varchar NOT NULL DEFAULT ('General'), "type" varchar NOT NULL, "content" blob NOT NULL, "steps" blob, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar)`);
        await queryRunner.query(`CREATE INDEX "IDX_59cda4467412f727b23abd085f" ON "ai_message" ("databaseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a107c5f5ee126196d4d4a7a92d" ON "ai_message" ("accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a1207b482145caa6ed5a8889e" ON "ai_message" ("createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4a1207b482145caa6ed5a8889e"`);
        await queryRunner.query(`DROP INDEX "IDX_a107c5f5ee126196d4d4a7a92d"`);
        await queryRunner.query(`DROP INDEX "IDX_59cda4467412f727b23abd085f"`);
        await queryRunner.query(`DROP TABLE "ai_message"`);
    }

}
