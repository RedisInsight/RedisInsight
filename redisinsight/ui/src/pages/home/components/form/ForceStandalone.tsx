import React, { ChangeEvent } from 'react'
import { EuiCheckbox, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiIcon, EuiToolTip, htmlIdGenerator } from '@elastic/eui'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

export interface Props {
  formik: FormikProps<DbConnectionInfo>;
}

const ForceStandaloneLabel = () => (
  <p>
    <span>Force Standalone Connection</span>
    <EuiToolTip
      className="homePage_tooltip"
      position="right"
      content={(
        <p>Override the default connection logic and connect to the specified endpoint as a standalone
          database.
        </p>
      )}
    >
      <EuiIcon
        type="iInCircle"
        style={{
          cursor: 'pointer',
          marginLeft: '5px',
        }}
      />
    </EuiToolTip>
  </p>
)
const ForceStandalone = (props: Props) => {
  const { formik } = props

  const handleChangeForceStandaloneCheckbox = (e: ChangeEvent<HTMLInputElement>): void => {
    formik.handleChange(e)
  }

  return (

    <EuiFlexGroup
      responsive={false}
      gutterSize="xs"
    >
      <EuiFlexItem
        grow={false}
      >
        <EuiFormRow>
          <EuiCheckbox
            id={`${htmlIdGenerator()()} over forceStandalone`}
            name="forceStandalone"
            label={<ForceStandaloneLabel />}
            checked={!!formik.values.forceStandalone}
            onChange={handleChangeForceStandaloneCheckbox}
            data-testid="forceStandalone"
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default ForceStandalone
