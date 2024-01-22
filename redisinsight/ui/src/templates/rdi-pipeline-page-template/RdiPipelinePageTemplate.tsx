import React from 'react'
import { Formik, Form } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import RdiPipelineHeader from 'uiSrc/pages/rdi/pipeline/components/header'
import Navigation from 'uiSrc/pages/rdi/pipeline/components/navigation'
import { deployPipelineAction, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'

import { IPipeline } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const RdiPipelinePageTemplate = (props: Props) => {
  const { children } = props

  const { data } = useSelector(rdiPipelineSelector)

  const dispatch = useDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const onSubmit = (values: IPipeline) => {
    dispatch(deployPipelineAction(rdiInstanceId, values))
  }

  // TODO add side panel logs
  return (
    <Formik
      initialValues={{
        config: data?.config ?? '',
        jobs: data?.jobs ?? [],
      }}
      enableReinitialize
      onSubmit={onSubmit}
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
