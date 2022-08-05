import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { populateSetWithMembers } from '../../../helpers/keys';
import { Common } from '../../../helpers/common';
import { addSetKeyApi, deleteKeyByNameApi } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const common = new Common();

const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
const keyName = `TestSetKey-${common.generateWord(10)}`;
const memberForSearch = `SearchField-${common.generateWord(5)}`;
const keyToAddParameters = { membersCount: 500000, keyName, memberStartWith: 'setMember' };
const setKeyParameters = { keyName, members: ['testMember'] };

fixture `Set Key verification`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await addSetKeyApi(setKeyParameters, ossStandaloneConfig);
    })
    .afterEach(async () => {
        //Clear and delete database
        await deleteKeyByNameApi(keyName, ossStandaloneConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can search per exact member name in Set key in DB with 1 million of members', async t => {
        // Add 1000000 members to the set key
        await populateSetWithMembers(dbParameters.host, dbParameters.port, keyToAddParameters);
        await populateSetWithMembers(dbParameters.host, dbParameters.port, keyToAddParameters);
        //Add custom member to the set key
        await browserPage.addMemberToSet(memberForSearch);
        //Search by full member name
        await browserPage.searchByTheValueInSetKey(memberForSearch);
        //Check the search result
        const result = await browserPage.setMembersList.nth(0).textContent;
        await t.expect(result).eql(memberForSearch, 'Set member not found');
    });
