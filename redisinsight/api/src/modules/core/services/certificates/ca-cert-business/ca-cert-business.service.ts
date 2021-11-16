import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CaCertificateEntity } from 'src/modules/core/models/ca-certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaCertDto } from 'src/modules/instances/dto/database-instance.dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import {
  EncryptionServiceErrorException,
} from 'src/modules/core/encryption/exceptions';

@Injectable()
export class CaCertBusinessService {
  private logger = new Logger('CaCertBusinessService');

  constructor(
    @InjectRepository(CaCertificateEntity)
    private readonly repository: Repository<CaCertificateEntity>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Get list of shortened CA certificates (id, name only)
   */
  async getAll(): Promise<CaCertificateEntity[]> {
    this.logger.log('Getting CA certificate list.');

    return this.repository
      .createQueryBuilder('c')
      .select(['c.id', 'c.name'])
      .getMany();
  }

  /**
   * Get full CA certificate entity by id with decrypted fields
   * @param id
   */
  async getOneById(id: string): Promise<CaCertificateEntity> {
    this.logger.log(`Getting CA certificate with id: ${id}.`);
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) {
      this.logger.error(`Unable to find CA certificate with id: ${id}`);
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CERTIFICATE_ID); // todo: why BadRequest?
    }

    return this.decryptEntityFields(entity);
  }

  async create(certDto: CaCertDto): Promise<CaCertificateEntity> {
    this.logger.log('Creating certificate.');
    const found = await this.repository.findOne({
      where: { name: certDto.name },
    });
    if (found) {
      this.logger.error(
        `Failed to create certificate. ${ERROR_MESSAGES.CA_CERT_EXIST}. name: ${certDto.name}`,
      );
      throw new BadRequestException(ERROR_MESSAGES.CA_CERT_EXIST);
    }
    try {
      const entity = await this.encryptEntityFields(this.repository.create({
        name: certDto.name,
        certificate: certDto.cert,
      }));

      return this.repository.save(entity);
    } catch (error) {
      this.logger.error('Failed to create certificate.', error);

      if (error instanceof EncryptionServiceErrorException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting certificate. id: ${id}`);
    const found = await this.repository.findOne({ where: { id } });
    if (!found) {
      this.logger.error(`Failed to delete certificate. Not Found. id: ${id}`);
      throw new NotFoundException();
    }
    try {
      await this.repository.delete(id);
      this.logger.log(`Succeed to delete certificate. id: ${id}`);
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
  private async encryptEntityFields(entity: CaCertificateEntity): Promise<CaCertificateEntity> {
    const {
      data: certificate,
      encryption,
    } = await this.encryptionService.encrypt(entity.certificate);

    return {
      ...entity,
      certificate,
      encryption,
    };
  }

  /**
   * Decrypt required CA certificate fields (certificate)
   * This method should not fail so in case of decryption error will return null for failed fields.
   * It will cause 401 Unauthorized errors when user tries to connect to redis database
   *
   * @param entity
   * @private
   */
  private async decryptEntityFields(entity: CaCertificateEntity): Promise<CaCertificateEntity> {
    let certificate = '';

    try {
      certificate = await this.encryptionService.decrypt(entity.certificate, entity.encryption);
    } catch (error) {
      this.logger.error(`Unable to decrypt certificate ${entity.name}`);
    }

    return {
      ...entity,
      certificate,
    };
  }
}
