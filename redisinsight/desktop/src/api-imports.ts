import log from 'electron-log'
import path from 'path'
import Module from 'module'
import fs from 'fs'

// Use require directly since we're in the main process
const require = Module.createRequire(__filename)

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development'
log.info('Development mode:', isDev)

// Base path to the API directory
const apiPath = isDev
  ? path.join(__dirname, '..', '..', 'api')
  : path.join(process.resourcesPath, 'api')

log.info('API Path:', apiPath)

// Cache for loaded modules
const moduleCache = new Map()

export function importApiModule(modulePath: string) {
  if (moduleCache.has(modulePath)) {
    return moduleCache.get(modulePath)
  }

  const fullPath = path.join(apiPath, modulePath)
  
  log.info('Importing module:', {
    modulePath,
    fullPath,
    exists: fs.existsSync(fullPath),
    dirContents: fs.existsSync(path.dirname(fullPath)) 
      ? fs.readdirSync(path.dirname(fullPath))
      : 'directory not found'
  })

  try {
    // For constants specifically, we'll import them directly
    if (modulePath === 'common/constants') {
      const constants = {
        // Add the constants you need here
        API_VERSION: 'v1',
        // ... other constants
      }
      moduleCache.set(modulePath, constants)
      return constants
    }

    const module = require(fullPath)
    moduleCache.set(modulePath, module)
    return module
  } catch (err) {
    log.error('Failed to import module:', {
      error: err,
      modulePath: fullPath,
      apiPath,
      isDev
    })
    throw err
  }
}
