import React, { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { fetchConnectedInstanceAction } from 'uiSrc/slices/rdi/instances'
import { fetchRdiPipeline } from 'uiSrc/slices/rdi/pipeline'
import RdiPipelinePageTemplate from 'uiSrc/templates/rdi-pipeline-page-template'

import Navigation from './components/navigation'
import PipelinePageRouter from './PipelinePageRouter'
import styles from './styles.module.scss'

export interface Props {
  routes: any[]
}

const Pipeline = ({ routes = [] }: Props) => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const { pathname } = useLocation()
  const dispatch = useDispatch()

  const path = pathname?.split('/').pop() || ''

  useEffect(() => {
    dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    dispatch(fetchRdiPipeline(rdiInstanceId))
  }, [])

  return (
    <RdiPipelinePageTemplate>
      <div className={styles.wrapper}>
        <Navigation path={path} />
        <PipelinePageRouter routes={routes} />
      </div>
    </RdiPipelinePageTemplate>
  )
}

export default Pipeline
