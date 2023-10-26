import { EncryptionStrategy } from 'src/modules/encryption/models';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';
import { SshOptionsEntity } from 'src/modules/ssh/entities/ssh-options.entity';

export const mockSshOptionsId = 'a77b23c1-7816-4ea4-b61f-d37795a0f805-ssh-id';

export const mockSshOptionsUsernamePlain = 'ssh-username';
export const mockSshOptionsUsernameEncrypted = 'ssh.username.ENCRYPTED';
export const mockSshOptionsPasswordPlain = 'ssh-password';
export const mockSshOptionsPasswordEncrypted = 'ssh.password.ENCRYPTED';
export const mockSshOptionsPrivateKeyPlain = '-----BEGIN OPENSSH PRIVATE KEY-----\nssh-private-key';
export const mockSshOptionsPrivateKeyEncrypted = 'ssh.privateKey.ENCRYPTED';
export const mockSshOptionsPassphrasePlain = 'ssh-passphrase';
export const mockSshOptionsPassphraseEncrypted = 'ssh.passphrase.ENCRYPTED';

export const mockSshOptionsBasic = Object.assign(new SshOptions(), {
  id: mockSshOptionsId,
  host: 'ssh.host.test',
  port: 22,
  username: mockSshOptionsUsernamePlain,
  password: mockSshOptionsPasswordPlain,
  privateKey: undefined,
  passphrase: undefined,
});

export const mockSshOptionsBasicEntity = Object.assign(new SshOptionsEntity(), {
  ...mockSshOptionsBasic,
  username: mockSshOptionsUsernameEncrypted,
  password: mockSshOptionsPasswordEncrypted,
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockSshOptionsPrivateKey = Object.assign(new SshOptions(), {
  ...mockSshOptionsBasic,
  password: undefined,
  privateKey: mockSshOptionsPrivateKeyPlain,
  passphrase: mockSshOptionsPassphrasePlain,
});

export const mockSshOptionsPrivateKeyEntity = Object.assign(new SshOptionsEntity(), {
  ...mockSshOptionsBasicEntity,
  password: null,
  privateKey: mockSshOptionsPrivateKeyEncrypted,
  passphrase: mockSshOptionsPassphraseEncrypted,
});

export const mockSshTunnelProvider = jest.fn(() => {

});
