import { merge, cloneDeep } from 'lodash';
import defaultConfig from '../../config/default';
import development from '../../config/development';
import staging from '../../config/staging';
import production from '../../config/production';

const config = cloneDeep(defaultConfig);

let envConfig;
switch (process.env.NODE_ENV) {
  case 'staging':
    envConfig = staging;
    break;
  case 'production':
    envConfig = production;
    break;
  default:
    envConfig = development;
    break;
}

merge(config, envConfig);

export const get = (key: string) => config[key];

export default {
  get,
};
