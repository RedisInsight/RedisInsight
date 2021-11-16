import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import config from 'src/utils/config';

const PATH_CONFIG = config.get('dir_path');

@Injectable()
export class CommandsJsonProvider implements OnModuleInit {
  private readonly logger: Logger;

  private readonly name: string;

  private readonly url: string;

  private readonly defaultCommands: Record<string, any>;

  constructor(name, url, defaultCommands) {
    this.name = name;
    this.url = url;
    this.defaultCommands = defaultCommands;
    this.logger = new Logger(this.name);
  }

  /**
   * Updates latest json on startup
   */
  async onModuleInit() {
    // async operation to not wait for it and not block user in case when no internet connection
    this.updateLatestJson();
  }

  /**
   * Get latest json from external resource and save it locally
   * @private
   */
  private async updateLatestJson() {
    try {
      this.logger.log(`Trying to update ${this.name} commands...`);
      const { data } = await axios.get(this.url, {
        responseType: 'text',
        transformResponse: [(raw) => raw],
      });

      if (!fs.existsSync(PATH_CONFIG.commands)) {
        fs.mkdirSync(PATH_CONFIG.commands);
      }

      fs.writeFileSync(
        path.join(PATH_CONFIG.commands, `${this.name}.json`),
        JSON.stringify(JSON.parse(data)), // check that we received proper json object
      );
      this.logger.log(`Successfully updated ${this.name} commands`);
    } catch (error) {
      this.logger.error(`Unable to update ${this.name} commands`, error);
    }
  }

  /**
   * Try to return latest commands
   * In case of any errors will return default one
   */
  async getCommands() {
    try {
      return JSON.parse(fs.readFileSync(
        path.join(PATH_CONFIG.commands, `${this.name}.json`),
        'utf8',
      ));
    } catch (error) {
      this.logger.error(`Unable to get latest ${this.name} commands. Return default.`, error);
      return this.defaultCommands;
    }
  }
}
