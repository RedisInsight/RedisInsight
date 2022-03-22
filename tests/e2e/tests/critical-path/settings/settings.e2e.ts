import { MyRedisDatabasePage, UserAgreementPage, SettingsPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTerms } from '../../../helpers/database';
import { commonUrl } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const settingsPage = new SettingsPage();

const explicitErrorHandler = (): void => {
    window.addEventListener('error', e => {
        if(e.message === 'ResizeObserver loop limit exceeded') {
            e.stopImmediatePropagation();
        }
    })
}

fixture `Settings`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .clientScripts({ content: `(${explicitErrorHandler.toString()})()` })
    .beforeEach(async t => {
        await acceptLicenseTerms();
    })
test
    .meta({ rte: rte.none })
    ('Verify that user can customize a number of keys to scan in filters per key name or key type', async t => {
        //Go to Settings page
        await t.click(myRedisDatabasePage.settingsButton);
        // Change keys to Scan
        await t.click(settingsPage.accordionAdvancedSettings);
        await settingsPage.changeKeysToScanValue('1500');
        // Reload Page
        await t.eval(() => location.reload());
        // Check that value was set
        await t.click(settingsPage.accordionAdvancedSettings);
        await t.expect(settingsPage.keysToScanValue.textContent).eql('1500', 'Keys to Scan has proper value');
    });
test
    .meta({ rte: rte.none })
    ('Verify that user can turn on/off Analytics in Settings in the application', async t => {
        //Go to Settings page
        await t.click(myRedisDatabasePage.settingsButton);
        await t.click(settingsPage.accordionPrivacySettings);

        const currentValue = await settingsPage.getAnalyticsValue();
        //We sort the values so as not to be tied to the current setting
        const equalValues = ['true', 'false'].sort((_, b) => b === currentValue ? -1 : 0)

        for (const value of equalValues) {
            await t.click(settingsPage.switchAnalyticsOption);
            // Reload Page
            await t.eval(() => location.reload());
            await t.click(settingsPage.accordionPrivacySettings);
            await t.expect(await settingsPage.getAnalyticsValue()).eql(value, 'Analytics was switched properly');
        }
    });
