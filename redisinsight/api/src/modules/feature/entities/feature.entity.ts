import {
  Column, Entity, PrimaryColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('features')
export class FeatureEntity {
  @Expose()
  @PrimaryColumn()
  name: string;

  @Expose()
  @Column()
  flag: boolean;

  @Expose()
  @Column()
  version: number;
}
