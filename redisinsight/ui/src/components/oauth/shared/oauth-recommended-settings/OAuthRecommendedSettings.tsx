import React from 'react'
import { EuiCheckbox, EuiIcon, EuiToolTip } from '@elastic/eui'
import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

import styles from './styles.module.scss'

export interface Props {
  value?: boolean
  onChange: (value: boolean) => void
}

const OAuthRecommendedSettings = (props: Props) => {
  const { value, onChange } = props

  return (
    <FeatureFlagComponent name={FeatureFlags.cloudSsoRecommendedSettings}>
      <div className={styles.recommendedSettings}>
        <EuiCheckbox
          id="ouath-recommended-settings"
          name="recommended-settings"
          label="Use a pre-selected provider and region"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          data-testid="oauth-recommended-settings-checkbox"
        />
        <EuiToolTip
          content={(
            <>
              The database will be automatically created using a pre-selected provider and region.
              <br />
              You can change it by signing in to Redis Cloud.
            </>
          )}
          position="top"
          anchorClassName={styles.recommendedSettingsToolTip}
        >
          <EuiIcon type="iInCircle" size="s" />
        </EuiToolTip>
      </div>
    </FeatureFlagComponent>
  )
}

export default OAuthRecommendedSettings
