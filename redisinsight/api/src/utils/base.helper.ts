import { isNumber, sortBy } from 'lodash';

export const sortByNumberField = <T>(
  items: T[],
  field: string,
): T[] => sortBy(items, (o) => (o && isNumber(o[field]) ? o[field] : -Infinity));

export const checkIsGreaterThan = (
  conditionNumber: number,
  currentCount: number,
): boolean => currentCount > conditionNumber;
