import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IBaseDatabaseEntity } from 'src/modules/database/interfaces/entity-interfaces';
import { IBaseSshOptionsEntity } from '../interfaces/entity-interfaces';

@Entity('ssh_options')
export class SshOptionsEntity implements IBaseSshOptionsEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  host: string;

  @Expose()
  @Column({ nullable: false })
  port: number;

  @Expose()
  @Column({ nullable: true })
  encryption: string;

  @Expose()
  @Column({ nullable: true })
  username: string;

  @Expose()
  @Column({ nullable: true })
  password: string;

  @Expose()
  @Column({ nullable: true })
  privateKey: string;

  @Expose()
  @Column({ nullable: true })
  passphrase: string;

  @OneToOne('database_instance', {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  database: IBaseDatabaseEntity;

  @RelationId((sshOptions: SshOptionsEntity) => sshOptions.database)
  databaseId: string;
}
