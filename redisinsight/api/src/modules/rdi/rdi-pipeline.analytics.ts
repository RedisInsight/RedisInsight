import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';

@Injectable()
export class RdiPipelineAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendRdiPipelineDeployed(id: string) {
    this.sendEvent(TelemetryEvents.RdiPipelineDeploymentSucceeded, { id });
  }

  sendRdiPipelineDeployFailed(
    exception: HttpException,
    id: string,
  ) {
    this.sendFailedEvent(
      TelemetryEvents.RdiPipelineDeploymentFailed,
      exception,
      { id },
    );
  }

  sendRdiPipelineFetched(id: string, pipeline: any) {
    this.sendEvent(
      TelemetryEvents.RdiPipelineDeploymentSucceeded,
      {
        id,
        jobsNumber: Object.keys(pipeline.jobs).length,
        source: 'server',
      },
    );
  }

  sendRdiPipelineFetchFailed(
    exception: HttpException,
    id: string,
  ) {
    this.sendFailedEvent(
      TelemetryEvents.RdiPipelineDeploymentFailed,
      exception,
      { id, source: 'server' },
    );
  }
}
