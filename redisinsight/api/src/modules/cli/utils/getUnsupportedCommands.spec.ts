import { getUnsupportedCommands } from './getUnsupportedCommands';

describe('cli unsupported commands', () => {
  it('should return correct list', () => {
    const expectedResult = ['monitor', 'subscribe', 'psubscribe', 'ssubscribe', 'sync', 'psync', 'script debug'];

    expect(getUnsupportedCommands()).toEqual(expectedResult);
  });
});
