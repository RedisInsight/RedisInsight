import { MyRedisDatabasePage, SettingsPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl } from '../../../../helpers/conf';
import { Common, Telemetry } from '../../../../helpers';

const myRedisDatabasePage = new MyRedisDatabasePage();
const settingsPage = new SettingsPage();
const databaseHelper = new DatabaseHelper();
const telemetry = new Telemetry();

const logger = telemetry.createLogger();

const telemetryEvent = 'SETTINGS_WORKBENCH_EDITOR_CLEAR_CHANGED';

const expectedProperties = [
    'currentValue',
    'newValue'
];

const explicitErrorHandler = (): void => {
    window.addEventListener('error', e => {
        if(e.message === 'ResizeObserver loop limit exceeded') {
            e.stopImmediatePropagation();
        }
    });
};

fixture `Settings`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .clientScripts({ content: `(${explicitErrorHandler.toString()})()` })
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test
    .after(async() => {
        await settingsPage.changeKeysToScanValue('10000');
    })('Verify that user can customize a number of keys to scan in filters per key name or key type', async t => {
    // Go to Settings page
        await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
        // Change keys to Scan
        await t.click(settingsPage.accordionAdvancedSettings);
        await settingsPage.changeKeysToScanValue('1500');
        // Reload Page
        await myRedisDatabasePage.reloadPage();
        // Check that value was set
        await t.click(settingsPage.accordionAdvancedSettings);
        await t.expect(settingsPage.keysToScanValue.textContent).eql('1500', 'Keys to Scan has proper value');
    });
test('Verify that user can turn on/off Analytics in Settings in the application', async t => {
    // Go to Settings page
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    await t.click(settingsPage.accordionPrivacySettings);

    const currentValue = await settingsPage.getAnalyticsSwitcherValue();
    // We sort the values so as not to be tied to the current setting
    const equalValues = [true, false].sort((_, b) => b === currentValue ? -1 : 0);

    for (const value of equalValues) {
        await t.click(settingsPage.switchAnalyticsOption);
        // Reload Page
        await myRedisDatabasePage.reloadPage();
        await t.click(settingsPage.accordionPrivacySettings);
        await t.expect(await settingsPage.getAnalyticsSwitcherValue()).eql(value, 'Analytics was switched properly');
        // Verify that telemetry is turned off
        if(value === false){
            await t.click(settingsPage.accordionWorkbenchSettings);
            //turn on and turn off option
            await t.click(settingsPage.switchEditorCleanupOption);
            await t.click(settingsPage.switchEditorCleanupOption);

            try {
                await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);
                await t.expect(true).eql(false, 'telemetry is sent when analytics is disabled');
            } catch (error) {
                await t.expect(true).eql(true, 'telemetry is not sent when analytics is disabled');
            }
        }
    }
});
