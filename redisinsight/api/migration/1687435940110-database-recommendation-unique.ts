import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseRecommendationUnique1687435940110
  implements MigrationInterface
{
  name = 'DatabaseRecommendationUnique1687435940110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_2487bdd9dbde3fdf65bcb96fc5"`);
    await queryRunner.query(`DROP INDEX "IDX_d6107e5e16648b038c511f3b00"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_database_recommendations" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "name" varchar NOT NULL, "read" boolean NOT NULL DEFAULT (0), "disabled" boolean NOT NULL DEFAULT (0), "vote" varchar, "hide" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "params" blob, "encryption" varchar, CONSTRAINT "UQ_b772d2856a42685ce4227321251" UNIQUE ("databaseId", "name"), CONSTRAINT "FK_2487bdd9dbde3fdf65bcb96fc52" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT OR IGNORE INTO "temporary_database_recommendations"("id", "databaseId", "name", "read", "disabled", "vote", "hide", "createdAt", "params", "encryption") SELECT "id", "databaseId", "name", "read", "disabled", "vote", "hide", "createdAt", "params", "encryption" FROM "database_recommendations"`,
    );
    await queryRunner.query(`DROP TABLE "database_recommendations"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_recommendations" RENAME TO "database_recommendations"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2487bdd9dbde3fdf65bcb96fc5" ON "database_recommendations" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d6107e5e16648b038c511f3b00" ON "database_recommendations" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_d6107e5e16648b038c511f3b00"`);
    await queryRunner.query(`DROP INDEX "IDX_2487bdd9dbde3fdf65bcb96fc5"`);
    await queryRunner.query(
      `ALTER TABLE "database_recommendations" RENAME TO "temporary_database_recommendations"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_recommendations" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "name" varchar NOT NULL, "read" boolean NOT NULL DEFAULT (0), "disabled" boolean NOT NULL DEFAULT (0), "vote" varchar, "hide" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "params" blob, "encryption" varchar, CONSTRAINT "FK_2487bdd9dbde3fdf65bcb96fc52" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "database_recommendations"("id", "databaseId", "name", "read", "disabled", "vote", "hide", "createdAt", "params", "encryption") SELECT "id", "databaseId", "name", "read", "disabled", "vote", "hide", "createdAt", "params", "encryption" FROM "temporary_database_recommendations"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_recommendations"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_d6107e5e16648b038c511f3b00" ON "database_recommendations" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2487bdd9dbde3fdf65bcb96fc5" ON "database_recommendations" ("databaseId") `,
    );
  }
}
