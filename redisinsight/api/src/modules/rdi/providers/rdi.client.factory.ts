import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { Rdi, RdiClientMetadata, RdiType } from 'src/modules/rdi/models';
import axios from 'axios';
import { ApiRdiClient } from 'src/modules/rdi/client/api.rdi.client';

@Injectable()
export class RdiClientFactory {
  async createClient(clientMetadata: RdiClientMetadata, rdi: Rdi): Promise<RdiClient> {
    switch (rdi.type) {
      case RdiType.API:
        return this.createApiRdiClient(clientMetadata, rdi);
      case RdiType.GEARS:
        throw new NotImplementedException();
      default:
        throw new BadRequestException('Unsupported RDI type');
    }
  }

  async createApiRdiClient(clientMetadata: RdiClientMetadata, rdi: Rdi): Promise<RdiClient> {
    const apiClient = axios.create({
      baseURL: rdi.url,
    });

    // todo: login with credentials and store them in the apiClient

    return new ApiRdiClient(clientMetadata, apiClient);
  }
}
