import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { PageNames } from 'uiSrc/constants'

const PipelineStatisticsPage = () => {
  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setLastPageContext(PageNames.rdiPipelineStatistics))
  })

  return (
    <div>Statistics Page</div>
  )
}

export default PipelineStatisticsPage
