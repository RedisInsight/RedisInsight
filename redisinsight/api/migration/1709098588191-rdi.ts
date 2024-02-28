import { MigrationInterface, QueryRunner } from "typeorm";

export class Rdi1709098588191 implements MigrationInterface {
    name = 'Rdi1709098588191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rdi" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "url" varchar, "host" varchar, "port" integer, "name" varchar NOT NULL, "username" varchar, "password" varchar, "lastConnection" datetime, "version" varchar NOT NULL, "encryption" varchar)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "rdi"`);
    }

}
