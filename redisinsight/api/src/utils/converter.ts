import { chunk, isInteger } from 'lodash';

export const convertStringsArrayToObject = (input: string[]): { [key: string]: any } => chunk(
  input,
  2,
).reduce((prev: any, current: string[]) => {
  const [key, value] = current;
  return { ...prev, [key.toLowerCase()]: value };
}, {});

export const convertIntToSemanticVersion = (input: number): string => {
  const separator = '.';
  try {
    if (isInteger(input) && input > 0) {
      // Pad input with optional zero symbols
      const version = String(input).padStart(6, '0');
      const patch = parseInt(version.slice(-2), 10);
      const minor = parseInt(version.slice(-4, -2), 10);
      const major = parseInt(version.slice(0, -4), 10);
      return [major, minor, patch].join(separator);
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};
