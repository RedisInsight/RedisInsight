import { EncryptionResult } from 'src/modules/core/encryption/models';

export interface IEncryptionStrategy {
  encrypt(data: string): Promise<EncryptionResult>;

  decrypt(data: string, encryptedWith: string): Promise<string | null>;
}
