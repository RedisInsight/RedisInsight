import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import {
  Rdi,
  RdiClientMetadata,
} from 'src/modules/rdi/models';
import { ApiRdiClient } from 'src/modules/rdi/client/api.rdi.client';

export const mockRdiId = 'rdiId';

export class MockRdiClient extends ApiRdiClient {
  constructor(metadata: RdiClientMetadata, client: any = jest.fn()) {
    super(metadata, client);
  }

  public getSchema = jest.fn();

  public getPipeline = jest.fn();

  public getTemplate = jest.fn();

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

export const mockRdiUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
};
