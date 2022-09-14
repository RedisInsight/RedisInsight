import { join } from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as editJsonFile from 'edit-json-file';
import { acceptLicenseTermsAndAddDatabaseApi} from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { rte, env } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const workingDirectory = process.env.APP_FOLDER_ABSOLUTE_PATH
    || (join(os.homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-v2'));
if (fs.existsSync(workingDirectory)) {
    // Guides content
    // const guidesTimestampPath = `${workingDirectory}/guides/build.json`;
    // const guidesGraphIntroductionFilePath = `${workingDirectory}/guides/quick-guides/graph/introduction.md`;
    const guidesTimestampPath = 'E:\\Redis\\RedisInsight\\tests\\e2e\\.redisinsight-v2\\guides\\build.json';
    const guidesGraphIntroductionFilePath = 'E:\\Redis\\RedisInsight\\tests\\e2e\\.redisinsight-v2\\guides\\quick-guides\\graph\\introduction.md';

    // Tutorials content
    // const tutorialsTimestampPath = `${workingDirectory}/tutorials/build.json`;
    // const tutorialsTimeSeriesFilePath = `${workingDirectory}/guides/quick-guides/graph/introduction.md`;
    const tutorialsTimestampPath = 'E:\\Redis\\RedisInsight\\tests\\e2e\\.redisinsight-v2\\tutorials\\build.json';
    const tutorialsTimeSeriesFilePath = 'E:\\Redis\\RedisInsight\\tests\\e2e\\.redisinsight-v2\\tutorials\\redis_stack\\redis_for_time_series.md';

    // Remove md files
    // fs.unlinkSync(guidesGraphIntroductionFilePath);
    // fs.unlinkSync(tutorialsTimeSeriesFilePath);

    // Update timestamp for build files
    const guidesTimestampFile = editJsonFile(guidesTimestampPath);
    const tutorialsTimestampFile = editJsonFile(tutorialsTimestampPath);

    console.log(`guide timestampBeforeUpdate: ${guidesTimestampFile.get('timestamp')}`);
    console.log(`tutorial timestampBeforeUpdate: ${tutorialsTimestampFile.get('timestamp')}`);
    const guidesNewTimestamp = guidesTimestampFile.get('timestamp') - 10;
    const tutorialNewTimestamp = tutorialsTimestampFile.get('timestamp') - 10;

    guidesTimestampFile.set('timestamp', guidesNewTimestamp);
    guidesTimestampFile.save();
    tutorialsTimestampFile.set('timestamp', tutorialNewTimestamp);
    tutorialsTimestampFile.save();

    console.log(`guide timestamp after file update: ${guidesTimestampFile.get('timestamp')}`);
    console.log(`tutorial timestamp after file update: ${tutorialsTimestampFile.get('timestamp')}`);

    fixture `Automatically update information`
        .meta({ type: 'critical_path' })
        .page(commonUrl)
        .beforeEach(async() => {
            await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        })
        .afterEach(async() => {
            await deleteStandaloneDatabaseApi(ossStandaloneConfig);
        });
    test.only
        .meta({ rte: rte.standalone, env: env.desktop })('Verify that user can see updated info in Enablement Area', async t => {
            // Create new file due to cache-ability
            const guidesTimestampFileNew = editJsonFile(guidesTimestampPath);
            const tutorialsTimestampFileNew = editJsonFile(tutorialsTimestampPath);

            // Open Workbench page
            await t.click(myRedisDatabasePage.workbenchButton);

            // Check Enablement area and validate that removed file is existed in Guides
            await t.click(workbenchPage.guidesGraphAccordion);
            await t.click(workbenchPage.guidesIntroductionGraphLink);
            await t.expect(workbenchPage.enablementAreaEmptyContent.visible).notOk('Guides folder is not updated');

            // Check Enablement area and validate that removed file is existed in Tutorials
            await t.click(workbenchPage.redisStackTutorialsButton);
            await t.click(workbenchPage.timeSeriesLink);
            await t.expect(workbenchPage.enablementAreaEmptyContent.visible).notOk('Tutorials folder is not updated');

            // Check that timestamp is new
            const actualGuidesTimestamp = await guidesTimestampFileNew.get('timestamp');
            const actualTutorialTimestamp = await tutorialsTimestampFileNew.get('timestamp');
            await t.expect(actualGuidesTimestamp).notEql(guidesNewTimestamp, 'Guides timestamp is not updated');
            await t.expect(actualTutorialTimestamp).notEql(tutorialNewTimestamp, 'Tutorials timestamp is not updated');
        });
}
