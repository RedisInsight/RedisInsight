import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ConnectionString } from 'connection-string'
import { useHistory } from 'react-router-dom'

import {
  clusterSelector,
  fetchInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { REDIS_URI_SCHEMES, Pages } from 'uiSrc/constants'
import { useResizableFormField } from 'uiSrc/services'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { ICredentialsRedisCluster } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import ClusterConnectionForm from './ClusterConnectionForm/ClusterConnectionForm'

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

  const autoFillFormDetails = (content: string): boolean => {
    try {
      const details = new ConnectionString(content)

      /* If a protocol exists, it should be a redis protocol */
      if (details.protocol && !REDIS_URI_SCHEMES.includes(details.protocol)) return false
      /*
       * Auto fill logic:
       * 1) If the port is parsed, we are sure that the user has indeed copied a connection string.
       *    '172.18.0.2:12000'                => {host: '172,18.0.2', port: 12000}
       *    'redis-12000.cluster.local:12000' => {host: 'redis-12000.cluster.local', port: 12000}
       *    'lorem ipsum'                     => {host: undefined, port: undefined}
       * 2) If the port is `undefined` but a redis URI scheme is present as protocol, we follow
       *    the "Scheme semantics" as mentioned in the official URI schemes.
       *    i)  redis:// - https://www.iana.org/assignments/uri-schemes/prov/redis
       *    ii) rediss:// - https://www.iana.org/assignments/uri-schemes/prov/rediss
       */
      if (
        details.port !== undefined
        || REDIS_URI_SCHEMES.includes(details.protocol || '')
      ) {
        setInitialValues({
          host: details.hostname || initialValues.host || 'localhost',
          port: `${details.port || initialValues.port || 9443}`,
          username: details.user || '',
          password: details.password || '',
        })
        /*
         * auto fill was successfull so return true
         */
        return true
      }
    } catch (err) {
      /* The pasted content is not a connection URI so ignore. */
      return false
    }
    return false
  }

  return (
    <div ref={formRef}>
      <ClusterConnectionForm
        host={credentials?.host ?? ''}
        port={credentials?.port?.toString() ?? ''}
        username={credentials?.username ?? ''}
        password={credentials?.password ?? ''}
        initialValues={initialValues}
        onHostNamePaste={autoFillFormDetails}
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
