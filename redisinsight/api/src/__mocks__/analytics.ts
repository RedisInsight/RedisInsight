export const mockInstancesAnalyticsService = () => ({
  sendInstanceListReceivedEvent: jest.fn(),
  sendInstanceAddedEvent: jest.fn(),
  sendInstanceAddFailedEvent: jest.fn(),
  sendInstanceEditedEvent: jest.fn(),
  sendInstanceDeletedEvent: jest.fn(),
  sendConnectionFailedEvent: jest.fn(),
});

export const mockBrowserAnalyticsService = () => ({
  sendKeysScannedEvent: jest.fn(),
  sendKeyAddedEvent: jest.fn(),
  sendKeyTTLChangedEvent: jest.fn(),
  sendKeysDeletedEvent: jest.fn(),
  sendKeyValueAddedEvent: jest.fn(),
  sendKeyValueEditedEvent: jest.fn(),
  sendKeyValueRemovedEvent: jest.fn(),
  sendKeyScannedEvent: jest.fn(),
  sendGetListElementByIndexEvent: jest.fn(),
  sendJsonPropertyAddedEvent: jest.fn(),
  sendJsonPropertyEditedEvent: jest.fn(),
  sendJsonPropertyDeletedEvent: jest.fn(),
  sendJsonArrayPropertyAppendEvent: jest.fn(),
});

export const mockCliAnalyticsService = () => ({
  sendCliClientCreatedEvent: jest.fn(),
  sendCliClientCreationFailedEvent: jest.fn(),
  sendCliClientDeletedEvent: jest.fn(),
  sendCliClientRecreatedEvent: jest.fn(),
  sendCliCommandExecutedEvent: jest.fn(),
  sendCliCommandErrorEvent: jest.fn(),
  sendCliClusterCommandExecutedEvent: jest.fn(),
  sendCliConnectionErrorEvent: jest.fn(),
});

export const mockSettingsAnalyticsService = () => ({
  sendAnalyticsAgreementChange: jest.fn(),
  sendSettingsUpdatedEvent: jest.fn(),
});
