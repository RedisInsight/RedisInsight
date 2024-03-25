import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { cloudSelector, fetchSubscriptionsRedisCloud, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { useResizableFormField } from 'uiSrc/services'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import CloudConnectionForm from './cloud-connection-form'

export interface Props {
  width: number
  onClose?: () => void
}

export interface ICloudConnectionSubmit {
  accessKey: string
  secretKey: string
}

const CloudConnectionFormWrapper = ({ onClose, width }: Props) => {
  const dispatch = useDispatch()
  const formRef = useRef<HTMLDivElement>(null)

  const history = useHistory()
  const { loading, credentials } = useSelector(cloudSelector)

  const [flexGroupClassName, flexItemClassName] = useResizableFormField(formRef, width)

  useEffect(
    () => () => {
      dispatch(resetErrors())
    },
    []
  )

  const formSubmit = (credentials: ICloudConnectionSubmit) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBMITTED
    })
    dispatch(setSSOFlow(undefined))
    dispatch(fetchSubscriptionsRedisCloud(credentials, false, onSuccess))
  }

  const onSuccess = () => {
    history.push(Pages.redisCloudSubscriptions)
  }

  return (
    <div ref={formRef}>
      <CloudConnectionForm
        accessKey={credentials?.accessKey ?? ''}
        secretKey={credentials?.secretKey ?? ''}
        flexGroupClassName={flexGroupClassName}
        flexItemClassName={flexItemClassName}
        onClose={onClose}
        onSubmit={formSubmit}
        loading={loading}
      />
    </div>
  )
}

export default CloudConnectionFormWrapper
