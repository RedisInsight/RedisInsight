import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { plainToClass } from 'class-transformer';
import { MicrosoftAuthSessionRepository } from './microsoft-auth.session.repository';
import { MicrosoftAuthSessionEntity } from '../entities/microsoft-auth.session.entity';
import { MicrosoftAuthSession, MicrosoftAuthSessionData } from '../models/microsoft-auth-session.model';

export class LocalMicrosoftAuthSessionRepository extends MicrosoftAuthSessionRepository {
    private readonly modelEncryptor: ModelEncryptor;

    constructor(
        @InjectRepository(MicrosoftAuthSessionEntity)
        private readonly repository: Repository<MicrosoftAuthSessionEntity>,
        private readonly encryptionService: EncryptionService,
    ) {
        super();
        this.modelEncryptor = new ModelEncryptor(this.encryptionService, ['data']);
    }

    async get(id: string): Promise<MicrosoftAuthSessionData> {
        const entity = await this.repository.findOneBy({ id });

        if (!entity) {
            return null;
        }

        const decrypted = await this.modelEncryptor.decryptEntity(entity, false);
        return classToClass(MicrosoftAuthSessionData, decrypted);
    }

    async save(data: Partial<MicrosoftAuthSessionData>): Promise<void> {
        const entity = await this.modelEncryptor.encryptEntity(
            plainToClass(MicrosoftAuthSessionEntity, data),
        );

        await this.repository.upsert(entity, ['id']);
    }
} 