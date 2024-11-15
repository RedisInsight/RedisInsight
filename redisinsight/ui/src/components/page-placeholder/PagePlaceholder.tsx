import React from 'react'
import { EuiLoadingLogo, EuiEmptyPrompt } from '@elastic/eui'
import LogoIcon from 'uiSrc/assets/img/logo_small.svg?react'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

const PagePlaceholder = () => (
  <>
    { riConfig.app.env !== 'development' && (
      <EuiEmptyPrompt
        data-testid="page-placeholder"
        icon={<EuiLoadingLogo logo={LogoIcon} size="xl" style={{ fontSize: '40px' }} />}
        titleSize="s"
      />
    )}
  </>

)

export default PagePlaceholder
