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
  : path.join(__dirname, '..', '..', 'api', 'dist');  // Remove the extra 'src'
log.info('API Path:', apiPath);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request: string, parent: string, isMain: boolean, options: any) {
  if (request.startsWith('apiSrc/') || request.startsWith('src/')) {
    const strippedRequest = request
      .replace(/^apiSrc\//, '')
      .replace(/^src\//, '');
    
    const modulePath = path.join(apiPath, strippedRequest);
    log.info('Trying to resolve:', {
      request,
      strippedRequest,
      modulePath
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
  const fullPath = path.join(apiPath, modulePath);
  log.info('Importing module:', {
    modulePath,
    fullPath
  });
  return require(fullPath);
}
