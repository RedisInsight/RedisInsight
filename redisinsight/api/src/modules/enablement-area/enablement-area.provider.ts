import axios from 'axios';
import * as fs from 'fs-extra';
import * as AdmZip from 'adm-zip';
import { URL } from 'url';
import { join } from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import config from 'src/utils/config';
import { get } from 'lodash';

const ENABLEMENT_AREA_CONFIG = config.get('enablementArea');
const PATH_CONFIG = config.get('dir_path');

@Injectable()
export class EnablementAreaProvider implements OnModuleInit {
  private readonly logger = new Logger('EnablementAreaProvider');

  /**
   * Updates latest json on startup
   */
  onModuleInit() {
    // async operation to not wait for it and not block user in case when no internet connection
    Promise.all([
      this.initDefaults(),
      this.autoUpdate(),
    ]);
  }

  /**
   * Simply copy default files prepared during build to the home directory when no files there
   */
  async initDefaults() {
    try {
      if (!await fs.pathExists(
        join(PATH_CONFIG.enablementArea, ENABLEMENT_AREA_CONFIG.buildInfo),
      )) {
        await fs.ensureDir(PATH_CONFIG.enablementArea);
        await fs.copy(PATH_CONFIG.defaultEnablementArea, PATH_CONFIG.enablementArea, {
          overwrite: true,
        });
      }
    } catch (e) {
      this.logger.error('Unable to create enablement area files from default', e);
    }
  }

  /**
   * Update enablement area if needed
   */
  async autoUpdate() {
    this.logger.log('Checking for updates...');
    if (!ENABLEMENT_AREA_CONFIG.devMode && await this.isUpdatesAvailable()) {
      this.logger.log('Updates available! Updating...');

      try {
        await this.updateStaticFiles();
      } catch (e) {
        this.logger.error('Unable to update auto enablement area', e);
      }
    }
  }

  async updateStaticFiles(): Promise<void> {
    const latestArchive = await this.getLatestArchive();

    if (latestArchive) {
      const zip = new AdmZip(latestArchive);
      await fs.remove(PATH_CONFIG.enablementArea);
      await zip.extractAllTo(PATH_CONFIG.enablementArea, true);
      await fs.writeFile(
        join(PATH_CONFIG.enablementArea, ENABLEMENT_AREA_CONFIG.buildInfo),
        JSON.stringify(await this.getRemoteBuildInfo()),
      );
    }
  }

  /**
   * Download archive from remote
   */
  async getLatestArchive() {
    try {
      const { data } = await axios.get(
        new URL(join(ENABLEMENT_AREA_CONFIG.updateUrl, ENABLEMENT_AREA_CONFIG.zip)).toString(),
        {
          responseType: 'arraybuffer',
        },
      );

      return data;
    } catch (e) {
      this.logger.error('Unable to get remote archive', e);
      return null;
    }
  }

  /**
   * Compare current vs remote build timestamp to understand if update is available.
   *
   * Note: We decided to not use versioning (semver or similar)
   */
  async isUpdatesAvailable(): Promise<boolean> {
    const currentBuildInfo = await this.getCurrentBuildInfo();
    const remoteBuildInfo = await this.getRemoteBuildInfo();

    return get(remoteBuildInfo, ['timestamp'], 0) > get(currentBuildInfo, ['timestamp'], 0);
  }

  /**
   * Get checksum for the remote latest version
   */
  async getRemoteBuildInfo(): Promise<Record<string, any>> {
    try {
      const { data } = await axios.get(
        new URL(join(ENABLEMENT_AREA_CONFIG.updateUrl, ENABLEMENT_AREA_CONFIG.buildInfo)).toString(),
      );

      return data;
    } catch (e) {
      this.logger.error('Unable to get remote build info', e);
      return {};
    }
  }

  /**
   * Get checksum for the current version of enablement area
   */
  async getCurrentBuildInfo(): Promise<Record<string, any>> {
    try {
      return JSON.parse(await fs.readFile(
        join(PATH_CONFIG.enablementArea, ENABLEMENT_AREA_CONFIG.buildInfo),
        'utf8',
      ));
    } catch (e) {
      this.logger.error('Unable to get local checksum', e);
      return {};
    }
  }
}
