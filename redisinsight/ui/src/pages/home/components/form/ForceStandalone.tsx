import React, { ChangeEvent } from 'react'
import {
  htmlIdGenerator,
} from '@elastic/eui'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const ForceStandaloneLabel = () => (
  <p>
    <span>Force Standalone Connection</span>
    <RiTooltip
      className="homePage_tooltip"
      position="right"
      content={
        <p>
          Override the default connection logic and connect to the specified
          endpoint as a standalone database.
        </p>
      }
    >
      <RiIcon
        type="InfoIcon"
        style={{
          cursor: 'pointer',
          marginLeft: '5px',
        }}
      />
    </RiTooltip>
  </p>
)
const ForceStandalone = (props: Props) => {
  const { formik } = props

  const handleChangeForceStandaloneCheckbox = (
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    formik.handleChange(e)
  }

  return (
    <Row gap="s">
      <FlexItem>
        <FormField>
          <Checkbox
            id={`${htmlIdGenerator()()} over forceStandalone`}
            name="forceStandalone"
            label={<ForceStandaloneLabel />}
            checked={!!formik.values.forceStandalone}
            onChange={handleChangeForceStandaloneCheckbox}
            data-testid="forceStandalone"
          />
        </FormField>
      </FlexItem>
    </Row>
  )
}

export default ForceStandalone
