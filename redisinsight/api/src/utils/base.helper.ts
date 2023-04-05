import { isNumber, sortBy } from 'lodash';

export const sortByNumberField = <T>(
  items: T[],
  field: string,
): T[] => sortBy(items, (o) => (o && isNumber(o[field]) ? o[field] : -Infinity));


export const numberWithSpaces = (number: number = 0) =>
  number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export const isJson = (item: any): boolean =>  {
  let value = typeof item !== "string" ? JSON.stringify(item) : item;
  try {
    value = JSON.parse(value);
  } catch (e) {
    return false;
  }

  return typeof value === "object" && value !== null;
}
