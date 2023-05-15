import { MigrationInterface, QueryRunner } from "typeorm";

export class feature1684175820824 implements MigrationInterface {
    name = 'feature1684175820824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "features" ("name" varchar PRIMARY KEY NOT NULL, "flag" boolean NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "features_config" ("id" varchar PRIMARY KEY NOT NULL, "controlNumber" integer, "data" varchar NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "features_config"`);
        await queryRunner.query(`DROP TABLE "features"`);
    }

}
