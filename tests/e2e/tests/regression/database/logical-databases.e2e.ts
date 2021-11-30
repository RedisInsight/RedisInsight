import {
    MyRedisDatabasePage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const userAgreementPage = new UserAgreementPage();
const cliPage = new CliPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Logical databases`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
    })
test('Verify that if user enters any index of the logical database that does not exist in the database, he can see Redis error "ERR DB index is out of range" and cannot proceed', async t => {
    const index = '0';
    //Add database with logical index
    await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
    await t.click(addRedisDatabasePage.databaseIndexCheckbox);
    await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { paste: true });
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Open database and run command with non-existing index
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.click(cliPage.cliExpandButton);
    await t.typeText(cliPage.cliCommandInput, 'Select 19', { paste: true });
    await t.pressKey('enter');
    //Verify the error
    await t.expect(cliPage.cliOutputResponseFail.textContent).eql('ERR DB index is out of range', 'Error is dispalyed in CLI');
});
