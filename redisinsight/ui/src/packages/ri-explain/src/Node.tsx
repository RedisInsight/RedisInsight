import React from 'react'
import { EuiToolTip, EuiIcon } from '@elastic/eui'
import { EntityInfo, EntityType } from './parser';

interface INodeProps {
  label: string
  numRecords?: string
  executionTime?: string
  snippet?: string
}


export function ExplainNode(props: INodeProps) {
  const propData: EntityInfo = (props as any).node.getData();
  const { type, data, snippet } = propData
  return (
    <div className="ExplainContainer">
      <div className="Main">
        <div className="Info">
          <div>{data ? data : type}</div>
          {type === EntityType.Expr && <div className="Type">text</div> }
        </div>
      </div>
      { snippet &&
        <div className='Footer'>
          {snippet}
        </div>
      }
    </div>
  )
}



interface INodeToolTip {
  content: string
}

function NodeToolTipContent(props: INodeToolTip) {
  return (
    <div className={"NodeToolTip"}>
      {props.content}
    </div>
  )
}
function Box() {
  return <div className="Box"></div>
}

export function ProfileNode(props: INodeProps) {
  const info: EntityInfo = (props as any).node.getData();
  const {data, type, snippet, time, counter} = info
  return (
    <div className="NodeContainer">
      <div className="NodeHeader">
        <div className="NodeHeaderInfo">
          <div className="NodeLabel">{data && type}</div>
          <div className="NodeType">text</div>
        </div>
        <div className="NodeHeaderMetadata">
          <div className="MetadataSnippet">{snippet}</div>
          <div className="MetadataCount">
            <div>100</div>
            {[...Array(4)].map(() => <Box />)}
          </div>
        </div>
      </div>
      <div className="NodeMetadata">
        <EuiToolTip className="NodeToolTip" position="bottom" content={<NodeToolTipContent content={"Execution Time"} />}>
          <div className="NodeTime">
            <div className="NodeTimeIcon">
              <EuiIcon className="NodeIcon" size="m" type="clock" />
            </div>
            <div className="NodeTimeUnit">{time} ms</div>
          </div>
        </EuiToolTip>
        <EuiToolTip position="bottom" content={<NodeToolTipContent content={"Records Produced"} />}>
          <div className="NodeContentInfo">
            <div className="NodeContentUnit">
              <span>{counter}</span>
            </div>
            <div className="NodeContentIcon">
              <EuiIcon className="NodeIcon" size="m" type="iInCircle" />
            </div>
          </div>
        </EuiToolTip>
      </div>
    </div>
  )
}
