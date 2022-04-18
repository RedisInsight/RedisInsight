import { ReadStream } from 'fs';
import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { LogFile } from 'src/modules/profiler/models/log-file';
import ERROR_MESSAGES from 'src/constants/error-messages';

@Injectable()
export class LogFileProvider implements OnModuleDestroy {
  private profilerLogFiles: Map<string, LogFile> = new Map();

  /**
   * Get or create Profiler Log File to work with
   * @param id
   */
  getOrCreate(id: string): LogFile {
    if (!this.profilerLogFiles.has(id)) {
      this.profilerLogFiles.set(id, new LogFile(id));
    }

    return this.profilerLogFiles.get(id);
  }

  /**
   * Get Profiler Log File or throw an error
   * @param id
   */
  get(id: string): LogFile {
    if (!this.profilerLogFiles.has(id)) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILER_LOG_FILE_NOT_FOUND);
    }

    return this.profilerLogFiles.get(id);
  }

  /**
   * Get ReadableStream for download and filename
   * Delete file after download finished
   * @param id
   */
  async getDownloadData(id): Promise<{ stream: ReadStream, filename: string }> {
    const logFile = await this.get(id);
    const stream = await logFile.getReadStream();

    stream.once('end', () => {
      stream.destroy();
      // logFile.destroy();
    });

    return { stream, filename: logFile.getFilename() };
  }

  async onModuleDestroy() {
    await Promise.all(Array.from(this.profilerLogFiles.values()).map((logFile: LogFile) => logFile.destroy()));
  }
}
