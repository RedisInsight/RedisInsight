import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IBaseDatabaseEntity, IBaseCloudDetailsEntity } from 'src/modules/database/interfaces/entity-interfaces';

@Entity('database_cloud_details')
export class CloudDatabaseDetailsEntity implements IBaseCloudDetailsEntity {
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

  @OneToOne('database_instance', {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  database: IBaseDatabaseEntity;
}
