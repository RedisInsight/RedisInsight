import { join } from 'path';

const homedir = join(__dirname, '..');

module.exports = {
  dir_path: {
    homedir,
    logs: join(homedir, 'logs'),
    caCertificates: join(homedir, 'ca_certificates'),
    clientCertificates: join(homedir, 'client_certificates'),
  },
  server: {
    env: 'test',
    tls: !!process.env.SERVER_TLS || true,
    tlsCert: process.env.SERVER_TLS_CERT,
    tlsKey: process.env.SERVER_TLS_KEY,
  },
};
