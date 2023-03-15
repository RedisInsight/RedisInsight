import { Selector } from 'testcafe';

export class OnboardingPage {
    backButton = Selector('[data-testid=back-btn]');
    nextButton = Selector('[data-testid=next-btn]');
    showMeAroundButton = Selector('span').withText('Show me around');
    skipTourButton = Selector('[data-testid=skip-tour-btn]');
    stepTitle = Selector('[data-testid=step-title]');
    wbOnbardingCommand = Selector('[data-testid=wb-onboarding-command]');
    copyCodeButton = Selector('[data-testid=copy-code-btn]');
    resetOnboardingBtn = Selector('[data-testid=reset-onboarding-btn]');
}
