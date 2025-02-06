import { Selector, t } from 'testcafe';

export class BulkActions {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    bulkDeleteTooltipIcon = Selector('[data-testid=bulk-delete-tooltip]');
    actionButton = Selector('[data-testid=bulk-action-warning-btn]');
    bulkApplyButton = Selector('[data-testid=bulk-action-apply-btn]', { timeout: 500 });
    bulkStopButton = Selector('[data-testid=bulk-action-stop-btn]');
    bulkStartAgainButton = Selector('[data-testid=bulk-action-start-again-btn]');
    bulkCancelButton = Selector('[data-testid=bulk-action-cancel-btn]');
    bulkClosePanelButton = Selector('[data-testid=bulk-close-panel]');
    bulkUpdateTab = Selector('[data-testid=bulk-action-tab-upload]');
    bulkActionStartNewButton = Selector('[data-testid=bulk-action-start-new-btn]');
    removeFileBtn = Selector('[aria-label="Clear selected files"]');
    bulkActionsOpenButton = Selector('[data-testid=btn-bulk-actions]');
    //TEXT
    infoFilter = Selector('[data-testid=bulk-actions-info-filter]');
    infoSearch = Selector('[data-testid=bulk-actions-info-search]');
    bulkActionsPlaceholder = Selector('[data-testid=bulk-actions-placeholder]');
    bulkDeleteSummary = Selector('[data-testid=bulk-delete-summary]');
    bulkActionWarningTooltip = Selector('[data-testid=bulk-action-tooltip]');
    bulkStatusInProgress = Selector('[data-testid=bulk-status-progress]');
    bulkStatusStopped = Selector('[data-testid=bulk-status-stopped]');
    bulkStatusCompleted = Selector('[data-testid=bulk-status-completed]');
    bulkDeleteCompletedSummary = Selector('[data-testid=bulk-delete-completed-summary]');
    bulkUploadCompletedSummary = Selector('[data-testid=bulk-upload-completed-summary]');
    //CONTAINERS
    bulkActionsContainer = Selector('[data-testid=bulk-actions-content]');
    bulkActionsSummary = Selector('[data-testid=bulk-actions-info]');
    progressLine = Selector('[data-testid=progress-line]');
    bulkUploadContainer = Selector('[data-testid=bulk-upload-container]');
    // IMPORT
    bulkUploadInput = Selector('[data-testid=bulk-upload-file-input]');

    /**
     * Open Bulk Actions and confirm deletion
     */
    async startBulkDelete(): Promise<void> {
        await t
            .click(this.actionButton)
            .click(this.bulkApplyButton);
    }

    /**
     * Bulk Upload of file
     * @param path Path to file to upload
     */
    async uploadFileInBulk(path: string): Promise<void> {
        await t
            .setFilesToUpload(this.bulkUploadInput, [path])
            .click(this.actionButton)
            .click(this.bulkApplyButton);
    }
}
