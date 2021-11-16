import { ReplyError } from 'src/models';

export class CliParsingError extends ReplyError {
  constructor(args) {
    super(args);
    this.name = 'CliParsingError';
  }
}

export class RedirectionParsingError extends ReplyError {
  constructor(args = 'Could not parse redirection error.') {
    super(args);
    this.name = 'RedirectionParsingError';
  }
}

export class CliCommandNotSupportedError extends ReplyError {
  constructor(args) {
    super(args);
    this.name = 'CliCommandNotSupportedError';
  }
}

export class WrongDatabaseTypeError extends Error {
  constructor(args) {
    super(args);
    this.name = 'WrongDatabaseTypeError';
  }
}

export class ClusterNodeNotFoundError extends Error {
  constructor(args) {
    super(args);
    this.name = 'ClusterNodeNotFoundError';
  }
}
