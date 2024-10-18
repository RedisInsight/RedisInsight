import React from 'react'
import { EuiLink, EuiTextColor } from '@elastic/eui'
import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

export interface Props {
  onClick: () => void
}

const UseProfilerLink = ({ onClick }: Props) => (
  <FeatureFlagComponent
    name={FeatureFlags.envDependent}
    otherwise={<EuiTextColor color="accent">Monitor not supported in this environment.</EuiTextColor>}
  >
    <EuiTextColor color="danger" key={Date.now()}>
      {'Use '}
      <EuiLink onClick={onClick} className="btnLikeLink" color="text" data-test-subj="monitor-btn">
        Profiler
      </EuiLink>
      {' tool to see all the requests processed by the server.'}
    </EuiTextColor>
  </FeatureFlagComponent>
)

export default UseProfilerLink
