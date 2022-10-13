import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Transform } from 'class-transformer';

@Entity('settings')
export class SettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Applied settings by user.',
    type: String,
  })
  @Column({ nullable: true })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((string) => {
    try {
      return JSON.parse(string);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  @Expose()
  data: string;
}
