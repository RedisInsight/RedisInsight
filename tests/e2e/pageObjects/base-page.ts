import { Selector, t } from 'testcafe';
import { NavigationPanel } from './components/navigation-panel';
import { Toast } from './components/common/toast';
import { ShortcutsPanel } from './components/shortcuts-panel';
import { EditorButton } from './components/common/editorButton';
import { Modal } from './components/common/modal';

export class BasePage {
    notification = Selector('[data-testid^=-notification]');

    NavigationPanel = new NavigationPanel();
    ShortcutsPanel = new ShortcutsPanel();
    Toast = new Toast();
    EditorButton = new EditorButton();
    Modal = new Modal();

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }
}
