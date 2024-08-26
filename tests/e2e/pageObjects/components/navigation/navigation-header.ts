import { Selector } from 'testcafe';

export class NavigationHeader {
    insightsTriggerButton = Selector('[data-testid=insights-trigger]');
    cloudSignInButton = Selector('[data-testid=cloud-sign-in-btn]');
}
