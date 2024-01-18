import * as fs from 'fs-extra';
import { join } from 'path';

import config from 'src/utils/config';

const PATH_CONFIG = config.get('dir_path');
const DB_CONFIG = config.get('db');

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
 * Migrate data from previous home folder defined in configs
 */
export const migrateHomeFolder = async () => {
  try {
    if (!(await fs.pathExists(DB_CONFIG.database)) && await fs.pathExists(PATH_CONFIG.prevHomedir)) {
      await fs.ensureDir(PATH_CONFIG.homedir);

      await Promise.all([
        'redisinsight.db',
        'plugins',
        'custom-tutorials',
      ].map((target) => copySource(
        join(PATH_CONFIG.prevHomedir, target),
        join(PATH_CONFIG.homedir, target),
      )));
    }
  } catch (e) {
    // continue initialization even without migration
  }
};

/**
 * Remove old guides folder
 */
export const removeGuidesFolder = async () => {
  try {
    if (await fs.pathExists(PATH_CONFIG.guides)) {
      await fs.rm(PATH_CONFIG.guides, { recursive: true, force: true });
    }
  } catch (e) {
    // continue initialization even without migration
  }
};
