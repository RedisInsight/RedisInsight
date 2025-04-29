import { MigrationInterface, QueryRunner } from "typeorm";

export class MicrosoftAzureAuth1739636593872 implements MigrationInterface {
    name = 'MicrosoftAzureAuth1739636593872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "microsoft_auth_session" (
                "id" varchar PRIMARY KEY NOT NULL,
                "token_cache" text,
                "username" varchar,
                "account_id" varchar,
                "tenant_id" varchar,
                "display_name" varchar,
                "last_updated" bigint,
                "encryption" varchar
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "microsoft_auth_session"`);
    }

}
