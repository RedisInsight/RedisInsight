import { EntityRepository, Repository } from 'typeorm';
import { ServerEntity } from 'src/modules/core/models/server.entity';

@EntityRepository(ServerEntity)
export class ServerRepository extends Repository<ServerEntity> {}
