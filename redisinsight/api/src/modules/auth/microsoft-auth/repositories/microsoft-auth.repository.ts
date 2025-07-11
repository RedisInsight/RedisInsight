import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { plainToClass } from 'class-transformer';
import { Logger, Injectable } from '@nestjs/common';
import { MicrosoftAuthEntity } from '../entities/microsoft-auth.entity';
import { MicrosoftAuthSessionData } from '../models/microsoft-auth-session.model';

// Default ID for single Microsoft auth record
const DEFAULT_AUTH_ID = 'default';

@Injectable()
export class MicrosoftAuthRepository {
  private readonly modelEncryptor: ModelEncryptor;
  private readonly logger = new Logger('MicrosoftAuthRepository');

  constructor(
    @InjectRepository(MicrosoftAuthEntity)
    private readonly repository: Repository<MicrosoftAuthEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    this.modelEncryptor = new ModelEncryptor(this.encryptionService, [
      'tokenCache',
      'username',
      'accountId',
      'tenantId',
      'displayName'
    ]);
  }

  async get(id: string = DEFAULT_AUTH_ID): Promise<MicrosoftAuthSessionData | null> {
    try {
      const entity = await this.repository.findOneBy({ id });

      if (!entity) {
        return null;
      }

      const decrypted = await this.modelEncryptor.decryptEntity(entity, false);
      return classToClass(MicrosoftAuthSessionData, decrypted);
    } catch (error) {
      this.logger.error(`Error getting Microsoft auth data: ${error.message}`, error.stack);
      return null;
    }
  }

  async save(authData: Partial<MicrosoftAuthSessionData>): Promise<void> {
    try {
      const id = authData.id || DEFAULT_AUTH_ID;

      const entity = await this.modelEncryptor.encryptEntity(
        plainToClass(MicrosoftAuthEntity, { ...authData, id }),
      );

      await this.repository.upsert(entity, ['id']);
    } catch (error) {
      this.logger.error(`Error saving Microsoft auth data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error(`Error deleting Microsoft auth data: ${error.message}`, error.stack);
      throw error;
    }
  }
}