import { t, Selector } from 'testcafe';
import { WorkbenchPage } from '../pageObjects';

const workbenchPage = new WorkbenchPage();

export class WorkbenchActions {
    /**
        Verify after client list command columns are visible
        @param columns List of columns to verify
    */
    async verifyClientListColumnsAreVisible(columns: string[]): Promise<void> {
        await t.switchToIframe(workbenchPage.iframe);
        for (const column of columns) {
            const columnSelector = Selector(`[data-test-subj^=tableHeaderCell_${column}_]`);
            await t.expect(columnSelector.visible).ok(`${column} column is not visible`);
        }
        await t.switchToMainWindow();
    }
    /**
        Verify after `client list` command table rows are expected count
    */
    async verifyClientListTableViewRowCount(): Promise<void>{
        await t.click(workbenchPage.selectViewType)
            .click(workbenchPage.viewTypeOptionsText);
        // get number of rows from text view
        const numberOfRowsInTextView = await Selector('[data-testid^=row-]').count - 1;
        // select client list table view
        await t.click(workbenchPage.selectViewType)
            .click(workbenchPage.viewTypeOptionClientList);
        await t.switchToIframe(workbenchPage.iframe);
        const paginationSelector = Selector('a[data-test-subj=pagination-button-next]');
        const tableRow =  Selector('tbody tr');
        let rowCount = await tableRow.count;
        if(await paginationSelector.visible) {
            await t.click(paginationSelector);
            rowCount += await tableRow.count;
        }
        await t.expect(rowCount).eql(numberOfRowsInTextView);
    }
    /**
        Verify error message after `client list` command if there is no permission to run
     */
    async verifyClientListErrorMessage(): Promise<void>{
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(Selector('div').withText('NOPERM this user has no permissions to run the \'client\' command or its subcommand').visible)
            .ok('NOPERM error message is not displayed');
        await t.switchToMainWindow();
    }
}
