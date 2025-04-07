import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

@Entity('microsoft_auth_session')
export class MicrosoftAuthEntity {
  @Column({ nullable: false, primary: true })
  @Expose()
  id: string;

  @Column({ name: 'token_cache', nullable: true, type: 'text' })
  @Expose()
  tokenCache: string;

  @Column({ nullable: true })
  @Expose()
  username: string;

  @Column({ name: 'account_id', nullable: true })
  @Expose()
  accountId: string;

  @Column({ name: 'tenant_id', nullable: true })
  @Expose()
  tenantId: string;

  @Column({ name: 'display_name', nullable: true })
  @Expose()
  displayName: string;

  @Column({ name: 'last_updated', nullable: true, type: 'bigint' })
  @Expose()
  lastUpdated: number;

  @Column({ nullable: true })
  encryption: string;
}