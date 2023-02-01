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
        await t.expect(workbenchPage.clientListTableHeaderCellLAddr.visible).ok('laddr column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellFd.visible).ok('fd column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellName.visible).ok('name column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellAge.visible).ok('age column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellIdle.visible).ok('idle column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellFlags.visible).ok('flags column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellDb.visible).ok('db column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellSub.visible).ok('sub column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellPSub.visible).ok('psub column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellMulti.visible).ok('multi column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellQBuf.visible).ok('qbuf column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellQBufFree.visible).ok('qbuf-free column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellQBufArgvMem.visible).ok('argv-mem column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellObl.visible).ok('obl column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellOll.visible).ok('oll column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellOmem.visible).ok('omem column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellTotMem.visible).ok('tot-mem column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellEvents.visible).ok('events column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellCmd.visible).ok('cmd column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellUser.visible).ok('user column is not visible');
        await t.expect(workbenchPage.clientListTableHeaderCellRedir.visible).ok('redir column is not visible');
    }
}
