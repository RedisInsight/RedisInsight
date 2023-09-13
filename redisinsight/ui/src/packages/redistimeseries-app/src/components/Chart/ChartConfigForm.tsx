import React, { useState } from 'react'
import {
  EuiFieldText,
  EuiSwitch,
  EuiFormFieldset,
  EuiButtonGroup,
  EuiAccordion,
  EuiButtonGroupProps,
} from '@elastic/eui'
import { AxisScale, GraphMode, ChartConfigFormProps } from './interfaces'
import { X_LABEL_MAX_LENGTH, Y_LABEL_MAX_LENGTH, TITLE_MAX_LENGTH } from './constants'

const NewEnumSelect = ({selected, values, onClick}: {select: string, values: string[], onClick: (v: string) => void}) => (
  <div className="new-button">
      {
        values.map(v => (
          <div
            title={v.charAt(0).toUpperCase() + v.slice(1)}
            onClick={() => onClick(v)}
            className={`button-point ${selected === v ? 'button-selected' : null}`}
          >
            {v}
          </div>
        ))
      }
  </div>
)

export default function ChartConfigForm(props: ChartConfigFormProps) {
  const [moreOptions, setMoreOptions] = useState(false)

  const { onChange, value } = props

  return (
    <form className="chart-config-form">
      <div className="chart-top-form">
        <NewEnumSelect values={Object.keys(GraphMode)} selected={value.mode} onClick={v => onChange('mode', v)} />
        <EuiSwitch
          compressed
          label={<span className="switch-staircase-label">Staircase</span>}
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
          arrowDisplay='right'
          forceState={moreOptions ? 'open' : 'closed'}
          onToggle={isOpen => setMoreOptions(isOpen)}
          buttonContent={moreOptions ? 'Less options' : 'More options'}
        >
          <span></span>
        </EuiAccordion>
      </div>
      { moreOptions && (
        <div className="more-options">
          <section>
            <EuiFormFieldset legend={{ children: 'Title' }}>
              <EuiFieldText
                placeholder="Title"
                value={value.title}
                onChange={(e) => onChange('title', e.target.value)}
                aria-label="Title"
                maxLength={parseInt(TITLE_MAX_LENGTH)}
              />
            </EuiFormFieldset>
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
          <section>
            <div className="right-y-axis">
              <div className="switch-wrapper">
                <EuiSwitch
                  compressed
                  label="Use Right Y Axis"
                  checked={value.yAxis2}
                  onChange={(e) => onChange('yAxis2', e.target.checked)}
                />
              </div>
              { value.yAxis2 && (
                <div className="y-axis-2">
                  { Object.keys(value.keyToY2Axis).map(key =>
                    <div className='y-axis-2-item'>
                      <div>{key}</div>
                      <EuiButtonGroup
                        buttonSize='compressed'
                        options={['left', 'right'].map((v: string) => ({ id: v, label: v }))}
                        onChange={id => onChange('keyToY2Axis', { ...value.keyToY2Axis, [key]: id === 'right' })}
                        idSelected={value.keyToY2Axis[key] === true ? 'right' : 'left'}
                        isFullWidth
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          <section className="y-axis-config">
            <YAxisConfigForm
              label="Left Y Axis"
              onChange={(v: any) => onChange('yAxisConfig', v)}
              isLeftYAxis={true}
              value={value.yAxisConfig}
            />
            { value.yAxis2 && (
              <YAxisConfigForm
                label="Right Y Axis"
                onChange={(v: any) => onChange('yAxis2Config', v)}
                isLeftYAxis={false}
                value={value.yAxis2Config}
              />
            )}
          </section>
        </div>
      )}
    </form >
  )
}

const YAxisConfigForm = ({ value, onChange, label }: any) => (
  <div>
    <EuiFormFieldset legend={{ children: `${label} Label` }}>
      <EuiFieldText
        placeholder="Label"
        value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value })}
        aria-label="label"
        maxLength={parseInt(Y_LABEL_MAX_LENGTH)}
      />
    </EuiFormFieldset>
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
  value: string
}
const EnumSelect = ({ enumType, inputLabel, ...props }: EnumSelectProps & EuiButtonGroupProps) => (
  <EuiButtonGroup
    legend='form-button'
    buttonSize='compressed'
    options={Object.values(enumType).map((v: string) => ({ id: v, label: v }))}
    onChange={id => props.onChange({ target: { value: id}} as any)}
    idSelected={props.value.toString()}
    isFullWidth
  />
)

