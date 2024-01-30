// import { join } from 'path';
// import * as os from 'os';
import * as fs from 'fs';
import * as editJsonFile from 'edit-json-file';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, workingDirectory } from '../../../../helpers/conf';
import { ExploreTabs, rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

if (fs.existsSync(workingDirectory)) {
    // Guides content
    const guidesTimestampPath = `${workingDirectory}/guides/build.json`;
    // const guidesGraphIntroductionFilePath = `${workingDirectory}/guides/quick-guides/graph/introduction.md`;

    // Tutorials content
    const tutorialsTimestampPath = `${workingDirectory}/tutorials/build.json`;
    // const tutorialsTimeSeriesFilePath = `${workingDirectory}/tutorials/redis_stack/redis_for_time_series.md`;

    // Remove md files from local folder. When desktop tests are started, files will be updated from remote repository
    // Need to uncomment when desktop tests are started
    // fs.unlinkSync(guidesGraphIntroductionFilePath);
    // fs.unlinkSync(tutorialsTimeSeriesFilePath);

    // Update timestamp for build files
    const guidesTimestampFile = editJsonFile(guidesTimestampPath);
    const tutorialsTimestampFile = editJsonFile(tutorialsTimestampPath);

    const guidesNewTimestamp = guidesTimestampFile.get('timestamp') - 10;
    const tutorialNewTimestamp = tutorialsTimestampFile.get('timestamp') - 10;

    guidesTimestampFile.set('timestamp', guidesNewTimestamp);
    guidesTimestampFile.save();
    tutorialsTimestampFile.set('timestamp', tutorialNewTimestamp);
    tutorialsTimestampFile.save();

    fixture `Auto-update in Enablement Area`
        .meta({ type: 'critical_path', rte: rte.standalone })
        .page(commonUrl)
        .beforeEach(async() => {
            await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        })
        .afterEach(async() => {
            await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
        });
    test('Verify that user can see updated info in Enablement Area', async t => {
        // Create new file due to cache-ability
        const guidesTimestampFileNew = editJsonFile(guidesTimestampPath);
        const tutorialsTimestampFileNew = editJsonFile(tutorialsTimestampPath);

        // Open Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);

        // Check Enablement area and validate that removed file is existed in Guides
        await workbenchPage.InsightsPanel.togglePanel(true);
        const tab = await workbenchPage.InsightsPanel.setActiveTab(ExploreTabs.Explore);
        await t.click(tab.guidesGraphAccordion);
        await t.click(tab.guidesIntroductionGraphLink.nth(1));
        await t.expect(tab.enablementAreaEmptyContent.visible).notOk('Guides folder is not updated');
        await t.click(tab.closeEnablementPage);

        // Check Enablement area and validate that removed file is existed in Tutorials
        await t.click(tab.redisStackTutorialsButton);
        await t.click(tab.timeSeriesLink);
        await t.expect(tab.enablementAreaEmptyContent.visible).notOk('Tutorials folder is not updated');

        // Check that timestamp is new
        const actualGuidesTimestamp = await guidesTimestampFileNew.get('timestamp');
        const actualTutorialTimestamp = await tutorialsTimestampFileNew.get('timestamp');
        await t.expect(actualGuidesTimestamp).notEql(guidesNewTimestamp, 'Guides timestamp is not updated');
        await t.expect(actualTutorialTimestamp).notEql(tutorialNewTimestamp, 'Tutorials timestamp is not updated');
    });
}
