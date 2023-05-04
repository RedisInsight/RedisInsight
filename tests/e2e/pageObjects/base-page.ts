import { t } from 'testcafe';
import { NavigationPanel } from './components/navigation-panel';
import { ShortcutsPanel } from './components/shortcuts-panel';

export class BasePage {
    NavigationPanel = new NavigationPanel();
    ShortcutsPanel = new ShortcutsPanel();

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }
}
