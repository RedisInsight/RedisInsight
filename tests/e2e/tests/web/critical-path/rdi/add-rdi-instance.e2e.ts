import { t } from 'testcafe';

import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { RdiInstance } from '../../../../pageObjects/components/myRedisDatabase/add-rdi-instance';
import { commonUrl } from '../../../../helpers/conf';

const rdiInstancePage = new RdiInstancePage();

const rdiInstance: RdiInstance = {
    alias: 'Alias',
    url: 'url',
    username: 'username',
    password: 'password',
    version: '1.2'
};

fixture `Rdi instance`
    .meta({ type: 'smoke' })
    // it will be remove
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();

    });
test('Verify that user can add and remove RDI', async() => {

    await t.navigateTo('http://localhost:8080/integrate');
    await rdiInstancePage.addRdi(rdiInstance);
    //TODO verify header
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
        await t.typeText(rdiInstancePage.searchInput, '');
        await rdiInstancePage.deleteAllRdi();
    })('Verify that user can search by RDI', async() => {

        const rdiInstance2: RdiInstance = {
            alias: 'test',
            url: 'testUrl',
            username: 'name',
            password: 'pass',
            version: '1.2'
        };
        await t.navigateTo('http://localhost:8080/integrate');

        await rdiInstancePage.addRdi(rdiInstance);
        await rdiInstancePage.addRdi(rdiInstance2);

        //TODO soring
        await t.typeText(rdiInstancePage.searchInput, rdiInstance2.alias);
        const addedRdiInstance = await rdiInstancePage.getRdiInstanceValuesByIndex(0);
        await t.expect(addedRdiInstance.alias).eql(rdiInstance2.alias, 'correct item is displayed');

        await t.expect(await rdiInstancePage.rdiInstanceRow.count).eql(1, 'search works incorrectly');
    });
