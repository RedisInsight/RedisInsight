import React from 'react'
import { ReactComponent as LogoIcon } from 'uiSrc/assets/img/logo.svg'
import { EuiLoadingLogo, EuiEmptyPrompt } from '@elastic/eui'

const PagePlaceholder = () => (
  <>
    { process.env.NODE_ENV !== 'development' && (
      <EuiEmptyPrompt
        icon={<EuiLoadingLogo logo={LogoIcon} size="xl" style={{ fontSize: '40px' }} />}
        titleSize="s"
      />
    )}
  </>

)

export default PagePlaceholder
