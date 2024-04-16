import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Formik, FormikProps } from 'formik'

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
import { deployPipelineAction, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

import InstancePageRouter from './InstancePageRouter'

export interface Props {
  routes: IRoute[]
}

const getInitialValues = (data: Nullable<IPipeline>): IPipeline => ({
  config: data?.config ?? '',
  jobs: data?.jobs ?? [],
})

const RdiInstancePage = ({ routes = [] }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { lastPage, contextRdiInstanceId } = useSelector(appContextSelector)
  const { data } = useSelector(rdiPipelineSelector)

  const [initialFormValues, setInitialFormValues] = useState<IPipeline>(getInitialValues(data))
  const formikRef = useRef<FormikProps<IPipeline>>(null)

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

    dispatch(fetchConnectedInstanceAction(rdiInstanceId))
  }, [])

  useEffect(() => {
    setInitialFormValues(getInitialValues(data))
    formikRef.current?.resetForm()
  }, [data])

  const onSubmit = (values: IPipeline) => {
    dispatch(deployPipelineAction(rdiInstanceId, values))
  }

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize
      onSubmit={onSubmit}
      innerRef={formikRef}
    >
      <InstancePageRouter routes={routes} />
    </Formik>
  )
}

export default RdiInstancePage
