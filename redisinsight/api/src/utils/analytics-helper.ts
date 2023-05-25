import { isNil } from 'lodash';

export const TOTAL_KEYS_BREAKPOINTS = [
  500000,
  1000000,
  10000000,
  50000000,
  100000000,
  1000000000,
];

export const SCAN_THRESHOLD_BREAKPOINTS = [
  5000,
  10000,
  50000,
  100000,
  1000000,
];

export const BULK_ACTIONS_BREAKPOINTS = [
  5000,
  10000,
  50000,
  100000,
  1000000,
];

const numberWithSpaces = (x: number): string => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const getRangeForNumber = (
  value: number,
  breakpoints: number[] = TOTAL_KEYS_BREAKPOINTS,
): string => {
  if (isNil(value)) {
    return undefined;
  }
  const index = breakpoints.findIndex(
    (threshold: number) => value <= threshold,
  );
  if (index === 0) {
    return `0 - ${numberWithSpaces(breakpoints[0])}`;
  }
  if (index === -1) {
    const lastItem = breakpoints[breakpoints.length - 1];
    return `${numberWithSpaces(lastItem + 1)} +`;
  }
  return `${numberWithSpaces(
    breakpoints[index - 1] + 1,
  )} - ${numberWithSpaces(breakpoints[index])}`;
};

export const calculateRedisHitRatio = (
  keyspaceHits: string | number,
  keyspaceMisses: string | number,
): number => {
  try {
    if (isNil(keyspaceHits) || isNil(keyspaceMisses)) {
      return undefined;
    }
    const keyspaceHitsValue = +keyspaceHits;
    const keyspaceMissesValue = +keyspaceMisses;
    if (keyspaceHitsValue === 0) {
      return 1;
    }
    const result = keyspaceHitsValue / (keyspaceHitsValue + keyspaceMissesValue);
    return Number.isNaN(result) ? undefined : result;
  } catch (error) {
    return undefined;
  }
};

export const getIsPipelineEnable = (size: number): boolean => size > 1;
