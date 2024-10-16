import { MigrationInterface, QueryRunner } from "typeorm";

export class CloudSession1729024196797 implements MigrationInterface {
    name = 'CloudSession1729024196797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cloud_session" ("id" integer PRIMARY KEY NOT NULL, "data" varchar, "encryption" varchar)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cloud_session"`);
    }

}
