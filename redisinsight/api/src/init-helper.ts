import * as fs from 'fs-extra';
import { join } from 'path';

import config from 'src/utils/config';

const PATH_CONFIG = config.get('dir_path');

/**
 * Copy source if exists
 * @param source
 * @param destination
 */
const copySource = async (source, destination) => {
  if (await fs.pathExists(source)) {
    await fs.copy(source, destination).catch();
  }
};

/**
 * Conditional data migration to new 'homedir' location
 * @param homedir
 * @param prevHomedir
 */
const migrateData = async (homedir: string, prevHomedir: string) => {
  if (await fs.pathExists(prevHomedir)) {
    await fs.ensureDir(homedir);

    await Promise.all([
      'redisinsight.db',
      'plugins',
      'custom-tutorials',
    ].map((target) => copySource(
      join(prevHomedir, target),
      join(homedir, target),
    )));

    // remove previous folder
    await fs.rm(prevHomedir, { recursive: true, force: true });
  }
};

/**
 * Migrate data from previous home folder defined in configs
 */
export const migrateHomeFolder = async () => {
  try {
    if(!(await fs.pathExists(join(PATH_CONFIG.homedir, 'plugins')))) {
      await migrateData(PATH_CONFIG.homedir, PATH_CONFIG.prevHomedir); // from .redisinsight-preview folder
      await migrateData(PATH_CONFIG.homedir, PATH_CONFIG.v2Homedir); // from .redisinsight-v2 folder
    }
  } catch (e) {
    // continue initialization even without migration
  }
};
