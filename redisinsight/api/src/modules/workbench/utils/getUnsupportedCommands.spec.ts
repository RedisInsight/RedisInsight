import { getUnsupportedCommands } from './getUnsupportedCommands';

describe('workbench unsupported commands', () => {
  it('should return correct list', () => {
    const expectedResult = ['monitor', 'subscribe', 'psubscribe', 'sync', 'psync', 'script debug', 'select'];

    expect(getUnsupportedCommands()).toEqual(expectedResult);
  });
});
