import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { CodeBlock } from 'uiSrc/components'
import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import { DryRunJobResultStatus } from 'uiSrc/slices/interfaces'
import MonacoJson from 'uiSrc/components/monaco-editor/components/monaco-json'

const DryRunJobTransformations = () => {
  const { results } = useSelector(rdiDryRunJobSelector)

  const [transformations, setTransformations] = useState('')

  useEffect(() => {
    if (results && results.transformations?.status === DryRunJobResultStatus.Success) {
      try {
        const transformations = JSON.stringify(results.transformations?.data, null, 2)
        setTransformations(transformations)
      } catch (e) {
        setTransformations(results.transformations?.data ?? '')
      }
    }

    if (results && results.transformations?.status === DryRunJobResultStatus.Failed) {
      setTransformations(results.transformations?.error ?? '')
    }
  }, [results])

  return (
    <>
      {results?.transformations?.status === DryRunJobResultStatus.Failed ? (
        <div className="rdi-dry-run__codeBlock" data-testid="transformations-output">
          <CodeBlock className="rdi-dry-run__code">
            <span className="rdi-dry-run__error">{transformations}</span>
          </CodeBlock>
        </div>
      ) : (
        <MonacoJson
          readOnly
          value={transformations}
          wrapperClassName="rdi-dry-run__transformationsCode"
          data-testid="transformations-output"
        />
      ) }
    </>
  )
}

export default DryRunJobTransformations
