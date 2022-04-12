import { ReadStream } from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfilerLogFile } from 'src/modules/monitor/helpers/file-logger/profiler-log-file';
import ERROR_MESSAGES from 'src/constants/error-messages';

@Injectable()
export class ProfilerLogFilesProvider {
  private profilerLogFiles: Map<string, ProfilerLogFile> = new Map();

  /**
   * Get or create Profiler Log File to work with
   * @param id
   */
  async getOrCreate(id: string): Promise<ProfilerLogFile> {
    if (!this.profilerLogFiles.has(id)) {
      this.profilerLogFiles.set(id, new ProfilerLogFile(id));
    }

    return this.profilerLogFiles.get(id);
  }

  /**
   * Get Profiler Log File or throw an error
   * @param id
   */
  async get(id: string): Promise<ProfilerLogFile> {
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

    // stream.once('end', () => {
    //   stream.destroy();
    //   logFile.destroy();
    // });

    return { stream, filename: logFile.getFilename() };
  }
}
