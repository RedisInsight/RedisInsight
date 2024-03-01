import React from 'react'

import InsightsTrigger from 'uiSrc/components/insights-trigger'
import Header from 'uiSrc/pages/rdi/components/header'

const RdiStatisticsHeader = () => <Header actions={<InsightsTrigger source="statistics page" />} />

export default RdiStatisticsHeader
