import { isNumber, sortBy } from 'lodash';

export const sortByNumberField = <T>(
  items: T[],
  field: string,
): T[] => sortBy(items, (o) => (o && isNumber(o[field]) ? o[field] : -Infinity));


export const numberWithSpaces = (number: number = 0) =>
  number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
