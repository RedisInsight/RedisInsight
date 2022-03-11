import { rte, env } from '../../../helpers/constants';
import { acceptLicenseTerms } from '../../../helpers/database';
import { MyRedisDatabasePage, HelpCenterPage, ShortcutsPage } from '../../../pageObjects';
import { commonUrl } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const helpCenterPage = new HelpCenterPage();
const shortcutsPage = new ShortcutsPage();

fixture `Shortcuts`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    })
test
    .meta({ env: env.web, rte: rte.none })
    ('Verify that user can see a summary of Shortcuts by clicking "Keyboard Shortcuts" button in Help Center', async t => {
        // Click on help center icon and verify panel
        await t.click(myRedisDatabasePage.helpCenterButton);
        await t.expect(helpCenterPage.helpCenterPanel.exists).ok('Help Center panel is opened');
        // Click on Shortcuts option and verify panel
        await t.click(helpCenterPage.helpCenterShortcutButton);
        await t.expect(shortcutsPage.shortcutsPanel.exists).ok('Shortcuts panel is opened');
        // Validate Title and sections of Shortcuts
        await t.expect(shortcutsPage.shortcutsPanel.exists).ok('Shortcuts panel is opened');
        await t.expect(shortcutsPage.shortcutsTitle.exists).ok('shortcutsTitle is opened');
        await t.expect(shortcutsPage.shortcutsCLISection.exists).ok('shortcutsCLISection is displayed');
        await t.expect(shortcutsPage.shortcutsWorkbenchSection.exists).ok('shortcutsWorkbenchSection is displayed');
        // Verify that user can close the Shortcuts
        await t.click(shortcutsPage.shortcutsCloseButton);
        await t.expect(shortcutsPage.shortcutsPanel.exists).notOk('Shortcuts panel is not displayed');
    })
test
    .meta({ env: env.desktop, rte: rte.none })
    ('Verify that user can see a summary of Shortcuts by clicking "Keyboard Shortcuts" button in Help Center for desktop', async t => {
        // Click on help center icon and verify panel
        await t.click(myRedisDatabasePage.helpCenterButton);
        await t.expect(helpCenterPage.helpCenterPanel.exists).ok('Help Center panel is opened');
        // Click on Shortcuts option and verify panel
        await t.click(helpCenterPage.helpCenterShortcutButton);
        await t.expect(shortcutsPage.shortcutsPanel.exists).ok('Shortcuts panel is opened');
        // Validate Title and sections of Shortcuts
        await t.expect(shortcutsPage.shortcutsPanel.exists).ok('Shortcuts panel is opened');
        await t.expect(shortcutsPage.shortcutsTitle.exists).ok('shortcutsTitle is opened');
        await t.expect(shortcutsPage.shortcutsDesktopApplicationSection.exists).ok('shortcutsDesktopApplicationSection is opened');
        await t.expect(shortcutsPage.shortcutsCLISection.exists).ok('shortcutsCLISection is displayed');
        await t.expect(shortcutsPage.shortcutsWorkbenchSection.exists).ok('shortcutsWorkbenchSection is displayed');
        // Verify that user can close the Shortcuts
        await t.click(shortcutsPage.shortcutsCloseButton);
        await t.expect(shortcutsPage.shortcutsPanel.exists).notOk('Shortcuts panel is not displayed');
    })
