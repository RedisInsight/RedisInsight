import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const common = new Common();

let keys: string[];

fixture `Filtering iteratively in Browser page`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see search results per 500 keys if number of results is 500', async t => {
        //Create new keys
        keys = await common.createArrayWithKeyValue(500);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
        //Search all keys
        await browserPage.searchByKeyName('*');
        const keysNumberOfResults = await browserPage.keysNumberOfResults.textContent;
        //Verify that number of results is 500
        await t.expect(keysNumberOfResults).contains('500', 'Number of results is 500');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can search iteratively via Scan more for search pattern and selected data type', async t => {
        //Create new keys
        keys = await common.createArrayWithKeyValue(1000);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
        //Search all string keys
        await browserPage.selectFilterGroupType(KeyTypesTexts.String)
        await browserPage.searchByKeyName('*');
        //Verify that scan more button is not shown
        await t.expect(browserPage.scanMoreButton.exists).ok('Scan more is shown');
        await t.click(browserPage.scanMoreButton);
        //Verify that number of results is 1000
        const keysNumberOfResults = await browserPage.keysNumberOfResults.textContent;
        await t.expect(keysNumberOfResults).contains('1 000', 'Number of results is 1 000');
    });
