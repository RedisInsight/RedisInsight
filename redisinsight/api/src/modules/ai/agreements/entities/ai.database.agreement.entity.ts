import { Expose } from 'class-transformer';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import {
  Column, Entity, JoinColumn, ManyToOne,
  Unique,
} from 'typeorm';

@Entity('ai_database_agreement')
@Unique(['accountId', 'databaseId'])
export class AiDatabaseAgreementEntity {
  @Column({ nullable: false, primary: true })
  @Expose()
  accountId: string;

  @Column({ nullable: false, primary: true })
  @Expose()
  databaseId: string;

  @ManyToOne(
    () => DatabaseEntity,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'databaseId' })
  database: DatabaseEntity;

  @Column({ nullable: false, default: false })
  @Expose()
  dataConsent: boolean;
}
