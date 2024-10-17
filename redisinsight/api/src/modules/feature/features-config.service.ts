import { Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export abstract class FeaturesConfigService {
  /**
   * Get control group and number fields
   */
  abstract getControlInfo(sessionMetadata: SessionMetadata): Promise<{ controlNumber: number, controlGroup: string }>;

  /**
   * Get latest config from remote and save it in the local database
   */
  abstract sync(sessionMetadata: SessionMetadata): Promise<void>;
}
