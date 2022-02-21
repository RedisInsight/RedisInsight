/* eslint-disable react/jsx-filename-extension */
import React, { useEffect, useState } from 'react'
import { EuiText, EuiButton, EuiSpacer, EuiTextColor } from '@elastic/eui'
import { getState, setState, executeRedisCommand } from 'redisinsight-plugin-sdk'

interface Props {
  result?: { response: any, status: string }[]
}

const App = (props: Props) => {
  const { result: [{ response = '' } = {}] = [] } = props
  const [lastRandomKey, setLastRandomKey] = useState<string>('')

  useEffect(() => {
    getLastRandomKey()
  }, [])

  const getLastRandomKey = async () => {
    try {
      const result = await getState()
      setLastRandomKey(result)
    } catch (e) {
      console.error(e)
    }
  }

  const updateLastRandomKey = async (key: string) => {
    try {
      const result = await setState(key)
      setLastRandomKey(result)
    } catch (error) {
      console.error(error)
    }
  }

  const randomizeKey = async () => {
    try {
      const result = await executeRedisCommand('RANDOMKEY')
      const [{ response = '', status }] = result
      if (status === 'success') {
        updateLastRandomKey(response)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="wrapper">
      <EuiText>
        <EuiTextColor color="subdued">Initial Key:</EuiTextColor>
        &nbsp;
        { response }
      </EuiText>
      <EuiText>
        <EuiTextColor color="subdued">Last Random Key:</EuiTextColor>
        &nbsp;
        { lastRandomKey }
      </EuiText>
      <EuiSpacer size="m" />
      <EuiButton
        fill
        color="secondary"
        className="btn-add"
        type="submit"
        onClick={randomizeKey}
      >
        Random new key
      </EuiButton>
    </div>
  )
}

export default App
