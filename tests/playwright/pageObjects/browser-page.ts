/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/lines-between-class-members */
import { expect, Locator, Page } from '@playwright/test'
import { Toast } from './components/common/toast'

import { BasePage } from './base-page'
import { AddElementInList } from '../helpers/constants'

export class BrowserPage extends BasePage {
    private toast: Toast
    // CSS Selectors
    public readonly cssSelectorGrid: Locator
    public readonly cssSelectorRows: Locator
    public readonly cssSelectorKey: Locator
    public readonly cssFilteringLabel: Locator
    public readonly cssJsonValue: Locator
    public readonly cssRowInVirtualizedTable: Locator
    public readonly cssVirtualTableRow: Locator
    public readonly cssKeyBadge: Locator
    public readonly cssKeyTtl: Locator
    public readonly cssKeySize: Locator
    public readonly cssRemoveSuggestionItem: Locator

    // BUTTONS
    public readonly applyButton: Locator
    public readonly cancelButton: Locator
    public readonly deleteKeyButton: Locator
    public readonly submitDeleteKeyButton: Locator
    public readonly confirmDeleteKeyButton: Locator
    public readonly editKeyTTLButton: Locator
    public readonly refreshKeysButton: Locator
    public readonly refreshKeyButton: Locator
    public readonly editKeyNameButton: Locator
    public readonly editKeyValueButton: Locator
    public readonly closeKeyButton: Locator
    public readonly plusAddKeyButton: Locator
    public readonly addKeyValueItemsButton: Locator
    public readonly saveHashFieldButton: Locator
    public readonly saveMemberButton: Locator
    public readonly searchButtonInKeyDetails: Locator
    public readonly addKeyButton: Locator
    public readonly keyTypeDropDown: Locator
    public readonly confirmRemoveHashFieldButton: Locator
    public readonly removeSetMemberButton: Locator
    public readonly removeHashFieldButton: Locator
    public readonly removeZsetMemberButton: Locator
    public readonly confirmRemoveSetMemberButton: Locator
    public readonly confirmRemoveZSetMemberButton: Locator
    public readonly saveElementButton: Locator
    public readonly removeElementFromListIconButton: Locator
    public readonly removeElementFromListButton: Locator
    public readonly confirmRemoveListElementButton: Locator
    public readonly removeElementFromListSelect: Locator
    public readonly addJsonObjectButton: Locator
    public readonly addJsonFieldButton: Locator
    public readonly expandJsonObject: Locator
    public readonly scoreButton: Locator
    public readonly sortingButton: Locator
    public readonly editJsonObjectButton: Locator
    public readonly applyEditButton: Locator
    public readonly cancelEditButton: Locator
    public readonly scanMoreButton: Locator
    public readonly resizeBtnKeyList: Locator
    public readonly treeViewButton: Locator
    public readonly browserViewButton: Locator
    public readonly searchButton: Locator
    public readonly clearFilterButton: Locator
    public readonly fullScreenModeButton: Locator
    public readonly closeRightPanel: Locator
    public readonly addNewStreamEntry: Locator
    public readonly removeEntryButton: Locator
    public readonly confirmRemoveEntryButton: Locator
    public readonly clearStreamEntryInputs: Locator
    public readonly saveGroupsButton: Locator
    public readonly acknowledgeButton: Locator
    public readonly confirmAcknowledgeButton: Locator
    public readonly claimPendingMessageButton: Locator
    public readonly submitButton: Locator
    public readonly consumerDestinationSelect: Locator
    public readonly removeConsumerButton: Locator
    public readonly removeConsumerGroupButton: Locator
    public readonly optionalParametersSwitcher: Locator
    public readonly forceClaimCheckbox: Locator
    public readonly editStreamLastIdButton: Locator
    public readonly saveButton: Locator
    public readonly bulkActionsButton: Locator
    public readonly editHashButton: Locator
    public readonly editHashFieldTtlButton: Locator
    public readonly editZsetButton: Locator
    public readonly editListButton: Locator
    public readonly cancelStreamGroupBtn: Locator
    public readonly patternModeBtn: Locator
    public readonly redisearchModeBtn: Locator
    public readonly showFilterHistoryBtn: Locator
    public readonly clearFilterHistoryBtn: Locator
    public readonly loadSampleDataBtn: Locator
    public readonly executeBulkKeyLoadBtn: Locator
    public readonly backToBrowserBtn: Locator
    public readonly loadAllBtn: Locator
    public readonly downloadAllValueBtn: Locator
    public readonly openTutorialsBtn: Locator
    public readonly keyItem: Locator
    public readonly columnsBtn: Locator

    // CONTAINERS
    public readonly streamGroupsContainer: Locator
    public readonly streamConsumersContainer: Locator
    public readonly breadcrumbsContainer: Locator
    public readonly virtualTableContainer: Locator
    public readonly streamEntriesContainer: Locator
    public readonly streamMessagesContainer: Locator
    public readonly loader: Locator
    public readonly newIndexPanel: Locator

    // LINKS
    public readonly internalLinkToWorkbench: Locator
    public readonly userSurveyLink: Locator
    public readonly redisearchFreeLink: Locator
    public readonly guideLinksBtn: Locator

    // OPTION ELEMENTS
    public readonly stringOption: Locator
    public readonly jsonOption: Locator
    public readonly setOption: Locator
    public readonly zsetOption: Locator
    public readonly listOption: Locator
    public readonly hashOption: Locator
    public readonly streamOption: Locator
    public readonly removeFromHeadSelection: Locator
    public readonly filterOptionType: Locator
    public readonly filterByKeyTypeDropDown: Locator
    public readonly filterAllKeyType: Locator
    public readonly consumerOption: Locator
    public readonly claimTimeOptionSelect: Locator
    public readonly relativeTimeOption: Locator
    public readonly timestampOption: Locator
    public readonly formatSwitcher: Locator
    public readonly formatSwitcherIcon: Locator
    public readonly refreshIndexButton: Locator
    public readonly selectIndexDdn: Locator
    public readonly createIndexBtn: Locator
    public readonly cancelIndexCreationBtn: Locator
    public readonly confirmIndexCreationBtn: Locator
    public readonly resizeTrigger: Locator
    public readonly filterHistoryOption: Locator
    public readonly filterHistoryItemText: Locator

    // TABS
    public readonly streamTabGroups: Locator
    public readonly streamTabConsumers: Locator
    public readonly streamTabs: Locator

    // TEXT INPUTS
    public readonly addKeyNameInput: Locator
    public readonly keyNameInput: Locator
    public readonly keyTTLInput: Locator
    public readonly editKeyTTLInput: Locator
    public readonly ttlText: Locator
    public readonly hashFieldValueInput: Locator
    public readonly hashFieldNameInput: Locator
    public readonly hashFieldValueEditor: Locator
    public readonly hashTtlFieldInput: Locator
    public readonly listKeyElementEditorInput: Locator
    public readonly stringKeyValueInput: Locator
    public readonly jsonKeyValueInput: Locator
    public readonly jsonUploadInput: Locator
    public readonly setMemberInput: Locator
    public readonly zsetMemberScoreInput: Locator
    public readonly filterByPatterSearchInput: Locator
    public readonly hashFieldInput: Locator
    public readonly hashValueInput: Locator
    public readonly searchInput: Locator
    public readonly jsonKeyInput: Locator
    public readonly jsonValueInput: Locator
    public readonly countInput: Locator
    public readonly streamEntryId: Locator
    public readonly streamField: Locator
    public readonly streamValue: Locator
    public readonly addAdditionalElement: Locator
    public readonly streamFieldsValues: Locator
    public readonly streamEntryIDDateValue: Locator
    public readonly groupNameInput: Locator
    public readonly consumerIdInput: Locator
    public readonly streamMinIdleTimeInput: Locator
    public readonly claimIdleTimeInput: Locator
    public readonly claimRetryCountInput: Locator
    public readonly lastIdInput: Locator
    public readonly inlineItemEditor: Locator
    public readonly indexNameInput: Locator
    public readonly prefixFieldInput: Locator
    public readonly indexIdentifierInput: Locator

    // TEXT ELEMENTS
    public readonly keySizeDetails: Locator
    public readonly keyLengthDetails: Locator
    public readonly keyNameInTheList: Locator
    public readonly hashFieldsList: Locator
    public readonly hashValuesList: Locator
    public readonly hashField: Locator
    public readonly hashFieldValue: Locator
    public readonly setMembersList: Locator
    public readonly zsetMembersList: Locator
    public readonly zsetScoresList: Locator
    public readonly listElementsList: Locator
    public readonly jsonKeyValue: Locator
    public readonly jsonError: Locator
    public readonly tooltip: Locator
    public readonly dialog: Locator
    public readonly noResultsFound: Locator
    public readonly noResultsFoundOnly: Locator
    public readonly searchAdvices: Locator
    public readonly keysNumberOfResults: Locator
    public readonly scannedValue: Locator
    public readonly totalKeysNumber: Locator
    public readonly keyDetailsBadge: Locator
    public readonly modulesTypeDetails: Locator
    public readonly filteringLabel: Locator
    public readonly keysSummary: Locator
    public readonly multiSearchArea: Locator
    public readonly keyDetailsHeader: Locator
    public readonly keyListTable: Locator
    public readonly keyListMessage: Locator
    public readonly keyDetailsTable: Locator
    public readonly keyNameFormDetails: Locator
    public readonly keyDetailsTTL: Locator
    public readonly progressLine: Locator
    public readonly progressKeyList: Locator
    public readonly jsonScalarValue: Locator
    public readonly noKeysToDisplayText: Locator
    public readonly streamEntryDate: Locator
    public readonly streamEntryIdValue: Locator
    public readonly streamFields: Locator
    public readonly streamVirtualContainer: Locator
    public readonly streamEntryFields: Locator
    public readonly confirmationMessagePopover: Locator
    public readonly streamGroupId: Locator
    public readonly streamGroupName: Locator
    public readonly streamMessage: Locator
    public readonly streamConsumerName: Locator
    public readonly consumerGroup: Locator
    public readonly entryIdInfoIcon: Locator
    public readonly entryIdError: Locator
    public readonly pendingCount: Locator
    public readonly streamRangeBar: Locator
    public readonly rangeLeftTimestamp: Locator
    public readonly rangeRightTimestamp: Locator
    public readonly jsonValue: Locator
    public readonly stringValueAsJson: Locator

    // POPUPS
    public readonly changeValueWarning: Locator

    // TABLE
    public readonly keyListItem: Locator

    // DIALOG
    public readonly noReadySearchDialogTitle: Locator

    // CHECKBOXES
    public readonly showTtlCheckbox: Locator
    public readonly showTtlColumnCheckbox: Locator
    public readonly showSizeColumnCheckbox: Locator

    // UTILITY FUNCTIONS
    public readonly getHashTtlFieldInput: (fieldName: string) => Locator
    public readonly getListElementInput: (count: number) => Locator
    public readonly getKeySize: (keyName: string) => Locator
    public readonly getKeyTTl: (keyName: string) => Locator

    constructor(page: Page) {
        super(page)
        this.page = page
        this.toast = new Toast(page)

        // CSS Selectors
        this.cssSelectorGrid = page.locator('[aria-label="grid"]')
        this.cssSelectorRows = page.locator('[aria-label="row"]')
        this.cssSelectorKey = page.locator('[data-testid^="key-"]')
        this.cssFilteringLabel = page.getByTestId('multi-search')
        this.cssJsonValue = page.getByTestId('value-as-json')
        this.cssRowInVirtualizedTable = page.locator('[role="gridcell"]')
        this.cssVirtualTableRow = page.locator('[aria-label="row"]')
        this.cssKeyBadge = page.locator('[data-testid^="badge-"]')
        this.cssKeyTtl = page.locator('[data-testid^="ttl-"]')
        this.cssKeySize = page.locator('[data-testid^="size-"]')
        this.cssRemoveSuggestionItem = page.locator(
            '[data-testid^="remove-suggestion-item-"]',
        )

        // BUTTONS
        this.applyButton = page.getByTestId('apply-btn')
        this.cancelButton = page.getByTestId('cancel-btn')
        this.deleteKeyButton = page.getByTestId('delete-key-btn')
        this.submitDeleteKeyButton = page.getByTestId('submit-delete-key')
        this.confirmDeleteKeyButton = page.getByTestId('delete-key-confirm-btn')
        this.editKeyTTLButton = page.getByTestId('edit-ttl-btn')
        this.refreshKeysButton = page.getByTestId('keys-refresh-btn')
        this.refreshKeyButton = page.getByTestId('key-refresh-btn')
        this.editKeyNameButton = page.getByTestId('edit-key-btn')
        this.editKeyValueButton = page.getByTestId('edit-key-value-btn')
        this.closeKeyButton = page.getByTestId('close-key-btn')
        this.plusAddKeyButton = page.getByTestId('btn-add-key')
        this.addKeyValueItemsButton = page.getByTestId(
            'add-key-value-items-btn',
        )
        this.saveHashFieldButton = page.getByTestId('save-fields-btn')
        this.saveMemberButton = page.getByTestId('save-members-btn')
        this.searchButtonInKeyDetails = page.getByTestId('search-button')
        this.addKeyButton = page.locator('button', {
            hasText: /^Add Key$/,
        })
        this.keyTypeDropDown = page.locator(
            'fieldset button.euiSuperSelectControl',
        )
        this.confirmRemoveHashFieldButton = page.locator(
            '[data-testid^="remove-hash-button-"] span',
        )
        this.removeSetMemberButton = page.getByTestId('set-remove-btn')
        this.removeHashFieldButton = page.getByTestId('remove-hash-button')
        this.removeZsetMemberButton = page.getByTestId('zset-remove-button')
        this.confirmRemoveSetMemberButton = page.locator(
            '[data-testid^="set-remove-btn-"] span',
        )
        this.confirmRemoveZSetMemberButton = page.locator(
            '[data-testid^="zset-remove-button-"] span',
        )
        this.saveElementButton = page.getByTestId('save-elements-btn')
        this.removeElementFromListIconButton = page.getByTestId(
            'remove-key-value-items-btn',
        )
        this.removeElementFromListButton = page.getByTestId(
            'remove-elements-btn',
        )
        this.confirmRemoveListElementButton = page.getByTestId('remove-submit')
        this.removeElementFromListSelect =
            page.getByTestId('destination-select')
        this.addJsonObjectButton = page.getByTestId('add-object-btn')
        this.addJsonFieldButton = page.getByTestId('add-field-btn')
        this.expandJsonObject = page.getByTestId('expand-object')
        this.scoreButton = page.getByTestId('score-button')
        this.sortingButton = page.getByTestId('header-sorting-button')
        this.editJsonObjectButton = page.getByTestId('edit-json-field')
        this.applyEditButton = page.getByTestId('apply-edit-btn')
        this.cancelEditButton = page.getByTestId('cancel-edit-btn')
        this.scanMoreButton = page.getByTestId('scan-more')
        this.resizeBtnKeyList = page.locator(
            '[data-test-subj="resize-btn-keyList-keyDetails"]',
        )
        this.treeViewButton = page.getByTestId('view-type-list-btn')
        this.browserViewButton = page.getByTestId('view-type-browser-btn')
        this.searchButton = page.getByTestId('search-btn')
        this.clearFilterButton = page.getByTestId('reset-filter-btn')
        this.fullScreenModeButton = page.getByTestId('toggle-full-screen')
        this.closeRightPanel = page.getByTestId('close-right-panel-btn')
        this.addNewStreamEntry = page.getByTestId('add-key-value-items-btn')
        this.removeEntryButton = page.locator(
            '[data-testid^="remove-entry-button-"]',
        )
        this.confirmRemoveEntryButton = page
            .locator('[data-testid^="remove-entry-button-"]')
            .filter({ hasText: 'Remove' })
        this.clearStreamEntryInputs = page.getByTestId('remove-item')
        this.saveGroupsButton = page.getByTestId('save-groups-btn')
        this.acknowledgeButton = page.getByTestId('acknowledge-btn')
        this.confirmAcknowledgeButton = page.getByTestId('acknowledge-submit')
        this.claimPendingMessageButton = page.getByTestId(
            'claim-pending-message',
        )
        this.submitButton = page.getByTestId('btn-submit')
        this.consumerDestinationSelect = page.getByTestId('destination-select')
        this.removeConsumerButton = page.locator(
            '[data-testid^="remove-consumer-button"]',
        )
        this.removeConsumerGroupButton = page.locator(
            '[data-testid^="remove-groups-button"]',
        )
        this.optionalParametersSwitcher = page.getByTestId(
            'optional-parameters-switcher',
        )
        this.forceClaimCheckbox = page
            .getByTestId('force-claim-checkbox')
            .locator('..')
        this.editStreamLastIdButton = page.getByTestId('stream-group_edit-btn')
        this.saveButton = page.getByTestId('save-btn')
        this.bulkActionsButton = page.getByTestId('btn-bulk-actions')
        this.editHashButton = page.locator('[data-testid^="hash_edit-btn-"]')
        this.editHashFieldTtlButton = page.locator(
            '[data-testid^="hash-ttl_edit-btn-"]',
        )
        this.editZsetButton = page.locator('[data-testid^="zset_edit-btn-"]')
        this.editListButton = page.locator('[data-testid^="list_edit-btn-"]')
        this.cancelStreamGroupBtn = page.getByTestId('cancel-stream-groups-btn')
        this.patternModeBtn = page.getByTestId('search-mode-pattern-btn')
        this.redisearchModeBtn = page.getByTestId('search-mode-redisearch-btn')
        this.showFilterHistoryBtn = page.getByTestId('show-suggestions-btn')
        this.clearFilterHistoryBtn = page.getByTestId('clear-history-btn')
        this.loadSampleDataBtn = page.getByTestId('load-sample-data-btn')
        this.executeBulkKeyLoadBtn = page.getByTestId(
            'load-sample-data-btn-confirm',
        )
        this.backToBrowserBtn = page.getByTestId('back-right-panel-btn')
        this.loadAllBtn = page.getByTestId('load-all-value-btn')
        this.downloadAllValueBtn = page.getByTestId('download-all-value-btn')
        this.openTutorialsBtn = page.getByTestId('explore-msg-btn')
        this.keyItem = page.locator(
            '[data-testid*="node-item"][data-testid*="keys:"]',
        )
        this.columnsBtn = page.getByTestId('btn-columns-actions')

        // CONTAINERS
        this.streamGroupsContainer = page.getByTestId('stream-groups-container')
        this.streamConsumersContainer = page.getByTestId(
            'stream-consumers-container',
        )
        this.breadcrumbsContainer = page.getByTestId('breadcrumbs-container')
        this.virtualTableContainer = page.getByTestId('virtual-table-container')
        this.streamEntriesContainer = page.getByTestId(
            'stream-entries-container',
        )
        this.streamMessagesContainer = page.getByTestId(
            'stream-messages-container',
        )
        this.loader = page.getByTestId('type-loading')
        this.newIndexPanel = page.getByTestId('create-index-panel')

        // LINKS
        this.internalLinkToWorkbench = page.getByTestId(
            'internal-workbench-link',
        )
        this.userSurveyLink = page.getByTestId('user-survey-link')
        this.redisearchFreeLink = page.getByTestId('get-started-link')
        this.guideLinksBtn = page.locator('[data-testid^="guide-button-"]')

        // OPTION ELEMENTS
        this.stringOption = page.locator('#string')
        this.jsonOption = page.locator('#ReJSON-RL')
        this.setOption = page.locator('#set')
        this.zsetOption = page.locator('#zset')
        this.listOption = page.locator('#list')
        this.hashOption = page.locator('#hash')
        this.streamOption = page.locator('#stream')
        this.removeFromHeadSelection = page.locator('#HEAD')
        this.filterOptionType = page.locator(
            '[data-test-subj^="filter-option-type-"]',
        )
        this.filterByKeyTypeDropDown = page.getByTestId(
            'select-filter-key-type',
        )
        this.filterAllKeyType = page.locator('#all')
        this.consumerOption = page.getByTestId('consumer-option')
        this.claimTimeOptionSelect = page.getByTestId('time-option-select')
        this.relativeTimeOption = page.locator('#idle')
        this.timestampOption = page.locator('#time')
        this.formatSwitcher = page.getByTestId('select-format-key-value')
        this.formatSwitcherIcon = page.locator(
            '[data-testid^="key-value-formatter-option-selected"]',
        )
        this.refreshIndexButton = page.getByTestId('refresh-indexes-btn')
        this.selectIndexDdn = page.locator(
            '[data-testid="select-index-placeholder"],[data-testid="select-search-mode"]',
        )
        this.createIndexBtn = page.getByTestId('create-index-btn')
        this.cancelIndexCreationBtn = page.getByTestId(
            'create-index-cancel-btn',
        )
        this.confirmIndexCreationBtn = page.getByTestId('create-index-btn')
        this.resizeTrigger = page.locator('[data-testid^="resize-trigger-"]')
        this.filterHistoryOption = page.getByTestId('suggestion-item-')
        this.filterHistoryItemText = page.getByTestId('suggestion-item-text')

        // TABS
        this.streamTabGroups = page.getByTestId('stream-tab-Groups')
        this.streamTabConsumers = page.getByTestId('stream-tab-Consumers')
        this.streamTabs = page.locator('[data-test-subj="stream-tabs"]')

        // TEXT INPUTS
        this.addKeyNameInput = page.getByTestId('key')
        this.keyNameInput = page.getByTestId('edit-key-input')
        this.keyTTLInput = page.getByTestId('ttl')
        this.editKeyTTLInput = page.getByTestId('edit-ttl-input')
        this.ttlText = page.getByTestId('key-ttl-text').locator('span')
        this.hashFieldValueInput = page.getByTestId('field-value')
        this.hashFieldNameInput = page.getByTestId('field-name')
        this.hashFieldValueEditor = page.getByTestId('hash_value-editor')
        this.hashTtlFieldInput = page.getByTestId('hash-ttl')
        this.listKeyElementEditorInput = page.getByTestId('list_value-editor-')
        this.stringKeyValueInput = page.getByTestId('string-value')
        this.jsonKeyValueInput = page.locator('div[data-mode-id=json] textarea')
        this.jsonUploadInput = page.getByTestId('upload-input-file')
        this.setMemberInput = page.getByTestId('member-name')
        this.zsetMemberScoreInput = page.getByTestId('member-score')
        this.filterByPatterSearchInput = page.getByTestId('search-key')
        this.hashFieldInput = page.getByTestId('hash-field')
        this.hashValueInput = page.getByTestId('hash-value')
        this.searchInput = page.getByTestId('search')
        this.jsonKeyInput = page.getByTestId('json-key')
        this.jsonValueInput = page.getByTestId('json-value')
        this.countInput = page.getByTestId('count-input')
        this.streamEntryId = page.getByTestId('entryId')
        this.streamField = page.getByTestId('field-name')
        this.streamValue = page.getByTestId('field-value')
        this.addAdditionalElement = page.getByTestId('add-item')
        this.streamFieldsValues = page.getByTestId('stream-entry-field-')
        this.streamEntryIDDateValue = page.locator(
            '[data-testid^="stream-entry-"][data-testid$="date"]',
        )
        this.groupNameInput = page.getByTestId('group-name-field')
        this.consumerIdInput = page.getByTestId('id-field')
        this.streamMinIdleTimeInput = page.getByTestId('min-idle-time')
        this.claimIdleTimeInput = page.getByTestId('time-count')
        this.claimRetryCountInput = page.getByTestId('retry-count')
        this.lastIdInput = page.getByTestId('last-id-field')
        this.inlineItemEditor = page.getByTestId('inline-item-editor')
        this.indexNameInput = page.getByTestId('index-name')
        this.prefixFieldInput = page.locator('[data-test-subj="comboBoxInput"]')
        this.indexIdentifierInput = page.getByTestId('identifier-')

        // TEXT ELEMENTS
        this.keySizeDetails = page.getByTestId('key-size-text')
        this.keyLengthDetails = page.getByTestId('key-length-text')
        this.keyNameInTheList = this.cssSelectorKey
        this.hashFieldsList = page.getByTestId('hash-field-').locator('span')
        this.hashValuesList = page
            .getByTestId('hash_content-value-')
            .locator('span')
        this.hashField = page.getByTestId('hash-field-').first()
        this.hashFieldValue = page.getByTestId('hash_content-value-')
        this.setMembersList = page.locator('[data-testid^="set-member-value-"]')
        this.zsetMembersList = page.locator(
            '[data-testid^="zset-member-value-"]',
        )
        this.zsetScoresList = page.locator(
            '[data-testid^="zset_content-value-"]',
        )
        this.listElementsList = page.locator(
            '[data-testid^="list_content-value-"]',
        )
        this.jsonKeyValue = page.getByTestId('json-data')
        this.jsonError = page.getByTestId('edit-json-error')
        this.tooltip = page.locator('[role="tooltip"]')
        this.dialog = page.locator('[role="dialog"]')
        this.noResultsFound = page.locator('[data-test-subj="no-result-found"]')
        this.noResultsFoundOnly = page.getByTestId('no-result-found-only')
        this.searchAdvices = page.locator('[data-test-subj="search-advices"]')
        this.keysNumberOfResults = page.getByTestId('keys-number-of-results')
        this.scannedValue = page.getByTestId('keys-number-of-scanned')
        this.totalKeysNumber = page.getByTestId('keys-total')
        this.keyDetailsBadge = page.locator(
            '.key-details-header .euiBadge__text',
        )
        this.modulesTypeDetails = page.getByTestId('modules-type-details')
        this.filteringLabel = page.getByTestId('badge-')
        this.keysSummary = page.getByTestId('keys-summary')
        this.multiSearchArea = page.getByTestId('multi-search')
        this.keyDetailsHeader = page.getByTestId('key-details-header')
        this.keyListTable = page.getByTestId('keyList-table')
        this.keyListMessage = page.getByTestId('no-result-found-msg')
        this.keyDetailsTable = page.getByTestId('key-details')
        this.keyNameFormDetails = page.getByTestId('key-name-text')
        this.keyDetailsTTL = page.getByTestId('key-ttl-text')
        this.progressLine = page.locator('div.euiProgress')
        this.progressKeyList = page.getByTestId('progress-key-list')
        this.jsonScalarValue = page.getByTestId('json-scalar-value')
        this.noKeysToDisplayText = page.getByTestId('no-result-found-msg')
        this.streamEntryDate = page.locator(
            '[data-testid*="-date"][data-testid*="stream-entry"]',
        )
        this.streamEntryIdValue = page.locator(
            '.streamItemId[data-testid*="stream-entry"]',
        )
        this.streamFields = page.locator(
            '[data-test-subj="stream-entries-container"] .truncateText',
        )
        this.streamVirtualContainer = page
            .locator('[data-testid="virtual-grid-container"] div div')
            .first()
        this.streamEntryFields = page.getByTestId('stream-entry-field')
        this.confirmationMessagePopover = page.locator(
            'div.euiPopover__panel .euiText',
        )
        this.streamGroupId = page
            .locator('.streamItemId[data-testid^="stream-group-id"]')
            .first()
        this.streamGroupName = page.getByTestId('stream-group-name')
        this.streamMessage = page.locator(
            '[data-testid*="-date"][data-testid^="stream-message"]',
        )
        this.streamConsumerName = page.getByTestId('stream-consumer-')
        this.consumerGroup = page.getByTestId('stream-group-')
        this.entryIdInfoIcon = page.getByTestId('entry-id-info-icon')
        this.entryIdError = page.getByTestId('id-error')
        this.pendingCount = page.getByTestId('pending-count')
        this.streamRangeBar = page.getByTestId('mock-fill-range')
        this.rangeLeftTimestamp = page.getByTestId('range-left-timestamp')
        this.rangeRightTimestamp = page.getByTestId('range-right-timestamp')
        this.jsonValue = page.getByTestId('value-as-json')
        this.stringValueAsJson = page.getByTestId('value-as-json')

        // POPUPS
        this.changeValueWarning = page.getByTestId('approve-popover')

        // TABLE
        this.keyListItem = page.locator('[role="rowgroup"] [role="row"]')

        // DIALOG
        this.noReadySearchDialogTitle = page.getByTestId('welcome-page-title')

        // CHECKBOXES
        this.showTtlCheckbox = page.getByTestId('test-check-ttl').locator('..')
        this.showTtlColumnCheckbox = page.getByTestId('show-ttl').locator('..')
        this.showSizeColumnCheckbox = page
            .getByTestId('show-key-size')
            .locator('..')

        // UTILITY FUNCTIONS
        this.getHashTtlFieldInput = (fieldName: string): Locator =>
            page.getByTestId(`hash-ttl_content-value-${fieldName}`)
        this.getListElementInput = (count: number): Locator =>
            page.locator(`[data-testid*="element-${count}"]`)
        this.getKeySize = (keyName: string): Locator =>
            page.getByTestId(`size-${keyName}`)
        this.getKeyTTl = (keyName: string): Locator =>
            page.getByTestId(`ttl-${keyName}`)
    }

    async commonAddNewKey(keyName: string, TTL?: string): Promise<void> {
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        if (TTL !== undefined) {
            await this.keyTTLInput.click()
            await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        }
        await this.keyTypeDropDown.click()
    }

    async addStringKey(
        keyName: string,
        value = ' ',
        TTL?: string,
    ): Promise<void> {
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.stringOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        if (TTL !== undefined) {
            await this.keyTTLInput.click()
            await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        }
        await this.stringKeyValueInput.click()
        await this.stringKeyValueInput.fill(value, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.addKeyButton.click()
    }

    async addJsonKey(
        keyName: string,
        value: string,
        TTL?: string,
    ): Promise<void> {
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.jsonOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, {
            timeout: 0,
        })
        await this.jsonKeyValueInput.click()
        await this.jsonKeyValueInput.fill(value, {
            timeout: 0,
        })
        if (TTL !== undefined) {
            await this.keyTTLInput.click()
            await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        }
        await this.addKeyButton.click()
    }

    async addSetKey(keyName: string, TTL = ' ', members = ' '): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.setOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        await this.setMemberInput.fill(members, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.addKeyButton.click()
        await this.toast.closeToast()
    }

    async addZSetKey(
        keyName: string,
        scores = ' ',
        TTL = ' ',
        members = ' ',
    ): Promise<void> {
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.zsetOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        await this.setMemberInput.fill(members, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.zsetMemberScoreInput.fill(scores, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.addKeyButton.click()
    }

    async addListKey(
        keyName: string,
        TTL = ' ',
        element: string[] = [' '],
        position: AddElementInList = AddElementInList.Tail,
    ): Promise<void> {
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.listOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        if (position === AddElementInList.Head) {
            await this.removeElementFromListSelect.click()
            await this.removeFromHeadSelection.click()
            await expect(this.removeFromHeadSelection).not.toBeVisible()
        }
        for (let i = 0; i < element.length; i += 1) {
            await this.getListElementInput(i).click()
            await this.getListElementInput(i).fill(element[i], {
                timeout: 0,
                noWaitAfter: false,
            })
            if (element.length > 1 && i < element.length - 1) {
                await this.addAdditionalElement.click()
            }
        }
        await this.addKeyButton.click()
    }

    async addHashKey(
        keyName: string,
        TTL = ' ',
        field = ' ',
        value = ' ',
        fieldTtl = '',
    ): Promise<void> {
        if (await this.toast.isCloseButtonVisible()) {
            await this.toast.closeToast()
        }
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.hashOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        await this.hashFieldNameInput.fill(field, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.hashFieldValueInput.fill(value, {
            timeout: 0,
            noWaitAfter: false,
        })
        if (fieldTtl !== '') {
            await this.hashTtlFieldInput.fill(fieldTtl, {
                timeout: 0,
                noWaitAfter: false,
            })
        }
        await this.addKeyButton.click()
        await this.toast.closeToast()
    }

    async addStreamKey(
        keyName: string,
        field: string,
        value: string,
        TTL?: string,
    ): Promise<void> {
        await this.commonAddNewKey(keyName, TTL)
        await this.streamOption.click()
        await expect(this.streamEntryId).toHaveValue('*', { timeout: 5000 })
        await this.streamField.fill(field, { timeout: 0, noWaitAfter: false })
        await this.streamValue.fill(value, { timeout: 0, noWaitAfter: false })
        await expect(this.addKeyButton).not.toBeDisabled()
        await this.addKeyButton.click()
        await this.toast.closeToast()
    }

    async addEntryToStream(
        field: string,
        value: string,
        entryId?: string,
    ): Promise<void> {
        await this.addNewStreamEntry.click()
        await this.streamField.fill(field, { timeout: 0, noWaitAfter: false })
        await this.streamValue.fill(value, { timeout: 0, noWaitAfter: false })
        if (entryId !== undefined) {
            await this.streamEntryId.fill(entryId, {
                timeout: 0,
                noWaitAfter: false,
            })
        }
        await this.saveElementButton.click()
        await expect(this.streamEntriesContainer).toContainText(field)
        await expect(this.streamEntriesContainer).toContainText(value)
    }

    async fulfillSeveralStreamFields(
        fields: string[],
        values: string[],
        entryId?: string,
    ): Promise<void> {
        for (let i = 0; i < fields.length; i += 1) {
            await this.streamField
                .nth(-1)
                .fill(fields[i], { timeout: 0, noWaitAfter: false })
            await this.streamValue
                .nth(-1)
                .fill(values[i], { timeout: 0, noWaitAfter: false })
            if (i < fields.length - 1) {
                await this.addAdditionalElement.click()
            }
        }
        if (entryId !== undefined) {
            await this.streamEntryId.fill(entryId, {
                timeout: 0,
                noWaitAfter: false,
            })
        }
    }

    async selectFilterGroupType(groupName: string): Promise<void> {
        await this.filterByKeyTypeDropDown.click()
        await this.filterOptionType.locator(groupName).click()
    }

    async setAllKeyType(): Promise<void> {
        await this.filterByKeyTypeDropDown.click()
        await this.filterAllKeyType.click()
    }

    async searchByKeyName(keyName: string): Promise<void> {
        await this.filterByPatterSearchInput.click()
        await this.filterByPatterSearchInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.page.keyboard.press('Enter')
    }

    getKeySelectorByName(keyName: string): Locator {
        return this.page.locator(`[data-testid="key-${keyName}"]`)
    }

    async isKeyIsDisplayedInTheList(keyName: string): Promise<boolean> {
        const keyNameInTheList = this.getKeySelectorByName(keyName)
        await this.waitForLocatorNotVisible(this.loader)
        return keyNameInTheList.isVisible()
    }

    async deleteKey(): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.keyNameInTheList.click()
        await this.deleteKeyButton.click()
        await this.confirmDeleteKeyButton.click()
    }

    async deleteKeyByName(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName)
        await this.keyNameInTheList.hover()
        await this.keyNameInTheList.click()
        await this.deleteKeyButton.click()
        await this.confirmDeleteKeyButton.click()
    }

    async deleteKeysByNames(keyNames: string[]): Promise<void> {
        for (const name of keyNames) {
            await this.deleteKeyByName(name)
        }
    }

    async deleteKeyByNameFromList(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName)
        await this.keyNameInTheList.hover()
        await this.page
            .locator(`[data-testid="delete-key-btn-${keyName}"]`)
            .click()
        await this.submitDeleteKeyButton.click()
    }

    async editKeyName(keyName: string): Promise<void> {
        await this.editKeyNameButton.click()
        await this.keyNameInput.fill(keyName, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async editStringKeyValue(value: string): Promise<void> {
        await this.stringKeyValueInput.click()
        await this.stringKeyValueInput.fill(value, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async getStringKeyValue(): Promise<string | null> {
        return this.stringKeyValueInput.textContent()
    }

    async getZsetKeyScore(): Promise<string | null> {
        return this.zsetScoresList.textContent()
    }

    async addFieldToHash(
        keyFieldValue: string,
        keyValue: string,
        fieldTtl = '',
    ): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.addKeyValueItemsButton.click()
        await this.hashFieldInput.fill(keyFieldValue, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.hashValueInput.fill(keyValue, {
            timeout: 0,
            noWaitAfter: false,
        })
        if (fieldTtl !== '') {
            await this.hashTtlFieldInput.fill(fieldTtl, {
                timeout: 0,
                noWaitAfter: false,
            })
        }
        await this.saveHashFieldButton.click()
    }

    async editHashKeyValue(value: string): Promise<void> {
        await this.hashFieldValue.hover()
        await this.editHashButton.click()
        await this.hashFieldValueEditor.fill(value, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async editHashFieldTtlValue(
        fieldName: string,
        fieldTtl: string,
    ): Promise<void> {
        await this.getHashTtlFieldInput(fieldName).hover()
        await this.editHashFieldTtlButton.click()
        await this.inlineItemEditor.fill(fieldTtl, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async getHashKeyValue(): Promise<string | null> {
        return this.hashFieldValue.textContent()
    }

    async editListKeyValue(value: string): Promise<void> {
        await this.listElementsList.hover()
        await this.editListButton.click()
        await this.listKeyElementEditorInput.fill(value, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async getListKeyValue(): Promise<string | null> {
        return this.listElementsList.textContent()
    }

    async getJsonKeyValue(): Promise<string | null> {
        return this.jsonKeyValue.textContent()
    }

    async searchByTheValueInKeyDetails(value: string): Promise<void> {
        await this.searchButtonInKeyDetails.click()
        await this.searchInput.fill(value, { timeout: 0, noWaitAfter: false })
        await this.page.keyboard.press('Enter')
    }

    async secondarySearchByTheValueInKeyDetails(value: string): Promise<void> {
        await this.searchInput.fill(value, { timeout: 0, noWaitAfter: false })
        await this.page.keyboard.press('Enter')
    }

    async searchByTheValueInSetKey(value: string): Promise<void> {
        await this.searchInput.click()
        await this.searchInput.fill(value, { timeout: 0, noWaitAfter: false })
        await this.page.keyboard.press('Enter')
    }

    async addMemberToSet(keyMember: string): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.addKeyValueItemsButton.click()
        await this.setMemberInput.fill(keyMember, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.saveMemberButton.click()
    }

    async addMemberToZSet(keyMember: string, score: string): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.addKeyValueItemsButton.click()
        await this.setMemberInput.fill(keyMember, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.zsetMemberScoreInput.fill(score, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.saveMemberButton.click()
    }

    async openKeyDetails(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName)
        await this.keyNameInTheList.click()
    }

    async openKeyDetailsByKeyName(keyName: string): Promise<void> {
        const keyNameInTheList = this.page.locator(
            `[data-testid="key-${keyName}"]`,
        )
        await keyNameInTheList.click()
    }

    async addElementToList(
        element: string[],
        position: AddElementInList = AddElementInList.Tail,
    ): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.addKeyValueItemsButton.click()
        if (position === AddElementInList.Head) {
            await this.removeElementFromListSelect.click()
            await this.removeFromHeadSelection.click()
            await expect(this.removeFromHeadSelection).not.toBeVisible()
        }
        for (let i = 0; i < element.length; i += 1) {
            await this.getListElementInput(i).click()
            await this.getListElementInput(i).fill(element[i], {
                timeout: 0,
                noWaitAfter: false,
            })
            if (element.length > 1 && i < element.length - 1) {
                await this.addAdditionalElement.click()
            }
        }
        await this.addKeyButton.click()
    }

    async removeListElementFromHeadOld(): Promise<void> {
        await this.removeElementFromListIconButton.click()
        await expect(
            await this.countInput.getAttribute('disabled'),
        ).toBeTruthy()
        await this.removeElementFromListSelect.click()
        await this.removeFromHeadSelection.click()
        await this.removeElementFromListButton.click()
        await this.confirmRemoveListElementButton.click()
    }

    async removeListElementFromTail(count: string): Promise<void> {
        await this.removeElementFromListIconButton.click()
        await this.countInput.fill(count, { timeout: 0, noWaitAfter: false })
        await this.removeElementFromListButton.click()
        await this.confirmRemoveListElementButton.click()
    }

    async removeListElementFromHead(count: string): Promise<void> {
        await this.removeElementFromListIconButton.click()
        await this.countInput.fill(count, { timeout: 0, noWaitAfter: false })
        await this.removeElementFromListSelect.click()
        await this.removeFromHeadSelection.click()
        await this.removeElementFromListButton.click()
        await this.confirmRemoveListElementButton.click()
    }

    async addJsonKeyOnTheSameLevel(
        jsonKey: string,
        jsonKeyValue: string,
    ): Promise<void> {
        await this.addJsonObjectButton.click()
        await this.jsonKeyInput.fill(jsonKey, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.jsonValueInput.fill(jsonKeyValue, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async addJsonKeyInsideStructure(
        jsonKey: string,
        jsonKeyValue: string,
    ): Promise<void> {
        await this.expandJsonObject.click()
        await this.addJsonFieldButton.click()
        await this.jsonKeyInput.fill(jsonKey, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.jsonValueInput.fill(jsonKeyValue, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async addJsonValueInsideStructure(jsonKeyValue: string): Promise<void> {
        await this.expandJsonObject.click()
        await this.addJsonFieldButton.click()
        await this.jsonValueInput.fill(jsonKeyValue, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyButton.click()
    }

    async addJsonStructure(jsonStructure: string): Promise<void> {
        if (await this.expandJsonObject.isVisible()) {
            await this.expandJsonObject.click()
        }
        await this.editJsonObjectButton.click()
        await this.jsonValueInput.fill(jsonStructure, {
            timeout: 0,
            noWaitAfter: false,
        })
        await this.applyEditButton.click()
    }

    async deleteStreamEntry(): Promise<void> {
        await this.removeEntryButton.click()
        await this.confirmRemoveEntryButton.click()
    }

    async getKeyLength(): Promise<string> {
        const rawValue = await this.keyLengthDetails.textContent()
        const parts = (rawValue ?? '').split(' ')
        return parts[parts.length - 1]
    }

    async createConsumerGroup(groupName: string, id?: string): Promise<void> {
        await this.addKeyValueItemsButton.click()
        await this.groupNameInput.fill(groupName, {
            timeout: 0,
            noWaitAfter: false,
        })
        if (id !== undefined) {
            await this.consumerIdInput.fill(id, {
                timeout: 0,
                noWaitAfter: false,
            })
        }
        await this.saveGroupsButton.click()
    }

    async openStreamPendingsView(keyName: string): Promise<void> {
        await this.openKeyDetails(keyName)
        await this.streamTabGroups.click()
        await this.consumerGroup.click()
        await this.streamConsumerName.click()
    }

    async selectFormatter(formatter: string): Promise<void> {
        const option = this.page.locator(
            `[data-test-subj="format-option-${formatter}"]`,
        )
        await this.formatSwitcher.click()
        await option.click()
    }

    async verifyScannningMore(): Promise<void> {
        for (let i = 10; i < 100; i += 10) {
            const rememberedScanResults = Number(
                (await this.keysNumberOfResults.textContent())?.replace(
                    /\s/g,
                    '',
                ),
            )
            await expect(this.progressKeyList).not.toBeVisible({
                timeout: 30000,
            })
            const scannedValueText = await this.scannedValue.textContent()
            const regExp = new RegExp(`${i} ...`)
            await expect(scannedValueText).toMatch(regExp)
            await this.scanMoreButton.click()
            const scannedResults = Number(
                (await this.keysNumberOfResults.textContent())?.replace(
                    /\s/g,
                    '',
                ),
            )
            await expect(scannedResults).toBeGreaterThan(rememberedScanResults)
        }
    }

    async selectIndexByName(index: string): Promise<void> {
        const option = this.page.locator(
            `[data-test-subj="mode-option-type-${index}"]`,
        )
        await this.selectIndexDdn.click()
        await option.click()
    }

    async verifyNoKeysInDatabase(): Promise<void> {
        await expect(this.keyListMessage).toBeVisible()
        await expect(this.keysSummary).not.toBeVisible()
    }

    async clearFilter(): Promise<void> {
        await this.clearFilterButton.click()
    }

    async clickGuideLinksByName(guide: string): Promise<void> {
        const linkGuide = this.page.locator(guide)
        await linkGuide.click()
    }

    async isKeyDetailsOpen(keyName: string): Promise<boolean> {
        try {
            // Check if the key details header is visible (only present when key is selected)
            const headerIsVisible = await this.page
                .getByTestId('key-details-header')
                .isVisible()

            if (!headerIsVisible) {
                return false
            }

            // Check if the key name in the header matches the expected key
            const keyNameIsVisible = await this.keyNameFormDetails
                .filter({ hasText: keyName })
                .isVisible()

            if (!keyNameIsVisible) {
                return false
            }

            // Check if any key details content is visible
            const detailsContainers = [
                'string-details',
                'hash-details',
                'set-details',
                'list-details',
                'zset-details',
                'json-details',
                'stream-details',
            ]

            for (const containerId of detailsContainers) {
                const container = this.page.getByTestId(containerId)
                if (await container.isVisible()) {
                    return true
                }
            }

            return false
        } catch (error) {
            return false
        }
    }

    async isKeyDetailsClosed(): Promise<boolean> {
        try {
            // Wait for either the header to disappear OR the close button to disappear
            // This ensures we wait for the UI transition to complete
            await expect
                .poll(async () => {
                    const headerIsVisible = await this.page
                        .getByTestId('key-details-header')
                        .isVisible()
                    const closeRightPanelBtn = await this.page
                        .getByTestId('close-right-panel-btn')
                        .isVisible()

                    // Return true if details are closed (header gone OR close button gone)
                    return !headerIsVisible || !closeRightPanelBtn
                })
                .toBe(true)

            return true
        } catch (error) {
            return false
        }
    }

    async closeKeyDetails(): Promise<void> {
        await this.closeKeyButton.click()
    }

    async hashFieldExists(
        fieldName: string,
        fieldValue: string,
    ): Promise<boolean> {
        try {
            const fieldLocator = this.page.locator(
                `[data-testid="hash-field-${fieldName}"]`,
            )
            const valueLocator = this.page.locator(
                `[data-testid="hash_content-value-${fieldName}"]`,
            )

            const fieldExists = await fieldLocator.isVisible()
            const valueExists = await valueLocator.isVisible()

            if (!fieldExists || !valueExists) {
                return false
            }

            const actualValue = await valueLocator.textContent()
            return actualValue?.includes(fieldValue) || false
        } catch {
            return false
        }
    }

    async getAllListElements(): Promise<string[]> {
        // Get all list elements' text content
        const elements = await this.listElementsList.all()
        const values: string[] = []

        for (let i = 0; i < elements.length; i += 1) {
            const text = await elements[i].textContent()
            if (text && text.trim()) {
                values.push(text.trim())
            }
        }

        return values
    }

    async getAllSetMembers(): Promise<string[]> {
        // Get all set members' text content
        const elements = await this.setMembersList.all()
        const values: string[] = []

        for (let i = 0; i < elements.length; i += 1) {
            const text = await elements[i].textContent()
            if (text && text.trim()) {
                values.push(text.trim())
            }
        }

        return values
    }

    async getAllZsetMembers(): Promise<Array<{ name: string; score: string }>> {
        // Get all zset members' names and scores
        const memberElements = await this.zsetMembersList.all()
        const scoreElements = await this.zsetScoresList.all()
        const members: Array<{ name: string; score: string }> = []

        for (let i = 0; i < memberElements.length; i += 1) {
            const memberText = await memberElements[i].textContent()
            const scoreText = await scoreElements[i].textContent()

            if (
                memberText &&
                memberText.trim() &&
                scoreText &&
                scoreText.trim()
            ) {
                members.push({
                    name: memberText.trim(),
                    score: scoreText.trim(),
                })
            }
        }

        return members
    }

    async getAllStreamEntries(): Promise<string[]> {
        // Get all stream field elements that contain the actual data
        const fieldElements = await this.page
            .locator('[data-testid^="stream-entry-field-"]')
            .all()

        const fieldValues: string[] = []

        for (let i = 0; i < fieldElements.length; i += 1) {
            const text = await fieldElements[i].textContent()
            if (text && text.trim()) {
                fieldValues.push(text.trim())
            }
        }

        return fieldValues
    }

    // Helper methods for key reading operations
    async openKeyDetailsAndVerify(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName)
        await this.openKeyDetailsByKeyName(keyName)

        // Wait for key details to be properly loaded
        await expect.poll(async () => this.isKeyDetailsOpen(keyName)).toBe(true)
    }

    async closeKeyDetailsAndVerify(): Promise<void> {
        await this.closeKeyDetails()
        const isDetailsClosed = await this.isKeyDetailsClosed()
        expect(isDetailsClosed).toBe(true)
    }

    async verifyKeySize(): Promise<void> {
        const keySizeText = await this.keySizeDetails.textContent()
        expect(keySizeText).toBeTruthy()
    }

    async verifyKeyLength(expectedLength: string): Promise<void> {
        const displayedLength = await this.getKeyLength()
        expect(displayedLength).toBe(expectedLength)
    }

    async verifyKeyTTL(expectedTTL?: number): Promise<void> {
        const displayedTTL = await this.keyDetailsTTL.textContent()
        expect(displayedTTL).toContain('TTL:')

        if (expectedTTL !== undefined) {
            const ttlMatch = displayedTTL?.match(/TTL:\s*(\d+|No limit)/)
            expect(ttlMatch).toBeTruthy()

            if (ttlMatch && ttlMatch[1] !== 'No limit') {
                const actualTTL = parseInt(ttlMatch[1], 10)
                // TTL should be close to what we set (allowing for some time passage during test execution)
                expect(actualTTL).toBeGreaterThan(expectedTTL - 60)
                expect(actualTTL).toBeLessThanOrEqual(expectedTTL)
            }
        }
    }

    // Helper methods for verifying key content
    async verifyStringKeyContent(expectedValue: string): Promise<void> {
        const displayedValue = await this.getStringKeyValue()
        expect(displayedValue).toContain(expectedValue)
    }

    async verifyHashKeyContent(
        fieldName: string,
        fieldValue: string,
    ): Promise<void> {
        const hashField = await this.hashFieldExists(fieldName, fieldValue)
        expect(hashField).toBe(true)
    }

    async verifyListKeyContent(expectedElements: string[]): Promise<void> {
        const displayedElements = await this.getAllListElements()
        expect(displayedElements).toHaveLength(expectedElements.length)

        expectedElements.forEach((expectedElement) => {
            expect(displayedElements).toContain(expectedElement)
        })
    }

    async verifySetKeyContent(expectedMembers: string[]): Promise<void> {
        const displayedMembers = await this.getAllSetMembers()
        expect(displayedMembers).toHaveLength(expectedMembers.length)

        expectedMembers.forEach((expectedMember) => {
            expect(displayedMembers).toContain(expectedMember)
        })
    }

    async verifyZsetKeyContent(
        expectedMembers: Array<{ name: string; score: number }>,
    ): Promise<void> {
        const displayedMembers = await this.getAllZsetMembers()
        expect(displayedMembers).toHaveLength(expectedMembers.length)

        expectedMembers.forEach((expectedMember) => {
            const foundMember = displayedMembers.find(
                (member) => member.name === expectedMember.name,
            )
            expect(foundMember).toBeDefined()
            expect(foundMember?.score).toBe(expectedMember.score.toString())
        })
    }

    async verifyJsonKeyContent(expectedValue: any): Promise<void> {
        const displayedValue = await this.getJsonKeyValue()

        // Check for scalar properties that should be visible
        if (typeof expectedValue === 'object' && expectedValue !== null) {
            if (expectedValue.name)
                expect(displayedValue).toContain(expectedValue.name)
            if (expectedValue.age)
                expect(displayedValue).toContain(expectedValue.age.toString())
            if (typeof expectedValue.active === 'boolean')
                expect(displayedValue).toContain(
                    expectedValue.active.toString(),
                )

            // Verify JSON structure keys are present
            Object.keys(expectedValue).forEach((key) => {
                expect(displayedValue).toContain(key)
            })
        }
    }

    async verifyStreamKeyContent(
        expectedEntries: Array<{
            fields: Array<{ name: string; value: string }>
        }>,
    ): Promise<void> {
        const displayedFieldValues = await this.getAllStreamEntries()
        expect(displayedFieldValues.length).toBeGreaterThan(0)

        // Combine all field values to check for expected content
        const allFieldsText = displayedFieldValues.join(' ')

        // Check that all expected field values are present
        expectedEntries.forEach((entry) => {
            entry.fields.forEach((field) => {
                expect(allFieldsText).toContain(field.value)
            })
        })
    }

    // Comprehensive helper method for complete key verification
    async verifyKeyDetails(
        keyName: string,
        expectedLength: string,
        expectedTTL?: number,
    ): Promise<void> {
        await this.openKeyDetailsAndVerify(keyName)
        await this.verifyKeyLength(expectedLength)
        await this.verifyKeySize()
        await this.verifyKeyTTL(expectedTTL)
        await this.closeKeyDetailsAndVerify()
    }

    async verifyKeyExists(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName)
        const keyExists = await this.isKeyIsDisplayedInTheList(keyName)
        expect(keyExists).toBe(true)
    }

    async verifyKeyDoesNotExist(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName)
        const keyStillExists = await this.isKeyIsDisplayedInTheList(keyName)
        expect(keyStillExists).toBe(false)
    }

    async deleteKeyFromDetailsView(keyName: string): Promise<void> {
        await this.openKeyDetailsByKeyName(keyName)
        await this.deleteKeyButton.click()
        await this.confirmDeleteKeyButton.click()
    }

    async deleteKeyFromListView(keyName: string): Promise<void> {
        await this.deleteKeyByNameFromList(keyName)
    }

    async startKeyDeletion(keyName: string): Promise<void> {
        await this.openKeyDetailsByKeyName(keyName)
        await this.deleteKeyButton.click()
    }

    async cancelKeyDeletion(): Promise<void> {
        // Click outside the confirmation popover to cancel deletion
        await this.keyDetailsHeader.click()
    }
}
