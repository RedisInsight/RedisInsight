import { Selector, t } from 'testcafe';

export class ExploreTab {

    documentButtonInQuickGuides = Selector('[data-testid=accordion-button-document]');
    internalLinkWorkingWithHashes = Selector('[data-testid=internal-link-working-with-hashes]');

    runMask = '[data-testid=run-btn-$name]';

    /**
     * Run code
     * @param block Name of the block
     */
    async runBlockCode(block: string): Promise<void> {
        const runButton = Selector(this.runMask.replace(/\$name/g, block));
        await t.scrollIntoView(runButton);
        await t.click(runButton);
    }

}
