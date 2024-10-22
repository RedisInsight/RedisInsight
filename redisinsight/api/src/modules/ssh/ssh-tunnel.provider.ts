import { HttpException, Injectable } from '@nestjs/common';
import { Client } from 'ssh2';
import { createServer, Server, AddressInfo } from 'net';
import { SshTunnel } from 'src/modules/ssh/models/ssh-tunnel';
import { UnableToCreateTunnelException } from 'src/modules/ssh/exceptions';
import { Endpoint } from 'src/common/models';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

@Injectable()
export class SshTunnelProvider {
  private activeConnections: Map<string, { client: Client; server: Server | null }> = new Map();

  private getConnectionKey(target: Endpoint, sshOptions: SshOptions): string {
    return `${sshOptions.host}:${sshOptions.port}-${target.host}:${target.port}`;
  }

  private cleanupConnection(connectionKey: string): void {
    const connection = this.activeConnections.get(connectionKey);
    if (connection) {
      console.log('Cleaning up connection:', connectionKey);
    
      // Clean up server
      if (connection.server) {
        connection.server.close();
        connection.server.unref();
      }
    
      // Clean up client
      if (connection.client) {
        connection.client.removeAllListeners(); // Remove all event listeners
        connection.client.end();
        connection.client.destroy();
      }
    
      this.activeConnections.delete(connectionKey);
    }
  }

  public async createTunnel(target: Endpoint, sshOptions: SshOptions): Promise<SshTunnel> {
    return new Promise((resolve, reject) => {
      const connectionKey = this.getConnectionKey(target, sshOptions);
      
      // Cleanup any existing connection
      this.cleanupConnection(connectionKey);

      const client = new Client();
      let server: Server | null = null;

      client.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
        finish(['032100']);
      });

      // Handle authentication failure explicitly
      // client.on('authenticationFailed', () => {
      //   console.log('Authentication failed - cleaning up');
      //   client.end();
      // });


      client.on('ready', () => {
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

              stream.on('error', () => {
                sock.destroy();
              });

              sock.on('error', () => {
                stream.destroy();
              });

              // Handle stream close
              stream.on('close', () => {
                sock.destroy();
              });

              sock.on('close', () => {
                stream.destroy();
              });
            }
          );
        });

        server.on('error', (err) => {
          this.cleanupConnection(connectionKey);
          reject(new UnableToCreateTunnelException(err.message));
        });

        server.listen(0, '127.0.0.1', () => {
          const tunnel = new SshTunnel(
            server!,
            client,
            {
              targetHost: target.host,
              targetPort: target.port,
            }
          );

          // Store the active connection
          this.activeConnections.set(connectionKey, { client, server });

          resolve(tunnel);
        });
      });

      client.on('error', (err) => {
        this.cleanupConnection(connectionKey);
        reject(new UnableToCreateTunnelException(err.message));
      });

      // Handle explicit connection end
      client.on('end', () => {
        this.cleanupConnection(connectionKey);
      });

      // Handle unexpected connection close
      client.on('close', () => {
        this.cleanupConnection(connectionKey);
      });

      try {
        client.connect({
          host: sshOptions.host,
          port: sshOptions.port,
          username: sshOptions.username,
          privateKey: sshOptions.privateKey,
          tryKeyboard: true,
          // Additional SSH options for better connection handling
          keepaliveInterval: 10000, // Send keepalive every 10 seconds
          keepaliveCountMax: 3, // Allow 3 missed keepalives before considering connection dead
          readyTimeout: 20000, // Wait 20 seconds for initial connection
          debug: (msg: string) => {
            console.debug(`SSH Debug: ${msg}`);
          }
        });
      } catch (e) {
        this.cleanupConnection(connectionKey);
        if (e instanceof HttpException) {
          throw e;
        }
        throw new UnableToCreateTunnelException(e.message);
      }
    });
  }

  // Method to close a specific tunnel
  public async closeTunnel(target: Endpoint, sshOptions: SshOptions): Promise<void> {
    const connectionKey = this.getConnectionKey(target, sshOptions);
    this.cleanupConnection(connectionKey);
  }

  // Method to close all tunnels
  public async closeAllTunnels(): Promise<void> {
    for (const connectionKey of this.activeConnections.keys()) {
      this.cleanupConnection(connectionKey);
    }
  }
}
