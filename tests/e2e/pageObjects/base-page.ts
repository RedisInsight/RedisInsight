import { ClientFunction, t } from 'testcafe';
import { NavigationPanel } from './components/navigation-panel';

export class BasePage {
    NavigationPanel = new NavigationPanel();

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }

    /**
     * Get current page url
     */
    async getPageUrl(): Promise<string> {
        return (await ClientFunction(() => window.location.href))();
    }


}
