import React, { useEffect, useRef, useState } from 'react'
import { Formik, Form, FormikProps } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import RdiPipelineHeader from 'uiSrc/pages/rdi/pipeline-management/components/header'
import Navigation from 'uiSrc/pages/rdi/pipeline-management/components/navigation'
import { deployPipelineAction, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'

import { IPipeline } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const getInitialValues = (data: Nullable<IPipeline>): IPipeline => ({
  config: data?.config ?? '',
  jobs: data?.jobs ?? [],
})

const RdiPipelinePageTemplate = (props: Props) => {
  const { children } = props

  const { data } = useSelector(rdiPipelineSelector)

  const dispatch = useDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const formikRef = useRef<FormikProps<IPipeline>>(null)

  const [initialFormValues, setInitialFormValues] = useState<IPipeline>(getInitialValues(data))

  const onSubmit = (values: IPipeline) => {
    dispatch(deployPipelineAction(rdiInstanceId, values))
  }

  useEffect(() => {
    setInitialFormValues(getInitialValues(data))
    formikRef.current?.resetForm()
  }, [data])

  // TODO add side panel logs
  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize
      onSubmit={onSubmit}
      innerRef={formikRef}
    >
      <Form className={styles.fullHeight}>
        <RdiPipelineHeader />
        <div className={styles.wrapper}>
          <Navigation />
          {children}
        </div>
      </Form>
    </Formik>
  )
}

export default RdiPipelinePageTemplate
