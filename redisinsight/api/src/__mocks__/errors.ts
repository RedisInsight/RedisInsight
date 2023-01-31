import { ReplyError } from 'src/models';

export const mockRedisNoAuthError: ReplyError = {
  name: 'ReplyError',
  command: 'AUTH',
  message: 'NOAUTH authentication is required',
};

export const mockRedisNoPasswordError: ReplyError = {
  name: 'ReplyError',
  command: 'AUTH',
  message: 'ERR Client sent AUTH, but no password is set',
};

export const mockRedisNoPermError: ReplyError = {
  name: 'ReplyError',
  command: 'GET',
  message: 'NOPERM this user has no permissions.',
};

export const mockRedisUnknownIndexName: ReplyError = {
  name: 'ReplyError',
  command: 'FT.INFO',
  message: 'Unknown Index name',
};

export const mockRedisWrongNumberOfArgumentsError: ReplyError = {
  name: 'ReplyError',
  command: 'GET',
  message: 'ERR wrong number of arguments.',
};

export const mockRedisWrongTypeError: ReplyError = {
  name: 'ReplyError',
  command: 'GET',
  message: 'WRONGTYPE Operation against a key holding the wrong kind of value.',
};

export const mockRedisMovedError: ReplyError = {
  name: 'ReplyError',
  command: 'GET',
  message: 'MOVED 7008 127.0.0.1:7002',
};

export const mockRedisAskError: ReplyError = {
  name: 'ReplyError',
  command: 'GET',
  message: 'ASK 7008 127.0.0.1:7002',
};
