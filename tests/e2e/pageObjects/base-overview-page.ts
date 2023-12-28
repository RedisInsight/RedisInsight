import { Selector, t } from 'testcafe';
import { BasePage } from './base-page';

export class BaseOverviewPage extends BasePage {

    deleteRowButton = Selector('[data-testid^=delete-instance-]');
    confirmDeleteButton = Selector('[data-testid^=delete-instance-]').withExactText('Remove');
    confirmDeleteAllDbButton = Selector('[data-testid=delete-selected-dbs]');

    instanceRow = Selector('[class*=euiTableRow-isSelectable]');

    selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
    deleteButtonInPopover = Selector('#deletePopover button');

    /**
     * Delete Rdi
     */
    async deleteAllRdi(): Promise<void> {
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
}
