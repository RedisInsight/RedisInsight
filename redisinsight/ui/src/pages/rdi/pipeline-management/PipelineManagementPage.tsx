import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { IRoute, PageNames } from 'uiSrc/constants'
import {connectedInstanceSelector} from 'uiSrc/slices/rdi/instances'
import { fetchRdiPipeline } from 'uiSrc/slices/rdi/pipeline'
import RdiPipelinePageTemplate from 'uiSrc/templates/rdi-pipeline-page-template'
import { appContextPipelineManagement, setLastPageContext } from 'uiSrc/slices/app/context'

import { formatLongName, setTitle } from 'uiSrc/utils'
import PipelinePageRouter from './PipelineManagementPageRouter'

export interface Props {
  routes: IRoute[]
}

const PipelineManagementPage = ({ routes = [] }: Props) => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastViewedPage } = useSelector(appContextPipelineManagement)
  const { name: connectedInstanceName } = useSelector(connectedInstanceSelector)

  const history = useHistory()
  const dispatch = useDispatch()

  const rdiInstanceName = formatLongName(connectedInstanceName, 33, 0, '...')
  setTitle(`${rdiInstanceName} - Pipeline Management`)

  useEffect(() => {
    dispatch(fetchRdiPipeline(rdiInstanceId))
  }, [])

  useEffect(() => () => {
    dispatch(setLastPageContext(PageNames.rdiPipelineManagement))
  })

  return (
    <RdiPipelinePageTemplate>
      <PipelinePageRouter routes={routes} />
    </RdiPipelinePageTemplate>
  )
}

export default PipelineManagementPage
