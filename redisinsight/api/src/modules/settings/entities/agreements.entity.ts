import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Transform } from 'class-transformer';

@Entity('agreements')
export class AgreementsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Last accepted version.',
    type: String,
  })
  @Column({ nullable: true })
  @Expose()
  version: string;

  @ApiProperty({
    description: 'User agreements.',
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
