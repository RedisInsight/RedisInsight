import { get } from 'lodash';
import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ProfilerClient } from 'src/modules/profiler/models/profiler.client';
import { ClientLogsEmitter } from 'src/modules/profiler/emitters/client.logs-emitter';
import { MonitorSettings } from 'src/modules/profiler/models/monitor-settings';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';

@Injectable()
export class ProfilerClientProvider {
  private profilerClients: Map<string, ProfilerClient> = new Map();

  constructor(
    private logFileProvider: LogFileProvider,
    private instancesBusinessService: InstancesBusinessService,
  ) {}

  async getOrCreateClient(socket: Socket, settings: MonitorSettings): Promise<ProfilerClient> {
    if (!this.profilerClients.has(socket.id)) {
      const clientObserver = new ProfilerClient(socket.id, socket);
      this.profilerClients.set(socket.id, clientObserver);

      clientObserver.addLogsEmitter(new ClientLogsEmitter(socket));

      if (settings?.logFileId) {
        const profilerLogFile = this.logFileProvider.getOrCreate(settings.logFileId);

        // set database alias as part of the log file name
        const alias = (await this.instancesBusinessService.getOneById(
          get(socket, 'handshake.query.instanceId'),
        )).name;
        profilerLogFile.setAlias(alias);

        clientObserver.addLogsEmitter(await profilerLogFile.getEmitter());
      }

      this.profilerClients.set(socket.id, clientObserver);
    }

    return this.profilerClients.get(socket.id);
  }

  async getClient(id: string) {
    return this.profilerClients.get(id);
  }
}
