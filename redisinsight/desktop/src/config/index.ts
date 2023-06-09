import pkg from '../../../package.json'
import configInit from '../../config.json'

const config: any = configInit

// Merge in some details from package.json
config.name = pkg.productName
config.description = pkg.description
config.version = pkg.version
config.author = pkg.author

export default config
