import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Logical databases`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
    })
    .afterEach(async t => {
        //Delete databases
        await myRedisDatabasePage.deleteAllDatabases();
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
