import { ClientFunction, t } from 'testcafe';
import { env, rte } from '../../../helpers/constants';
import { acceptLicenseTerms, addNewStandaloneDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteAllDatabasesApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const getPageUrl = ClientFunction(() => window.location.href);

fixture `Add database from welcome page`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await deleteAllDatabasesApi();
        // Reload Page
        await t.eval(() => location.reload());
    });
test
    .after(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    .meta({ rte: rte.standalone })('Verify that user can add first DB from Welcome page', async t => {
        await t.expect(addRedisDatabasePage.welcomePageTitle.exists).ok('The welcome page title');
        //Add database from Welcome page
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).ok('The database adding', { timeout: 10000 });
    });
test
    .meta({  env: env.web, rte: rte.standalone })('Verify that all the links are valid from Welcome page', async t => {
        // Verify build from source link
        await t.expect(addRedisDatabasePage.buildFromSource.visible).ok('Build from source link');
        await t.click(addRedisDatabasePage.buildFromSource);
        await t.expect(getPageUrl()).eql('https://developer.redis.com/create/from-source/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight', 'Build from source page');
        await t.switchToParentWindow();
        // Verify build from source link
        await t.expect(addRedisDatabasePage.buildFromDocker.visible).ok('Build from source link');
        await t.click(addRedisDatabasePage.buildFromDocker);
        await t.expect(getPageUrl()).eql('https://developer.redis.com/create/docker/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight', 'Build from source page');
        await t.switchToParentWindow();
        // Verify build from source link
        await t.expect(addRedisDatabasePage.buildFromHomebrew.visible).ok('Build from source link');
        await t.click(addRedisDatabasePage.buildFromHomebrew);
        await t.expect(getPageUrl()).eql('https://developer.redis.com/create/homebrew/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight', 'Build from source page');
        await t.switchToParentWindow();
        // Verify promo button link
        await t.expect(myRedisDatabasePage.promoButton.visible).ok('Promotion button');
        await t.click(myRedisDatabasePage.promoButton);
        await t.expect(getPageUrl()).eql('https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_offer_jan', 'Build from source page');
    });
