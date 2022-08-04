import {MigrationInterface, QueryRunner} from "typeorm";

export class notificationCategory1659614625861 implements MigrationInterface {
    name = 'notificationCategory1659614625861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification" ("type" varchar CHECK( type IN ('global') ) NOT NULL, "timestamp" integer NOT NULL, "title" varchar NOT NULL, "category" varchar, "categoryColor" varchar, "body" text NOT NULL, "read" boolean NOT NULL DEFAULT (0), PRIMARY KEY ("type", "timestamp"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notification"`);
    }

}
