import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientCertificateEntity } from 'src/modules/core/models/client-certificate.entity';
import { ClientCertPairDto } from 'src/modules/instances/dto/database-instance.dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import {
  EncryptionServiceErrorException,
} from 'src/modules/core/encryption/exceptions';

@Injectable()
export class ClientCertBusinessService {
  private logger = new Logger('ClientCertBusinessService');

  constructor(
    @InjectRepository(ClientCertificateEntity)
    private readonly repository: Repository<ClientCertificateEntity>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Get list of shortened CA certificates (id, name only)
   */
  async getAll(): Promise<ClientCertificateEntity[]> {
    this.logger.log('Getting client certificates list.');

    return this.repository
      .createQueryBuilder('c')
      .select(['c.id', 'c.name'])
      .getMany();
  }

  /**
   * Get full Client certificate entity by id with decrypted fields
   * @param id
   */
  async getOneById(id: string): Promise<ClientCertificateEntity> {
    this.logger.log(`Getting client certificate with id: ${id}.`);
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      this.logger.error(`Unable to find client certificate with id: ${id}`);
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CERTIFICATE_ID); // todo: why BadRequest?
    }

    return this.decryptEntityFields(entity);
  }

  async create(certDto: ClientCertPairDto): Promise<ClientCertificateEntity> {
    this.logger.log('Creating certificate.');
    const found = await this.repository.findOneBy({ name: certDto.name });

    if (found) {
      this.logger.error(
        `Failed to create certificate. name: ${certDto.name}`,
        ERROR_MESSAGES.CLIENT_CERT_EXIST,
      );
      throw new BadRequestException(ERROR_MESSAGES.CLIENT_CERT_EXIST);
    }

    try {
      const entity = await this.encryptEntityFields(this.repository.create({
        name: certDto.name,
        certificate: certDto.cert,
        key: certDto.key,
      }));
      const res = await this.repository.save(entity);

      this.logger.log('Succeed to create certificate.');
      return res;
    } catch (error) {
      this.logger.error('Failed to create client certificate.', error);

      if (error instanceof EncryptionServiceErrorException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting client-certificate. id: ${id}`);
    const found = await this.repository.findOneBy({ id });

    if (!found) {
      this.logger.error(
        `Failed to delete client-certificate. Not Found. id: ${id}`,
      );
      throw new NotFoundException();
    }
    try {
      await this.repository.delete(id);
      this.logger.log(`Succeed to delete certificate. id: ${id}`);
      return;
    } catch (error) {
      this.logger.error(`Failed to delete certificate ${id}`, error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Encrypt required certificates fields based on picked encryption strategy
   * Should always throw some encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  private async encryptEntityFields(
    entity: ClientCertificateEntity,
  ): Promise<ClientCertificateEntity> {
    const {
      data: certificate,
      encryption,
    } = await this.encryptionService.encrypt(entity.certificate);

    const {
      data: key,
    } = await this.encryptionService.encrypt(entity.key);

    return {
      ...entity,
      certificate,
      key,
      encryption,
    };
  }

  /**
   * Decrypt required client certificate fields (certificate and key)
   * This method should not fail so in case of decryption error will return null for failed fields.
   * It will cause 401 Unauthorized errors when user tries to connect to redis database
   *
   * @param entity
   * @private
   */
  private async decryptEntityFields(
    entity: ClientCertificateEntity,
  ): Promise<ClientCertificateEntity> {
    let certificate = '';
    let key = '';

    try {
      certificate = await this.encryptionService.decrypt(entity.certificate, entity.encryption);
      key = await this.encryptionService.decrypt(entity.key, entity.encryption);
    } catch (error) {
      this.logger.error(`Unable to decrypt client certificate ${entity.name}`);
    }

    return {
      ...entity,
      certificate,
      key,
    };
  }
}
