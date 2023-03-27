import { t } from 'testcafe';
import { OnboardingPage, BrowserPage } from '../pageObjects';

const onboardingPage = new OnboardingPage();
const browserPage = new BrowserPage();
export class OnboardActions {
    /**
     * Verify onboarding step visible based on title
     * @param stepName title of the step
    */
    async verifyStepVisible(stepName: string): Promise<void> {
        await t.expect(onboardingPage.stepTitle.withText(stepName).exists).ok(`${stepName} step is not visible`);
    }
    /**
        Click next step
    */
    async clickNextStep(): Promise<void> {
        await t.click(onboardingPage.nextButton);
    }
    /**
        Click next step until the last step
    */
    async clickNextUntilLastStep(): Promise<void> {
        do {
            await t.click(onboardingPage.nextButton);
        }
        while (await onboardingPage.skipTourButton.exists);
    }
    /**
        Start onboarding process
    */
    async startOnboarding(): Promise<void> {
        await t.click(onboardingPage.showMeAroundButton);
    }
    /**
        Complete onboarding process
     */
    async verifyOnboardingCompleted(): Promise<void> {
        await t.expect(onboardingPage.showMeAroundButton.exists).notOk('Show me around button still visible');
        await t.expect(onboardingPage.stepTitle.exists).notOk('Onboarding tooltip still visible');
        await t.expect(browserPage.patternModeBtn.visible).ok('Browser page is not opened');
    }
    /**
        Click back step
     */
    async clickBackStep(): Promise<void> {
        await t.click(onboardingPage.backButton);
    }
    /**
        Click skip tour step
     */
    async clickSkipTour(): Promise<void> {
        await t.click(onboardingPage.skipTourButton);
    }
}
