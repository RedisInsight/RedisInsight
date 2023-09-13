import { get } from 'lodash';
import { TypeHelpOptions } from 'class-transformer';
// eslint-disable-next-line import/no-cycle
import { CreateDatabaseCloudJobDataDto } from '../dto';
import { CloudJobName } from '../constants';

export const cloudJobDataTransformer = (data: TypeHelpOptions) => {
  const jobName = get(data?.object, 'name');

  switch (jobName) {
    case CloudJobName.CreateFreeDatabase:
    case CloudJobName.CreateFreeSubscription:
      return CreateDatabaseCloudJobDataDto;

    default:
      return undefined;
  }
};
