
import * as fs from 'fs-extra';
import { join } from 'path';

/**
 * Select homedir based on conditions
 * @param homedir
 * @param prevHomedir
 */
export const getHomedir = (homedir: string, prevHomedir: string) => {
  try {
    if ((!fs.pathExistsSync(homedir)) || fs.pathExistsSync(join(homedir, 'plugins'))) {
      return homedir;
    }

    return prevHomedir;
  } catch (error) {
    // continue initialization even without migration
  }
};
