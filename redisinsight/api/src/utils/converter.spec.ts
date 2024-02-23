import {
  convertIntToSemanticVersion,
  convertStringToNumber,
} from './converter';

const convertIntToSemanticVersionTests: Record<string, any>[] = [
  { input: 1, output: '0.0.1' },
  { input: 10, output: '0.0.10' },
  { input: 100, output: '0.1.0' },
  { input: 1000, output: '0.10.0' },
  { input: 10000, output: '1.0.0' },
  { input: 100000, output: '10.0.0' },
  { input: 1000000, output: '100.0.0' },
  { input: 10410, output: '1.4.10' },
  { input: 10008, output: '1.0.8' },
  { input: 20407, output: '2.4.7' },
  { input: 20011, output: '2.0.11' },
  { input: 20206, output: '2.2.6' },
  { input: 0, output: undefined },
  { input: 'string', output: undefined },
];

describe('convertIntToSemanticVersionTests', () => {
  convertIntToSemanticVersionTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${JSON.stringify(test.input)}`, () => {
      const result = convertIntToSemanticVersion(test.input);

      expect(result).toEqual(test.output);
    });
  });
});

const convertStringToNumberTests: Record<string, any>[] = [
  { input: ['1'], output: 1 },
  { input: [1], output: 1 },
  { input: [{ some: 'obj' }], output: undefined },
  { input: [{ some: 'obj' }, 11], output: 11 },
  { input: ['asd45', 11], output: 11 },
  { input: ['123.123', 11], output: 123.123 },
  { input: [undefined, 11], output: 11 },
];

describe('convertStringToNumber', () => {
  convertStringToNumberTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${JSON.stringify(test.input)}`, () => {
      const result = convertStringToNumber.call(this, ...test.input);

      expect(result).toEqual(test.output);
    });
  });
});
