import log from 'electron-log'
import path from 'path'
import Module, { createRequire } from 'module'
import fs from 'fs'

const require = createRequire(import.meta.url)

// Check if we're in development mode
const isDev = process.env.ELECTRON_DEV === 'true'
log.info('Development mode:', isDev)

// Base path to the API directory
const apiPath = isDev
  ? path.join(__dirname, '..', '..', 'api', 'src')
  : path.join(__dirname, '..', '..', 'api') // Remove the extra 'src'
log.info('API Path:', apiPath)

const { resolveFilename } = (Module as any);
(Module as any).resolveFilename = function resolveApiModule(
  request: string,
  parent: string,
  isMain: boolean,
  options: any
) {
  if (request.startsWith('apiSrc/')) {
    const strippedRequest = request.replace(/^apiSrc\//, '')
    const modulePath = path.join(apiPath, strippedRequest)

    log.info('Trying to resolve:', {
      request,
      strippedRequest,
      modulePath,
      exists: fs.existsSync(modulePath)
    })

    try {
      return resolveFilename.call(this, modulePath, parent, isMain, options)
    } catch (err) {
      log.error('Failed to resolve module:', err)
      throw err
    }
  }
  return resolveFilename.call(this, request, parent, isMain, options)
}

export function importApiModule(modulePath: string) {
  // Remove any .js extension if present
  const updatedPath = modulePath.replace(/\.js$/, '')

  const fullPath = path.join(apiPath, updatedPath)
  log.info('Importing module:', {
    updatedPath,
    fullPath,
    exists: fs.existsSync(fullPath)
  })

  try {
    // eslint-disable-next-line import/no-dynamic-require
    return require(fullPath)
  } catch (err) {
    log.error('Failed to import module:', {
      updatedPath,
      fullPath,
      error: err
    })
    throw err
  }
}
