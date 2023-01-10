import { Socket, Server } from 'socket.io';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Body,
  Logger, UseFilters, UsePipes, ValidationPipe,
} from '@nestjs/common';
import config from 'src/utils/config';
import { BulkActionsServerEvents } from 'src/modules/bulk-actions/constants';
import { CreateBulkActionDto } from 'src/modules/bulk-actions/dto/create-bulk-action.dto';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { AckWsExceptionFilter } from 'src/modules/pub-sub/filters/ack-ws-exception.filter';
import { BulkActionIdDto } from 'src/modules/bulk-actions/dto/bulk-action-id.dto';

const SOCKETS_CONFIG = config.get('sockets');

@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(AckWsExceptionFilter)
@WebSocketGateway({ namespace: 'bulk-actions', cors: SOCKETS_CONFIG.cors, serveClient: SOCKETS_CONFIG.serveClient })
export class BulkActionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('BulkActionsGateway');

  constructor(
    private service: BulkActionsService,
  ) {}

  @SubscribeMessage(BulkActionsServerEvents.Create)
  create(@ConnectedSocket() socket: Socket, @Body() dto: CreateBulkActionDto) {
    this.logger.log('Creating new bulk action.');
    return this.service.create(dto, socket);
  }

  @SubscribeMessage(BulkActionsServerEvents.Get)
  get(@Body() dto: BulkActionIdDto) {
    this.logger.log('Subscribing to bulk action.');
    return this.service.get(dto);
  }

  @SubscribeMessage(BulkActionsServerEvents.Abort)
  abort(@Body() dto: BulkActionIdDto) {
    this.logger.log('Aborting bulk action.');
    return this.service.abort(dto);
  }

  async handleConnection(socket: Socket): Promise<void> {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${socket.id}`);
    this.service.disconnect(socket.id);
  }
}
