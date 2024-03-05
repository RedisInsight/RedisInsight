import { t } from 'testcafe';

import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { RdiInstance } from '../../../../pageObjects/components/myRedisDatabase/add-rdi-instance';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { commonUrl } from '../../../../helpers/conf';
import { RedisOverviewPage } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { DatabaseHelper } from '../../../../helpers';

const rdiInstancesListPage = new RdiInstancesListPage();
const browserActions = new BrowserActions();
const rdiInstancePage = new RdiInstancePage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();

const rdiInstance: RdiInstance = {
    alias: 'Alias',
    url: 'url',
    username: 'username',
    password: 'password',
    version: '1.2'
};
const rdiInstance2: RdiInstance = {
    alias: 'test',
    url: 'http://test',
    username: 'name',
    password: 'pass',
    version: '1.2'
};

const rdiInstance3: RdiInstance = {
    alias: 'first',
    url: 'http://localhost:8080/',
    username: 'name',
    password: 'pass',
    version: '1.2'
};
//skip the tests until rdi integration is added

fixture.skip `Rdi instance`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);

    })
    .afterEach(async() => {
        // delete instances via UI
        await rdiInstancesListPage.deleteAllInstance();

    });
test('Verify that user can add and remove RDI', async() => {

    await rdiInstancesListPage.addRdi(rdiInstance);
    const addRdiInstance = await rdiInstancesListPage.getRdiInstanceValuesByIndex(0);

    await t.expect(addRdiInstance.alias).eql(rdiInstance.alias, 'added alias is not corrected');
    await t.expect(addRdiInstance.lastConnection?.length).gt(1, 'last connection is not displayed');
    await t.expect(addRdiInstance.url).eql(rdiInstance.url, 'added alias is not corrected');
    await t.expect(addRdiInstance.version).eql(rdiInstance.version, 'added alias is not corrected');

    let notification = rdiInstancesListPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Instance has been added', 'The notification not displayed');
    await t.click(rdiInstancesListPage.Toast.toastCloseButton);
    await rdiInstancesListPage.deleteRdiByName(rdiInstance.alias);

    notification = rdiInstancesListPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Instance has been deleted', 'The notification not displayed');

    await t.expect(rdiInstancesListPage.emptyRdiList.textContent).contains('No RDI instances added', 'the instance is not removed');
});
test
    .after(async() => {
        await t.typeText(rdiInstancesListPage.searchInput, '', { replace: true });
        await rdiInstancesListPage.deleteAllInstance();
    })('Verify that user can search by RDI', async() => {
        await rdiInstancesListPage.addRdi(rdiInstance);
        await rdiInstancesListPage.addRdi(rdiInstance2);
        await t.typeText(rdiInstancesListPage.searchInput, rdiInstance2.alias);
        const addedRdiInstance = await rdiInstancesListPage.getRdiInstanceValuesByIndex(0);
        await t.expect(addedRdiInstance.alias).eql(rdiInstance2.alias, 'correct item is displayed');

        await t.expect(await rdiInstancesListPage.rdiInstanceRow.count).eql(1, 'search works incorrectly');
    });
test('Verify that sorting on the list of rdi saved when rdi opened', async t => {
    // Sort by Connection Type

    await rdiInstancesListPage.addRdi(rdiInstance);
    await rdiInstancesListPage.addRdi(rdiInstance3);
    await rdiInstancesListPage.addRdi(rdiInstance2);

    const sortedByUrl = [rdiInstance3.alias, rdiInstance2.alias, rdiInstance.alias];
    await rdiInstancesListPage.sortByColumn('URL');
    let actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByUrl);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.alias);
    await t.click(rdiInstancePage.breadcrumbsLink);
    actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByUrl);
});
test('Verify that user has the same sorting if db name is changed', async t => {
    const newAliasName  = 'New alias';

    await rdiInstancesListPage.addRdi(rdiInstance);
    await rdiInstancesListPage.addRdi(rdiInstance3);
    await rdiInstancesListPage.addRdi(rdiInstance2);

    // Sort by  name
    const sortedByAliasType = [rdiInstance.alias, rdiInstance3.alias, rdiInstance2.alias];
    await rdiInstancesListPage.sortByColumn('RDI Alias');
    let actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByAliasType);
    // Change DB name insides of sorted list
    await rdiInstancesListPage.editRdiByName(rdiInstance.alias);
    await t.typeText(rdiInstancesListPage.AddRdiInstance.rdiAliasInput, newAliasName, { replace: true });
    await t.click(rdiInstancesListPage.AddRdiInstance.addInstanceButton);

    rdiInstance.alias = newAliasName;

    const sortedByAliasTypeUpdated = [rdiInstance3.alias, rdiInstance.alias, rdiInstance2.alias];
    actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByAliasTypeUpdated);
});
test('Verify that button is displayed if user does not enter all mandatory information', async t => {

    const tooltipText = [
        'URL'
    ];

    await t.click(rdiInstancesListPage.rdiInstanceButton);
    await t.typeText(rdiInstancesListPage.AddRdiInstance.rdiAliasInput, rdiInstance.alias);

    await t.click(rdiInstancesListPage.AddRdiInstance.addInstanceButton);

    for (const text of tooltipText) {
        await browserActions.verifyTooltipContainsText(text, true);
    }
});
