import {t} from 'testcafe';
import {OnboardingPage, BrowserPage} from '../pageObjects';

const onboardingPage = new OnboardingPage();
const browserPage = new BrowserPage();
export class OnboardActions {
    /**
        @param stepName title of the step
        verify onboarding step visible based on title
    */
    async verifyStepVisible(stepName: string): Promise<void> {
        await t.expect(onboardingPage.stepTitle.withText(stepName).exists).ok(`${stepName} step is not visible`);
    }
    /**
        click next step
    */
    async clickNextStep(): Promise<void> {
        await t.click(onboardingPage.nextButton);
    }
    /**
        start onboarding process
    */
    async startOnboarding(): Promise<void> {
        await t.click(onboardingPage.showMeAroundButton);
    }
    /**
        complete onboarding process
     */
    async verifyOnboardingCompleted(): Promise<void> {
        await t.expect(onboardingPage.showMeAroundButton.exists).notOk('show me around button still visible');
        await t.expect(browserPage.patternModeBtn.visible).ok('browser page is not opened');
    }
    /**
        click back step
     */
    async clickBackStep(): Promise<void> {
        await t.click(onboardingPage.backButton);
    }
    /**
        click skip tour step
     */
    async clickSkipTour(): Promise<void> {
        await t.click(onboardingPage.skipTourButton);
    }
}
