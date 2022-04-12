import { join } from 'path';
import * as fs from 'fs-extra';
import { ReadStream, WriteStream } from 'fs';
import config from 'src/utils/config';
import FileLogsEmitter from 'src/modules/monitor/helpers/emitters/file.logs-emitter';

const DIR_PATH = config.get('dir_path');
const PROFILER = config.get('profiler');

export class ProfilerLogFile {
  private readonly filePath: string;

  private startTime: Date;

  private writeStream: WriteStream;

  private emitter: FileLogsEmitter;

  private readonly clientObservers: Map<string, string> = new Map();

  private idleSince: number = 0;

  private alias: string;

  public readonly id: string;

  constructor(id: string, alias: string = null) {
    this.id = id;
    this.alias = alias || id;
    this.filePath = join(DIR_PATH.tmpDir, this.id);
    this.startTime = new Date();
  }

  /**
   * Get or create file write stream to write logs
   */
  getWriteStream(): WriteStream {
    if (!this.writeStream) {
      this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
    }

    return this.writeStream;
  }

  /**
   * Get readable stream of the logs file
   * Used to download file using http server
   */
  getReadStream(): ReadStream {
    return fs.createReadStream(this.filePath);
  }

  /**
   * Get or create logs emitter to use on each 'monitor' event
   */
  getEmitter(): FileLogsEmitter {
    if (!this.emitter) {
      this.emitter = new FileLogsEmitter(this);
    }

    return this.emitter;
  }

  /**
   * Generate file name
   */
  getFilename(): string {
    return `${this.alias}-${this.startTime.getTime()}-${Date.now()}`;
  }

  setAlias(alias: string) {
    this.alias = alias;
  }

  public addClientObserver(id: string) {
    this.clientObservers.set(id, id);
    this.idleSince = 0;
  }

  public removeClientObserver(id: string) {
    this.clientObservers.delete(id);

    if (!this.clientObservers.size) {
      this.idleSince = Date.now();

      setTimeout(() => {
        if (this?.idleSince && Date.now() - this.idleSince >= PROFILER.logFileIdleThreshold) {
          this.destroy();
        }
      }, PROFILER.logFileIdleThreshold);
    }
  }

  /**
   * Remove file after finish
   */
  async destroy() {
    console.log('___LofFile.destroy');
    try {
      this.writeStream = null;
      await fs.unlink(this.filePath);
    } catch (e) {
      // ignore error
    }
  }
}
