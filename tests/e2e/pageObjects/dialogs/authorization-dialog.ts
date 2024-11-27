import { Selector } from 'testcafe';
import { RedisCloudSigninPanel } from '../components/redis-cloud-sign-in-panel';

export class AuthorizationDialog {
    RedisCloudSigninPanel = new RedisCloudSigninPanel();

    //COMPONENTS
    authDialog = Selector('[data-testid=social-oauth-dialog]');
}
