import { rte } from '../../../helpers/constants';
import { AddRedisDatabasePage, BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, invalidOssStandaloneConfig, ossStandaloneForSSHConfig } from '../../../helpers/conf';
import { acceptLicenseTerms, clickOnEditDatabaseByName } from '../../../helpers/database';
import { deleteStandaloneDatabasesByNamesApi } from '../../../helpers/api/api-database';
import { sshPrivateKey, sshPrivateKeyWithPasscode } from '../../../test-data/sshPrivateKeys';
import { Common } from '../../../helpers/common';
import { BrowserActions } from '../../../common-actions/browser-actions';

const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const common = new Common();
const browserActions = new BrowserActions();

const sshParams = {
    sshHost: '172.31.100.245',
    sshPort: '2222',
    sshUsername: 'u'
};
const newClonedDatabaseAlias = 'Cloned ssh database';
const sshDbPass = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${common.generateWord(5)}`
};
const sshDbPrivateKey = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${common.generateWord(5)}`
};
const sshDbPasscode = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${common.generateWord(5)}`
};

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

        // Verify that when user request to test database connection is not successfull, can see standart connection error
        await t.click(addRedisDatabasePage.testConnectionBtn);
        await t.expect(myRedisDatabasePage.databaseInfoMessage.textContent).contains('Error', 'Invalid connection has no error on test');

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
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        // Delete databases
        await deleteStandaloneDatabasesByNamesApi([sshDbPass.databaseName, sshDbPrivateKey.databaseName, sshDbPasscode.databaseName, newClonedDatabaseAlias]);
    })('Adding database with SSH', async t => {
        const tooltipText = [
            'Enter a value for required fields (3):',
            'SSH Host',
            'SSH Username',
            'SSH Private Key'
        ];
        const sshWithPass = {
            ...sshParams,
            sshPassword: 'pass'
        };
        const sshWithPrivateKey = {
            ...sshParams,
            sshPrivateKey: sshPrivateKey
        };
        const sshWithPassphrase = {
            ...sshParams,
            sshPrivateKey: sshPrivateKeyWithPasscode,
            sshPassphrase: 'test'
        };

        // Verify that if user have not entered any required value he can see that this field should be specified when hover over the button to add a database
        await t
            .click(addRedisDatabasePage.addDatabaseButton)
            .click(addRedisDatabasePage.addDatabaseManually)
            .click(addRedisDatabasePage.useSSHCheckbox)
            .click(addRedisDatabasePage.sshPrivateKeyRadioBtn)
            .hover(addRedisDatabasePage.addRedisDatabaseButton);
        for (const text of tooltipText) {
            await browserActions.verifyTooltipContainsText(text, true);
        }
        // Verify that user can see the Test Connection button enabled/disabled with the same rules as the button to add/apply the changes
        await t.hover(addRedisDatabasePage.testConnectionBtn);
        for (const text of tooltipText) {
            await browserActions.verifyTooltipContainsText(text, true);
        }

        // Verify that user can add SSH tunnel with Password for Standalone database
        await t.click(addRedisDatabasePage.cancelButton);
        await addRedisDatabasePage.addStandaloneSSHDatabase(sshDbPass, sshWithPass);
        await myRedisDatabasePage.clickOnDBByName(sshDbPass.databaseName);
        await common.checkURLContainsText('browser');

        // Verify that user can add SSH tunnel with Private Key
        await t.click(browserPage.myRedisDbIcon);
        await addRedisDatabasePage.addStandaloneSSHDatabase(sshDbPrivateKey, sshWithPrivateKey);
        await myRedisDatabasePage.clickOnDBByName(sshDbPrivateKey.databaseName);
        await common.checkURLContainsText('browser');

        // Verify that user can edit SSH parameters for existing database connections
        await t.click(browserPage.myRedisDbIcon);
        await myRedisDatabasePage.clickOnEditDBByName(sshDbPrivateKey.databaseName);
        await t
            .typeText(addRedisDatabasePage.sshPrivateKeyInput, sshWithPassphrase.sshPrivateKey, { replace: true, paste: true })
            .typeText(addRedisDatabasePage.sshPassphraseInput, sshWithPassphrase.sshPassphrase, { replace: true, paste: true });
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(addRedisDatabasePage.addRedisDatabaseButton.exists).notOk('Edit database panel still displayed');
        await clickOnEditDatabaseByName(sshDbPrivateKey.databaseName);
        await t
            .expect(addRedisDatabasePage.sshPrivateKeyInput.value).eql(sshWithPassphrase.sshPrivateKey, 'Edited Private key not saved')
            .expect(addRedisDatabasePage.sshPassphraseInput.value).eql(sshWithPassphrase.sshPassphrase, 'Edited Passphrase not saved');

        // Verify that user can clone database with SSH tunnel
        await clickOnEditDatabaseByName(sshDbPrivateKey.databaseName);
        await t.click(addRedisDatabasePage.cloneDatabaseButton);
        // Edit Database alias before cloning
        await t.typeText(addRedisDatabasePage.databaseAliasInput, newClonedDatabaseAlias, { replace: true });
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newClonedDatabaseAlias).exists).ok('DB with SSH was not cloned');

        // Verify that user can add SSH tunnel with Passcode
        await addRedisDatabasePage.addStandaloneSSHDatabase(sshDbPasscode, sshWithPassphrase);
        await myRedisDatabasePage.clickOnDBByName(sshDbPasscode.databaseName);
        await common.checkURLContainsText('browser');
    });
