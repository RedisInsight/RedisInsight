import React, { CSSProperties } from 'react'
// import { CircularProgress } from 'material-ui';

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const CircularSpinnerPage = (props: {
  style?: CSSProperties
  msg?: string
  msgStyle?: CSSProperties
}) => {
  const { style = {}, msg, msgStyle = {} } = props
  return (
    <div style={{ ...containerStyle, ...style }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* <CircularProgress /> */}
        {msg && <div style={{ marginTop: '20px', ...msgStyle }}>{msg}</div>}
      </div>
    </div>
  )
}

export default CircularSpinnerPage
