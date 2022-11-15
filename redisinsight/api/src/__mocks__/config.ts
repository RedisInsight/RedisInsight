import { when } from 'jest-when';
import config from 'src/utils/config';

jest.mock('src/utils/config', jest.fn(
  () => jest.requireActual('src/utils/config') as object,
));

const configGetSpy = jest.spyOn(config, 'get');

export const mockServerConfig = config.get('server');
when(configGetSpy).calledWith('server').mockReturnValue(mockServerConfig);
