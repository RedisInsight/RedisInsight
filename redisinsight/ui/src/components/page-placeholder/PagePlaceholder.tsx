import React from 'react'
import { EuiLoadingLogo, EuiEmptyPrompt } from '@elastic/eui'
import { envVars } from 'uiSrc/utils'
import { ReactComponent as LogoIcon } from 'uiSrc/assets/img/logo.svg'

const PagePlaceholder = () => (
  <>
    { envVars.NODE_ENV !== 'development' && (
      <EuiEmptyPrompt
        icon={<EuiLoadingLogo logo={LogoIcon} size="xl" style={{ fontSize: '40px' }} />}
        titleSize="s"
      />
    )}
  </>

)

export default PagePlaceholder
