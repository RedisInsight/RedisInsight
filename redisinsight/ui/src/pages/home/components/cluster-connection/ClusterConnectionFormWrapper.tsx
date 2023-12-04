import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  clusterSelector,
  fetchInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { Pages } from 'uiSrc/constants'
import { useResizableFormField } from 'uiSrc/services'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { ICredentialsRedisCluster, InstanceType } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { autoFillFormDetails } from 'uiSrc/pages/home/utils'

import ClusterConnectionForm from './cluster-connection-form/ClusterConnectionForm'

export interface Props {
  width: number;
  onClose?: () => void;
}

const ClusterConnectionFormWrapper = ({ onClose, width }: Props) => {
  const [initialValues, setInitialValues] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
  })

  const history = useHistory()
  const dispatch = useDispatch()

  const formRef = useRef<HTMLDivElement>(null)

  const { loading, credentials } = useSelector(clusterSelector)

  const [flexGroupClassName, flexItemClassName] = useResizableFormField(
    formRef,
    width
  )

  useEffect(
    () => () => {
      dispatch(resetErrors())
    },
    []
  )

  useEffect(() => {
    if (credentials) {
      setInitialValues({
        host: credentials?.host,
        port: credentials?.port?.toString(),
        username: credentials?.username,
        password: credentials?.password,
      })
    }
  }, [credentials])

  const formSubmit = (values: ICredentialsRedisCluster) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_SUBMITTED
    })

    dispatch(fetchInstancesRedisCluster(values, onSuccess))
  }

  const onSuccess = () => {
    history.push(Pages.redisEnterpriseAutodiscovery)
  }

  const handlePostHostName = (content: string) => (
    autoFillFormDetails(content, initialValues, setInitialValues, InstanceType.RedisEnterpriseCluster)
  )

  return (
    <div ref={formRef}>
      <ClusterConnectionForm
        host={credentials?.host ?? ''}
        port={credentials?.port?.toString() ?? ''}
        username={credentials?.username ?? ''}
        password={credentials?.password ?? ''}
        initialValues={initialValues}
        onHostNamePaste={handlePostHostName}
        flexGroupClassName={flexGroupClassName}
        flexItemClassName={flexItemClassName}
        onClose={onClose}
        onSubmit={formSubmit}
        loading={loading}
      />
    </div>
  )
}

export default ClusterConnectionFormWrapper
