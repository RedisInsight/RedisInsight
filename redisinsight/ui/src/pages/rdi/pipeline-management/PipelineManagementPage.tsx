import React, { useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { fetchRdiPipeline, fetchRdiPipelineSchema, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import RdiPipelinePageTemplate from 'uiSrc/templates/rdi-pipeline-page-template'
import {
  appContextPipelineManagement,
  setLastPageContext,
  setLastPipelineManagementPage,
} from 'uiSrc/slices/app/context'

import { formatLongName, setTitle } from 'uiSrc/utils'
import PipelinePageRouter from './PipelineManagementPageRouter'

export interface Props {
  routes: IRoute[]
}

const PipelineManagementPage = ({ routes = [] }: Props) => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastViewedPage } = useSelector(appContextPipelineManagement)
  const { name: connectedRdiInstanceName } = useSelector(connectedInstanceSelector)
  const { data: pipelineData } = useSelector(rdiPipelineSelector)

  const pathnameRef = useRef<string>('')

  const history = useHistory()
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(`${rdiInstanceName} - Pipeline Management`)

  useEffect(() => {
    if (!pipelineData) {
      dispatch(fetchRdiPipeline(rdiInstanceId))
    }

    dispatch(fetchRdiPipelineSchema(rdiInstanceId))
  }, [])

  useEffect(() => () => {
    dispatch(setLastPageContext(PageNames.rdiPipelineManagement))
    dispatch(setLastPipelineManagementPage(pathnameRef.current))
  }, [])

  useEffect(() => {
    if (pathname === Pages.rdiPipelineManagement(rdiInstanceId)) {
      if (pathnameRef.current && pathnameRef.current !== lastViewedPage) {
        history.push(pathnameRef.current)
        return
      }

      // restore from context
      if (lastViewedPage) {
        history.push(lastViewedPage)
        return
      }

      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
    }

    pathnameRef.current = pathname === Pages.rdiPipelineManagement(rdiInstanceId) ? '' : pathname
  }, [pathname, lastViewedPage])

  return (
    <RdiPipelinePageTemplate>
      <PipelinePageRouter routes={routes} />
    </RdiPipelinePageTemplate>
  )
}

export default PipelineManagementPage
