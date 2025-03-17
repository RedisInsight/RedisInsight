import { expect, Locator, Page } from '@playwright/test'
// import { Common } from '../helpers/common'
import { AddElementInList } from '../helpers/constants'
import {Toast } from './components/common/toast'

// import { BulkActions, TreeView } from './components/browser'
// import { AddNewKeyParameters , HashKeyParameters ,StreamKeyParameters,
//     SetKeyParameters , SortedSetKeyParameters ,ListKeyParameters, StringKeyParameters, AddKeyArguments, KeyData} from '../types'
import { BasePage } from './base-page'

export class BrowserPage extends BasePage {
    // private readonly bulkActions: BulkActions
    // private readonly treeView: TreeView
    private page: Page
    private toast: Toast
    // CSS Selectors
    private readonly cssSelectorGrid: Locator
    private readonly cssSelectorRows: Locator
    private readonly cssSelectorKey: Locator
    private readonly cssFilteringLabel: Locator
    private readonly cssJsonValue: Locator
    private readonly cssRowInVirtualizedTable: Locator
    private readonly cssVirtualTableRow: Locator
    private readonly cssKeyBadge: Locator
    private readonly cssKeyTtl: Locator
    private readonly cssKeySize: Locator
    private readonly cssRemoveSuggestionItem: Locator

    // BUTTONS
    private readonly applyButton: Locator
    private readonly deleteKeyButton: Locator
    private readonly submitDeleteKeyButton: Locator
    private readonly confirmDeleteKeyButton: Locator
    private readonly editKeyTTLButton: Locator
    private readonly refreshKeysButton: Locator
    private readonly refreshKeyButton: Locator
    private readonly editKeyNameButton: Locator
    private readonly editKeyValueButton: Locator
    private readonly closeKeyButton: Locator
    private readonly plusAddKeyButton: Locator
    private readonly addKeyValueItemsButton: Locator
    private readonly saveHashFieldButton: Locator
    private readonly saveMemberButton: Locator
    private readonly searchButtonInKeyDetails: Locator
    private readonly addKeyButton: Locator
    private readonly keyTypeDropDown: Locator
    private readonly confirmRemoveHashFieldButton: Locator
    private readonly removeSetMemberButton: Locator
    private readonly removeHashFieldButton: Locator
    private readonly removeZsetMemberButton: Locator
    private readonly confirmRemoveSetMemberButton: Locator
    private readonly confirmRemoveZSetMemberButton: Locator
    private readonly saveElementButton: Locator
    private readonly removeElementFromListIconButton: Locator
    private readonly removeElementFromListButton: Locator
    private readonly confirmRemoveListElementButton: Locator
    private readonly removeElementFromListSelect: Locator
    private readonly addJsonObjectButton: Locator
    private readonly addJsonFieldButton: Locator
    private readonly expandJsonObject: Locator
    private readonly scoreButton: Locator
    private readonly sortingButton: Locator
    private readonly editJsonObjectButton: Locator
    private readonly applyEditButton: Locator
    private readonly cancelEditButton: Locator
    private readonly scanMoreButton: Locator
    private readonly resizeBtnKeyList: Locator
    private readonly treeViewButton: Locator
    private readonly browserViewButton: Locator
    private readonly searchButton: Locator
    private readonly clearFilterButton: Locator
    private readonly fullScreenModeButton: Locator
    private readonly closeRightPanel: Locator
    private readonly addNewStreamEntry: Locator
    private readonly removeEntryButton: Locator
    private readonly confirmRemoveEntryButton: Locator
    private readonly clearStreamEntryInputs: Locator
    private readonly saveGroupsButton: Locator
    private readonly acknowledgeButton: Locator
    private readonly confirmAcknowledgeButton: Locator
    private readonly claimPendingMessageButton: Locator
    private readonly submitButton: Locator
    private readonly consumerDestinationSelect: Locator
    private readonly removeConsumerButton: Locator
    private readonly removeConsumerGroupButton: Locator
    private readonly optionalParametersSwitcher: Locator
    private readonly forceClaimCheckbox: Locator
    private readonly editStreamLastIdButton: Locator
    private readonly saveButton: Locator
    private readonly bulkActionsButton: Locator
    private readonly editHashButton: Locator
    private readonly editHashFieldTtlButton: Locator
    private readonly editZsetButton: Locator
    private readonly editListButton: Locator
    private readonly cancelStreamGroupBtn: Locator
    private readonly patternModeBtn: Locator
    private readonly redisearchModeBtn: Locator
    private readonly showFilterHistoryBtn: Locator
    private readonly clearFilterHistoryBtn: Locator
    private readonly loadSampleDataBtn: Locator
    private readonly executeBulkKeyLoadBtn: Locator
    private readonly backToBrowserBtn: Locator
    private readonly loadAllBtn: Locator
    private readonly downloadAllValueBtn: Locator
    private readonly openTutorialsBtn: Locator
    private readonly keyItem: Locator
    private readonly columnsBtn: Locator

    // CONTAINERS
    private readonly streamGroupsContainer: Locator
    private readonly streamConsumersContainer: Locator
    private readonly breadcrumbsContainer: Locator
    private readonly virtualTableContainer: Locator
    private readonly streamEntriesContainer: Locator
    private readonly streamMessagesContainer: Locator
    private readonly loader: Locator
    private readonly newIndexPanel: Locator

    // LINKS
    private readonly internalLinkToWorkbench: Locator
    private readonly userSurveyLink: Locator
    private readonly redisearchFreeLink: Locator
    private readonly guideLinksBtn: Locator

    // OPTION ELEMENTS
    private readonly stringOption: Locator
    private readonly jsonOption: Locator
    private readonly setOption: Locator
    private readonly zsetOption: Locator
    private readonly listOption: Locator
    private readonly hashOption: Locator
    private readonly streamOption: Locator
    private readonly removeFromHeadSelection: Locator
    private readonly filterOptionType: Locator
    private readonly filterByKeyTypeDropDown: Locator
    private readonly filterAllKeyType: Locator
    private readonly consumerOption: Locator
    private readonly claimTimeOptionSelect: Locator
    private readonly relativeTimeOption: Locator
    private readonly timestampOption: Locator
    private readonly formatSwitcher: Locator
    private readonly formatSwitcherIcon: Locator
    private readonly refreshIndexButton: Locator
    private readonly selectIndexDdn: Locator
    private readonly createIndexBtn: Locator
    private readonly cancelIndexCreationBtn: Locator
    private readonly confirmIndexCreationBtn: Locator
    private readonly resizeTrigger: Locator
    private readonly filterHistoryOption: Locator
    private readonly filterHistoryItemText: Locator

    // TABS
    private readonly streamTabGroups: Locator
    private readonly streamTabConsumers: Locator
    private readonly streamTabs: Locator

    // TEXT INPUTS
    private readonly addKeyNameInput: Locator
    private readonly keyNameInput: Locator
    private readonly keyTTLInput: Locator
    private readonly editKeyTTLInput: Locator
    private readonly ttlText: Locator
    private readonly hashFieldValueInput: Locator
    private readonly hashFieldNameInput: Locator
    private readonly hashFieldValueEditor: Locator
    private readonly hashTtlFieldInput: Locator
    private readonly listKeyElementEditorInput: Locator
    private readonly stringKeyValueInput: Locator
    private readonly jsonKeyValueInput: Locator
    private readonly jsonUploadInput: Locator
    private readonly setMemberInput: Locator
    private readonly zsetMemberScoreInput: Locator
    private readonly filterByPatterSearchInput: Locator

    // TEXT ELEMENTS
    private readonly keySizeDetails: Locator
    private readonly keyLengthDetails: Locator
    private readonly keyNameInTheList: Locator
    private readonly hashFieldsList: Locator
    private readonly hashValuesList: Locator
    private readonly hashField: Locator
    private readonly hashFieldValue: Locator
    private readonly setMembersList: Locator
    private readonly zsetMembersList: Locator
    private readonly zsetScoresList: Locator
    private readonly listElementsList: Locator
    private readonly jsonKeyValue: Locator
    private readonly jsonError: Locator
    private readonly tooltip: Locator
    private readonly dialog: Locator
    private readonly noResultsFound: Locator
    private readonly noResultsFoundOnly: Locator
    private readonly searchAdvices: Locator
    private readonly keysNumberOfResults: Locator
    private readonly scannedValue: Locator
    private readonly totalKeysNumber: Locator
    private readonly keyDetailsBadge: Locator
    private readonly modulesTypeDetails: Locator
    private readonly filteringLabel: Locator
    private readonly keysSummary: Locator
    private readonly multiSearchArea: Locator
    private readonly keyDetailsHeader: Locator
    private readonly keyListTable: Locator
    private readonly keyListMessage: Locator
    private readonly keyDetailsTable: Locator
    private readonly keyNameFormDetails: Locator
    private readonly keyDetailsTTL: Locator
    private readonly progressLine: Locator
    private readonly progressKeyList: Locator
    private readonly jsonScalarValue: Locator
    private readonly noKeysToDisplayText: Locator
    private readonly streamEntryDate: Locator
    private readonly streamEntryIdValue: Locator
    private readonly streamFields: Locator
    private readonly streamVirtualContainer: Locator
    private readonly streamEntryFields: Locator
    private readonly confirmationMessagePopover: Locator
    private readonly streamGroupId: Locator
    private readonly streamGroupName: Locator
    private readonly streamMessage: Locator
    private readonly streamConsumerName: Locator
    private readonly consumerGroup: Locator
    private readonly entryIdInfoIcon: Locator
    private readonly entryIdError: Locator
    private readonly pendingCount: Locator
    private readonly streamRangeBar: Locator
    private readonly rangeLeftTimestamp: Locator
    private readonly rangeRightTimestamp: Locator
    private readonly jsonValue: Locator
    private readonly stringValueAsJson: Locator

    // POPUPS
    private readonly changeValueWarning: Locator

    // TABLE
    private readonly keyListItem: Locator

    // DIALOG
    private readonly noReadySearchDialogTitle: Locator

    // CHECKBOXES
    private readonly showTtlCheckbox: Locator
    private readonly showTtlColumnCheckbox: Locator
    private readonly showSizeColumnCheckbox: Locator

    // UTILITY FUNCTIONS
    private readonly getHashTtlFieldInput: (fieldName: string) => Locator
    private readonly getListElementInput: (count: number) => Locator
    private readonly getKeySize: (keyName: string) => Locator
    private readonly getKeyTTl: (keyName: string) => Locator

    constructor(page: Page) {
        super(page)
        this.page = page
        this.toast = new Toast(page)
        // this.bulkActions = new BulkActions(page)
        // this.treeView = new TreeView(page)

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
        this.cssRemoveSuggestionItem = page.locator('[data-testid^="remove-suggestion-item-"]')

        // BUTTONS
        this.applyButton = page.getByTestId('apply-btn')
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
        this.addKeyValueItemsButton = page.getByTestId('add-key-value-items-btn')
        this.saveHashFieldButton = page.getByTestId('save-fields-btn')
        this.saveMemberButton = page.getByTestId('save-members-btn')
        this.searchButtonInKeyDetails = page.getByTestId('search-button')
        this.addKeyButton = page.getByTestId('add-key-hash-btn')
        this.keyTypeDropDown = page.locator('fieldset button.euiSuperSelectControl')
        this.confirmRemoveHashFieldButton = page.locator('[data-testid^="remove-hash-button-"] span')
        this.removeSetMemberButton = page.getByTestId('set-remove-btn')
        this.removeHashFieldButton = page.getByTestId('remove-hash-button')
        this.removeZsetMemberButton = page.getByTestId('zset-remove-button')
        this.confirmRemoveSetMemberButton = page.locator('[data-testid^="set-remove-btn-"] span')
        this.confirmRemoveZSetMemberButton = page.locator('[data-testid^="zset-remove-button-"] span')
        this.saveElementButton = page.getByTestId('save-elements-btn')
        this.removeElementFromListIconButton = page.getByTestId('remove-key-value-items-btn')
        this.removeElementFromListButton = page.getByTestId('remove-elements-btn')
        this.confirmRemoveListElementButton = page.getByTestId('remove-submit')
        this.removeElementFromListSelect = page.getByTestId('destination-select')
        this.addJsonObjectButton = page.getByTestId('add-object-btn')
        this.addJsonFieldButton = page.getByTestId('add-field-btn')
        this.expandJsonObject = page.getByTestId('expand-object')
        this.scoreButton = page.getByTestId('score-button')
        this.sortingButton = page.getByTestId('header-sorting-button')
        this.editJsonObjectButton = page.getByTestId('edit-json-field')
        this.applyEditButton = page.getByTestId('apply-edit-btn')
        this.cancelEditButton = page.getByTestId('cancel-edit-btn')
        this.scanMoreButton = page.getByTestId('scan-more')
        this.resizeBtnKeyList = page.locator('[data-test-subj="resize-btn-keyList-keyDetails"]')
        this.treeViewButton = page.getByTestId('view-type-list-btn')
        this.browserViewButton = page.getByTestId('view-type-browser-btn')
        this.searchButton = page.getByTestId('search-btn')
        this.clearFilterButton = page.getByTestId('reset-filter-btn')
        this.fullScreenModeButton = page.getByTestId('toggle-full-screen')
        this.closeRightPanel = page.getByTestId('close-right-panel-btn')
        this.addNewStreamEntry = page.getByTestId('add-key-value-items-btn')
        this.removeEntryButton = page.locator('[data-testid^="remove-entry-button-"]')
        this.confirmRemoveEntryButton = page.locator('[data-testid^="remove-entry-button-"]').filter({ hasText: 'Remove' })
        this.clearStreamEntryInputs = page.getByTestId('remove-item')
        this.saveGroupsButton = page.getByTestId('save-groups-btn')
        this.acknowledgeButton = page.getByTestId('acknowledge-btn')
        this.confirmAcknowledgeButton = page.getByTestId('acknowledge-submit')
        this.claimPendingMessageButton = page.getByTestId('claim-pending-message')
        this.submitButton = page.getByTestId('btn-submit')
        this.consumerDestinationSelect = page.getByTestId('destination-select')
        this.removeConsumerButton = page.locator('[data-testid^="remove-consumer-button"]')
        this.removeConsumerGroupButton = page.locator('[data-testid^="remove-groups-button"]')
        this.optionalParametersSwitcher = page.getByTestId('optional-parameters-switcher')
        this.forceClaimCheckbox = page.getByTestId('force-claim-checkbox').locator('..')
        this.editStreamLastIdButton = page.getByTestId('stream-group_edit-btn')
        this.saveButton = page.getByTestId('save-btn')
        this.bulkActionsButton = page.getByTestId('btn-bulk-actions')
        this.editHashButton = page.locator('[data-testid^="hash_edit-btn-"]')
        this.editHashFieldTtlButton = page.locator('[data-testid^="hash-ttl_edit-btn-"]')
        this.editZsetButton = page.locator('[data-testid^="zset_edit-btn-"]')
        this.editListButton = page.locator('[data-testid^="list_edit-btn-"]')
        this.cancelStreamGroupBtn = page.getByTestId('cancel-stream-groups-btn')
        this.patternModeBtn = page.getByTestId('search-mode-pattern-btn')
        this.redisearchModeBtn = page.getByTestId('search-mode-redisearch-btn')
        this.showFilterHistoryBtn = page.getByTestId('show-suggestions-btn')
        this.clearFilterHistoryBtn = page.getByTestId('clear-history-btn')
        this.loadSampleDataBtn = page.getByTestId('load-sample-data-btn')
        this.executeBulkKeyLoadBtn = page.getByTestId('load-sample-data-btn-confirm')
        this.backToBrowserBtn = page.getByTestId('back-right-panel-btn')
        this.loadAllBtn = page.getByTestId('load-all-value-btn')
        this.downloadAllValueBtn = page.getByTestId('download-all-value-btn')
        this.openTutorialsBtn = page.getByTestId('explore-msg-btn')
        this.keyItem = page.locator('[data-testid*="node-item"][data-testid*="keys:"]')
        this.columnsBtn = page.getByTestId('btn-columns-actions')

        // CONTAINERS
        this.streamGroupsContainer = page.getByTestId('stream-groups-container')
        this.streamConsumersContainer = page.getByTestId('stream-consumers-container')
        this.breadcrumbsContainer = page.getByTestId('breadcrumbs-container')
        this.virtualTableContainer = page.getByTestId('virtual-table-container')
        this.streamEntriesContainer = page.getByTestId('stream-entries-container')
        this.streamMessagesContainer = page.getByTestId('stream-messages-container')
        this.loader = page.getByTestId('type-loading')
        this.newIndexPanel = page.getByTestId('create-index-panel')

        // LINKS
        this.internalLinkToWorkbench = page.getByTestId('internal-workbench-link')
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
        this.filterOptionType = page.locator('[data-test-subj^="filter-option-type-"]')
        this.filterByKeyTypeDropDown = page.getByTestId('select-filter-key-type')
        this.filterAllKeyType = page.locator('#all')
        this.consumerOption = page.getByTestId('consumer-option')
        this.claimTimeOptionSelect = page.getByTestId('time-option-select')
        this.relativeTimeOption = page.locator('#idle')
        this.timestampOption = page.locator('#time')
        this.formatSwitcher = page.getByTestId('select-format-key-value')
        this.formatSwitcherIcon = page.locator('[data-testid^="key-value-formatter-option-selected"]')
        this.refreshIndexButton = page.getByTestId('refresh-indexes-btn')
        this.selectIndexDdn = page.locator('[data-testid="select-index-placeholder"],[data-testid="select-search-mode"]')
        this.createIndexBtn = page.getByTestId('create-index-btn')
        this.cancelIndexCreationBtn = page.getByTestId('create-index-cancel-btn')
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
        this.jsonKeyValueInput = page.locator('[data-mode-id="json"]')
        this.jsonUploadInput = page.getByTestId('upload-input-file')
        this.setMemberInput = page.getByTestId('member-name')
        this.zsetMemberScoreInput = page.getByTestId('member-score')
        this.filterByPatterSearchInput = page.getByTestId('search-key')
        // this.hashFieldInput = page.getByTestId('hash-field')
        // this.hashValueInput = page.getByTestId('hash-value')
        // this.searchInput = page.getByTestId('search')
        // this.jsonKeyInput = page.getByTestId('json-key')
        // this.jsonValueInput = page.getByTestId('json-value')
        // this.countInput = page.getByTestId('count-input')
        // this.streamEntryId = page.getByTestId('entryId')
        // this.streamField = page.getByTestId('field-name')
        // this.streamValue = page.getByTestId('field-value')
        // this.addAdditionalElement = page.getByTestId('add-item')
        // this.streamFieldsValues = page.getByTestId('stream-entry-field-')
        // this.streamEntryIDDateValue = page.locator('[data-testid^="stream-entry-"][data-testid$="date"]')
        // this.groupNameInput = page.getByTestId('group-name-field')
        // this.consumerIdInput = page.getByTestId('id-field')
        // this.streamMinIdleTimeInput = page.getByTestId('min-idle-time')
        // this.claimIdleTimeInput = page.getByTestId('time-count')
        // this.claimRetryCountInput = page.getByTestId('retry-count')
        // this.lastIdInput = page.getByTestId('last-id-field')
        // this.inlineItemEditor = page.getByTestId('inline-item-editor')
        // this.indexNameInput = page.getByTestId('index-name')
        // this.prefixFieldInput = page.locator('[data-test-subj="comboBoxInput"]')
        // this.indexIdentifierInput = page.getByTestId('identifier-')

        // TEXT ELEMENTS
        this.keySizeDetails = page.getByTestId('key-size-text')
        this.keyLengthDetails = page.getByTestId('key-length-text')
        this.keyNameInTheList = this.cssSelectorKey
        this.hashFieldsList = page.getByTestId('hash-field-').locator('span')
        this.hashValuesList = page.getByTestId('hash_content-value-').locator('span')
        this.hashField = page.getByTestId('hash-field-').first()
        this.hashFieldValue = page.getByTestId('hash_content-value-')
        this.setMembersList = page.getByTestId('set-member-value-')
        this.zsetMembersList = page.getByTestId('zset-member-value-')
        this.zsetScoresList = page.getByTestId('zset_content-value-')
        this.listElementsList = page.getByTestId('list_content-value-')
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
        this.keyDetailsBadge = page.locator('.key-details-header .euiBadge__text')
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
        this.streamEntryDate = page.locator('[data-testid*="-date"][data-testid*="stream-entry"]')
        this.streamEntryIdValue = page.locator('.streamItemId[data-testid*="stream-entry"]')
        this.streamFields = page.locator('[data-test-subj="stream-entries-container"] .truncateText')
        this.streamVirtualContainer = page.locator('[data-testid="virtual-grid-container"] div div').first()
        this.streamEntryFields = page.getByTestId('stream-entry-field')
        this.confirmationMessagePopover = page.locator('div.euiPopover__panel .euiText')
        this.streamGroupId = page.locator('.streamItemId[data-testid^="stream-group-id"]').first()
        this.streamGroupName = page.getByTestId('stream-group-name')
        this.streamMessage = page.locator('[data-testid*="-date"][data-testid^="stream-message"]')
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
        this.showSizeColumnCheckbox = page.getByTestId('show-key-size').locator('..')

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
        await this.addKeyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        if (TTL !== undefined) {
            await this.keyTTLInput.click()
            await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        }
        await this.keyTypeDropDown.click()
    }

    async addStringKey(keyName: string, value = ' ', TTL?: string): Promise<void> {
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.stringOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        if (TTL !== undefined) {
            await this.keyTTLInput.click()
            await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        }
        await this.stringKeyValueInput.click()
        await this.stringKeyValueInput.fill(value, { timeout: 0, noWaitAfter: false })
        await this.addKeyButton.click()
    }

    async addJsonKey(keyName: string, value: string, TTL?: string): Promise<void> {
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.jsonOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        await this.jsonKeyValueInput.click()
        await this.jsonKeyValueInput.fill(value, { timeout: 0, noWaitAfter: false })
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
        await this.addKeyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        await this.setMemberInput.fill(members, { timeout: 0, noWaitAfter: false })
        await this.addKeyButton.click()
    }

    async addZSetKey(keyName: string, scores = ' ', TTL = ' ', members = ' '): Promise<void> {
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.zsetOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        await this.setMemberInput.fill(members, { timeout: 0, noWaitAfter: false })
        await this.zsetMemberScoreInput.fill(scores, { timeout: 0, noWaitAfter: false })
        await this.addKeyButton.click()
    }

    async addListKey(keyName: string, TTL = ' ', element: string[] = [' '], position: AddElementInList = AddElementInList.Tail): Promise<void> {
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.listOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        if (position === AddElementInList.Head) {
            await this.removeElementFromListSelect.click()
            await this.removeFromHeadSelection.click()
            await expect(this.removeFromHeadSelection).not.toBeVisible()
        }
        for (let i = 0; i < element.length; i++) {
            await this.getListElementInput(i).click()
            await this.getListElementInput(i).fill(element[i], { timeout: 0, noWaitAfter: false })
            if (element.length > 1 && i < element.length - 1) {
                await this.addAdditionalElement.click()
            }
        }
        await this.addKeyButton.click()
    }

    async addHashKey(keyName: string, TTL = ' ', field = ' ', value = ' ', fieldTtl = ''): Promise<void> {
        if (await this.toast.isCloseButtonVisible()) {
            await this.toast.closeToast()
        }
        await this.waitForLocatorNotVisible(this.progressLine)
        await this.waitForLocatorNotVisible(this.loader)
        await this.plusAddKeyButton.click()
        await this.keyTypeDropDown.click()
        await this.hashOption.click()
        await this.addKeyNameInput.click()
        await this.addKeyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        await this.keyTTLInput.click()
        await this.keyTTLInput.fill(TTL, { timeout: 0, noWaitAfter: false })
        await this.hashFieldNameInput.fill(field, { timeout: 0, noWaitAfter: false })
        await this.hashFieldValueInput.fill(value, { timeout: 0, noWaitAfter: false })
        if (fieldTtl !== '') {
            await this.hashTtlFieldInput.fill(fieldTtl, { timeout: 0, noWaitAfter: false })
        }
        await this.addKeyButton.click()
    }

    async addStreamKey(keyName: string, field: string, value: string, TTL?: string): Promise<void> {
        await this.commonAddNewKey(keyName, TTL)
        await this.streamOption.click()
        await expect(this.streamEntryId).toHaveValue('*', { timeout: 5000 })
        await this.streamField.fill(field, { timeout: 0, noWaitAfter: false })
        await this.streamValue.fill(value, { timeout: 0, noWaitAfter: false })
        await expect(this.addKeyButton).not.toBeDisabled()
        await this.addKeyButton.click()
        await this.toast.closeToast()
    }

    async addEntryToStream(field: string, value: string, entryId?: string): Promise<void> {
        await this.addNewStreamEntry.click()
        await this.streamField.fill(field, { timeout: 0, noWaitAfter: false })
        await this.streamValue.fill(value, { timeout: 0, noWaitAfter: false })
        if (entryId !== undefined) {
            await this.streamEntryId.fill(entryId, { timeout: 0, noWaitAfter: false })
        }
        await this.saveElementButton.click()
        await expect(this.streamEntriesContainer).toContainText(field)
        await expect(this.streamEntriesContainer).toContainText(value)
    }

    async fulfillSeveralStreamFields(fields: string[], values: string[], entryId?: string): Promise<void> {
        for (let i = 0; i < fields.length; i++) {
            await this.streamField.nth(-1).fill(fields[i], { timeout: 0, noWaitAfter: false })
            await this.streamValue.nth(-1).fill(values[i], { timeout: 0, noWaitAfter: false })
            if (i < fields.length - 1) {
                await this.addAdditionalElement.click()
            }
        }
        if (entryId !== undefined) {
            await this.streamEntryId.fill(entryId, { timeout: 0, noWaitAfter: false })
        }
    }

    async selectFilterGroupType(groupName: string): Promise<void> {
        await this.filterByKeyTypeDropDown.click()
        await this.filterOptionType.withText(groupName).click()
    }

    async setAllKeyType(): Promise<void> {
        await this.filterByKeyTypeDropDown.click()
        await this.filterAllKeyType.click()
    }

    async searchByKeyName(keyName: string): Promise<void> {
        await this.filterByPatterSearchInput.click()
        await this.filterByPatterSearchInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        await this.page.keyboard.press('Enter')
    }

    getKeySelectorByName(keyName: string): Locator {
        return this.page.locator(`[data-testid="key-${keyName}"]`)
    }

    async isKeyIsDisplayedInTheList(keyName: string): Promise<boolean> {
        const keyNameInTheList = this.getKeySelectorByName(keyName)
        await this.waitForLocatorNotVisible(this.loader)
        return await keyNameInTheList.isVisible()
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
        await this.page.locator(`[data-testid="delete-key-btn-${keyName}"]`).click()
        await this.submitDeleteKeyButton.click()
    }

    async editKeyName(keyName: string): Promise<void> {
        await this.editKeyNameButton.click()
        await this.keyNameInput.fill(keyName, { timeout: 0, noWaitAfter: false })
        await this.EditorButton.applyBtn.click()
    }

    async editStringKeyValue(value: string): Promise<void> {
        await this.stringKeyValueInput.click()
        await this.stringKeyValueInput.fill(value, { timeout: 0, noWaitAfter: false })
        await this.EditorButton.applyBtn.click()
    }

    async getStringKeyValue(): Promise<string> {
        return await this.stringKeyValueInput.textContent()
    }

    async getZsetKeyScore(): Promise<string> {
        return await this.zsetScoresList.textContent()
    }

    async addFieldToHash(keyFieldValue: string, keyValue: string, fieldTtl = ''): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.addKeyValueItemsButton.click()
        await this.hashFieldInput.fill(keyFieldValue, { timeout: 0, noWaitAfter: false })
        await this.hashValueInput.fill(keyValue, { timeout: 0, noWaitAfter: false })
        if (fieldTtl !== '') {
            await this.hashTtlFieldInput.fill(fieldTtl, { timeout: 0, noWaitAfter: false })
        }
        await this.saveHashFieldButton.click()
    }

    async editHashKeyValue(value: string): Promise<void> {
        await this.hashFieldValue.hover()
        await this.editHashButton.click()
        await this.hashFieldValueEditor.fill(value, { timeout: 0, noWaitAfter: false })
        await this.EditorButton.applyBtn.click()
    }

    async editHashFieldTtlValue(fieldName: string, fieldTtl: string): Promise<void> {
        await this.getHashTtlFieldInput(fieldName).hover()
        await this.editHashFieldTtlButton.click()
        await this.inlineItemEditor.fill(fieldTtl, { timeout: 0, noWaitAfter: false })
        await this.applyButton.click()
    }

    async getHashKeyValue(): Promise<string> {
        return await this.hashFieldValue.textContent()
    }

    async editListKeyValue(value: string): Promise<void> {
        await this.listElementsList.hover()
        await this.editListButton.click()
        await this.listKeyElementEditorInput.fill(value, { timeout: 0, noWaitAfter: false })
        await this.EditorButton.applyBtn.click()
    }

    async getListKeyValue(): Promise<string> {
        return await this.listElementsList.textContent()
    }

    async getJsonKeyValue(): Promise<string> {
        return await this.jsonKeyValue.textContent()
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
        await this.setMemberInput.fill(keyMember, { timeout: 0, noWaitAfter: false })
        await this.saveMemberButton.click()
    }

    async addMemberToZSet(keyMember: string, score: string): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.addKeyValueItemsButton.click()
        await this.setMemberInput.fill(keyMember, { timeout: 0, noWaitAfter: false })
        await this.zsetMemberScoreInput.fill(score, { timeout: 0, noWaitAfter: false })
        await this.saveMemberButton.click()
    }

    async openKeyDetails(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName)
        await this.keyNameInTheList.click()
    }

    async openKeyDetailsByKeyName(keyName: string): Promise<void> {
        const keyNameInTheList = this.page.locator(`[data-testid="key-${keyName}"]`)
        await keyNameInTheList.click()
    }

    async addElementToList(element: string[], position: AddElementInList = AddElementInList.Tail): Promise<void> {
        if (await this.toast.toastCloseButton.isVisible()) {
            await this.toast.toastCloseButton.click()
        }
        await this.addKeyValueItemsButton.click()
        if (position === AddElementInList.Head) {
            await this.removeElementFromListSelect.click()
            await this.removeFromHeadSelection.click()
            await expect(this.removeFromHeadSelection).not.toBeVisible()
        }
        for (let i = 0; i < element.length; i++) {
            await this.getListElementInput(i).click()
            await this.getListElementInput(i).fill(element[i], { timeout: 0, noWaitAfter: false })
            if (element.length > 1 && i < element.length - 1) {
                await this.addAdditionalElement.click()
            }
        }
        await this.addKeyButton.click()
    }

    async removeListElementFromHeadOld(): Promise<void> {
        await this.removeElementFromListIconButton.click()
        await expect(await this.countInput.getAttribute('disabled')).toBeTruthy()
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

    async addJsonKeyOnTheSameLevel(jsonKey: string, jsonKeyValue: string): Promise<void> {
        await this.addJsonObjectButton.click()
        await this.jsonKeyInput.fill(jsonKey, { timeout: 0, noWaitAfter: false })
        await this.jsonValueInput.fill(jsonKeyValue, { timeout: 0, noWaitAfter: false })
        await this.EditorButton.applyBtn.click()
    }

    async addJsonKeyInsideStructure(jsonKey: string, jsonKeyValue: string): Promise<void> {
        await this.expandJsonObject.click()
        await this.addJsonFieldButton.click()
        await this.jsonKeyInput.fill(jsonKey, { timeout: 0, noWaitAfter: false })
        await this.jsonValueInput.fill(jsonKeyValue, { timeout: 0, noWaitAfter: false })
        await this.EditorButton.applyBtn.click()
    }

    async addJsonValueInsideStructure(jsonKeyValue: string): Promise<void> {
        await this.expandJsonObject.click()
        await this.addJsonFieldButton.click()
        await this.jsonValueInput.fill(jsonKeyValue, { timeout: 0, noWaitAfter: false })
        await this.applyButton.click()
    }

    async addJsonStructure(jsonStructure: string): Promise<void> {
        if (await this.expandJsonObject.isVisible()) {
            await this.expandJsonObject.click()
        }
        await this.editJsonObjectButton.click()
        await this.jsonValueInput.fill(jsonStructure, { timeout: 0, noWaitAfter: false })
        await this.applyEditButton.click()
    }

    async deleteStreamEntry(): Promise<void> {
        await this.removeEntryButton.click()
        await this.confirmRemoveEntryButton.click()
    }

    async getKeyLength(): Promise<string> {
        const rawValue = await this.keyLengthDetails.textContent()
        const parts = rawValue.split(' ')
        return parts[parts.length - 1]
    }

    async createConsumerGroup(groupName: string, id?: string): Promise<void> {
        await this.addKeyValueItemsButton.click()
        await this.groupNameInput.fill(groupName, { timeout: 0, noWaitAfter: false })
        if (id !== undefined) {
            await this.consumerIdInput.fill(id, { timeout: 0, noWaitAfter: false })
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
        const option = this.page.locator(`[data-test-subj="format-option-${formatter}"]`)
        await this.formatSwitcher.click()
        await option.click()
    }

    async verifyScannningMore(): Promise<void> {
        for (let i = 10; i < 100; i += 10) {
            const rememberedScanResults = Number((await this.keysNumberOfResults.textContent()).replace(/\s/g, ''))
            await expect(this.progressKeyList).not.toBeVisible({ timeout: 30000 })
            const scannedValueText = await this.scannedValue.textContent()
            const regExp = new RegExp(`${i} ...`)
            await expect(scannedValueText).toMatch(regExp)
            await this.scanMoreButton.click()
            const scannedResults = Number((await this.keysNumberOfResults.textContent()).replace(/\s/g, ''))
            await expect(scannedResults).toBeGreaterThan(rememberedScanResults)
        }
    }

    async selectIndexByName(index: string): Promise<void> {
        const option = this.page.locator(`[data-test-subj="mode-option-type-${index}"]`)
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
        const linkGuide = this.page.locator('[data-testid^="guide-button-"]').withText(guide)
        await linkGuide.click()
    }
}
