import { Selector, t } from 'testcafe';
import { InsightsPanel } from '../insights-panel';

export class RdiHeader {
    InsightsPanel = new InsightsPanel();

    breadcrumbsLink = Selector('[data-testid=my-rdi-instances-btn]');
    rdiNameLinkBreadcrumbs = Selector('[data-testid=rdi-instance-name]');

    deployPipelineBtn = Selector('[data-testid=deploy-rdi-pipeline]');
    deployConfirmBtn = Selector('[data-testid=deploy-confirm-btn]');

    uploadPipelineButton = Selector('[data-testid=upload-pipeline-btn]');
    uploadFromFileButton = Selector('[data-testid=upload-file-btn]');
    downloadPipelineButton = Selector('[data-testid=download-pipeline-btn]');
    importInput = Selector('[data-testid=import-file-modal-filepicker]');
    confirmUploadingPipelineBatton = Selector('[data-testid=upload-confirm-btn]');

    cloudSignInButton = Selector('[data-testid=cloud-sign-in-btn]');

    /**
     * Import pipeline
     * @param filePath the name if the file
     */
    async uploadPipeline(filePath: string): Promise<void> {
        await t
            .setFilesToUpload(this.importInput, filePath)
            .click(this.confirmUploadingPipelineBatton);
    }
}
