import { acceptLicenseTerms, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Logical databases`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
    .afterEach(async () => {
        //Clear and delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can add DB with logical index via host and port from Add DB manually form', async t => {
    const index = '0';
    await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
    //Enter logical index
    await t.click(addRedisDatabasePage.databaseIndexCheckbox);
    await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { paste: true });
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Verify that the database is in the list
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).ok('The existence of the database', { timeout: 60000 });
});
test('Verify that if user adds DB with logical DB >0, DB name contains postfix "space+[{database index}]"', async t => {
    const index = '10';
    await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
    //Enter logical index
    await t.click(addRedisDatabasePage.databaseIndexCheckbox);
    await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { paste: true });
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Verify that the database name contains postfix
    await t.expect(myRedisDatabasePage.dbNameList.textContent).eql(`${ossStandaloneConfig.databaseName} [${index}]`, 'The postfix is added to the database name', { timeout: 60000 });
});
