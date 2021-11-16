import React from 'react'
import { ContentEditableEvent } from 'react-contenteditable'

import { ContentEditable } from 'uiSrc/components'
import { parseContentEditableChangeHtml } from 'uiSrc/components/ContentEditable'

import styles from './styles.module.scss'

export interface Props {
  command: string;
  setInputEl: Function;
  setCommand: (command: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
}

const CliInput = (props: Props) => {
  const { command = '', setInputEl, setCommand, onKeyDown } = props

  const onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()
  }

  const onChange = (e: ContentEditableEvent) => {
    setCommand(parseContentEditableChangeHtml(e.target.value ?? ''))
  }

  return (
    <>
      &gt;&nbsp;
      <ContentEditable
        tagName="span"
        html={command}
        id={styles.command}
        spellCheck={false}
        data-testid="cli-command"
        innerRef={setInputEl}
        onKeyDown={onKeyDown}
        onMouseUp={onMouseUp}
        onChange={onChange}
      />
    </>
  )
}

export default CliInput
