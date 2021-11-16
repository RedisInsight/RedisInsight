export enum EncryptionStrategy {
  PLAIN = 'PLAIN',
  KEYTAR = 'KEYTAR',
}

export class EncryptionResult {
  encryption?: EncryptionStrategy;

  data: string;
}
