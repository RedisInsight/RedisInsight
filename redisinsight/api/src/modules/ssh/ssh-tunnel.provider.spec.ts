import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDatabaseWithSshBasic,
} from 'src/__mocks__';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { EventEmitter } from 'events';
import {
  UnableToCreateLocalServerException,
  UnableToCreateSshConnectionException,
  UnableToCreateTunnelException,
} from 'src/modules/ssh/exceptions';
import * as net from 'net';
import * as ssh2 from 'ssh2';
import * as detectPort from 'detect-port';
import Mock = jest.Mock;

jest.mock('ssh2', () => ({
  ...jest.requireActual('ssh2') as object,
}));

jest.mock('net', () => ({
  ...jest.requireActual('net') as object,
}));

jest.mock('detect-port');

describe('SshTunnelProvider', () => {
  let service: SshTunnelProvider;
  let mockClient;
  let mockServer;
  let createServerSpy;
  let sshClientSpy;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SshTunnelProvider,
      ],
    }).compile();

    service = await module.get(SshTunnelProvider);

    mockClient = new EventEmitter();
    mockClient.connect = jest.fn();
    mockServer = new EventEmitter();
    mockServer.listen = jest.fn(() => mockServer.emit('listening'));
    mockServer.address = jest.fn().mockReturnValue({ address: '127.0.0.1', port: 50000 });
    createServerSpy = jest.spyOn(net, 'createServer');
    createServerSpy.mockImplementationOnce(() => mockServer);
    sshClientSpy = jest.spyOn(ssh2, 'Client');
    sshClientSpy.mockImplementationOnce(() => mockClient);
    (detectPort as Mock).mockImplementationOnce(() => Promise.resolve(50000));
  });

  describe('createTunnel', () => {
    it('should create tunnel', (done) => {
      service.createTunnel(mockDatabaseWithSshBasic)
        .then((tnl) => {
          expect(mockServer.listen).toHaveBeenCalledWith({
            host: '127.0.0.1',
            port: 50000,
          });

          expect(tnl['client']).toEqual(mockClient);
          expect(tnl['server']).toEqual(mockServer);
          done();
        })
        .catch(done);

      process.nextTick(() => mockClient.emit('ready'));
      process.nextTick(() => mockServer.emit('listening'));
    });
    it('should fail due to server init error', (done) => {
      (mockServer.listen as Mock).mockImplementationOnce(() => mockServer.emit('error', new Error('bb')));

      service.createTunnel(mockDatabaseWithSshBasic)
        .catch((e) => {
          expect(e).toBeInstanceOf(UnableToCreateLocalServerException);
          done();
        });

      process.nextTick(() => mockClient.emit('ready'));
    });
    it('should fail with error but not with unable to get property from "undefined"', (done) => {
      (mockServer.listen as Mock).mockImplementationOnce(() => mockServer.emit('error', new Error('bb')));

      service.createTunnel(undefined)
        .catch((e) => {
          expect(e).toBeInstanceOf(UnableToCreateLocalServerException);
          done();
        });

      process.nextTick(() => mockClient.emit('ready'));
    });
    it('should fail due to createServer failed', (done) => {
      const mockError = new Error('Cannot parse privateKey: due to some reason');
      createServerSpy.mockReset().mockImplementationOnce(() => {
        throw mockError;
      });

      service.createTunnel(mockDatabaseWithSshBasic)
        .catch((e) => {
          expect(e).toBeInstanceOf(UnableToCreateTunnelException);
          expect(e.message).toEqual('Unable to create tunnel. Cannot parse privateKey');
          done();
        });

      process.nextTick(() => mockClient.emit('ready'));
    });
    it('should fail due to ssh client creation failed', (done) => {
      const mockError = new Error('some not processed error');

      service.createTunnel(mockDatabaseWithSshBasic)
        .catch((e) => {
          expect(e).toBeInstanceOf(UnableToCreateSshConnectionException);
          done();
        });

      process.nextTick(() => mockClient.emit('error', mockError));
      process.nextTick(() => mockServer.emit('listening'));
    });
  });
});
