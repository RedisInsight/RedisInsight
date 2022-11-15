import React from 'react'
import { EuiText, EuiSpacer, EuiLink } from '@elastic/eui'

import { getRouterLinkProps } from 'uiSrc/services'

export const NoResultsFoundText = (<EuiText size="m">No results found.</EuiText>)
export const NoSelectedIndexText = (<EuiText size="m">Select an index and enter a query to search per values of keys.</EuiText>)
export const NoKeysToDisplayText = (path: string, onClick: ()=> void) => (
  <EuiText size="m" data-testid="no-result-found-msg">
    No keys to display.
    <br />
    <EuiLink
      {...getRouterLinkProps(path, onClick)}
      color="text"
      data-test-subj="workbench-page-btn"
    >
      Use Workbench Guides and Tutorials
    </EuiLink>
    {' to quickly load the data.'}
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
    <EuiText size="m">No results found.</EuiText>
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
