import { concat } from 'lodash';
import { convertStringsArrayToObject } from 'src/utils';
import { FunctionType, Function } from 'src/modules/triggered-functions/models';

/**
 * Get all functions
*/
const getFunctionsInformation = (
  functions: string[][] | string[],
  type: FunctionType,
  libName: string,
): Function[] => functions.map((reply) => {
  if (type === FunctionType.ClusterFunction) {
    return ({
      name: reply as string,
      type,
      library: libName,
    });
  }

  const func = convertStringsArrayToObject(reply);

  return ({
    name: func.name,
    success: func.num_success,
    fail: func.num_failed,
    total: func.num_trigger,
    isAsync: func.is_async,
    flags: func.flags,
    lastError: func.last_error,
    lastExecutionTime: func.last_execution_time,
    totalExecutionTime: func.total_execution_time,
    prefix: func.prefix,
    streams: func.streams?.map((stream) => convertStringsArrayToObject(stream)),
    trim: func.trim,
    window: func.window,
    type,
    library: libName,
  });
});

const getFunctionName = (
  functions: string[][] | string[],
  type: FunctionType,
): Function[] => functions.map((reply) => ({
  name: reply as string,
  type,
}));

/**
 * Get all function names
*/
const getFunctionNames = (
  lib,
): Function[] => {
  const functionGroups = Object.values(FunctionType).map((type) => getFunctionName(lib[type], type));
  return concat(...functionGroups);
};

/**
 * Get all functions
*/
const collectFunctions = (lib) => {
  const functionGroups = Object.values(FunctionType).map((type) => getFunctionsInformation(lib[type], type, lib.name));
  return concat(...functionGroups);
};

/**
 * Get functions count
*/
const getTotalFunctions = (lib) => (
  Object.values(FunctionType).reduce((prev, cur) => prev + lib[cur].length, 0)
);

/**
 * Get library information
*/
export const getLibraryInformation = (lib: string[]) => {
  const library = convertStringsArrayToObject(lib);
  const functions = getFunctionNames(library);
  return ({
    name: library.name,
    apiVersion: library.api_version,
    user: library.user,
    pendingJobs: library.pending_jobs,
    configuration: library.configuration,
    code: library.code,
    functions,
  });
};

export const getFunctions = (lib: string[]) => collectFunctions(convertStringsArrayToObject(lib));

export const getShortLibraryInformation = (lib: string[]) => {
  const library = convertStringsArrayToObject(lib);
  const totalFunctions = getTotalFunctions(library);
  return ({
    name: library.name,
    user: library.user,
    pendingJobs: library.pending_jobs,
    totalFunctions,
  });
};
