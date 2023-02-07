import { acceptLicenseTermsAndAddDatabaseApi, clickOnEditDatabaseByName, deleteDatabase } from '../../../helpers/database';
import { AddRedisDatabasePage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Common } from '../../../helpers/common';

const common = new Common();
const myRedisDatabasePage = new MyRedisDatabasePage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const database = Object.assign({}, ossStandaloneConfig);

const previousDatabaseName = common.generateWord(20);
const newDatabaseName = common.generateWord(20);
database.databaseName = previousDatabaseName;

fixture `List of Databases`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(database, database.databaseName);
    });
test
    .after(async() => {
        // Delete database
        await deleteDatabase(newDatabaseName);
    })('Verify that user can edit DB alias of Standalone DB', async t => {
        await t.click(myRedisDatabasePage.myRedisDBButton);
        // Edit alias of added database
        await clickOnEditDatabaseByName(database.databaseName);

        // Verify that timeout input is displayed for edit db window with default value when it wasn't specified
        await t.expect(addRedisDatabasePage.timeoutInput.value).eql('30', 'Timeout is not defaulted to 30');

        await t.click(myRedisDatabasePage.editAliasButton);
        await t.typeText(myRedisDatabasePage.aliasInput, newDatabaseName, { replace: true });
        await t.click(myRedisDatabasePage.applyButton);
        await t.click(myRedisDatabasePage.submitChangesButton);
        // Verify that database has new alias
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newDatabaseName).exists).ok('The database with new alias is in not the list', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(previousDatabaseName).exists).notOk('The database with previous alias is still in the list', { timeout: 10000 });
    });
