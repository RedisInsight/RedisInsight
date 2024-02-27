import { rte } from '../../../../helpers/constants';
import { BrowserPage, MyRedisDatabasePage, WelcomePage } from '../../../../pageObjects';
import { commonUrl, invalidOssStandaloneConfig, ossClusterForSSHConfig, ossStandaloneForSSHConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { sshPrivateKey, sshPrivateKeyWithPasscode } from '../../../../test-data/sshPrivateKeys';
import { Common } from '../../../../helpers/common';
import { BrowserActions } from '../../../../common-actions/browser-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const welcomePage = new WelcomePage();
const browserActions = new BrowserActions();

const sshParams = {
    sshHost: '172.31.100.245',
    sshPort: '2222',
    sshUsername: 'u'
};
const newClonedDatabaseAlias = 'Cloned ssh database';
const sshDbPass = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${Common.generateWord(5)}`
};
const sshDbPrivateKey = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${Common.generateWord(5)}`
};
const sshDbPasscode = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${Common.generateWord(5)}`
};
const sshDbClusterPass = {
    ...ossClusterForSSHConfig,
    databaseName: `SSH_Cluster_${Common.generateWord(5)}`
};

fixture `Connecting to the databases verifications`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test
    .meta({ rte: rte.none })('Verify that user can see error message if he can not connect to added Database', async t => {
        const errorMessage = `Could not connect to ${invalidOssStandaloneConfig.host}:${invalidOssStandaloneConfig.port}, please check the connection details.`;

        // Fill the add database form
        await myRedisDatabasePage.AddRedisDatabase.addRedisDataBase(invalidOssStandaloneConfig);

        // Verify that when user request to test database connection is not successfull, can see standart connection error
        await t.click(myRedisDatabasePage.AddRedisDatabase.testConnectionBtn);
        await t.expect(myRedisDatabasePage.Toast.toastHeader.textContent).contains('Error', 'Invalid connection has no error on test');

        // Click for saving
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        // Verify that the database is not in the list
        await t.expect(myRedisDatabasePage.Toast.toastError.textContent).contains('Error', 'Error message not displayed', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.Toast.toastError.textContent).contains(errorMessage, 'Error message not displayed', { timeout: 10000 });
    });
test
    .meta({ rte: rte.none })('Fields to add database prepopulation', async t => {
        const defaultHost = '127.0.0.1';
        const defaultPort = '6379';
        const defaultSentinelPort = '26379';

        if (await welcomePage.addDbManuallyBtn.exists) {
            await t.click(welcomePage.addDbManuallyBtn);
        }
        else {
            await t
                .click(myRedisDatabasePage.AddRedisDatabase.addDatabaseButton)
                .click(myRedisDatabasePage.AddRedisDatabase.addDatabaseManually);
        }
        // Verify that the Host, Port, Database Alias values pre-populated by default for the manual flow
        await t
            .expect(myRedisDatabasePage.AddRedisDatabase.hostInput.value).eql(defaultHost, 'Default host not prepopulated')
            .expect(myRedisDatabasePage.AddRedisDatabase.portInput.value).eql(defaultPort, 'Default port not prepopulated')
            .expect(myRedisDatabasePage.AddRedisDatabase.databaseAliasInput.value).eql(`${defaultHost}:${defaultPort}`, 'Default db alias not prepopulated');
        // Verify that the Host, Port, Database Alias values pre-populated by default for Sentinel
        await t
            .click(myRedisDatabasePage.AddRedisDatabase.addAutoDiscoverDatabase)
            .click(myRedisDatabasePage.AddRedisDatabase.redisSentinelType);
        await t
            .expect(myRedisDatabasePage.AddRedisDatabase.hostInput.value).eql(defaultHost, 'Default sentinel host not prepopulated')
            .expect(myRedisDatabasePage.AddRedisDatabase.portInput.value).eql(defaultSentinelPort, 'Default sentinel port not prepopulated');
    });
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabasesByNamesApi([sshDbPass.databaseName, sshDbPrivateKey.databaseName, sshDbPasscode.databaseName, newClonedDatabaseAlias]);
    })('Adding database with SSH', async t => {
        const hiddenPass = '••••••••••••';
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
        if (await welcomePage.addDbManuallyBtn.exists) {
            await t.click(welcomePage.addDbManuallyBtn);
        }
        else {
            await t
                .click(myRedisDatabasePage.AddRedisDatabase.addDatabaseButton)
                .click(myRedisDatabasePage.AddRedisDatabase.addDatabaseManually);
        }
        await t
            .click(myRedisDatabasePage.AddRedisDatabase.useSSHCheckbox)
            .click(myRedisDatabasePage.AddRedisDatabase.sshPrivateKeyRadioBtn)
            .hover(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        for (const text of tooltipText) {
            await browserActions.verifyTooltipContainsText(text, true);
        }
        // Verify that user can see the Test Connection button enabled/disabled with the same rules as the button to add/apply the changes
        await t.hover(myRedisDatabasePage.AddRedisDatabase.testConnectionBtn);
        for (const text of tooltipText) {
            await browserActions.verifyTooltipContainsText(text, true);
        }

        // Verify that user can add SSH tunnel with Password for Standalone database
        await t.click(myRedisDatabasePage.AddRedisDatabase.cancelButton);
        await myRedisDatabasePage.AddRedisDatabase.addStandaloneSSHDatabase(sshDbPass, sshWithPass);
        await myRedisDatabasePage.clickOnDBByName(sshDbPass.databaseName);
        await Common.checkURLContainsText('browser');

        // Verify that user can add SSH tunnel with Private Key
        await t.click(browserPage.OverviewPanel.myRedisDBLink);
        await myRedisDatabasePage.AddRedisDatabase.addStandaloneSSHDatabase(sshDbPrivateKey, sshWithPrivateKey);
        await myRedisDatabasePage.clickOnDBByName(sshDbPrivateKey.databaseName);
        await Common.checkURLContainsText('browser');

        // Verify that user can edit SSH parameters for existing database connections
        await t.click(browserPage.OverviewPanel.myRedisDBLink);
        await myRedisDatabasePage.clickOnEditDBByName(sshDbPrivateKey.databaseName);
        await t
            .typeText(myRedisDatabasePage.AddRedisDatabase.sshPrivateKeyInput, sshWithPassphrase.sshPrivateKey, { replace: true, paste: true })
            .typeText(myRedisDatabasePage.AddRedisDatabase.sshPassphraseInput, sshWithPassphrase.sshPassphrase, { replace: true, paste: true });
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton.exists).notOk('Edit database panel still displayed');
        await databaseHelper.clickOnEditDatabaseByName(sshDbPrivateKey.databaseName);
        // Verify that password, passphrase and private key are hidden for SSH option
        await t
            .expect(myRedisDatabasePage.AddRedisDatabase.sshPrivateKeyInput.textContent).eql(hiddenPass, 'Edited Private key not saved')
            .expect(myRedisDatabasePage.AddRedisDatabase.sshPassphraseInput.value).eql(hiddenPass, 'Edited Passphrase not saved');

        // Verify that user can clone database with SSH tunnel
        await databaseHelper.clickOnEditDatabaseByName(sshDbPrivateKey.databaseName);
        await t.click(myRedisDatabasePage.AddRedisDatabase.cloneDatabaseButton);
        // Edit Database alias before cloning
        await t.typeText(myRedisDatabasePage.AddRedisDatabase.databaseAliasInput, newClonedDatabaseAlias, { replace: true });
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newClonedDatabaseAlias).exists).ok('DB with SSH was not cloned');

        // Verify that user can add SSH tunnel with Passcode
        await myRedisDatabasePage.AddRedisDatabase.addStandaloneSSHDatabase(sshDbPasscode, sshWithPassphrase);
        await myRedisDatabasePage.clickOnDBByName(sshDbPasscode.databaseName);
        await Common.checkURLContainsText('browser');
    });
test
    .meta({ rte: rte.ossCluster })
    .after(async() => {
        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabaseApi(sshDbClusterPass);
    })('Adding OSS Cluster database with SSH', async() => {
        const sshWithPass = {
            ...sshParams,
            sshPassword: 'pass'
        };
        // Verify that user can add SSH tunnel with Password for OSS Cluster database
        await myRedisDatabasePage.AddRedisDatabase.addStandaloneSSHDatabase(sshDbClusterPass, sshWithPass);
        await myRedisDatabasePage.clickOnDBByName(sshDbPass.databaseName);
        await Common.checkURLContainsText('browser');
    });
