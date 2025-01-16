import React from 'react'
import Explain from './modules/RiExplain/RiExplain'
import { ResponseProps } from './interfaces'

export default function AppRiExplain(props: ResponseProps) {
  return (
    <div id="mainApp" style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      <Explain {...props} />
    </div>
  )
}
