import React from 'react'
import { EuiText, EuiSpacer } from '@elastic/eui'

export const NoResultsFoundText = (<EuiText size="m">No results found.</EuiText>)
export const NoKeysToDisplayText = (<EuiText size="m">No keys to display.</EuiText>)
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
    <EuiText size="m">No results found.</EuiText>
    <br />
    <EuiText size="s">
      Use &quot;Scan more&quot; button to proceed or filter per exact Key Name to scan more efficiently.
    </EuiText>
  </>
)
