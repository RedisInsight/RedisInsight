import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage, MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const chance = new Chance();
const cliPage = new CliPage();

let keyName = chance.word({ length: 20 });

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
        keyName = chance.word({length: 20});
        let field = chance.sentence({ words: 50 });
        let value = chance.sentence({ words: 50 });
        //Add new Stream key with 1 field
        await cliPage.sendCommandInCli(`XADD ${keyName} * '${field}' '${value}'`);
        //Open key details and click on delete entry
        await browserPage.openKeyDetails(keyName);
        const startCellHeight = await browserPage.streamEntryFields.parent(1).clientHeight;
        await console.log(startCellHeight);
        await t.click(browserPage.streamEntryFields);
        await console.log(await browserPage.streamEntryFields.parent(1).clientHeight);
    });
