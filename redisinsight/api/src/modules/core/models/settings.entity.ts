import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface ISettingsJSON {
  theme: string;
  scanThreshold: number;
}

const defaultData: ISettingsJSON = {
  theme: null,
  scanThreshold: null,
};

@Entity('settings')
export class SettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Applied settings by user.',
    type: String,
  })
  @Column({ nullable: true })
  data: string;

  toJSON(): ISettingsJSON {
    const { data } = this;
    try {
      return {
        ...defaultData,
        ...JSON.parse(data),
      };
    } catch (e) {
      return {
        ...defaultData,
      };
    }
  }
}
