import React from 'react'
import { EuiIcon } from '@elastic/eui'
import { FeatureFlagComponent, RiTooltip } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
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
        <Checkbox
          id="ouath-recommended-settings"
          name="recommended-settings"
          label="Use a pre-selected provider and region"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          data-testid="oauth-recommended-settings-checkbox"
        />
        <RiTooltip
          content={
            <>
              The database will be automatically created using a pre-selected
              provider and region.
              <br />
              You can change it by signing in to Redis Cloud.
            </>
          }
          position="top"
          anchorClassName={styles.recommendedSettingsToolTip}
        >
          <EuiIcon type="iInCircle" size="s" />
        </RiTooltip>
      </div>
    </FeatureFlagComponent>
  )
}

export default OAuthRecommendedSettings
