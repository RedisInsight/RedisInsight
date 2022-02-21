import React from 'react'

import {
  EuiFieldText,
  EuiSwitch,
  EuiForm,
  EuiSelect,
  EuiFormFieldset,
  EuiSpacer,
  EuiFormRow,
  EuiTitle,
} from '@elastic/eui';

import { ChartConfig, AxisScale, GraphMode } from './interfaces'
import { X_LABEL_MAX_LENGTH, Y_LABEL_MAX_LENGTH, TITLE_MAX_LENGTH } from './constants'

const styles = {
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '386px',
    minHeight: '345px',
    paddingRight: '5em',
    paddingLeft: '5em'
  } as React.CSSProperties,

  mainToggle: {
    marginTop: '20px'
  },
  rightYAxis: {
    display: 'flex',
    flexDirection: 'column',
  },
}


interface ChartConfigFormProps {
  value: ChartConfig
  onChange: (control: string, value: any) => void
  onChartTitleKeyDown: (event: React.KeyboardEvent) => void
  onLeftYAxisLabelKeyDown: (event: React.KeyboardEvent) => void
  onRightYAxisLabelKeyDown: (event: React.KeyboardEvent) => void
  onXAxisLabelKeyDown: (event: React.KeyboardEvent) => void
  onYAxisScaleChanged: (isLeftYAxis: boolean, scaleValue: string) => void
}

interface ChartConfigFormState {
  anchorEl: Element | null
}

export default class ChartConfigForm extends React.Component<ChartConfigFormProps, ChartConfigFormState> {

  state = {
    anchorEl: null,
  }

  render() {
    const { onChange, value } = this.props
    return (
      <form style={{ display: 'flex', justifyContent: 'space-around', margin: '0 3em', flexWrap: 'wrap' }}>
        <section style={styles.formSection}>
          <EuiTitle size="xs"><h4>Options</h4></EuiTitle>
          <EuiSpacer size="m" />
          <EuiFormFieldset>
            <EnumSelect
              inputLabel="mode"
              {
                ...{
                  onChange: (e: React.ChangeEvent<{ value: unknown }>) => onChange('mode', e.target.value),
                  value: value.mode
                }
              }
              enumType={GraphMode}
              />
          </EuiFormFieldset>
          <EuiSpacer size="m" />
          <div style={{ display: 'flex' }}>
            <EuiSwitch
              compressed
              label={<span style={{paddingRight: '10px' }}>Staircase</span>}
              checked={value.staircase}
              onChange={(e) => onChange('staircase', e.target.checked)}
            />
            <EuiSpacer size="m" />
            <EuiSwitch
              compressed
              label="Fill"
              checked={value.fill}
              onChange={(e) => onChange('fill', e.target.checked)}
            />
          </div>
          <EuiSpacer size="m" />
          <EuiFormFieldset legend={{ children: 'Title' }}>
            <EuiFieldText
              placeholder="Title"
              value={value.title}
              onChange={(e) => onChange('title', e.target.value)}
              aria-label="Title"
              maxLength={parseInt(TITLE_MAX_LENGTH)}
            />
          </EuiFormFieldset>
          <EuiSpacer size="m" />
          <EuiFormFieldset legend={{ children: 'X axis Label' }}>
            <EuiFieldText
              placeholder="X axis label"
              value={value.xlabel}
              onChange={(e) => onChange('xlabel', e.target.value)}
              aria-label="X Label"
              maxLength={parseInt(X_LABEL_MAX_LENGTH)}
            />
          </EuiFormFieldset>
        </section>
        <section style={styles.formSection}>
          <EuiTitle size="xs"><h4>Left Y Axis</h4></EuiTitle>
          <EuiSpacer size="m" />
          <YAxisConfigForm
            onChange={(v: any) => onChange('yAxisConfig', v)}
            isLeftYAxis={true}
            value={value.yAxisConfig}
          />
        </section>
        <section style={styles.formSection}>
          <div style={styles.rightYAxis}>
            <div><EuiTitle size="xs"><h4>Right Y Axis</h4></EuiTitle></div>
            <EuiSpacer size="m" />
            <EuiFormFieldset>
              <EuiSwitch
                compressed
                label="Use Right Y Axis"
                checked={value.yAxis2}
                onChange={(e) => onChange('yAxis2', e.target.checked)}
              />
            </EuiFormFieldset>
          </div>
          <EuiSpacer size="m" />
          {value.yAxis2 &&
            <React.Fragment>
              <YAxisConfigForm
                onChange={(v: any) => onChange('yAxis2Config', v)}
                isLeftYAxis={false}
                value={value.yAxis2Config}
              />
              <EuiSpacer size="m" />
              <EuiFormFieldset legend={{ children: 'Use Right Y Axis for keys' }}>
                {Object.keys(value.keyToY2Axis).map(key =>
                  <>
                    <EuiSwitch
                      compressed
                      label={key}
                      checked={value.keyToY2Axis[key]}
                      onChange={(e) => onChange('keyToY2Axis', { ...value.keyToY2Axis, [key]: e.target.checked})}
                      key={key}
                    />
                    <EuiSpacer size="m" />
                  </>
                )}
              </EuiFormFieldset>
            </React.Fragment>
          }
        </section>
      </form >
    )
  }
}

const YAxisConfigForm = ({ value, onChange }: any) => (
  <React.Fragment>
    <EuiFormFieldset legend={{ children: 'Label' }}>
      <EuiFieldText
        placeholder="Label"
        value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value})}
        aria-label="label"
        maxLength={parseInt(Y_LABEL_MAX_LENGTH)}
      />
    </EuiFormFieldset>
    <EuiSpacer size="m" />
    <EnumSelect
      inputLabel="Scale"
      {
        ...{
          onChange: (e: any) => onChange({ ...value, scale: e.target.value as string }),
          value: value.scale
        }
      }
      enumType={AxisScale}
    />
  </React.Fragment>
)


interface EnumSelectProps {
  enumType: any
  inputLabel: string
}
const EnumSelect = ({ enumType, inputLabel, ...props }: EnumSelectProps) => (
  <EuiForm component="form">
    <EuiFormFieldset legend={{ children: inputLabel, compressed: true }}>
      <EuiSelect
        hasNoInitialSelection
        {...props}
        options={Object.values(enumType).map((v: string) => ({value: v, text: v}))}
      />
    </EuiFormFieldset>
  </EuiForm>
)

