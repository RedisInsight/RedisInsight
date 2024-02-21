import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { PageNames } from 'uiSrc/constants'
import { formatLongName, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'

const PipelineStatisticsPage = () => {
  const { name: connectedRdiInstanceName } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setLastPageContext(PageNames.rdiPipelineStatistics))
  })
  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(`${rdiInstanceName} - Pipeline Statistics`)

  return (
    <div>Statistics Page</div>
  )
}

export default PipelineStatisticsPage
