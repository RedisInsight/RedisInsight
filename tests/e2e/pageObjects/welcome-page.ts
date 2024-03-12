import { Selector } from 'testcafe';
import { BasePage } from './base-page';
import { CompatibilityPromotion } from './components/compatibility-promotion';
import { InsightsPanel } from './components/insights-panel';

export class WelcomePage extends BasePage {
    CompatibilityPromotion = new CompatibilityPromotion();
    InsightsPanel = new InsightsPanel();

    // Buttons
    tryRedisCloudBtn = Selector('[data-testid=promo-btn]');
    addDbManuallyBtn = Selector('[data-testid=add-db-manually-btn]');
    addDbAutoBtn = Selector('[data-testid=add-db-auto-btn]');
    importCloudDbBtn = Selector('[data-testid=import-cloud-db-btn]');
    importDbFromFileBtn = Selector('[data-testid=import-from-file-btn]');
    // Links
    buildFromLinux = Selector('a').withExactText('Linux');
    buildFromDocker = Selector('a').withExactText('Docker');
    buildFromHomebrew = Selector('a').withExactText('Homebrew');
    // Text
    welcomePageTitle = Selector('[data-testid=welcome-page-title]');
}
