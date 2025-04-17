import { MigrationInterface, QueryRunner } from 'typeorm';

export class PreSetupDatabases1741786803681 implements MigrationInterface {
  name = 'PreSetupDatabases1741786803681';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_ca_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, "isPreSetup" boolean, CONSTRAINT "UQ_23be613e4fb204fd5a66916b0b3" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_ca_certificate"("id", "name", "encryption", "certificate") SELECT "id", "name", "encryption", "certificate" FROM "ca_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "ca_certificate"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_ca_certificate" RENAME TO "ca_certificate"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_client_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, "key" varchar, "isPreSetup" boolean, CONSTRAINT "UQ_4966cf1c0e299df01049ebd53a5" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_client_certificate"("id", "name", "encryption", "certificate", "key") SELECT "id", "name", "encryption", "certificate", "key" FROM "client_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "client_certificate"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_client_certificate" RENAME TO "client_certificate"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean, "verifyServerCert" boolean, "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar DEFAULT ('[]'), "nameFromProvider" varchar, "sentinelMasterName" varchar, "sentinelMasterUsername" varchar, "sentinelMasterPassword" varchar, "provider" varchar DEFAULT ('UNKNOWN'), "modules" varchar NOT NULL DEFAULT ('[]'), "db" integer, "encryption" varchar, "tlsServername" varchar, "new" boolean, "ssh" boolean, "timeout" integer, "compressor" varchar NOT NULL DEFAULT ('NONE'), "version" varchar, "createdAt" datetime DEFAULT (datetime('now')), "forceStandalone" boolean, "isPreSetup" boolean, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt", "forceStandalone") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt", "forceStandalone" FROM "database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "database_instance"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_instance" RENAME TO "database_instance"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" RENAME TO "temporary_database_instance"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean, "verifyServerCert" boolean, "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar DEFAULT ('[]'), "nameFromProvider" varchar, "sentinelMasterName" varchar, "sentinelMasterUsername" varchar, "sentinelMasterPassword" varchar, "provider" varchar DEFAULT ('UNKNOWN'), "modules" varchar NOT NULL DEFAULT ('[]'), "db" integer, "encryption" varchar, "tlsServername" varchar, "new" boolean, "ssh" boolean, "timeout" integer, "compressor" varchar NOT NULL DEFAULT ('NONE'), "version" varchar, "createdAt" datetime DEFAULT (datetime('now')), "forceStandalone" boolean, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt", "forceStandalone") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new", "ssh", "timeout", "compressor", "version", "createdAt", "forceStandalone" FROM "temporary_database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_instance"`);
    await queryRunner.query(
      `ALTER TABLE "client_certificate" RENAME TO "temporary_client_certificate"`,
    );
    await queryRunner.query(
      `CREATE TABLE "client_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, "key" varchar, CONSTRAINT "UQ_4966cf1c0e299df01049ebd53a5" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "client_certificate"("id", "name", "encryption", "certificate", "key") SELECT "id", "name", "encryption", "certificate", "key" FROM "temporary_client_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_client_certificate"`);
    await queryRunner.query(
      `ALTER TABLE "ca_certificate" RENAME TO "temporary_ca_certificate"`,
    );
    await queryRunner.query(
      `CREATE TABLE "ca_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, CONSTRAINT "UQ_23be613e4fb204fd5a66916b0b3" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "ca_certificate"("id", "name", "encryption", "certificate") SELECT "id", "name", "encryption", "certificate" FROM "temporary_ca_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_ca_certificate"`);
  }
}
