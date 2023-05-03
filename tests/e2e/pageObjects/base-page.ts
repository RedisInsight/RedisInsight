import { t } from 'testcafe';
import { NavigationPanel } from './components/navigation-panel';
import { Toast } from './components/toast';

export class BasePage {
    NavigationPanel = new NavigationPanel();
    Toast = new Toast();

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }
}
