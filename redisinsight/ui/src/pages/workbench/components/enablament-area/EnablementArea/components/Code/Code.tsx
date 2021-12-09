import React, { useContext } from 'react'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import CodeButton from '../CodeButton'

export interface Props {
  label: string;
  children: string;
}

const Code = ({ children, ...rest }: Props) => {
  const { setScript } = useContext(EnablementAreaContext)

  const loadContent = () => {
    setScript(children)
  }

  return (
    <CodeButton className="mb-s mt-s" onClick={loadContent} {...rest} />
  )
}

export default Code
