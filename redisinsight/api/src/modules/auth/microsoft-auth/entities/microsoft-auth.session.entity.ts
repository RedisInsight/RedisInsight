import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';
import { Column, Entity } from 'typeorm';

@Entity('microsoft_auth_session')
export class MicrosoftAuthSessionEntity {
    @Column({ nullable: false, primary: true })
    @Expose()
    id: string;

    @Column({ nullable: true })
    @DataAsJsonString()
    @Expose()
    data: string;

    @Column({ nullable: true })
    encryption: string;
} 