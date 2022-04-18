xdescribe('dummy', () => {
  it('dummy', () => {});
});

// import * as fs from 'fs-extra';
// import { WsException } from '@nestjs/websockets';
// import * as MockedSocket from 'socket.io-mock';
// import ERROR_MESSAGES from 'src/constants/error-messages';
// import { LogFile } from 'src/modules/profiler/models/log-file';
// import { ProfilerClient } from './profiler.client';
//
// describe('LogFile', () => {
//   let socketClient;
//
//   beforeEach(() => {
//     socketClient = new MockedSocket();
//     socketClient.id = '123';
//     socketClient.emit = jest.fn();
//   });
//
//   it('should create log file', async () => {
//     const logFile = new LogFile('1234');
//     const writeStream = logFile.getWriteStream();
//     writeStream.on('error', (e) => {
//       console.log('ERROR: ', e);
//     });
//     writeStream.on('close', () => {
//       console.log('CLOSED: ');
//     });
//     await new Promise((res) => {
//       writeStream.on('ready', () => {
//         console.log('READY');
//         res(null);
//       });
//       writeStream.on('open', () => {
//         console.log('OPENED');
//         res(null);
//       });
//
//     });
//     await writeStream.write('aaa');
//     await writeStream.write('bbb');
//     const { path } = writeStream;
//     console.log('1', fs.readFileSync(path).toString())
//     await fs.unlink(path);
//     // console.log('2', fs.readFileSync(path).toString())
//     writeStream.write('ccc');
//     writeStream.write('ddd');
//     writeStream.close();
//     // console.log('3', fs.readFileSync(path).toString())
//     // const client = new ProfilerClient(socketClient.id, socketClient);
//
//     // expect(client.id).toEqual(socketClient.id);
//     await new Promise((res) => setTimeout(res, 2000));
//   });
//   // it('should emit event on monitorData', async () => {
//   //   const client = new ProfilerClient(socketClient.id, socketClient);
//   //   const monitorData = {
//   //     // unix timestamp
//   //     time: `${(new Date()).getTime() / 1000}`,
//   //     source: '127.0.0.1:58612',
//   //     database: 0,
//   //     args: ['set', 'foo', 'bar'],
//   //   };
//   //   const payload: IOnDatePayload = { ...monitorData, shardOptions: { host: '127.0.0.1', port: 6379 } };
//   //
//   //   client.handleOnData(payload);
//   //
//   //   await new Promise((r) => setTimeout(r, 500));
//   //
//   //   expect(socketClient.emit).toHaveBeenCalledWith(MonitorGatewayServerEvents.Data, [monitorData]);
//   // });
//   // it.only('should emit exception event', () => {
//   //   const client = new ProfilerClient(socketClient.id, socketClient);
//   //
//   //   client.handleOnDisconnect();
//   //
//   //   expect(socketClient.emit).toHaveBeenCalledWith(
//   //     MonitorGatewayServerEvents.Exception,
//   //     new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
//   //   );
//   // });
// });
