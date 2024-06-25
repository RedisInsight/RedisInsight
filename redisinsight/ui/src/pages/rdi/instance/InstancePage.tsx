import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Formik, FormikProps } from 'formik'

import {
  appContextSelector,
  resetDatabaseContext,
  resetRdiContext,
  setAppContextConnectedRdiInstanceId,
  setPipelineDialogState,
} from 'uiSrc/slices/app/context'
import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { fetchConnectedInstanceAction } from 'uiSrc/slices/rdi/instances'
import {
  resetConnectedInstance as resetConnectedDatabaseInstance,
} from 'uiSrc/slices/instances/instances'
import {
  deployPipelineAction,
  getPipelineStatusAction,
  rdiPipelineSelector,
  setPipelineInitialState,
} from 'uiSrc/slices/rdi/pipeline'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { Nullable, pipelineToJson } from 'uiSrc/utils'

import InstancePageRouter from './InstancePageRouter'
import { ConfirmLeavePagePopup } from './components'
import { useUndeployedChangesPrompt } from './hooks'

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
  const { showModal, handleCloseModal, handleConfirmLeave } = useUndeployedChangesPrompt()

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
    dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    dispatch(getPipelineStatusAction(rdiInstanceId))
    // redirect only if there is no exact path
    if (pathname === Pages.rdiPipeline(rdiInstanceId)) {
      if (lastPage === PageNames.rdiStatistics && contextRdiInstanceId === rdiInstanceId) {
        history.push(Pages.rdiStatistics(rdiInstanceId))
        return
      }
      history.push(Pages.rdiPipelineManagement(rdiInstanceId))
    }
  }, [])

  useEffect(() => {
    setInitialFormValues(getInitialValues(data))
    formikRef.current?.resetForm()
  }, [data])

  // set initial values
  useEffect(() => () => {
    dispatch(setPipelineInitialState())
    dispatch(setPipelineDialogState(true))
  }, [])

  const onSubmit = (values: IPipeline) => {
    const JSONValues = pipelineToJson(values)
    dispatch(deployPipelineAction(rdiInstanceId, JSONValues))
  }

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize
      onSubmit={onSubmit}
      innerRef={formikRef}
    >
      <>
        <InstancePageRouter routes={routes} />
        {showModal && <ConfirmLeavePagePopup onClose={handleCloseModal} onConfirm={handleConfirmLeave} />}
      </>
    </Formik>
  )
}

export default RdiInstancePage
