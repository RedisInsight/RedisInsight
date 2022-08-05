import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { populateListWithElements } from '../../../helpers/keys';
import { Common } from '../../../helpers/common';
import { addListKeyApi, deleteKeyByNameApi } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const common = new Common();

const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
const keyName = `TestListKey-${common.generateWord(10)}`;
const elementForSearch = `SearchField-${common.generateWord(5)}`;
const keyToAddParameters = { elementsCount: 500000, keyName, elementStartWith: 'listElement' };
const listKeyParameters = { keyName, element: 'testElement' };

fixture `List Key verification`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await addListKeyApi(listKeyParameters, ossStandaloneConfig);
    })
    .afterEach(async () => {
        //Clear and delete database
        await deleteKeyByNameApi(keyName, ossStandaloneConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can search per exact element index in List key in DB with 1 million of fields', async t => {
        // Add 1000000 elements to the list key
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);
        //Add custom element to the list key
        await browserPage.addElementToList(elementForSearch);
        //Search by element index
        await browserPage.searchByTheValueInKeyDetails('1000001');
        //Check the search result
        const result = await browserPage.listElementsList.nth(0).textContent;
        await t.expect(result).eql(elementForSearch, 'List element not found');
    });
