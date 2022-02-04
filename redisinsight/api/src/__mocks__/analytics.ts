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
  sendClientCreatedEvent: jest.fn(),
  sendClientCreationFailedEvent: jest.fn(),
  sendClientDeletedEvent: jest.fn(),
  sendClientRecreatedEvent: jest.fn(),
  sendCommandExecutedEvent: jest.fn(),
  sendCommandErrorEvent: jest.fn(),
  sendClusterCommandExecutedEvent: jest.fn(),
  sendConnectionErrorEvent: jest.fn(),
});

export const mockWorkbenchAnalyticsService = () => ({
  sendCommandExecutedEvent: jest.fn(),
});

export const mockSettingsAnalyticsService = () => ({
  sendAnalyticsAgreementChange: jest.fn(),
  sendSettingsUpdatedEvent: jest.fn(),
});
