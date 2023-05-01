import {
    acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase
} from '../../../helpers/database';
import {
    commonUrl, ossStandaloneConfigEmpty
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Common } from '../../../helpers/common';
import { OnboardActions } from '../../../common-actions/onboard-actions';
import {
    MemoryEfficiencyPage,
    SlowLogPage,
    WorkbenchPage,
    PubSubPage,
    OnboardingPage,
    MyRedisDatabasePage,
    HelpCenterPage,
    BrowserPage
} from '../../../pageObjects';
import { Telemetry } from '../../../helpers/telemetry';

const common = new Common();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const helpCenterPage = new HelpCenterPage();
const onBoardActions = new OnboardActions();
const onboardingPage = new OnboardingPage();
const memoryEfficiencyPage = new MemoryEfficiencyPage();
const workBenchPage = new WorkbenchPage();
const slowLogPage = new SlowLogPage();
const pubSubPage = new PubSubPage();
const telemetry = new Telemetry();

const logger = telemetry.createLogger();
const indexName = common.generateWord(10);
const telemetryEvent = 'ONBOARDING_TOUR_FINISHED';
const expectedProperties = [
    'databaseId'
];

fixture `Onboarding new user tests`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfigEmpty, ossStandaloneConfigEmpty.databaseName);
    })
    .afterEach(async() => {
        await browserPage.Cli.sendCommandInCli(`DEL ${indexName}`);
        await deleteDatabase(ossStandaloneConfigEmpty.databaseName);
    });
// https://redislabs.atlassian.net/browse/RI-4070, https://redislabs.atlassian.net/browse/RI-4067
// https://redislabs.atlassian.net/browse/RI-4278
test('Verify onbarding user steps', async t => {
    await t.click(myRedisDatabasePage.NavigationPanel.helpCenterButton);
    await t.expect(helpCenterPage.helpCenterPanel.visible).ok('help center panel is not opened');
    // Verify that user can reset onboarding
    await t.click(onboardingPage.resetOnboardingBtn);
    await t.expect(onboardingPage.showMeAroundButton.visible).ok('onbarding starting is not visible');
    await onBoardActions.startOnboarding();
    // verify browser step is visible
    await onBoardActions.verifyStepVisible('Browser');
    // move to next step
    await onBoardActions.clickNextStep();
    // verify tree view step is visible
    await onBoardActions.verifyStepVisible('Tree view');
    await onBoardActions.clickNextStep();
    await onBoardActions.verifyStepVisible('Filter and search');
    await onBoardActions.clickNextStep();
    // verify cli is opened
    await t.expect(browserPage.Cli.cliPanel.visible).ok('cli is not expanded');
    await onBoardActions.verifyStepVisible('CLI');
    await onBoardActions.clickNextStep();
    // verify command helper area is opened
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).ok('command helper is not expanded');
    await onBoardActions.verifyStepVisible('Command Helper');
    await onBoardActions.clickNextStep();
    // verify profiler is opened
    await t.expect(browserPage.Profiler.monitorArea.visible).ok('profiler is not expanded');
    await onBoardActions.verifyStepVisible('Profiler');
    await onBoardActions.clickNextStep();
    // verify Insights is opened
    await t.expect(browserPage.InsightsPanel.insightsPanel.visible).ok('Insights panel is not expanded');
    await onBoardActions.verifyStepVisible('Insights');
    await onBoardActions.clickNextStep();
    // Verify that client list command visible when there is not any index created
    await t.expect(onboardingPage.wbOnbardingCommand.withText('CLIENT LIST').visible).ok('CLIENT LIST command is not visible');
    await t.expect(onboardingPage.copyCodeButton.visible).ok('copy code button is not visible');
    // verify workbench page is opened
    await t.expect(workBenchPage.mainEditorArea.visible).ok('workbench is not opened');
    await onBoardActions.verifyStepVisible('Try Workbench!');

    // create index in order to see in FT.INFO {index} in onboarding step
    await browserPage.Cli.sendCommandInCli(`FT.CREATE ${indexName} ON HASH PREFIX 1 test SCHEMA "name" TEXT`);
    await onBoardActions.clickBackStep();
    // verify one step before is opened
    await t.expect(browserPage.InsightsPanel.insightsPanel.visible).ok('Insights panel is not expanded');
    await onBoardActions.verifyStepVisible('Insights');
    await onBoardActions.clickNextStep();
    // verify workbench page is opened
    await t.expect(onboardingPage.wbOnbardingCommand.withText(`FT.INFO ${indexName}`).visible).ok(`FT.INFO ${indexName} command is not visible`);
    await t.expect(onboardingPage.copyCodeButton.visible).ok('copy code button is not visible');
    await t.expect(workBenchPage.mainEditorArea.visible).ok('workbench is not opened');
    await onBoardActions.verifyStepVisible('Try Workbench!');
    await onBoardActions.clickNextStep();
    await onBoardActions.verifyStepVisible('Explore and learn more');
    await onBoardActions.clickNextStep();
    await onBoardActions.verifyStepVisible('Upload your tutorials');
    await onBoardActions.clickNextStep();
    // verify analysis tools page is opened
    await t.expect(memoryEfficiencyPage.noReportsText.visible).ok('analysis tools is not opened');
    await onBoardActions.verifyStepVisible('Database Analysis');
    await onBoardActions.clickNextStep();
    // verify slow log is opened
    await t.expect(slowLogPage.slowLogConfigureButton.visible).ok('slow log is not opened');
    await onBoardActions.verifyStepVisible('Slow Log');
    await onBoardActions.clickNextStep();
    // verify pub/sub page is opened
    await t.expect(pubSubPage.subscribeButton.visible).ok('pub/sub page is not opened');
    await onBoardActions.verifyStepVisible('Pub/Sub');
    await onBoardActions.clickNextStep();
    // verify last step of onboarding process is visible
    await onBoardActions.verifyStepVisible('Great job!');
    await onBoardActions.clickNextStep();
    // verify onboarding step completed successfully
    await onBoardActions.verifyOnboardingCompleted();
});
// https://redislabs.atlassian.net/browse/RI-4067, https://redislabs.atlassian.net/browse/RI-4278
test('Verify onboard new user skip tour', async(t) => {
    await t.click(myRedisDatabasePage.NavigationPanel.helpCenterButton);
    await t.expect(helpCenterPage.helpCenterPanel.visible).ok('help center panel is not opened');
    // Verify that user can reset onboarding
    await t.click(onboardingPage.resetOnboardingBtn);
    await t.expect(onboardingPage.showMeAroundButton.visible).ok('onbarding starting is not visible');
    // start onboarding process
    await onBoardActions.startOnboarding();
    // verify browser step is visible
    await onBoardActions.verifyStepVisible('Browser');
    // move to next step
    await onBoardActions.clickNextStep();
    // verify tree view step is visible
    await onBoardActions.verifyStepVisible('Tree view');
    await t.click(browserPage.NavigationPanel.workbenchButton);
    await t.click(myRedisDatabasePage.NavigationPanel.helpCenterButton);
    await t.expect(helpCenterPage.helpCenterPanel.visible).ok('help center panel is not opened');
    await t.click(onboardingPage.resetOnboardingBtn);
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Verify that when user reset onboarding, user can see the onboarding triggered when user open the Browser page.
    await t.expect(onboardingPage.showMeAroundButton.visible).ok('onbarding starting is not visible');
    // click skip tour
    await onBoardActions.clickSkipTour();
    // verify onboarding step completed successfully
    await onBoardActions.verifyOnboardingCompleted();
    await common.reloadPage();
    // verify onboarding step still not visible after refresh page
    await onBoardActions.verifyOnboardingCompleted();
});
// https://redislabs.atlassian.net/browse/RI-4305
test.requestHooks(logger)('Verify that the final onboarding step is closed when user opens another page', async(t) => {
    await t.click(myRedisDatabasePage.NavigationPanel.helpCenterButton);
    await t.click(onboardingPage.resetOnboardingBtn);
    await onBoardActions.startOnboarding();
    await onBoardActions.clickNextUntilLastStep();
    // Verify last step of onboarding process is visible
    await onBoardActions.verifyStepVisible('Great job!');
    // Go to Workbench page
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);

    // Verify that “ONBOARDING_TOUR_FINISHED” event is sent when user opens another page (or close the app)
    await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);

    // Go to PubSub page
    await t.click(myRedisDatabasePage.NavigationPanel.pubSubButton);
    // Verify onboarding completed successfully
    await t.expect(onboardingPage.showMeAroundButton.exists).notOk('Show me around button still visible');
    await t.expect(onboardingPage.stepTitle.exists).notOk('Onboarding tooltip still visible');
    // Go to Browser Page
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Verify onboarding completed successfully
    await onBoardActions.verifyOnboardingCompleted();
});
