import { concat } from 'lodash';
import { convertStringsArrayToObject } from 'src/utils';
import { FunctionType, Function } from 'src/modules/triggered-functions/models';

/**
 * Get all functions
*/
const getFunctionsInformation = (functions: string[][], type: FunctionType): Function[] => functions.map((reply) => {
  const func = convertStringsArrayToObject(reply);
  return ({
    name: func.name,
    success: func.num_success,
    fail: func.num_failed,
    total: func.num_trigger,
    isAsync: func.is_async,
    flags: func.flags,
    type,
  });
});

/**
 * Get all functions
*/
const collectFunctions = (lib) => {
  const functionGroups = Object.values(FunctionType).map((type) => getFunctionsInformation(lib[type], type));
  return concat(...functionGroups);
};

/**
 * Get library information
*/
export const getLibraryInformation = (lib: string[]) => {
  const library = convertStringsArrayToObject(lib);
  const functions = collectFunctions(library);
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
