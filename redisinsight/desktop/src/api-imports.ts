import path from 'path';
import { createRequire } from 'module';
import Module from 'module';
import log from 'electron-log';

const require = createRequire(import.meta.url);

// Check if we're in development mode
const isDev = process.env.ELECTRON_DEV === 'true';
log.info('Development mode:', isDev);

// Base path to the API directory
const apiPath = isDev
  ? path.join(__dirname, '..', '..', 'api', 'src')
  : path.join(__dirname, '..', '..', 'api');  // Remove the extra 'src'
log.info('API Path:', apiPath);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request: string, parent: string, isMain: boolean, options: any) {
  if (request.startsWith('apiSrc/')) {
    const strippedRequest = request.replace(/^apiSrc\//, '');
    const modulePath = path.join(apiPath, 'src', strippedRequest);
    
    log.info('Trying to resolve:', {
      request,
      strippedRequest,
      modulePath,
      exists: require('fs').existsSync(modulePath)
    });
    
    try {
      return originalResolveFilename.call(this, modulePath, parent, isMain, options);
    } catch (err) {
      log.error('Failed to resolve module:', err);
      throw err;
    }
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

export function importApiModule(modulePath: string) {
  // Remove any .js extension if present
  modulePath = modulePath.replace(/\.js$/, '');
  
  const fullPath = path.join(apiPath, modulePath);
  log.info('Importing module:', {
    modulePath,
    fullPath,
    exists: require('fs').existsSync(fullPath)
  });
  
  try {
    return require(fullPath);
  } catch (err) {
    log.error('Failed to import module:', {
      modulePath,
      fullPath,
      error: err
    });
    throw err;
  }
}
