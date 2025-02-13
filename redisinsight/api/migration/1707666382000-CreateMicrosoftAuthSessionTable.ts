import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMicrosoftAuthSessionTable1707666382000 implements MigrationInterface {
    name = 'CreateMicrosoftAuthSessionTable1707666382000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'microsoft_auth_session',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        isNullable: false,
                    },
                    {
                        name: 'data',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'encryption',
                        type: 'varchar',
                        isNullable: true,
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('microsoft_auth_session');
    }
} 