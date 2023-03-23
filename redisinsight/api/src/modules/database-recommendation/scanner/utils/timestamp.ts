import { isValid } from 'date-fns';
import { isNumber } from 'lodash';
import { IS_TIMESTAMP, IS_INTEGER_NUMBER_REGEX, IS_NUMBER_REGEX } from 'src/constants';

// todo compare it with recommendation module (need 1 module for live time and db analysis)
export const checkTimestamp = (value: string): boolean => {
  try {
    if (!IS_NUMBER_REGEX.test(value) && isValid(new Date(value))) {
      return true;
    }
    const integerPart = parseInt(value, 10);
    if (!IS_TIMESTAMP.test(integerPart.toString())) {
      return false;
    }
    if (integerPart.toString().length === value.length) {
      return true;
    }
    // check part after separator
    const subPart = value.replace(integerPart.toString(), '');
    return IS_INTEGER_NUMBER_REGEX.test(subPart.substring(1, subPart.length));
  } catch (err) {
    // ignore errors
    return false;
  }
};
