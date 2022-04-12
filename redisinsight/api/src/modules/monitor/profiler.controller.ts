import { Response } from 'express';
import {
  Controller, Get, Param, Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfilerLogFilesProvider } from 'src/modules/monitor/providers/profiler-log-files.provider';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';

@ApiTags('Profiler')
@Controller('profiler')
export class ProfilerController {
  constructor(private logFilesProvider: ProfilerLogFilesProvider) {}

  @ApiEndpoint({
    description: 'Endpoint do download profiler log file',
    statusCode: 200,
  })
  @Get('/logs/:id')
  async downloadLogsFile(
  @Res() res: Response,
    @Param('id') id: string,
  ) {
    const { stream, filename } = await this.logFilesProvider.getDownloadData(id);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment;filename="${filename}.txt"`);

    stream.pipe(res);
  }
}
