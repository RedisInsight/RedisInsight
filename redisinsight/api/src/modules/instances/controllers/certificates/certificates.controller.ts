import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CaCertificateEntity } from 'src/modules/core/models/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/core/models/client-certificate.entity';
import {
  CaCertBusinessService,
} from 'src/modules/core/services/certificates/ca-cert-business/ca-cert-business.service';
import {
  ClientCertBusinessService,
} from 'src/modules/core/services/certificates/client-cert-business/client-cert-business.service';

@ApiTags('TLS Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(
    private caCertBusinessService: CaCertBusinessService,
    private clientCertBusinessService: ClientCertBusinessService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('ca')
  @ApiOperation({ description: 'Get Ca Certificate list' })
  @ApiOkResponse({
    description: 'Ca Certificate list',
    isArray: true,
    type: CaCertificateEntity,
  })
  async getCaCertList(): Promise<CaCertificateEntity[]> {
    return await this.caCertBusinessService.getAll();
  }

  @Delete('ca/:id')
  @ApiOperation({ description: 'Delete Ca Certificate by id' })
  @ApiParam({ name: 'id', type: String })
  async deleteCaCert(@Param('id') id: string): Promise<void> {
    await this.caCertBusinessService.delete(id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('client')
  @ApiOperation({ description: 'Get Client Certificate list' })
  @ApiOkResponse({
    description: 'Client Certificate list',
    isArray: true,
    type: ClientCertificateEntity,
  })
  async getClientCertList(): Promise<ClientCertificateEntity[]> {
    return await this.clientCertBusinessService.getAll();
  }

  @Delete('client/:id')
  @ApiOperation({ description: 'Delete Client Certificate pair by id' })
  @ApiParam({ name: 'id', type: String })
  async deleteClientCertificatePair(@Param('id') id: string): Promise<void> {
    await this.clientCertBusinessService.delete(id);
  }
}
