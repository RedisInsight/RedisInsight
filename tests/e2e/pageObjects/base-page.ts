import { Selector, t } from 'testcafe';
import { NavigationPanel } from './components/navigation-panel';
import { Toast } from './components/common/toast';
import { ShortcutsPanel } from './components/shortcuts-panel';
import { EditorButton } from './components/common/editorButton';

export class BasePage {
    notification = Selector('[data-testid^=-notification]');

    NavigationPanel = new NavigationPanel();
    ShortcutsPanel = new ShortcutsPanel();
    Toast = new Toast();
    EditorButton = new EditorButton();

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }
}
