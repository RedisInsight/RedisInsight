import {
  Rdi,
  RdiClientMetadata,
  RdiPipeline,
  RdiStatisticsData,
} from 'src/modules/rdi/models';
import { ApiRdiClient } from 'src/modules/rdi/client/api.rdi.client';
import { RdiEntity } from 'src/modules/rdi/entities/rdi.entity';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { RdiDryRunJobDto } from 'src/modules/rdi/dto';

export const mockRdiId = 'rdiId';
export const mockRdiPasswordEncrypted = 'password_ENCRYPTED';

export const mockRdiPasswordPlain = 'some pass';

export class MockRdiClient extends ApiRdiClient {
  constructor(metadata: RdiClientMetadata, client: any = jest.fn()) {
    super(metadata, client);
  }

  public getSchema = jest.fn();

  public getPipeline = jest.fn();

  public getConfigTemplate = jest.fn();

  public getJobTemplate = jest.fn();

  public getStrategies = jest.fn();

  public deploy = jest.fn();

  public deployJob = jest.fn();

  public dryRunJob = jest.fn();

  public testConnections = jest.fn();

  public getStatistics = jest.fn();

  public getPipelineStatus = jest.fn();

  public getJobFunctions = jest.fn();

  public connect = jest.fn();

  public ensureAuth = jest.fn();
}

export const generateMockRdiClient = (
  metadata: RdiClientMetadata,
  client = jest.fn(),
): MockRdiClient => new MockRdiClient(metadata as RdiClientMetadata, client);

export const mockRdiClientMetadata: RdiClientMetadata = {
  sessionMetadata: undefined,
  id: mockRdiId,
};

export const mockRdi = Object.assign(new Rdi(), {
  name: 'name',
  version: '1.2',
  url: 'http://localhost:4000',
  password: 'pass',
  username: 'user',
});

export const mockRdiPipeline = Object.assign(new RdiPipeline(), {
  jobs: { some_job: {} },
  config: {},
});

export const mockRdiDryRunJob: RdiDryRunJobDto = Object.assign(new RdiDryRunJobDto(), {
  input_data: {},
  job: {},
});

export const mockRdiStatisticsData = Object.assign(new RdiStatisticsData(), {});

export const mockRdiDecrypted = Object.assign(new Rdi(), {
  id: '1',
  name: 'name',
  version: '1.0',
  url: 'http://test.com',
  username: 'testuser',
  password: mockRdiPasswordPlain,
  lastConnection: new Date(),
});

export const mockRdiEntityEncrypted = Object.assign(new RdiEntity(), {
  ...mockRdiDecrypted,
  password: mockRdiPasswordEncrypted,
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockRdiUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
};

export const mockRdiRepository = jest.fn(() => ({
  get: jest.fn(),
  list: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

export const mockRdiClientProvider = jest.fn(() => ({
  getOrCreate: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  deleteManyByRdiId: jest.fn(),
}));

export const mockRdiClientFactory = jest.fn(() => ({
  createClient: jest.fn(),
}));

export const mockRdiClientStorage = jest.fn(() => ({
  getByMetadata: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  deleteManyByRdiId: jest.fn(),
}));

export const mockRdiPipelineAnalytics = jest.fn(() => ({
  sendRdiPipelineFetched: jest.fn(),
  sendRdiPipelineFetchFailed: jest.fn(),
  sendRdiPipelineDeployed: jest.fn(),
  sendRdiPipelineDeployFailed: jest.fn(),
}));

export const mockRdiAnalytics = jest.fn(() => ({
  sendRdiInstanceDeleted: jest.fn(),
}));
