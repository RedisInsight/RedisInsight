import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const chance = new Chance();
const myRedisDatabasePage = new MyRedisDatabasePage();
const database = Object.assign({}, ossStandaloneConfig);

const previousDatabaseName = chance.word({ length: 20 });
const newDatabaseName = chance.word({ length: 20 });
database.databaseName = previousDatabaseName;

fixture `List of Databases`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(database, database.databaseName);
        console.log(`Newly added database name is ${database.databaseName}`);
    });
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        //Delete database
        await deleteDatabase(newDatabaseName);
    })('Verify that user can edit DB alias of Standalone DB', async t => {
        await t.click(myRedisDatabasePage.myRedisDBButton);
        //Edit alias of added database
        await myRedisDatabasePage.clickOnEditDBByName(database.databaseName);
        await t.click(myRedisDatabasePage.editAliasButton);
        await t.typeText(myRedisDatabasePage.aliasInput, newDatabaseName, { replace: true });
        await t.click(myRedisDatabasePage.applyButton);
        await t.click(myRedisDatabasePage.submitChangesButton);
        console.log(`New database name is ${database.databaseName}`);
        //Verify that database has new alias
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newDatabaseName).exists).ok('The database with new alias is in the list', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(previousDatabaseName).exists).notOk('The database with previous alias is not in the list', { timeout: 10000 });
    });
