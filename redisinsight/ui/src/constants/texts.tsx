import React from 'react'
import { EuiText, EuiSpacer } from '@elastic/eui'

export const NoResultsFoundText = (
  <EuiText
    size="m"
    data-testid="no-result-found-only"
  >
    No results found.
  </EuiText>
)
export const NoSelectedIndexText = (
  <EuiText size="m" data-testid="no-result-select-index">
    Select an index and enter a query to search per values of keys.
  </EuiText>
)

export const FullScanNoResultsFoundText = (
  <>
    <EuiText size="m" data-test-subj="no-result-found">No results found.</EuiText>
    <EuiSpacer size="m" />
    <EuiText size="s" data-test-subj="search-advices">
      Check the spelling.
      <br />
      Check upper and lower cases.
      <br />
      Use an asterisk (*) in your request for more generic results.
    </EuiText>
  </>
)
export const ScanNoResultsFoundText = (
  <>
    <EuiText size="m" data-testid="scan-no-results-found">No results found.</EuiText>
    <br />
    <EuiText size="s">
      Use &quot;Scan more&quot; button to proceed or filter per exact Key Name to scan more efficiently.
    </EuiText>
  </>
)

export const lastDeliveredIDTooltipText = (
  <>
    Specify the ID of the last delivered entry in the stream from the new group's perspective.
    <EuiSpacer size="xs" />
    Otherwise, <b>$</b> represents the ID of the last entry in the stream,&nbsp;
    <b>0</b> fetches the entire stream from the beginning.
  </>
)
