/* eslint-disable react/jsx-filename-extension */
import React from 'react'

interface Props {
  command: string,
  response: any,
  status: string
}

const App = (props: Props) => {
  const { command = '', response = '', status = '' } = props
  if (status === 'fail') {
    return <div className="responseFail">{response}</div>
  }

  return <pre>{response}</pre>
}

export default App
