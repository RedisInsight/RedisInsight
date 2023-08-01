import { Selector } from 'testcafe';
import { BasePage } from './base-page';

export class WelcomePage extends BasePage {
    // Buttons
    tryRedisCloudBtn = Selector('[data-testid=promo-btn]');
    addDbManuallyBtn = Selector('[data-testid=add-db-manually-btn]');
    addDbAutoBtn = Selector('[data-testid=add-db-auto-btn]');
    importCloudDbBtn = Selector('[data-testid=import-cloud-db-btn]');
    importDbFromFileBtn = Selector('[data-testid=import-from-file-btn]');
    // Links
    buildFromSource = Selector('a').withExactText('Build from source');
    buildFromDocker = Selector('a').withExactText('Docker');
    buildFromHomebrew = Selector('a').withExactText('Homebrew');
    // Text
    welcomePageTitle = Selector('[data-testid=welcome-page-title]');
}
