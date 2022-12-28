import { rte } from '../../../helpers/constants';
import { AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, invalidOssStandaloneConfig } from '../../../helpers/conf';
import { acceptLicenseTerms } from '../../../helpers/database';

const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Connecting to the databases verifications`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
test
    .meta({ rte: rte.none })('Verify that user can see error message if he can not connect to added Database', async t => {
        const errorMessage = `Could not connect to ${invalidOssStandaloneConfig.host}:${invalidOssStandaloneConfig.port}, please check the connection details.`;

        // Fill the add database form
        await addRedisDatabasePage.addRedisDataBase(invalidOssStandaloneConfig);
        // Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        // Verify that the database is not in the list
        await t.expect(addRedisDatabasePage.errorMessage.textContent).contains('Error', 'Error message not displayed', { timeout: 10000 });
        await t.expect(addRedisDatabasePage.errorMessage.textContent).contains(errorMessage, 'Error message not displayed', { timeout: 10000 });
    });
test
    .meta({ rte: rte.none })('Fields to add database prepopulation', async t => {
        const defaultHost = '127.0.0.1';
        const defaultPort = '6379';
        const defaultSentinelPort = '26379';

        await t
            .click(addRedisDatabasePage.addDatabaseButton)
            .click(addRedisDatabasePage.addDatabaseManually);
        // Verify that the Host, Port, Database Alias values pre-populated by default for the manual flow
        await t
            .expect(addRedisDatabasePage.hostInput.value).eql(defaultHost, 'Default host not prepopulated')
            .expect(addRedisDatabasePage.portInput.value).eql(defaultPort, 'Default port not prepopulated')
            .expect(addRedisDatabasePage.databaseAliasInput.value).eql(`${defaultHost}:${defaultPort}`, 'Default db alias not prepopulated');
        // Verify that the Host, Port, Database Alias values pre-populated by default for Sentinel
        await t
            .click(addRedisDatabasePage.addAutoDiscoverDatabase)
            .click(addRedisDatabasePage.redisSentinelType);
        await t
            .expect(addRedisDatabasePage.hostInput.value).eql(defaultHost, 'Default sentinel host not prepopulated')
            .expect(addRedisDatabasePage.portInput.value).eql(defaultSentinelPort, 'Default sentinel port not prepopulated');

    });
