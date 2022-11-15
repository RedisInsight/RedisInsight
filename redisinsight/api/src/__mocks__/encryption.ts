export const mockDataToEncrypt = 'stringtoencrypt';
export const mockKeytarPassword = 'somepassword';
export const mockEncryptResult = {
  data: '4a558dfef5c1abbdf745232614194ee9',
  encryption: 'KEYTAR',
};

export const mockEncryptionService = () => ({
  getAvailableEncryptionStrategies: jest.fn(),
  encrypt: jest.fn(),
  decrypt: jest.fn(),
});

export const mockEncryptionStrategy = jest.fn(() => ({
  isAvailable: jest.fn(),
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

export const mockKeytarModule = {
  getPassword: jest.fn(),
  setPassword: jest.fn(),
};
