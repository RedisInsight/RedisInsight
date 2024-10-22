import { HttpException, Injectable } from '@nestjs/common';
import { Client } from 'ssh2';
import { createServer, Server, AddressInfo } from 'net';
import { SshTunnel } from 'src/modules/ssh/models/ssh-tunnel';
import { UnableToCreateTunnelException } from 'src/modules/ssh/exceptions';
import { Endpoint } from 'src/common/models';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

@Injectable()
export class SshTunnelProvider {
  public async createTunnel(target: Endpoint, sshOptions: SshOptions): Promise<SshTunnel> {
    return new Promise((resolve, reject) => {
      const client = new Client();
      let server: Server | null = null;

      // Handle keyboard-interactive auth if needed
      // if (sshOptions?.tryKeyboard) {
      //   client.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
      //     finish([sshOptions.password || '']);
      //   });
      // }

      client.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
        finish([sshOptions.password || '']);
      }

      client.on('ready', () => {
        // Create local server after SSH connection is established
        server = createServer((sock) => {
          client.forwardOut(
            sock.remoteAddress || '127.0.0.1',
            sock.remotePort || 0,
            target.host,
            target.port,
            (err, stream) => {
              if (err) {
                sock.destroy();
                return;
              }

              sock.pipe(stream).pipe(sock);

              // Handle socket cleanup
              stream.on('error', () => sock.destroy());
              sock.on('error', () => stream.destroy());
            }
          );
        });

        // Handle server errors
        server.on('error', (err) => {
          client.end();
          reject(new UnableToCreateTunnelException(err.message));
        });

        // Start listening on random port
        server.listen(0, '127.0.0.1', () => {
          const tunnel = new SshTunnel(
            server!,
            client,
            {
              targetHost: target.host,
              targetPort: target.port,
            }
          );
          resolve(tunnel);
        });
      });

      client.on('error', (err) => {
        if (server) {
          server.close();
        }
        reject(new UnableToCreateTunnelException(err.message));
      });

      // Connect to SSH server
      try {
        client.connect({
          host: sshOptions.host,
          port: sshOptions.port,
          username: sshOptions.username,
          password: sshOptions.password,
          privateKey: sshOptions.privateKey,
          tryKeyboard: false,
        });
      } catch (e) {
        if (e instanceof HttpException) {
          throw e;
        }
        throw new UnableToCreateTunnelException(e.message);
      }
    });
  }
}
