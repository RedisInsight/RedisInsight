import { rte } from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { populateListWithElements } from '../../../helpers/keys';
import { Common } from '../../../helpers/common';
import { APIKeyRequests } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
const keyName = `TestListKey-${ Common.generateWord(10) }`;
const elementForSearch = `SearchField-${ Common.generateWord(5) }`;
const keyToAddParameters = { elementsCount: 500000, keyName, elementStartWith: 'listElement' };

fixture `List Key verification`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        await browserPage.addListKey(keyName, '2147476121', 'testElement');
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search per exact element index in List key in DB with 1 million of fields', async t => {
        // Add 1000000 elements to the list key
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);
        // Add custom element to the list key
        await browserPage.openKeyDetails(keyName);
        await browserPage.addElementToList(elementForSearch);
        // Search by element index
        await browserPage.searchByTheValueInKeyDetails('1000001');
        // Check the search result
        const result = await browserPage.listElementsList.nth(0).textContent;
        await t.expect(result).eql(elementForSearch, 'List element not found');
    });
