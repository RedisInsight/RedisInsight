import { t } from 'testcafe';

import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { RdiInstance } from '../../../../pageObjects/components/myRedisDatabase/add-rdi-instance';

const rdiInstancePage = new RdiInstancePage();
export const commonUrl = process.env.COMMON_URL || 'http://localhost:8080/integrate';

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

fixture `Rdi instance`
    .meta({ type: 'smoke' })
    // it will be removed
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();

    })
    .afterEach(async() => {
        // delete instances via UI
        await rdiInstancePage.deleteAllInstance();

    });
test('Verify that user can add and remove RDI', async() => {

    await rdiInstancePage.addRdi(rdiInstance);
    const addRdiInstance = await rdiInstancePage.getRdiInstanceValuesByIndex(0);

    await t.expect(addRdiInstance.alias).eql(rdiInstance.alias, 'added alias is not corrected');
    await t.expect(addRdiInstance.lastConnection?.length).gt(1, 'last connection is not displayed');
    await t.expect(addRdiInstance.url).eql(rdiInstance.url, 'added alias is not corrected');
    await t.expect(addRdiInstance.version).eql(rdiInstance.version, 'added alias is not corrected');

    let notification = rdiInstancePage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Instance has been added', 'The notification not displayed');
    await t.click(rdiInstancePage.Toast.toastCloseButton);
    await rdiInstancePage.deleteRdiByName(rdiInstance.alias);

    notification = rdiInstancePage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Instance has been deleted', 'The notification not displayed');

    await t.expect(rdiInstancePage.emptyRdiList.textContent).contains('No deployments found', 'the instance is not removed');
});
test
    .after(async() => {
        await t.typeText(rdiInstancePage.searchInput, '', { replace: true });
        await rdiInstancePage.deleteAllInstance();
    })('Verify that user can search by RDI', async() => {
        await rdiInstancePage.addRdi(rdiInstance);
        await rdiInstancePage.addRdi(rdiInstance2);
        await t.typeText(rdiInstancePage.searchInput, rdiInstance2.alias);
        const addedRdiInstance = await rdiInstancePage.getRdiInstanceValuesByIndex(0);
        await t.expect(addedRdiInstance.alias).eql(rdiInstance2.alias, 'correct item is displayed');

        await t.expect(await rdiInstancePage.rdiInstanceRow.count).eql(1, 'search works incorrectly');
    });
test('Verify that sorting on the list of rdi saved when rdi opened', async t => {
    // Sort by Connection Type

    await rdiInstancePage.addRdi(rdiInstance);
    await rdiInstancePage.addRdi(rdiInstance3);
    await rdiInstancePage.addRdi(rdiInstance2);

    const sortedByUrl = [rdiInstance3.alias, rdiInstance2.alias, rdiInstance.alias];
    await rdiInstancePage.sortByColumn('URL');
    let actualDatabaseList = await rdiInstancePage.getAllRdiNames();
    await rdiInstancePage.compareInstances(actualDatabaseList, sortedByUrl);
    // TODO Open any RDI and go back
    actualDatabaseList = await rdiInstancePage.getAllRdiNames();
    await rdiInstancePage.compareInstances(actualDatabaseList, sortedByUrl);
});
test('Verify that user has the same sorting if db name is changed', async t => {
    const newAliasName  = 'New alias';

    await rdiInstancePage.addRdi(rdiInstance);
    await rdiInstancePage.addRdi(rdiInstance3);
    await rdiInstancePage.addRdi(rdiInstance2);

    // Sort by  name
    const sortedByAliasType = [rdiInstance.alias, rdiInstance3.alias, rdiInstance2.alias];
    await rdiInstancePage.sortByColumn('RDI Alias');
    let actualDatabaseList = await rdiInstancePage.getAllRdiNames();
    await rdiInstancePage.compareInstances(actualDatabaseList, sortedByAliasType);
    // Change DB name insides of sorted list
    await rdiInstancePage.clickOnEditRdiByName(rdiInstance.alias);
    await t.typeText(rdiInstancePage.AddRdiInstance.rdiAliasInput, newAliasName, { replace: true });
    await t.click(rdiInstancePage.AddRdiInstance.addInstanceButton);
    rdiInstance.alias = newAliasName;
    const sortedByAliasTypeUpdated = [rdiInstance3.alias, rdiInstance.alias, rdiInstance2.alias];
    actualDatabaseList = await rdiInstancePage.getAllRdiNames();
    await rdiInstancePage.compareInstances(actualDatabaseList, sortedByAliasTypeUpdated);
});
