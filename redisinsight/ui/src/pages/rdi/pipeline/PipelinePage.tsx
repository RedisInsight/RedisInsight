import React, { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { fetchConnectedInstanceAction } from 'uiSrc/slices/rdi/instances'
import { fetchRdiPipeline } from 'uiSrc/slices/rdi/pipeline'
import RdiPipelinePageTemplate from 'uiSrc/templates/rdi-pipeline-page-template'

import PipelinePageRouter from './PipelinePageRouter'

export interface Props {
  routes: any[]
}

const Pipeline = ({ routes = [] }: Props) => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    dispatch(fetchRdiPipeline(rdiInstanceId))
  }, [])

  return (
    <RdiPipelinePageTemplate>
      <PipelinePageRouter routes={routes} />
    </RdiPipelinePageTemplate>
  )
}

export default Pipeline
