import {
  Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('features_config')
export class FeaturesConfigEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Expose()
  controlGroup: number;

  @Column({ nullable: false })
  @Expose()
  @DataAsJsonString()
  config: string;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}
