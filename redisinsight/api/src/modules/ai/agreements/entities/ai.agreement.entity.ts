import { Expose } from 'class-transformer';
import {
  Column, Entity,
} from 'typeorm';

@Entity('ai_agreement')
export class AiAgreementEntity {
  @Column({ nullable: false, primary: true })
  @Expose()
  accountId: string;

  @Column({ nullable: false, default: false })
  @Expose()
  consent: boolean;
}
