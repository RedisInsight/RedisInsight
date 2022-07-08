import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { has } from 'lodash'
import {
  EuiText,
  EuiForm,
  EuiTitle,
  EuiSpacer,
} from '@elastic/eui'

import { compareConsents } from 'uiSrc/utils'
import { updateUserConfigSettingsAction, userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import ConsentOption from '../ConsentOption'

import styles from '../styles.module.scss'

// interface Values {
//   [key: string]: string;
// }

export interface IConsent {
  defaultValue: boolean
  displayInSetting: boolean
  required: boolean
  editable: boolean
  disabled: boolean
  category?: string
  since: string
  title: string
  label: string
  agreementName: string
  description?: string
}

export interface Props {
  onSubmitted?: () => void
}

const ConsentsNotifications = () => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [notificationConsents, setNotificationConsents] = useState<IConsent[]>([])
  const [initialValues, setInitialValues] = useState<any>({})

  const { config, spec } = useSelector(userSettingsSelector)

  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  useEffect(() => {
    if (spec && config) {
      setConsents(compareConsents(spec?.agreements, config?.agreements, true))
    }
  }, [spec, config])

  useEffect(() => {
    console.log(consents)
    setNotificationConsents(consents.filter(
      (consent: IConsent) => !consent.required && consent.category === 'notifications' && consent.displayInSetting
    ))
    if (consents.length) {
      const values = consents.reduce(
        (acc: any, cur: IConsent) => ({ ...acc, [cur.agreementName]: cur.defaultValue }),
        {}
      )

      if (config) {
        Object.keys(values).forEach((value) => {
          if (has(config.agreements, value)) {
            values[value] = config?.agreements?.[value]
          }
        })
      }
      setInitialValues(values)
    }
  }, [consents])
  // console.log(notificationConsents)

  const onChangeAgreement = (checked: boolean, name: string) => {
    formik.setFieldValue(name, checked)
    formik.submitForm()
  }

  console.log(notificationConsents)
  const submitForm = (values: any) => {
    dispatch(updateUserConfigSettingsAction({ agreements: values }))
  }

  return (
    <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="consents-settings-form">
      <div className={styles.consentsWrapper}>
        <EuiTitle size="xs">
          <h4>Notifications</h4>
        </EuiTitle>
        {
          notificationConsents
            .map((consent: IConsent) => (
              <ConsentOption
                consent={consent}
                checked={formik.values[consent.agreementName] ?? false}
                onChangeAgreement={onChangeAgreement}
                settingsPage
                key={consent.agreementName}
              />
            ))
        }
      </div>
    </EuiForm>
  )
}

export default ConsentsNotifications
