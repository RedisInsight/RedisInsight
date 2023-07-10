import { v4 as uuidv4 } from 'uuid';
import config from 'src/utils/config';
import { CloudJobInfo, CloudJobStatus } from 'src/modules/cloud/job/models/cloud-job-info';
import { HttpException, Logger } from '@nestjs/common';
import { ClassType } from 'class-transformer/ClassTransformer';
import { CloudJobAbortedException, wrapCloudJobError } from 'src/modules/cloud/job/exceptions';
import { SessionMetadata } from 'src/common/models';
import { CloudJobName } from 'src/modules/cloud/job/constants';

const cloudConfig = config.get('cloud');

export class CloudJobOptions {
  abortController: AbortController;

  sessionMetadata: SessionMetadata;

  stateCallback?: (self: CloudJob) => any;
}

export abstract class CloudJob {
  protected logger = new Logger(this.constructor.name);

  public id = uuidv4();

  protected name = CloudJobName.Unknown;

  protected status = CloudJobStatus.Initializing;

  protected error?: HttpException;

  protected child?: CloudJob;

  protected options: CloudJobOptions;

  protected dependencies: any;

  protected constructor(options: CloudJobOptions) {
    this.options = options;
  }

  public async run() {
    try {
      this.changeState({
        status: CloudJobStatus.Running,
      });

      return await this.iteration();
    } catch (e) {
      this.logger.error('Cloud job failed', e);

      const error = wrapCloudJobError(e);

      this.changeState({
        status: CloudJobStatus.Failed,
        error,
      });

      throw error;
    }
  }

  public abort(reason?: string) {
    // @ts-ignore
    this.options?.abortController?.abort(reason);
  }

  public getState(): CloudJobInfo {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      error: this.error ? wrapCloudJobError(this.error) : undefined,
      child: this.child?.getState(),
    };
  }

  public createChildJob<T>(TargetJob: ClassType<T>, data: {}): T {
    return new TargetJob(
      {
        ...this.options,
        stateCallback: () => this.changeState(),
      },
      data,
      this.dependencies,
    );
  }

  public async runChildJob(TargetJob: ClassType<CloudJob>, data: {}): Promise<any> {
    const child = this.createChildJob(TargetJob, data);

    this.changeState({ child });

    const result = await child.run();

    this.changeState({ child: null });

    return result;
  }

  protected changeState(state = {}) {
    Object.entries(state).forEach(([key, value]) => { this[key] = value; });
    try {
      this.options.stateCallback?.(this);
    } catch (e) {
      // silently ignore callback
    }
  }

  protected checkSignal() {
    if (this.options?.abortController?.signal?.aborted === true) {
      // @ts-ignore
      const reason = this.abortController?.signal?.reason;
      this.logger.error(`Job ${this.name} aborted with reason: ${reason}`);
      throw new CloudJobAbortedException(undefined, { cause: reason });
    }
  }

  protected runNextIteration(timeout = cloudConfig.jobIterationInterval): Promise<any> {
    return new Promise((res, rej) => {
      setTimeout(() => {
        this.iteration().then(res).catch(rej);
      }, timeout);
    });
  }

  protected abstract iteration(): Promise<any>;
}
