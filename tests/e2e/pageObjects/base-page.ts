import { t } from 'testcafe';
import { NavigationPanel } from './components/navigation-panel';
import { Toast } from './components/toast';
import { ShortcutsPanel } from './components/shortcuts-panel';

export class BasePage {
    NavigationPanel = new NavigationPanel();
    ShortcutsPanel = new ShortcutsPanel();
    Toast = new Toast();

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }
}
