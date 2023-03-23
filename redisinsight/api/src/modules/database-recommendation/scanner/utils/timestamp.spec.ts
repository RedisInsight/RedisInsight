import { checkTimestamp } from './timestamp';

const checkTimestampTests = [
  { input: '1234567891', expected: true },
  { input: '1234567891234', expected: true },
  { input: '1234567891234567', expected: true },
  { input: '1234567891234567891', expected: true },
  { input: '1234567891.2', expected: true },
  { input: '1234567891:12', expected: true },
  { input: '1234567891a12', expected: true },
  { input: '10-10-2020', expected: true },
  { input: '1', expected: false },
  { input: '123', expected: false },
  { input: '12345678911', expected: false },
  { input: '12345678912345', expected: false },
  { input: '12345678912345678', expected: false },
  { input: '1234567891.2.2', expected: false },
  { input: '1234567891asd', expected: false },
  { input: '-1234567891', expected: false },
  { input: 'inf', expected: false },
  { input: '-inf', expected: false },
];

describe('checkTimestamp', () => {
  test.each(checkTimestampTests)('%j', ({ input, expected }) => {
    expect(checkTimestamp(input)).toEqual(expected);
  });
});
