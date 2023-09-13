import { Socket, Server } from 'socket.io';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException,
} from '@nestjs/websockets';
import {
  Logger, ValidationPipe,
} from '@nestjs/common';
import config from 'src/utils/config';
import { CloudJobEvents } from 'src/modules/cloud/common/constants';
import { CloudJobService } from 'src/modules/cloud/job/cloud-job.service';
import { MonitorCloudJobDto } from 'src/modules/cloud/job/dto/monitor.cloud-job.dto';
import { Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { DEFAULT_SESSION_ID, DEFAULT_USER_ID } from 'src/common/constants';
import { CloudJobInfo } from 'src/modules/cloud/job/models';

const SOCKETS_CONFIG = config.get('sockets');

@WebSocketGateway({ cors: SOCKETS_CONFIG.cors, serveClient: SOCKETS_CONFIG.serveClient })
export class CloudJobGateway {
  @WebSocketServer() wss: Server;

  private readonly validator = new Validator();

  private exceptionFactory = (new ValidationPipe()).createExceptionFactory();

  private logger: Logger = new Logger('CloudJobGateway');

  constructor(
    private readonly cloudJobService: CloudJobService,
  ) {}

  @SubscribeMessage(CloudJobEvents.Monitor)
  async monitor(client: Socket, data: MonitorCloudJobDto): Promise<CloudJobInfo> {
    try {
      const dto = plainToClass(MonitorCloudJobDto, data);

      const errors = await this.validator.validate(
        dto,
        { whitelist: true },
      );

      if (errors?.length) {
        throw this.exceptionFactory(errors);
      }

      // todo: implement session handling for entire app
      const sessionMetadata = {
        userId: DEFAULT_USER_ID,
        sessionId: DEFAULT_SESSION_ID,
      };

      return await this.cloudJobService.monitorJob(sessionMetadata, dto, client);
    } catch (error) {
      this.logger.error('Unable to add listener', error);
      throw new WsException(error);
    }
  }
}
