import { EuiSpacer, EuiTitle } from '@elastic/eui'
import React from 'react'

export const CHECK_CLOUD_DATABASE = (
  <>
    <EuiTitle size="xxs"><span>Check your Cloud database</span></EuiTitle>
    <EuiSpacer size="s" />
    <div>
      Free Cloud databases are usually deleted after 15 days of inactivity.
      <EuiSpacer size="s" />
      Check your Cloud database to proceed with learning more about Redis and its capabilities.
    </div>
  </>
)

export const WARNING_WITH_CAPABILITY = (capability: string) => (
  <>
    <EuiTitle size="xxs"><span>{capability}</span></EuiTitle>
    <EuiSpacer size="s" />
    <div>
      Hey, remember you expressed interest in {capability}?
      <br />
      Try your Cloud database to get started.
    </div>
    <EuiSpacer size="s" />
    <div><b>Notice</b>: free Cloud databases will be deleted after 15 days of inactivity.</div>
  </>
)
export const WARNING_WITHOUT_CAPABILITY = (
  <>
    <EuiTitle size="xxs"><span>Try your Cloud database</span></EuiTitle>
    <EuiSpacer size="s" />
    <div>Hey, try your Cloud database to learn more about Redis.</div>
    <EuiSpacer size="s" />
    <div><b>Notice</b>: free Cloud databases will be deleted after 15 days of inactivity.</div>
  </>
)
