import {ClientFunction} from 'testcafe';
import {
    acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase
} from '../../../helpers/database';
import {
    commonUrl, ossStandaloneConfigEmpty
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import {Common} from '../../../helpers/common';
import {OnboardActions} from '../../../common-actions/onboard-actions';
import {
    CliPage,
    MemoryEfficiencyPage,
    SlowLogPage,
    WorkbenchPage,
    PubSubPage,
    MonitorPage,
    OnboardingPage
} from '../../../pageObjects';

const common = new Common();
const onBoardActions = new OnboardActions();
const onboardingPage = new OnboardingPage();
const cliPage = new CliPage();
const memoryEfficiencyPage = new MemoryEfficiencyPage();
const workBenchPage = new WorkbenchPage();
const slowLogPage = new SlowLogPage();
const pubSubPage = new PubSubPage();
const monitorPage = new MonitorPage();
const setLocalStorageItem = ClientFunction((key: string, value: string) => window.localStorage.setItem(key, value));
const indexName = common.generateWord(10);

fixture `Onboarding new user tests`
    .meta({type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfigEmpty, ossStandaloneConfigEmpty.databaseName);
        await setLocalStorageItem('onboardingStep', '0');
        await common.reloadPage();
    })
    .afterEach(async() => {
        await cliPage.sendCommandInCli(`DEL ${indexName}`);
        await deleteDatabase(ossStandaloneConfigEmpty.databaseName);
    });
// https://redislabs.atlassian.net/browse/RI-4070, https://redislabs.atlassian.net/browse/RI-4067
test
    .meta({ env: env.desktop })('Verify onbarding new user steps', async t => {
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
        await t.expect(cliPage.cliPanel.visible).ok('cli is not expanded');
        await onBoardActions.verifyStepVisible('CLI');
        await onBoardActions.clickNextStep();
        // verify command helper area is opened
        await t.expect(cliPage.commandHelperArea.visible).ok('command helper is not expanded');
        await onBoardActions.verifyStepVisible('Command Helper');
        await onBoardActions.clickNextStep();
        // verify profiler is opened
        await t.expect(monitorPage.monitorArea.visible).ok('profiler is not expanded');
        await onBoardActions.verifyStepVisible('Profiler');
        await onBoardActions.clickNextStep();
        // Verify that client list command visible when there is not any index created
        await t.expect(onboardingPage.wbOnbardingCommand.withText('CLIENT LIST').visible).ok('CLIENT LIST command is not visible');
        await t.expect(onboardingPage.copyCodeButton.visible).ok('copy code button is not visible');
        // verify workbench page is opened
        await t.expect(workBenchPage.mainEditorArea.visible).ok('workbench is not opened');
        await onBoardActions.verifyStepVisible('Try Workbench!');
        // click back step button
        await onBoardActions.clickBackStep();
        // create index in order to see in FT.INFO {index} in onboarding step
        await cliPage.sendCommandInCli(`FT.CREATE ${indexName} ON HASH PREFIX 1 test SCHEMA "name" TEXT`);
        // verify one step before is opened
        await t.expect(monitorPage.monitorArea.visible).ok('profiler is not expanded');
        await onBoardActions.verifyStepVisible('Profiler');
        await onBoardActions.clickNextStep();
        // verify workbench page is opened
        await t.expect(onboardingPage.wbOnbardingCommand.withText(`FT.INFO ${indexName}`).visible).ok(`FT.INFO ${indexName} command is not visible`);
        await t.expect(onboardingPage.copyCodeButton.visible).ok('copy code button is not visible');
        await t.expect(workBenchPage.mainEditorArea.visible).ok('workbench is not opened');
        await onBoardActions.verifyStepVisible('Try Workbench!');
        await onBoardActions.clickNextStep();
        await onBoardActions.verifyStepVisible('Explore and learn more');
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
// https://redislabs.atlassian.net/browse/RI-4067
test
    .meta({ env: env.desktop })('verify onboard new user skip tour', async() => {
    // start onboarding process
        await onBoardActions.startOnboarding();
        // verify browser step is visible
        await onBoardActions.verifyStepVisible('Browser');
        // move to next step
        await onBoardActions.clickNextStep();
        // verify tree view step is visible
        await onBoardActions.verifyStepVisible('Tree view');
        // click skip tour
        await onBoardActions.clickSkipTour();
        // verify onboarding step completed successfully
        await onBoardActions.verifyOnboardingCompleted();
        await common.reloadPage();
        // verify onboarding step still not visible after refresh page
        await onBoardActions.verifyOnboardingCompleted();
    });
