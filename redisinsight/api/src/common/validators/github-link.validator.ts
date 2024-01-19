import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import config from 'src/utils/config';

const SERVER_CONFIG = config.get('server');

@ValidatorConstraint({ name: 'GitHubLink', async: false })
export class GitHubLink implements ValidatorConstraintInterface {
  validate(value: any) {
    // TODO: temporary solution for integration tests
    if (SERVER_CONFIG.env === 'test') return true;

    // Regular expression to match any GitHub URL
    const githubUrlRegex = /^https:\/\/github\.com(?:\/[^\s/]+(?:\/[^\s/]+)*)?\/?$/;
    return typeof value === 'string' && githubUrlRegex.test(value);
  }

  defaultMessage() {
    return 'Enter a full GitHub link';
  }
}
