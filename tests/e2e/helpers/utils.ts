import { ClientFunction } from 'testcafe';
import { commonUrl } from './conf';

export const goBackHistory = ClientFunction(() => window.history.back());
export const openRedisHomePage =  ClientFunction(() => window.open(commonUrl));
