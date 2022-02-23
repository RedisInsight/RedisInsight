import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Chance } from 'chance';

const chance = new Chance();
const myRedisDatabasePage = new MyRedisDatabasePage();

const newDatabaseName = chance.word({ length: 10 });

fixture `List of Databases`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Delete database
        await deleteDatabase(newDatabaseName);
    })
    ('Verify that user can edit DB alias of Standalone DB', async t => {
        await t.click(myRedisDatabasePage.myRedisDBButton);
        //Edit alias of added database
        await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.editAliasButton);
        await t.typeText(myRedisDatabasePage.aliasInput, newDatabaseName, { replace: true });
        await t.click(myRedisDatabasePage.applyButton);
        await t.click(myRedisDatabasePage.submitChangesButton);
        //Verify that database has new alias
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newDatabaseName).exists).ok('The database with new alias is in the list', { timeout: 60000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).notOk('The database with previous alias is not in the list', { timeout: 60000 });
    });
