import React, { CSSProperties } from 'react'

import {
  EuiFieldText,
  EuiSwitch,
  EuiForm,
  EuiFormFieldset,
  EuiSpacer,
  EuiSelectProps,
  EuiButtonGroup,
  EuiAccordion,
} from '@elastic/eui'

import { ChartConfig, AxisScale, GraphMode } from './interfaces'
import { X_LABEL_MAX_LENGTH, Y_LABEL_MAX_LENGTH, TITLE_MAX_LENGTH } from './constants'

const styles = {
  formSection: {
    display: 'flex',
    minWidth: '386px',
    paddingRight: '5em',
    paddingLeft: '5em',
    paddingTop: '1em',
    paddingBottom: '1em',
    justifyContent: 'space-between'
  } as CSSProperties,

  mainToggle: {
    marginTop: '20px'
  },
  rightYAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  } as CSSProperties,
}


interface ChartConfigFormProps {
  value: ChartConfig
  onChange: (control: string, value: any) => void
}

interface ChartConfigFormState {
  moreOptions: boolean
}

export default class ChartConfigForm extends React.Component<ChartConfigFormProps, ChartConfigFormState> {
  state = {
    moreOptions: false,
  }

  render() {
    const { onChange, value } = this.props
    return (
      <form style={{ width: '60%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
          <EuiFormFieldset>
            <EnumSelect
              inputLabel="mode"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => onChange('mode', e.target.value)}
              value={value.mode}
              enumType={GraphMode}
            />
          </EuiFormFieldset>
          <EuiSwitch
            compressed
            label={<span style={{ paddingRight: '10px' }}>Staircase</span>}
            checked={value.staircase}
            onChange={(e) => onChange('staircase', e.target.checked)}
          />
          <EuiSwitch
            compressed
            label="Fill"
            checked={value.fill}
            onChange={(e) => onChange('fill', e.target.checked)}
          />
          <EuiAccordion
            forceState={this.state.moreOptions ? 'open' : 'closed'}
            onToggle={isOpen => this.setState({ moreOptions: isOpen })}
            buttonContent={this.state.moreOptions ? 'Less options' : 'More options'}
          >
            <span></span>
          </EuiAccordion>
        </div>
        {
          this.state.moreOptions &&
          <div className="more-options">
            <section style={styles.formSection}>
              <EuiFormFieldset style={{width: '48%'}} legend={{ children: 'Title' }}>
                <EuiFieldText
                  placeholder="Title"
                  value={value.title}
                  onChange={(e) => onChange('title', e.target.value)}
                  aria-label="Title"
                  maxLength={parseInt(TITLE_MAX_LENGTH)}
                />
              </EuiFormFieldset>
              <EuiFormFieldset style={{width: '48%'}} legend={{ children: 'X axis Label' }}>
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
              <div style={styles.rightYAxis as CSSProperties}>
                <div style={{width: '48%'}}>
                  <EuiSwitch
                    compressed
                    label="Use Right Y Axis"
                    checked={value.yAxis2}
                    onChange={(e) => onChange('yAxis2', e.target.checked)}
                  />
                </div>
                {
                  value.yAxis2 &&
                  <div style={{width: '48%'}}>
                    {Object.keys(value.keyToY2Axis).map(key =>
                      <>
                        <EuiSwitch
                          compressed
                          label={key}
                          checked={value.keyToY2Axis[key]}
                          onChange={(e) => onChange('keyToY2Axis', { ...value.keyToY2Axis, [key]: e.target.checked })}
                          key={key}
                        />
                        <EuiSpacer size="m" />
                      </>
                    )}
                  </div>
                }
              </div>
            </section>
            <section className="y-axis-config" style={styles.formSection}>
              <YAxisConfigForm
                label="Left Y Axis"
                onChange={(v: any) => onChange('yAxisConfig', v)}
                isLeftYAxis={true}
                value={value.yAxisConfig}
              />
              {
                value.yAxis2 &&
                <YAxisConfigForm
                  label="Right Y Axis"
                  onChange={(v: any) => onChange('yAxis2Config', v)}
                  isLeftYAxis={false}
                  value={value.yAxis2Config}
                />
              }
            </section>
          </div>
        }
      </form >
    )
  }
}

const YAxisConfigForm = ({ value, onChange, label }: any) => (
  <div style={{width: '48%'}}>
    <EuiFormFieldset legend={{ children: `${label} Label` }}>
      <EuiFieldText
        placeholder="Label"
        value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value })}
        aria-label="label"
        maxLength={parseInt(Y_LABEL_MAX_LENGTH)}
      />
    </EuiFormFieldset>
    <EuiSpacer size="m" />
    <EuiFormFieldset legend={{ children: `${label} Scale` }}>
      <EnumSelect
        inputLabel="Scale"
        onChange={e => onChange({ ...value, scale: e.target.value as string })}
        value={value.scale}
        enumType={AxisScale}
      />
    </EuiFormFieldset>
  </div>
)


interface EnumSelectProps {
  enumType: any
  inputLabel: string
}
const EnumSelect = ({ enumType, inputLabel, ...props }: EnumSelectProps & EuiSelectProps) => (
  <EuiForm component="form">
    <EuiButtonGroup
      legend='form-button'
      buttonSize='s'
      options={Object.values(enumType).map((v: string) => ({ id: v, label: v }))}
      onChange={id => props.onChange({ target: { value: id}} as any)}
      idSelected={props.value.toString()}
    />
  </EuiForm>
)

