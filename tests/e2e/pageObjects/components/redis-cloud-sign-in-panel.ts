import { Selector } from 'testcafe';

export class RedisCloudSigninPanel {
    ssoOauthButton = Selector('[data-testid=sso-oauth]');
    ssoEmailInput = Selector('[data-testid=sso-email]');
    submitBtn = Selector('[data-testid=btn-submit]');
    oauthAgreement = Selector('[for=ouath-agreement]');
    googleOauth = Selector('[data-testid=google-oauth]');
    githubOauth = Selector('[data-testid=github-oauth]');
    ssoOauth = Selector('[data-testid=sso-oauth]');
}
