import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { RdiEntity } from 'src/modules/rdi/entities/rdi.entity';
import { Rdi, RdiType } from 'src/modules/rdi/models';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { classToClass } from 'src/utils';

// mock data
let mockRdiInstances: Rdi[] = [
  {
    type: RdiType.API,
    id: uuidv4(),
    name: 'My first integration',
    url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
    lastConnection: new Date(),
    version: '1.2',
    username: '',
    password: '',
  },
  {
    type: RdiType.API,
    id: uuidv4(),
    name: 'My second integration',
    url: 'redis-67890.c253.us-central1-1.gce.cloud.redislabs.com:67890',
    lastConnection: new Date(),
    version: '1.2',
    username: '',
    password: '',
  },
];

@Injectable()
export class LocalRdiRepository extends RdiRepository {
  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(RdiEntity)
    private readonly repository: Repository<RdiEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(this.encryptionService, ['password']);
  }

  /**
   * @inheritDoc
   */
  public async get(id: string, ignoreEncryptionErrors: boolean = false): Promise<Rdi> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      return null;
    }

    return classToClass(Rdi, await this.modelEncryptor.decryptEntity(entity, ignoreEncryptionErrors));
  }

  /**
   * @inheritDoc
   */
  public async list(): Promise<Rdi[]> {
    const entities = mockRdiInstances;

    return entities.map((entity) => classToClass(Rdi, entity));
  }

  /**
   * @inheritDoc
   */
  public async create(rdi: Rdi): Promise<Rdi> {
    mockRdiInstances.push(rdi);
    return rdi;
  }

  /**
   * @inheritDoc
   */
  public async update(id: string, rdi: Partial<Rdi>): Promise<Rdi> {
    // todo: the same way as PATCH for databases
    return null;
  }

  /**
   * @inheritDoc
   */
  public async delete(ids: string[]): Promise<void> {
    mockRdiInstances = mockRdiInstances.filter((instance) => !ids.includes(instance.id));
    await this.repository.delete(ids);
  }
}
