import * as fs from 'fs-extra'
import { config as apiConfig } from '../../../api/dist/src/main'

async function getCustomConfig(): Promise<Record<string, any>> {
  try {
    const customConfig = JSON.parse(await fs.readFile(apiConfig.dir_path.customConfig, 'utf8'))
    return customConfig?.features || {}
  } catch (e) {
    return {}
  }
}

export default getCustomConfig
