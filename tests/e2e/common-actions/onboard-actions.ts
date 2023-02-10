import {Selector, t} from 'testcafe';

export class OnboardActions {
    /**
        @param stepName title of the step
        verify onboarding step visible based on title
    */
    async verifyStepVisible(stepName: string): Promise<void> {
        await t.expect(Selector('[data-testid=step-title]').withText(stepName).exists).ok(`${stepName} step is not visible`);
    }
    /**
        click next step
    */
    async clickNextStep(): Promise<void> {
        await t.click(Selector('[data-testid=next-btn]'));
    }
    /**
        start onboarding process
    */
    async startOnboarding(): Promise<void> {
        await t.click(Selector('span').withText('Show me around'));
    }
    /**
        complete onboarding process
     */
    async verifyOnbardingCompleted(): Promise<void> {
        await t.expect(Selector('span').withText('Show me around').visible).notOk('show me around button still visible');
        await t.expect(Selector('[data-testid=search-mode-switcher]').visible).ok('browser page is not opened');
    }
    /**
        click back step
     */
    async clickBackStep(): Promise<void> {
        await t.click(Selector('[data-testid=back-btn]'));
    }
    /**
        click skip tour step
     */
    async clickSkipTour(): Promise<void> {
        await t.click(Selector('[data-testid=skip-tour-btn]'));
    }
}
