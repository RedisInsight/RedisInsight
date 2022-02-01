import { ForbiddenException } from '@nestjs/common';
import * as Redis from 'ioredis';
import { mockClientMonitorObserver, mockRedisMonitorObserver } from 'src/__mocks__/monitor';
import { ReplyError } from 'src/models';
import { mockRedisNoPermError } from 'src/__mocks__';
import { MonitorObserverStatus } from './monitor-observer.interface';
import { MonitorObserver } from './monitor-observer';

const nodeClient = Object.create(Redis.prototype);
nodeClient.monitor = jest.fn().mockResolvedValue(mockRedisMonitorObserver);
nodeClient.status = 'ready';
nodeClient.options = { ...nodeClient.options, host: 'localhost', port: 6379 };

const clusterClient = Object.create(Redis.Cluster.prototype);
const mockClusterNode1 = nodeClient;
const mockClusterNode2 = nodeClient;
mockClusterNode1.options = { ...nodeClient.options, host: 'localhost', port: 5000 };
mockClusterNode2.options = { ...nodeClient.options, host: 'localhost', port: 5001 };

clusterClient.nodes = jest.fn().mockReturnValue([mockClusterNode1, mockClusterNode2]);

const NO_PERM_ERROR: ReplyError = {
  ...mockRedisNoPermError,
  command: 'MONITOR',
};

describe('MonitorObserver', () => {
  describe('for redis standalone', () => {
    let monitorObserver;
    beforeEach(() => {
      MonitorObserver.isMonitorAvailable = jest.fn().mockResolvedValue(true);
      monitorObserver = new MonitorObserver(nodeClient);
    });

    it('should create shard observer only on first subscribe call', async () => {
      const connectMethod = jest.spyOn(monitorObserver, 'connect');

      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });
      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });

      expect(monitorObserver.status).toBe(MonitorObserverStatus.Ready);
      expect(connectMethod).toHaveBeenCalledTimes(1);
      expect(monitorObserver.clientMonitorObservers.has('1')).toEqual(true);
      expect(monitorObserver.clientMonitorObservers.has('2')).toEqual(true);
      expect(monitorObserver.shardsObservers.length).toEqual(1);
      expect(monitorObserver.getSize()).toEqual(2);
    });
    it('should be set to END status on clear', async () => {
      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });

      monitorObserver.clear();

      expect(monitorObserver.status).toBe(MonitorObserverStatus.End);
      expect(monitorObserver.getSize()).toEqual(0);
      expect(monitorObserver.shardsObservers.length).toEqual(0);
    });
    it('should be set to END status if there are no more observers', async () => {
      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });

      monitorObserver.unsubscribe('1');
      monitorObserver.unsubscribe('2');

      expect(monitorObserver.status).toBe(MonitorObserverStatus.End);
      expect(monitorObserver.getSize()).toEqual(0);
      expect(monitorObserver.shardsObservers.length).toEqual(0);
    });
    it('should throw ForbiddenException if a user has no permissions', async () => {
      MonitorObserver.isMonitorAvailable = jest.fn().mockRejectedValue(NO_PERM_ERROR);

      await expect(
        monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
  describe('for redis cluster', () => {
    let monitorObserver;
    beforeEach(() => {
      MonitorObserver.isMonitorAvailable = jest.fn().mockResolvedValue(true);
      monitorObserver = new MonitorObserver(clusterClient);
    });

    it('should create shard observer only on first subscribe call', async () => {
      const connectMethod = jest.spyOn(monitorObserver, 'connect');

      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });

      expect(monitorObserver.status).toBe(MonitorObserverStatus.Ready);
      expect(connectMethod).toHaveBeenCalledTimes(1);
      expect(monitorObserver.clientMonitorObservers.has('1')).toEqual(true);
      expect(monitorObserver.shardsObservers.length).toEqual(2);
      expect(monitorObserver.getSize()).toEqual(1);
    });
    it('should be set to END status on clear', async () => {
      await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });

      monitorObserver.clear();

      expect(monitorObserver.status).toBe(MonitorObserverStatus.End);
      expect(monitorObserver.getSize()).toEqual(0);
      expect(monitorObserver.shardsObservers.length).toEqual(0);
    });
    // eslint-disable-next-line sonarjs/no-identical-functions
    it('should throw ForbiddenException if a user has no permissions', async () => {
      MonitorObserver.isMonitorAvailable = jest.fn().mockRejectedValue(NO_PERM_ERROR);

      await expect(
        monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
