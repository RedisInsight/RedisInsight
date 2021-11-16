import { isMap } from 'lodash';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';

// Delete all keys from the validated Map that are not included in the settings specification.
export const pickDefinedAgreements = (data: Map<string, boolean>) => {
  if (isMap(data)) {
    for (const k of data?.keys()) {
      if (!AGREEMENTS_SPEC.agreements[k]) {
        data.delete(k);
      }
    }
  }
  return data;
};
