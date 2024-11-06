import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IDatabaseEntity } from 'src/modules/database/interfaces/database-relations.interface';

@Entity('database_cloud_details')
export class CloudDatabaseDetailsEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  cloudId: number;

  @Expose()
  @Column({ nullable: false })
  subscriptionType: string;

  @Expose()
  @Column({ nullable: true })
  planMemoryLimit: number;

  @Expose()
  @Column({ nullable: true })
  memoryLimitMeasurementUnit: number;

  @Expose()
  @Column({ nullable: true, default: false })
  free: boolean;

  @OneToOne(
    () => DatabaseEntity,
    (database) => database.cloudDetails,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  database: IDatabaseEntity;
}
