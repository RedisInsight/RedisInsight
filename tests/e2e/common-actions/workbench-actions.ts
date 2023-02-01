import {t} from 'testcafe';
import { WorkbenchPage } from '../pageObjects';

const workbenchPage = new WorkbenchPage();

export class WorkbenchActions {
    /*
        Verify after client list command columns are visible
    */
    async verifyClientListColumnsAreVisible(): Promise<void> {
        await t.expect(workbenchPage.clientListTableHeaderCellId.visible).ok('id column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellAddr.visible).ok('addr column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellName.visible).ok('name column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellUser.visible).ok('user column is not visible');
    }
}
