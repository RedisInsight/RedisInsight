import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isEmpty, isNumber } from 'lodash';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CreateCloudJobDataDto, CreateCloudJobDto } from 'src/modules/cloud/job/dto';

@ValidatorConstraint({ name: 'CloudJobDataValidator', async: true })
export class CloudJobDataValidator implements ValidatorConstraintInterface {
  async validate(data: CreateCloudJobDataDto, { object }: ValidationArguments) {

    const createCloudJobDto = (object as CreateCloudJobDto)

    switch (createCloudJobDto.name) {
      case CloudJobName.CreateFreeDatabase:
      case CloudJobName.CreateFreeSubscription:
        if (!data || isEmpty(data) || !data.planId || !isNumber(data.planId)) {
          return false;
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return true;
    }
  }

  defaultMessage() {
    return 'field data must contain planId as a number';
  }
}
