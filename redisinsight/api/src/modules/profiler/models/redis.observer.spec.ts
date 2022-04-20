import * as Redis from 'ioredis-mock';
import { RedisObserver } from 'src/modules/profiler/models/redis.observer';
import { RedisObserverStatus } from 'src/modules/profiler/constants';

const redisClient = new Redis();
const getRedisClientFn = jest.fn();

describe('RedisObserver', () => {
  let redisObserver: RedisObserver;

  beforeEach(() => {
    redisObserver = new RedisObserver();
    getRedisClientFn.mockResolvedValue(redisClient);
  });

  it('initialization', () => {
    expect(redisObserver['status']).toEqual(RedisObserverStatus.Empty);
  });

  describe('init', () => {
    it('successfully init', async () => {
      await new Promise((resolve) => {
        redisObserver.init(getRedisClientFn);
        expect(redisObserver['status']).toEqual(RedisObserverStatus.Initializing);
        redisObserver.on('connect', () => {
          resolve(true);
        });
      });
      expect(redisObserver['status']).toEqual(RedisObserverStatus.Connected);
      expect(redisObserver['redis']).toEqual(redisClient);
    });
    it('init error due to redis connection', async () => {
      getRedisClientFn.mockRejectedValueOnce(new Error('error'));
      await redisObserver.init(getRedisClientFn);
      expect(redisObserver['status']).toEqual(RedisObserverStatus.Error);
      expect(redisObserver['redis']).toEqual(undefined);
    });
  });
});

// import { ForbiddenException } from '@nestjs/common';
// import * as Redis from 'ioredis';
// import { mockClientMonitorObserver, mockRedisMonitorObserver } from 'src/__mocks__/monitor';
// import { ReplyError } from 'src/models';
// import { mockRedisNoPermError } from 'src/__mocks__';
// import { MonitorObserverStatus } from '../helpers/monitor-observer/monitor-observer.interface';
// import { RedisMonitorClient } from '../../observers/monitor-observer';
//
// const nodeClient = Object.create(Redis.prototype);
// nodeClient.monitor = jest.fn().mockResolvedValue(mockRedisMonitorObserver);
// nodeClient.status = 'ready';
// nodeClient.options = { ...nodeClient.options, host: 'localhost', port: 6379 };
//
// const clusterClient = Object.create(Redis.Cluster.prototype);
// const mockClusterNode1 = nodeClient;
// const mockClusterNode2 = nodeClient;
// mockClusterNode1.options = { ...nodeClient.options, host: 'localhost', port: 5000 };
// mockClusterNode2.options = { ...nodeClient.options, host: 'localhost', port: 5001 };
//
// clusterClient.nodes = jest.fn().mockReturnValue([mockClusterNode1, mockClusterNode2]);
//
// const NO_PERM_ERROR: ReplyError = {
//   ...mockRedisNoPermError,
//   command: 'MONITOR',
// };
//
// describe('MonitorObserver', () => {
//   describe('for redis standalone', () => {
//     let monitorObserver;
//     beforeEach(() => {
//       RedisMonitorClient.isMonitorAvailable = jest.fn().mockResolvedValue(true);
//       monitorObserver = new RedisMonitorClient(nodeClient);
//     });
//
//     it('should create shard observer only on first subscribe call', async () => {
//       const connectMethod = jest.spyOn(monitorObserver, 'connect');
//
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });
//
//       expect(monitorObserver.status).toBe(MonitorObserverStatus.Ready);
//       expect(connectMethod).toHaveBeenCalledTimes(1);
//       expect(monitorObserver.clientMonitorObservers.has('1')).toEqual(true);
//       expect(monitorObserver.clientMonitorObservers.has('2')).toEqual(true);
//       expect(monitorObserver.shardsObservers.length).toEqual(1);
//       expect(monitorObserver.getSize()).toEqual(2);
//     });
//     it('should be set to END status on clear', async () => {
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });
//
//       monitorObserver.clear();
//
//       expect(monitorObserver.status).toBe(MonitorObserverStatus.End);
//       expect(monitorObserver.getSize()).toEqual(0);
//       expect(monitorObserver.shardsObservers.length).toEqual(0);
//     });
//     it('should be set to END status if there are no more observers', async () => {
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '2' });
//
//       monitorObserver.unsubscribe('1');
//       monitorObserver.unsubscribe('2');
//
//       expect(monitorObserver.status).toBe(MonitorObserverStatus.End);
//       expect(monitorObserver.getSize()).toEqual(0);
//       expect(monitorObserver.shardsObservers.length).toEqual(0);
//     });
//     it('should throw ForbiddenException if a user has no permissions', async () => {
//       RedisMonitorClient.isMonitorAvailable = jest.fn().mockRejectedValue(NO_PERM_ERROR);
//
//       await expect(
//         monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' }),
//       ).rejects.toThrow(ForbiddenException);
//     });
//   });
//   describe('for redis cluster', () => {
//     let monitorObserver;
//     beforeEach(() => {
//       RedisMonitorClient.isMonitorAvailable = jest.fn().mockResolvedValue(true);
//       monitorObserver = new RedisMonitorClient(clusterClient);
//     });
//
//     it('should create shard observer only on first subscribe call', async () => {
//       const connectMethod = jest.spyOn(monitorObserver, 'connect');
//
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
//
//       expect(monitorObserver.status).toBe(MonitorObserverStatus.Ready);
//       expect(connectMethod).toHaveBeenCalledTimes(1);
//       expect(monitorObserver.clientMonitorObservers.has('1')).toEqual(true);
//       expect(monitorObserver.shardsObservers.length).toEqual(2);
//       expect(monitorObserver.getSize()).toEqual(1);
//     });
//     it('should be set to END status on clear', async () => {
//       await monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' });
//
//       monitorObserver.clear();
//
//       expect(monitorObserver.status).toBe(MonitorObserverStatus.End);
//       expect(monitorObserver.getSize()).toEqual(0);
//       expect(monitorObserver.shardsObservers.length).toEqual(0);
//     });
//     // eslint-disable-next-line sonarjs/no-identical-functions
//     it('should throw ForbiddenException if a user has no permissions', async () => {
//       RedisMonitorClient.isMonitorAvailable = jest.fn().mockRejectedValue(NO_PERM_ERROR);
//
//       await expect(
//         monitorObserver.subscribe({ ...mockClientMonitorObserver, id: '1' }),
//       ).rejects.toThrow(ForbiddenException);
//     });
//   });
// });
