import React from 'react'
import { EuiToolTip, EuiIcon } from '@elastic/eui'
import { EntityInfo, EntityType } from './parser'

interface INodeProps {
  label: string
  numRecords?: string
  executionTime?: string
  snippet?: string
}

function Snippet({ content }: { content: string }) {
  return (
    <div className="FooterCommon Footer">
      <EuiToolTip delay="long" content={content}><span>{content}</span></EuiToolTip>
    </div>
  )
}

export function ExplainNode(props: INodeProps) {
  const propData: EntityInfo = (props as any).node.getData()
  const { id, type, data, snippet, subType } = propData

  const infoData = data || type

  return (
    <div className="ExplainContainer" id={`node-${id}`}>
      <div className="Main">
        <div className="Info">
          <div className="InfoData">
            <EuiToolTip delay="long" content={infoData}><span>{infoData}</span></EuiToolTip>
          </div>
          {subType && [EntityType.GEO, EntityType.NUMERIC, EntityType.TEXT, EntityType.TAG, EntityType.FUZZY, EntityType.WILDCARD, EntityType.PREFIX, EntityType.IDS, EntityType.LEXRANGE, EntityType.NUMBER].includes(subType) && <div className="Type">{subType}</div> }
        </div>
      </div>
      {
        snippet && <Snippet content={snippet} />
      }
    </div>
  )
}

interface INodeToolTip {
  content?: string
  items?: { [key: string]: string }
}

function NodeToolTipContent(props: INodeToolTip) {
  if (props.content !== undefined) {
    return <div className="NodeToolTip">{props.content}</div>
  }

  if (props.items !== undefined) {
    const { items } = props
    return (
      <div className="NodeToolTip">
        {
          Object.keys(items).map((k) => (
            <div className="NodeToolTipItem">{k}: {items[k]}</div>
          ))
        }
      </div>
    )
  }

  return null
}

export function ProfileNode(props: INodeProps) {
  const info: EntityInfo = (props as any).node.getData()
  const { id, data, type, snippet, time, counter, size, recordsProduced } = info

  const items = {}

  if (counter !== undefined) {
    items.Counter = counter
  }

  if (size !== undefined) {
    items.Size = size
  }

  const infoData = data || type
  return (
    <div className="ProfileContainer" id={`node-${id}`}>
      <div className="Main">
        <div className="InfoData">
          <EuiToolTip delay="long" content={infoData}><span>{infoData}</span></EuiToolTip>
        </div>
        <div className="Type">{[EntityType.GEO, EntityType.NUMERIC, EntityType.TEXT, EntityType.TAG].includes(type) ? type : ''}</div>
      </div>
      {
        snippet && <Snippet content={snippet} />
      }
      <div className="MetaData">
        <EuiToolTip content={<NodeToolTipContent content="Execution Time" />}>
          <div className="Time">
            <div className="IconContainer"><EuiIcon className="NodeIcon" size="m" type="clock" /></div>
            <div>{time} ms</div>
          </div>
        </EuiToolTip>
        <EuiToolTip
          content={(
            <NodeToolTipContent
              {...{
                items: recordsProduced === undefined ? items : undefined,
                content: recordsProduced ? 'Records produced' : undefined
              }}
            />
          )}
        >
          <div className="Size">
            <div>{
              counter !== undefined ? counter
                : size !== undefined ? size : recordsProduced
}
            </div>
            <div className="IconContainer"><EuiIcon className="NodeIcon" size="m" type="reportingApp" /></div>
          </div>
        </EuiToolTip>
      </div>
    </div>
  )
}
