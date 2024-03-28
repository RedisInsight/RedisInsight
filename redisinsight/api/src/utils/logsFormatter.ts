import { format } from 'winston';
import { pick, get, map } from 'lodash';
import { inspect } from 'util';

const errorWhiteListFields = [
  'message',
  'command.name',
];

const sanitizeStack = (stack: any[]) => {
  try {
    let sanitizedStack = stack;

    if (stack && stack.length) {
      sanitizedStack = stack.map((error) => {
        if (error?.name === 'AxiosError') {
          return {
            ...pick(error, ['message', 'name', 'code', 'stack']),
            response: error?.response?.data,
          };
        }

        return error;
      });
    }

    return inspect(sanitizedStack);
  } catch (e) {
    return e.stack;
  }
};

/**
 * Get only whitelisted fields from logs when omitSensitiveData option enabled
 */
export const sensitiveDataFormatter = format((info, opts = {}) => {
  let stack;
  if (opts?.omitSensitiveData) {
    stack = map(get(info, 'stack', []), (stackItem) => pick(stackItem, errorWhiteListFields));
  } else {
    stack = map(get(info, 'stack', []), (stackItem) => {
      if (stackItem?.stack) {
        return {
          ...stackItem,
          stack: stackItem.stack,
        };
      }

      return stackItem;
    });
  }

  return {
    ...info,
    stack: sanitizeStack(stack),
  };
});

export const jsonFormat = format.printf((info) => {
  const logData = {
    level: info.level,
    timestamp: new Date().toLocaleString(),
    context: info.context,
    message: info.message,
    stack: sanitizeStack(info.stack),
  };
  return JSON.stringify(logData);
});

export const prettyFormat = format.printf((info) => {
  const separator = ' | ';
  const timestamp = new Date().toLocaleString();
  const {
    level, context, message, stack,
  } = info;

  const logData = [timestamp, `${level}`.toUpperCase(), context, message, { stack: sanitizeStack(stack) }];
  return logData.join(separator);
});
