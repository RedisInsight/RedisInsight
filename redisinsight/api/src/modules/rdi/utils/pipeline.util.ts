import {
  isArray, unset, set, forEach,
} from 'lodash';
import { plainToClass } from 'class-transformer';
import { RdiPipeline } from 'src/modules/rdi/models';

export const convertApiDataToRdiJobs = (jobs?: [Record<string, any>]): Record<string, any> => {
  const jobsMap = {};

  if (jobs && isArray(jobs)) {
    jobs.forEach((job) => {
      if (job?.name) {
        jobsMap[job.name] = {
          ...job,
          name: undefined, // do not show name in the config area
        };
      }
    });
  }

  return jobsMap;
};

export const convertApiDataToRdiPipeline = (data: { config?: Record<string, any> } = {}): RdiPipeline => {
  const pipeline = {
    ...data,
    jobs: convertApiDataToRdiJobs(data.config.jobs),
  };

  // do not show jobs in the config area
  unset(pipeline, 'config.jobs');

  return plainToClass(RdiPipeline, pipeline, { excludeExtraneousValues: true });
};

export const convertRdiJobsToApiPayload = (jobs: Record<string, any>): Record<string, any>[] => {
  const payload = [];

  forEach(jobs, (job, key) => {
    payload.push({
      ...job,
      name: key,
    });
  });

  return payload;
};

export const convertRdiPipelineToApiPayload = (pipeline: RdiPipeline): { config?: Record<string, any> } => {
  const payload = {
    ...pipeline,
    jobs: undefined,
  };

  set(payload, 'config.jobs', convertRdiJobsToApiPayload(pipeline.jobs));
  return payload;
};
