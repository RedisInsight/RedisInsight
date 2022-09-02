import {MigrationInterface, QueryRunner} from "typeorm";

export class workbenchUpdatedAt1662101361161 implements MigrationInterface {
    name = 'workbenchUpdatedAt1662101361161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_5cd90dd6def1fd7c521e53fb2c"`);
        await queryRunner.query(`CREATE TABLE "temporary_command_execution" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "command" text NOT NULL, "result" text NOT NULL, "role" varchar, "nodeOptions" varchar, "encryption" varchar, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "mode" varchar, CONSTRAINT "FK_ea8adfe9aceceb79212142206b8" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_command_execution"("id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "updatedAt", "mode") SELECT "id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "createdAt", "mode" FROM "command_execution"`);
        await queryRunner.query(`DROP TABLE "command_execution"`);
        await queryRunner.query(`ALTER TABLE "temporary_command_execution" RENAME TO "command_execution"`);
        await queryRunner.query(`CREATE INDEX "IDX_8ed44175a2a0a67a0728084f57" ON "command_execution" ("updatedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8ed44175a2a0a67a0728084f57"`);
        await queryRunner.query(`ALTER TABLE "command_execution" RENAME TO "temporary_command_execution"`);
        await queryRunner.query(`CREATE TABLE "command_execution" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "command" text NOT NULL, "result" text NOT NULL, "role" varchar, "nodeOptions" varchar, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "mode" varchar, CONSTRAINT "FK_ea8adfe9aceceb79212142206b8" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "command_execution"("id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "createdAt", "mode") SELECT "id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "updatedAt", "mode" FROM "temporary_command_execution"`);
        await queryRunner.query(`DROP TABLE "temporary_command_execution"`);
        await queryRunner.query(`CREATE INDEX "IDX_5cd90dd6def1fd7c521e53fb2c" ON "command_execution" ("createdAt") `);
    }

}
