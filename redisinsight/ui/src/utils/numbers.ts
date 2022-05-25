import { toNumber } from 'lodash'

export const isNaNConvertedString = (value: string): boolean => Number.isNaN(toNumber(value))

export const numberWithSpaces = (number: number = 0) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
