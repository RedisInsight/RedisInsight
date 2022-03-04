import * as os from 'os';
import * as net from 'net';
import { spawn } from 'child_process';
import { isObject } from 'lodash';

interface Endpoint {
  host: string,
  port: number,
}

/**
 * Get "netstat" command and args based on operation system
 */
export const getSpawnArgs = (): [string, string[]] => {
  switch (os.type()) {
    case 'Linux':
      return ['netstat', ['-anpt']];
    case 'Darwin':
      return ['netstat', ['-anvp', 'tcp']];
    case 'Windows_NT':
      return ['netstat.exe', ['-a', '-n', '-o']];
    default:
      throw new Error('Unsupported operation system');
  }
};

/**
 * Get list of processes running on local machine
 */
export const getRunningProcesses = async (): Promise<string[]> => new Promise((resolve, reject) => {
  try {
    let stdoutData = '';
    const proc = spawn(...getSpawnArgs());

    proc.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    proc.stdout.on('error', (e) => {
      reject(e);
    });

    proc.stdout.on('end', () => {
      resolve(stdoutData.split('\n'));
    });
  } catch (e) {
    reject(e);
  }
});

/**
 * Return list of unique endpoints (host is hardcoded) to test
 * @param processes
 */
export const getTCP4Endpoints = (processes: string[]): Endpoint[] => {
  const regExp = /(\d+\.\d+\.\d+\.\d+|\*)[:.](\d+)/;
  const endpoints = new Map();

  processes.forEach((line) => {
    const match = line.match(regExp);

    if (match) {
      endpoints.set(match[2], {
        host: 'localhost',
        port: parseInt(match[2], 10),
      });
    }
  });

  return [...endpoints.values()];
};

/**
 * Check RESP protocol response from tcp connection
 * @param endpoint
 */
export const testEndpoint = async (endpoint: Endpoint): Promise<Endpoint> => new Promise((resolve) => {
  const client = net.createConnection({
    host: endpoint.host,
    port: endpoint.port,
  }, () => {
    client.write('PING\r\n');
  });

  client.on('data', (data) => {
    client.end();

    if (data.toString().startsWith('+PONG')) {
      resolve(endpoint);
    } else {
      resolve(null);
    }
  });

  client.on('error', () => {
    resolve(null);
  });

  setTimeout(() => {
    client.end();
    resolve(null);
  }, 1000);
});

/**
 * Get endpoints that we are able to connect and receive expected RESP protocol response
 * @param endpoints
 */
export const getAvailableEndpoints = async (
  endpoints: Endpoint[],
): Promise<Endpoint[]> => (await Promise.all(endpoints.map(testEndpoint))).filter(isObject);
