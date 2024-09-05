import { Selector } from 'testcafe';

export class AuthorizationDialog {
    //COMPONENTS
    authDialog = Selector('[data-testid=social-oauth-dialog]');
    //BUTTONS
    googleAuth = Selector('[data-testid=google-oauth]');
    gitHubAuth = Selector('[data-testid=github-oauth]');
    ssoAuth = Selector('[data-testid=sso-oauth]');
}
