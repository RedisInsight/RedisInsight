import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import {
  appContextSelector,
  resetDatabaseContext,
  setAppContextConnectedRdiInstanceId,
} from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { getPageName } from 'uiSrc/utils/routing'
import {
  fetchConnectedInstanceAction,
  resetConnectedInstance as resetRdiConnectedInstance,
  setConnectedInstanceId
} from 'uiSrc/slices/rdi/instances'
import {
  resetConnectedInstance as resetConnectedDatabaseInstance,
} from 'uiSrc/slices/instances/instances'

import InstancePageRouter from './InstancePageRouter'

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const [isShouldChildrenRerender, setIsShouldChildrenRerender] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage, contextRdiInstanceId } = useSelector(appContextSelector)

  const lastPageRef = useRef<string>()

  useEffect(() => {
    if (contextRdiInstanceId && contextRdiInstanceId !== rdiInstanceId) {
      dispatch(fetchConnectedInstanceAction(rdiInstanceId))

      // rerender children only if the same page from scratch to clear all component states
      if (lastPageRef.current === getPageName(rdiInstanceId, pathname)) {
        setIsShouldChildrenRerender(true)
      }

      dispatch(resetRdiConnectedInstance())
    }
    dispatch(setAppContextConnectedRdiInstanceId(rdiInstanceId))

    // clear database context
    dispatch(resetConnectedDatabaseInstance())
    dispatch(resetDatabaseContext())
  }, [rdiInstanceId])

  useEffect(() => {
    dispatch(setConnectedInstanceId(rdiInstanceId))

    // redirect only if there is no exact path
    if (pathname === Pages.rdiPipeline(rdiInstanceId)) {
      if (lastPage === PageNames.rdiPipelineStatistics && contextRdiInstanceId === rdiInstanceId) {
        history.push(Pages.rdiPipelineStatistics(rdiInstanceId))
        return
      }

      history.push(Pages.rdiPipelineManagement(rdiInstanceId))
    }
  }, [])

  useEffect(() => {
    lastPageRef.current = getPageName(rdiInstanceId, pathname)
  }, [pathname])

  useEffect(() => {
    if (isShouldChildrenRerender) setIsShouldChildrenRerender(false)
  }, [isShouldChildrenRerender])

  useEffect(() => {

  }, [])

  if (isShouldChildrenRerender) {
    return null
  }

  return (
    // TODO add rdi page template
    <InstancePageRouter routes={routes} />
  )
}

export default RdiInstancePage
