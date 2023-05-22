import { get, map } from 'lodash';
import { plainToClass } from 'class-transformer';
import {
  FeatureConfigFilter,
  FeatureConfigFilterAnd,
  FeatureConfigFilterOr,
} from 'src/modules/feature/model/features-config';

export const featureConfigFilterTransformer = (value) => map(value || [], (filter) => {
  let cls: any = FeatureConfigFilter;

  if (get(filter, 'and')) {
    cls = FeatureConfigFilterAnd;
  }

  if (get(filter, 'or')) {
    cls = FeatureConfigFilterOr;
  }

  return plainToClass(cls, filter);
});
