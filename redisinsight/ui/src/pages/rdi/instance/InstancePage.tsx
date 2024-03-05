import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import {
  appContextSelector,
  resetDatabaseContext,
  resetRdiContext,
  setAppContextConnectedRdiInstanceId,
} from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { fetchConnectedInstanceAction } from 'uiSrc/slices/rdi/instances'
import {
  resetConnectedInstance as resetConnectedDatabaseInstance,
} from 'uiSrc/slices/instances/instances'

import InstancePageRouter from './InstancePageRouter'

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage, contextRdiInstanceId } = useSelector(appContextSelector)

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
      if (lastPage === PageNames.rdiPipelineStatistics && contextRdiInstanceId === rdiInstanceId) {
        history.push(Pages.rdiPipelineStatistics(rdiInstanceId))
        return
      }

      history.push(Pages.rdiPipelineManagement(rdiInstanceId))
    }
  }, [])

  return (
    // TODO add rdi page template
    <InstancePageRouter routes={routes} />
  )
}

export default RdiInstancePage
