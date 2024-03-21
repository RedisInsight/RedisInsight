import { Selector, t } from 'testcafe';
import { RedisOverviewPage } from '../helpers/constants';
import { Toast } from './components/common/toast';
import { ShortcutsPanel } from './components/shortcuts-panel';
import { EditorButton } from './components/common/editorButton';
export class BaseOverviewPage {
    ShortcutsPanel = new ShortcutsPanel();
    Toast = new Toast();
    EditorButton = new EditorButton();

    notification = Selector('[data-testid^=-notification]');
    deleteRowButton = Selector('[data-testid^=delete-instance-]');
    editRowButton = Selector('[data-testid^=edit-instance-]');
    confirmDeleteButton = Selector('[data-testid^=delete-instance-]').withExactText('Remove');
    confirmDeleteAllDbButton = Selector('[data-testid=delete-selected-dbs]');

    instanceRow = Selector('[class*=euiTableRow-isSelectable]');

    selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
    deleteButtonInPopover = Selector('#deletePopover button');

    databasePageLink = Selector('[data-testid=home-tab-databases]');
    rdiPageLink = Selector('[data-testid=home-tab-rdi-instances]');

    /**
     * Reload page
     */
    async reloadPage(): Promise<void> {
        await t.eval(() => location.reload());
    }

    async setActivePage(type: RedisOverviewPage): Promise<void> {

        if(type === RedisOverviewPage.Rdi) {
            await t.click(this.rdiPageLink);
        }
        else {
            await t.click(this.databasePageLink);
        }
    }

    /**
     * Delete instances
     */
    async deleteAllInstance(): Promise<void> {
        const rows = this.instanceRow;
        const count = await rows.count;
        if (count > 1) {
            await t
                .click(this.selectAllCheckbox)
                .click(this.deleteButtonInPopover)
                .click(this.confirmDeleteAllDbButton);
        }
        else if (count === 1) {
            await t
                .click(this.deleteRowButton)
                .click(this.confirmDeleteButton);
        }
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
    }

    /**
     * Get all databases from List of DBs page
     * @param actualList Actual list
     * @param sortedList Expected list
     */
    async compareInstances(actualList: string[], sortedList: string[]): Promise<void> {
        for (let k = 0; k < actualList.length; k++) {
            await t.expect(actualList[k].trim()).eql(sortedList[k].trim());
        }
    }
}
