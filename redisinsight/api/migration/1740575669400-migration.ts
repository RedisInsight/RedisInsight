import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1740575669400 implements MigrationInterface {
    name = 'Migration1740575669400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "database_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "databaseId" varchar NOT NULL, "data" varchar, CONSTRAINT "REL_548c7a02b802a053a80a60bdc9" UNIQUE ("databaseId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_548c7a02b802a053a80a60bdc9" ON "database_settings" ("databaseId") `);
        await queryRunner.query(`CREATE TABLE "temporary_database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean, "verifyServerCert" boolean, "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar DEFAULT ('[]'), "nameFromProvider" varchar, "sentinelMasterName" varchar, "sentinelMasterUsername" varchar, "sentinelMasterPassword" varchar, "provider" varchar DEFAULT ('UNKNOWN'), "modules" varchar NOT NULL DEFAULT ('[]'), "db" integer, "encryption" varchar, "tlsServername" varchar, "new" boolean, "ssh" boolean, "timeout" integer, "compressor" varchar NOT NULL DEFAULT ('NONE'), "version" varchar, "createdAt" datetime DEFAULT (datetime('now')), "forceStandalone" boolean, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt" FROM "database_instance"`);
        await queryRunner.query(`DROP TABLE "database_instance"`);
        await queryRunner.query(`ALTER TABLE "temporary_database_instance" RENAME TO "database_instance"`);
        await queryRunner.query(`DROP INDEX "IDX_548c7a02b802a053a80a60bdc9"`);
        await queryRunner.query(`CREATE TABLE "temporary_database_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "databaseId" varchar NOT NULL, "data" varchar, CONSTRAINT "REL_548c7a02b802a053a80a60bdc9" UNIQUE ("databaseId"), CONSTRAINT "FK_548c7a02b802a053a80a60bdc96" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_database_settings"("id", "databaseId", "data") SELECT "id", "databaseId", "data" FROM "database_settings"`);
        await queryRunner.query(`DROP TABLE "database_settings"`);
        await queryRunner.query(`ALTER TABLE "temporary_database_settings" RENAME TO "database_settings"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_548c7a02b802a053a80a60bdc9" ON "database_settings" ("databaseId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_548c7a02b802a053a80a60bdc9"`);
        await queryRunner.query(`ALTER TABLE "database_settings" RENAME TO "temporary_database_settings"`);
        await queryRunner.query(`CREATE TABLE "database_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "databaseId" varchar NOT NULL, "data" varchar, CONSTRAINT "REL_548c7a02b802a053a80a60bdc9" UNIQUE ("databaseId"))`);
        await queryRunner.query(`INSERT INTO "database_settings"("id", "databaseId", "data") SELECT "id", "databaseId", "data" FROM "temporary_database_settings"`);
        await queryRunner.query(`DROP TABLE "temporary_database_settings"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_548c7a02b802a053a80a60bdc9" ON "database_settings" ("databaseId") `);
        await queryRunner.query(`ALTER TABLE "database_instance" RENAME TO "temporary_database_instance"`);
        await queryRunner.query(`CREATE TABLE "database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean, "verifyServerCert" boolean, "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar DEFAULT ('[]'), "nameFromProvider" varchar, "sentinelMasterName" varchar, "sentinelMasterUsername" varchar, "sentinelMasterPassword" varchar, "provider" varchar DEFAULT ('UNKNOWN'), "modules" varchar NOT NULL DEFAULT ('[]'), "db" integer, "encryption" varchar, "tlsServername" varchar, "new" boolean, "ssh" boolean, "timeout" integer, "compressor" varchar NOT NULL DEFAULT ('NONE'), "version" varchar, "createdAt" datetime DEFAULT (datetime('now')), CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt" FROM "temporary_database_instance"`);
        await queryRunner.query(`DROP TABLE "temporary_database_instance"`);
        await queryRunner.query(`DROP INDEX "IDX_548c7a02b802a053a80a60bdc9"`);
        await queryRunner.query(`DROP TABLE "database_settings"`);
    }

}
