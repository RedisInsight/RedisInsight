import { t } from 'testcafe';
import { DatabaseScripts, DbTableParameters } from '../../../../helpers/database-scripts';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RedisOverviewPage } from '../../../../helpers/constants';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const rdiApiRequests = new RdiApiRequests();
const databaseHelper = new DatabaseHelper();
const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const databaseAPIRequests = new DatabaseAPIRequests();

const dbTableParams: DbTableParameters = {
    tableName: 'rdi',
    columnName: 'id',
    rowValue: 'testId'
};
const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password'
};

//skip the tests until rdi integration is added
fixture `Rdi Navigation`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await DatabaseScripts.updateColumnValueInDBTable(dbTableParams);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test.before(async t => {
    await rdiApiRequests.addNewRdiApi(rdiInstance);
    await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
})('Verify that buttons are displayed correctly in navigation panel', async() => {
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    let count = await rdiInstancesListPage.NavigationPanel.getButtonsCount();
    await t.expect(count).eql(3, 'dataBase buttons are displayed');

    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);

    await t.click(rdiInstancePage.NavigationPanel.myRedisDBButton);
    await t.click(rdiInstancePage.NavigationPanel.rdiPageButton);
    await t.expect(rdiInstancePage.refreshPipelineIcon.exists).ok('rdi instance page is opened');

    await t.click(rdiInstancePage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
    count = await myRedisDatabasePage.NavigationPanel.getButtonsCount();
    await t.expect(count).eql(3, 'rdi buttons is displayed');
});
