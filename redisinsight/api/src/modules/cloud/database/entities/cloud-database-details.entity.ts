import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { IDatabase } from 'src/modules/database/interfaces/database.interface';

@Entity('cloud_database_details')
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
    'DatabaseEntity',
    'cloudDetails',
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'databaseInstanceId' })
  database_instance: IDatabase;
}