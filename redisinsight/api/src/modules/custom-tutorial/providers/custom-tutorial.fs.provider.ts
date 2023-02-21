import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
import config from 'src/utils/config';
import * as AdmZip from 'adm-zip';

const PATH_CONFIG = config.get('dir_path');

const TMP_FOLDER = `${PATH_CONFIG.tmpDir}/RedisInsight-v2/custom-tutorials`;

@Injectable()
export class CustomTutorialFsProvider {
  private logger = new Logger('CustomTutorialFsProvider');

  /**
   * Unzip custom tutorials to temporary folder
   * @param file
   */
  public async unzipToTmpFolder(file: MemoryStoredFile): Promise<string> {
    try {
      const path = join(TMP_FOLDER, uuidv4());
      await fs.ensureDir(path);
      const zip = new AdmZip(file.buffer);
      await fs.remove(path);
      await zip.extractAllTo(path, true);

      return path;
    } catch (e) {
      this.logger.error('Unable to unzip archive', e);
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * Move custom tutorial from tmp folder to proper path to serve static files
   * force - default false, will remove existing folder
   * @param tmpPath
   * @param dest
   * @param force
   */
  public async moveFolder(tmpPath: string, dest: string, force = false) {
    try {
      if (force && await fs.pathExists(dest)) {
        await fs.remove(dest);
      }

      await fs.move(tmpPath, dest);
    } catch (e) {
      this.logger.error('Unable to move tutorial to a folder', e);
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * Delete Tutorial folder
   * Will silently log an error if any
   * @param path
   */
  public async removeFolder(path: string) {
    try {
      await fs.remove(path);
    } catch (e) {
      this.logger.warn('Unable to delete tutorial folder', e);
    }
  }
}
