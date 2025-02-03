import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { findIndex } from 'lodash'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { Pages } from 'uiSrc/constants'
import { Maybe } from 'uiSrc/utils'
import Job from './Job'

const JobWrapper = () => {
  const { rdiInstanceId, jobName } = useParams<{ rdiInstanceId: string, jobName: string }>()

  const [decodedJobName, setDecodedJobName] = useState<string>(decodeURIComponent(jobName))
  const [jobIndex, setJobIndex] = useState<number>(-1)
  const [deployedJobValue, setDeployedJobValue] = useState<Maybe<string>>()

  const history = useHistory()

  const { data } = useSelector(rdiPipelineSelector)

  const { values } = useFormikContext<IPipeline>()

  useEffect(() => {
    const jobIndex = findIndex(values?.jobs, (({ name }) => name === decodedJobName))
    setJobIndex(jobIndex)

    if (jobIndex === -1) {
      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
    }
  }, [decodedJobName, rdiInstanceId, values?.jobs?.length])

  useEffect(() => {
    setDecodedJobName(decodeURIComponent(jobName))
  }, [jobName])

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_JOBS,
      eventData: {
        rdiInstanceId
      }
    })
  }, [])

  useEffect(() => {
    const newDeployedJob = data?.jobs.find((el) => el.name === decodedJobName)

    setDeployedJobValue(newDeployedJob ? newDeployedJob.value : undefined)
  }, [data, decodedJobName])

  return (
    <Job
      name={decodedJobName}
      value={values.jobs[jobIndex]?.value ?? ''}
      deployedJobValue={deployedJobValue}
      jobIndex={jobIndex}
      rdiInstanceId={rdiInstanceId}
    />
  )
}

export default React.memo(JobWrapper)
