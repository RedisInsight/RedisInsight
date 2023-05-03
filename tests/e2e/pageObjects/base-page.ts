import { t } from 'testcafe';
import { NavigationPanel } from './components/navigation-panel';

export class BasePage {
    NavigationPanel = new NavigationPanel();

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }
}
