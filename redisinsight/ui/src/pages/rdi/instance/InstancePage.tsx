import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import {
  appContextSelector,
  resetDatabaseContext,
  resetRdiContext,
  setAppContextConnectedRdiInstanceId,
} from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import {
  fetchConnectedInstanceAction,
  fetchInstancesAction as fetchRdiInstancesAction,
  instancesSelector as rdiInstancesSelector
} from 'uiSrc/slices/rdi/instances'
import {
  resetConnectedInstance as resetConnectedDatabaseInstance,
  fetchInstancesAction,
  instancesSelector as dbInstancesSelector
} from 'uiSrc/slices/instances/instances'

import { RdiInstancePageTemplate } from 'uiSrc/templates'
import { RdiInstanceHeader } from 'uiSrc/components'
import InstancePageRouter from './InstancePageRouter'
import { RdiPipelineHeader } from './components'
import styles from './styles.module.scss'

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage, contextRdiInstanceId } = useSelector(appContextSelector)
  const { data: rdiInstances } = useSelector(rdiInstancesSelector)
  const { data: dbInstances } = useSelector(dbInstancesSelector)

  useEffect(() => {
    if (!dbInstances?.length) {
      dispatch(fetchInstancesAction())
    }
    if (!rdiInstances?.length) {
      dispatch(fetchRdiInstancesAction())
    }
  }, [])

  useEffect(() => {
    if (!contextRdiInstanceId || contextRdiInstanceId !== rdiInstanceId) {
      dispatch(resetRdiContext())
      dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    }
    dispatch(setAppContextConnectedRdiInstanceId(rdiInstanceId))

    // clear database context
    dispatch(resetConnectedDatabaseInstance())
    dispatch(resetDatabaseContext())
  }, [rdiInstanceId])

  useEffect(() => {
    // redirect only if there is no exact path
    if (pathname === Pages.rdiPipeline(rdiInstanceId)) {
      if (lastPage === PageNames.rdiStatistics && contextRdiInstanceId === rdiInstanceId) {
        history.push(Pages.rdiStatistics(rdiInstanceId))
        return
      }
      history.push(Pages.rdiPipelineManagement(rdiInstanceId))
    }
  }, [])

  return (
    <EuiFlexGroup className={styles.page} direction="column" gutterSize="none" responsive={false}>
      <EuiFlexItem grow={false}>
        <RdiInstanceHeader />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <RdiPipelineHeader />
      </EuiFlexItem>
      <RdiInstancePageTemplate>
        <InstancePageRouter routes={routes} />
      </RdiInstancePageTemplate>
    </EuiFlexGroup>
  )
}

export default RdiInstancePage
