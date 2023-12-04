import React, { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { fetchRdiPipeline } from 'uiSrc/slices/rdi/pipeline'

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
    dispatch(fetchRdiPipeline(rdiInstanceId))
  }, [])

  return (
    <div className={styles.wrapper}>
      <Navigation path={path} />
      <PipelinePageRouter routes={routes} />
    </div>
  )
}

export default Pipeline
