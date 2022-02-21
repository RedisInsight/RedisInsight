import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { EuiPage, EuiPageBody } from '@elastic/eui'

import { getApiErrorMessage, isStatusSuccessful, Nullable, setTitle } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, Pages } from 'uiSrc/constants'
import { PageHeader, PagePlaceholder } from 'uiSrc/components'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { setConnectedInstanceId } from 'uiSrc/slices/instances'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Instance } from 'uiSrc/slices/interfaces'
import AddDatabaseContainer from 'uiSrc/pages/home/components/AddDatabases/AddDatabasesContainer'

import './styles.scss'
import styles from './styles.module.scss'

interface IState {
  loading: boolean;
  error: string;
  data: Nullable<Instance>
}
const DEFAULT_STATE = { loading: true, error: '', data: null }

const EditConnection = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { server } = useSelector(appInfoSelector)
  const [state, setState] = useState<IState>(DEFAULT_STATE)

  let isApiSubscribed = false

  setTitle('Redis Stack')

  useEffect(() => {
    getInstanceInfo()
    return () => {
      isApiSubscribed = false
    }
  }, [])

  const getInstanceInfo = async () => {
    try {
      setState(DEFAULT_STATE)
      isApiSubscribed = true
      const { data, status } = await apiService.get<Instance>(`${ApiEndpoints.INSTANCE}/${server.fixedDatabaseId}`)
      if (isStatusSuccessful(status) && isApiSubscribed) {
        setState({ ...state, loading: false, data })
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      if (isApiSubscribed) {
        setState({ ...state, loading: false, error: errorMessage })
      }
      dispatch(addErrorNotification(error))
    }
  }
  const onInstanceChanged = () => {
    if (server?.fixedDatabaseId) {
      dispatch(setConnectedInstanceId(server.fixedDatabaseId))
      history.push(Pages.browser(server?.fixedDatabaseId))
    }
  }

  const onAliasChanged = (value: string) => {
    setState({ ...state, data: state.data ? { ...state.data, name: value } : null })
  }

  return (
    state.loading ? <PagePlaceholder />
      : (
        <>
          <PageHeader title="Redis Stack" />
          <div />
          <EuiPage className="homePage redisStackConnection">
            <EuiPageBody component="div" className={styles.container}>
              <div className={styles.formContainer}>
                <div className={styles.form}>
                  <AddDatabaseContainer
                    editMode
                    width={600}
                    editedInstance={state.data}
                    onDbAdded={() => {}}
                    onDbEdited={onInstanceChanged}
                    onAliasEdited={onAliasChanged}
                  />
                </div>
                <div id="footerDatabaseForm" />
              </div>
            </EuiPageBody>
          </EuiPage>
        </>
      )
  )
}

export default EditConnection
