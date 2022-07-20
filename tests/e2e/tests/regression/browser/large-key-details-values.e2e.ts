import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const common = new Common();

let keyName = common.generateWord(20);
let field = common.generateWord(20);
let value = common.generateSentence(200);

fixture `Expand/Collapse large values in key details`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test('Verify that user can click on a row to expand it if any of its cells contains a value which is truncated.', async t => {
    let value1 = common.generateWord(20);
    let cliCommands = [
        `XADD ${keyName} * '${field}' '${value}'`,
        `XADD ${keyName} * '${field}' '${value1}'`
    ]
    //Add new Stream key with 2 fields
    for (const command of cliCommands) {
        await cliPage.sendCommandInCli(command);
    }
    //Open key details
    await browserPage.openKeyDetails(keyName);
    // Remember height of the cell with long value
    const startLongCellHeight = await browserPage.streamEntryFields.nth(1).parent(1).clientHeight;
    const startSmallCellHeight = await browserPage.streamEntryFields.nth(0).parent(1).clientHeight;
    const endLongCellHeight = startLongCellHeight + 150;
    const endSmallCellHeight = startSmallCellHeight + 5;
    await t.click(browserPage.streamEntryFields.nth(0).parent(1));
    await t.expect(browserPage.streamEntryFields.nth(0).parent(1).clientHeight).lt(endSmallCellHeight, 'Cell height is expanded', { timeout: 5000 });
    await t.click(browserPage.streamEntryFields.nth(1).parent(1));
    await t.expect(browserPage.streamEntryFields.nth(1).parent(1).clientHeight).gt(endLongCellHeight, 'Cell height is not expanded', { timeout: 5000 });
});
