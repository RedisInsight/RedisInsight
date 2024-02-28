import React from 'react'
import { getDefaultEuiMarkdownProcessingPlugins } from '@elastic/eui'
import { ExternalLink } from 'uiSrc/components'

const remarkLink = (data: any) => {
  if (!data) return null

  return (
    <ExternalLink
      iconSize="s"
      href={data.href}
    >
      {data.href}
    </ExternalLink>
  )
}

const remarkCode = (data: any) => {
  if (!data) return null

  console.log(data)

  return (<span>123</span>)
}

const defaultPlugins = getDefaultEuiMarkdownProcessingPlugins()
defaultPlugins[1][1].components.a = remarkLink
defaultPlugins[1][1].components.code = remarkCode
const processingMarkdownPlugins = [...defaultPlugins, remarkLink, remarkCode] as any

export {
  remarkLink,
  processingMarkdownPlugins
}
