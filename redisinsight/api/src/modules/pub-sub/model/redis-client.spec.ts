import Redis from 'ioredis';
import { RedisClient } from 'src/modules/pub-sub/model/redis-client';
import { RedisClientEvents, RedisClientStatus } from 'src/modules/pub-sub/constants';

const getRedisClientFn = jest.fn();

const nodeClient = Object.create(Redis.prototype);
nodeClient.subscribe = jest.fn();
nodeClient.psubscribe = jest.fn();
nodeClient.unsubscribe = jest.fn();
nodeClient.punsubscribe = jest.fn();
nodeClient.status = 'ready';
nodeClient.disconnect = jest.fn();
nodeClient.quit = jest.fn();

describe('RedisClient', () => {
  let redisClient: RedisClient;

  beforeEach(() => {
    jest.resetAllMocks();
    redisClient = new RedisClient('databaseId', getRedisClientFn);
    getRedisClientFn.mockResolvedValue(nodeClient);
    nodeClient.subscribe.mockResolvedValue('OK');
    nodeClient.psubscribe.mockResolvedValue('OK');
  });

  describe('getClient', () => {
    let connectSpy;

    beforeEach(() => {
      connectSpy = jest.spyOn(redisClient as any, 'connect');
    });

    it('should connect and return client by default', async () => {
      expect(await redisClient.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClient['status']).toEqual(RedisClientStatus.Connected);
    });
    it('should wait until first attempt of connection finish with success', async () => {
      redisClient.getClient().then().catch();
      expect(redisClient['status']).toEqual(RedisClientStatus.Connecting);
      expect(await redisClient.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClient['status']).toEqual(RedisClientStatus.Connected);
    });
    it('should wait until first attempt of connection finish with error', async () => {
      try {
        getRedisClientFn.mockRejectedValueOnce(new Error('Connection error'));
        redisClient.getClient().then().catch(() => {});
        expect(redisClient['status']).toEqual(RedisClientStatus.Connecting);
        expect(await redisClient.getClient()).toEqual(nodeClient);
        fail();
      } catch (e) {
        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(redisClient['status']).toEqual(RedisClientStatus.Error);
      }
    });
    it('should return existing connection when status connected', async () => {
      expect(await redisClient.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClient['status']).toEqual(RedisClientStatus.Connected);
      expect(await redisClient.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
    it('should return create new connection when status end or error', async () => {
      expect(await redisClient.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClient['status']).toEqual(RedisClientStatus.Connected);
      redisClient['status'] = RedisClientStatus.Error;
      expect(await redisClient.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(2);
      expect(redisClient['status']).toEqual(RedisClientStatus.Connected);
      redisClient['status'] = RedisClientStatus.End;
      expect(await redisClient.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(3);
      expect(redisClient['status']).toEqual(RedisClientStatus.Connected);
    });
  });

  describe('connect', () => {
    it('should connect and emit connected event', async () => {
      expect(await new Promise((res) => {
        redisClient['connect']();
        redisClient.on(RedisClientEvents.Connected, res);
      })).toEqual(nodeClient);
    });
    it('should emit message event (message source)', async () => {
      await redisClient['connect']();
      const [id, message] = await new Promise((res: (value: any[]) => void) => {
        redisClient.on('message', (i, m) => res([i, m]));
        nodeClient.emit('message', 'channel-a', 'message-a');
      });

      expect(id).toEqual('s:channel-a');
      expect(message.channel).toEqual('channel-a');
      expect(message.message).toEqual('message-a');
    });
    it('should emit message event (pmessage source)', async () => {
      await redisClient['connect']();
      const [id, message] = await new Promise((res: (value: any[]) => void) => {
        redisClient.on('message', (i, m) => res([i, m]));
        nodeClient.emit('pmessage', '*', 'channel-aa', 'message-aa');
      });
      expect(id).toEqual('p:*');
      expect(message.channel).toEqual('channel-aa');
      expect(message.message).toEqual('message-aa');
    });
    it('should emit end event', async () => {
      await redisClient['connect']();
      await new Promise((res) => {
        redisClient.on('end', () => {
          res(null);
        });

        nodeClient.emit('end');
      });
    });
  });

  describe('destroy', () => {
    it('should remove all listeners, disconnect, set client to null and emit end event', async () => {
      const removeAllListenersSpy = jest.spyOn(nodeClient, 'removeAllListeners');

      await redisClient['connect']();
      redisClient.destroy();

      expect(redisClient['client']).toEqual(null);
      expect(redisClient['status']).toEqual(RedisClientStatus.End);
      expect(removeAllListenersSpy).toHaveBeenCalled();
      expect(nodeClient.quit).toHaveBeenCalled();
    });
  });
});
