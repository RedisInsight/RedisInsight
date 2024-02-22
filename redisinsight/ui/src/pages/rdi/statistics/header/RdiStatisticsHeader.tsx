import {
  EuiButton
} from '@elastic/eui'
import React from 'react'
import { useSelector } from 'react-redux'

import LightBulbIcon from 'uiSrc/assets/img/rdi/light_bulb.svg'
import Header from 'uiSrc/pages/rdi/components/header'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'

const RdiStatisticsHeader = () => {
  const { loading } = useSelector(rdiPipelineSelector)

  return (
    <Header
      actions={(
        <EuiButton
          fill
          size="s"
          color="secondary"
          onClick={() => {}}
          iconType={LightBulbIcon}
          disabled={loading}
          isLoading={loading}
          data-testid="rdi-insights-btn"
        >
          Insights
        </EuiButton>
      )}
    />
  )
}

export default RdiStatisticsHeader
