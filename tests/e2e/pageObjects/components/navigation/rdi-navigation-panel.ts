import { Selector, t } from 'testcafe';
import { BaseNavigationPanel } from './base-navigation-panel';

export class RdiNavigationPanel extends BaseNavigationPanel{
    rdiPageButton = Selector('[data-testid=pipeline-management-page-btn]');

}
