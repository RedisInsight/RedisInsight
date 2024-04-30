import { EuiSuperSelectOption } from '@elastic/eui'

export const NO_TEMPLATE_LABEL = 'No template'

export const NO_TEMPLATE_VALUE = 'no_template'

export const NO_OPTIONS: EuiSuperSelectOption<string>[] = [
  {
    value: NO_TEMPLATE_VALUE,
    inputDisplay: NO_TEMPLATE_LABEL,
  }
]

export const INGEST_OPTION = 'ingest'
