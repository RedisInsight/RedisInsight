import { Selector, t } from 'testcafe';

export class TutorialsTab {

    documentButtonInQuickGuides = Selector('[data-testid=accordion-button-document]');
    internalLinkWorkingWithHashes = Selector('[data-testid=internal-link-working-with-hashes]');

    /**
     * Run code
     * @param block Name of the block
     */
    async runBlockCode(block: string): Promise<void> {
        const runButton = Selector('[data-testid=code-button-block-label]').withExactText(block);
        await t.scrollIntoView(runButton);
        await t.click(runButton);
    }

}
