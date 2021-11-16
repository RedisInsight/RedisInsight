import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface IAgreementsJSON {
  version: string;
}

@Entity('agreements')
export class AgreementsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Last accepted version.',
    type: String,
  })
  @Column({ nullable: true })
  version: string;

  @ApiProperty({
    description: 'User agreements.',
    type: String,
  })
  @Column({ nullable: true })
  data: string;

  toJSON(): IAgreementsJSON {
    const { version, data } = this;
    try {
      return {
        version,
        ...JSON.parse(data),
      };
    } catch (e) {
      return { version: null };
    }
  }
}
