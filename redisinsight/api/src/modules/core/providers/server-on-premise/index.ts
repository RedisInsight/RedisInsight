import { ServerRepository } from 'src/modules/core/repositories/server.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { ServerOnPremiseService } from './server-on-premise.service';

export default {
  provide: 'SERVER_PROVIDER',
  useFactory: (
    repository: ServerRepository,
    eventEmitter: EventEmitter2,
    encryptionService: EncryptionService,
  ) => new ServerOnPremiseService(repository, eventEmitter, encryptionService),
  inject: [ServerRepository, EventEmitter2, EncryptionService],
};
