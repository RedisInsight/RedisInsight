import { FC, ReactElement } from 'react'
import { HIDE_ADS } from 'uiSrc/constants/cloud'

const CloudAd: FC<{ children: ReactElement }> = ({ children }) => {
  if (HIDE_ADS) {
    return null
  }

  return children
}

export default CloudAd
