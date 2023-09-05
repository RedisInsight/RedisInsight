import { TypeHelpOptions } from 'class-transformer';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CreateDatabaseCloudJobDataDto } from '../dto';

import { cloudJobDataTransformer } from './cloud-job-data.transformer';

describe('cloudJobDataTransformer', () => {
  [
    {
      input: { object: { name: CloudJobName.CreateFreeDatabase } } as unknown as TypeHelpOptions,
      output: CreateDatabaseCloudJobDataDto,
    },
    {
      input: { object: { name: CloudJobName.CreateFreeSubscription } } as unknown as TypeHelpOptions,
      output: CreateDatabaseCloudJobDataDto,
    },
    {
      input: { object: { name: CloudJobName.WaitForActiveDatabase } } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: { object: { name: CloudJobName.WaitForActiveSubscription } } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: { object: { name: CloudJobName.WaitForTask } } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: { object: { name: CloudJobName.Unknown } } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: null,
      output: undefined,
    },
  ].forEach((tc) => {
    it(`Should return ${tc.output} when input is: ${tc.input}`, () => {
      expect(cloudJobDataTransformer(tc.input)).toEqual(tc.output);
    });
  });
});
