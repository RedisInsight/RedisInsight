import { Selector, t } from 'testcafe';

export class ExploreTab {

    documentButtonInQuickGuides = Selector('[data-testid=accordion-button-document]');
    internalLinkWorkingWithHashes = Selector('[data-testid=internal-link-working-with-hashes]');
    redisStackTutorialsButton = Selector('[data-testid=accordion-button-redis_stack]');
    timeSeriesLink = Selector('[data-testid=internal-link-redis_for_time_series]');
    scrolledEnablementArea = Selector('[data-testid=enablement-area__page]');
    closeEnablementPage = Selector('[data-testid=enablement-area__page-close]');
    tutorialLinkField = Selector('[data-testid=tutorial-link-field]');
    tutorialLatestDeleteIcon = Selector('[data-testid^=delete-tutorial-icon-]').nth(0);
    tutorialDeleteButton = Selector('button[data-testid^=delete-tutorial-]');
    preselectArea = Selector('[data-testid=enablementArea]');
    //Custom tutorials
    customTutorials = Selector('[data-testid=accordion-button-custom-tutorials]');
    tutorialOpenUploadButton = Selector('[data-testid=open-upload-tutorial-btn]');
    tutorialSubmitButton = Selector('[data-testid=submit-upload-tutorial-btn]');
    tutorialImport = Selector('[data-testid=import-tutorial]');
    tutorialAccordionButton = Selector('[data-testid^=accordion-button-]');
    uploadDataBulkBtn = Selector('[data-testid=upload-data-bulk-btn]');
    uploadDataBulkApplyBtn = Selector('[data-testid=upload-data-bulk-apply-btn]');

    //CSS
    cssTutorialDeleteIcon = '[data-testid^=delete-tutorial-icon-]';

    runMask = '[data-testid="run-btn-$name"]';

    /**
     * Run code
     * @param block Name of the block
     */
    async runBlockCode(block: string): Promise<void> {
        const runButton = Selector(this.runMask.replace(/\$name/g, block));
        await t.scrollIntoView(runButton);
        await t.click(runButton);
    }

    /**
     * Get selector with tutorial name
     * @param tutorialName name of the uploaded tutorial
     */
    getAccordionButtonWithName(tutorialName: string): Selector {
        return Selector(`[data-testid=accordion-button-${tutorialName}]`);
    }

    /**
     * Get internal tutorial link with .md name
     * @param internalLink name of the .md file
     */
    getInternalLinkWithManifest(internalLink: string): Selector {
        return Selector(`[data-testid="internal-link-${internalLink}.md"]`);
    }

    /**
     * Find image in tutorial by alt text
     * @param alt Image alt text
     */
    getTutorialImageByAlt(alt: string): Selector {
        return Selector('img').withAttribute('alt', alt);
    }

    /**
     * Wait until image rendered
     * @param selector Image selector
     */
    async waitUntilImageRendered(selector: Selector): Promise<void> {
        const searchTimeout = 5 * 1000; // 5 sec maximum wait
        const startTime = Date.now();
        let imageHeight = await selector.getStyleProperty('height');

        do {
            imageHeight = await selector.getStyleProperty('height');
        }
        while ((imageHeight == '0px') && Date.now() - startTime < searchTimeout);
    }

    /**
     * Get internal tutorial link without .md name
     * @param internalLink name of the label
     */
    getInternalLinkWithoutManifest(internalLink: string): Selector {
        return Selector(`[data-testid="internal-link-${internalLink}"]`);
    }

    /**
     * Delete tutorial by name
     * @param name A tutorial name
     */
    async deleteTutorialByName(name: string): Promise<void> {
        const deleteTutorialBtn = this.tutorialAccordionButton.withText(name).find(this.cssTutorialDeleteIcon);
        if (await this.closeEnablementPage.exists) {
            await t.click(this.closeEnablementPage);
        }
        await t.click(deleteTutorialBtn);
        await t.click(this.tutorialDeleteButton);
    }
}
