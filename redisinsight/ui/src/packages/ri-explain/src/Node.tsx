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
  content?: string
  items?: {[key: string]: string}
}

function NodeToolTipContent(props: INodeToolTip) {

  if (props.content !== undefined) {
    return <div className='NodeToolTip'>{props.content}</div>
  }

  if (props.items !== undefined) {
    let items = props.items
    return (
      <div className="NodeToolTip">
        {
          Object.keys(items).map(k => (
            <div className="NodeToolTipItem">{k}: {items[k]}</div>
          ))
        }
      </div>
    )
  }

  return null;
}


export function ProfileNode(props: INodeProps) {
  const info: EntityInfo = (props as any).node.getData();
  const {data, type, snippet, time, counter, size} = info
  // const oldRender =  (
  //   <div className="NodeContainer">
  //     <div className="NodeHeader">
  //       <div className="NodeHeaderInfo">
  //         <div className="NodeLabel">{data ? data : type}</div>
  //         <div className="NodeType">text</div>
  //       </div>
  //       <div className="NodeHeaderMetadata">
  //         <div className="MetadataSnippet">{snippet}</div>
  // {/*<div className="MetadataCount">
  //           <div>100</div>
  //           {[...Array(4)].map(() => <Box />)}
  //         </div>*/}
  //       </div>
  //     </div>
  //     <div className="NodeMetadata">
  //       <EuiToolTip className="NodeToolTip" position="bottom" content={<NodeToolTipContent content={"Execution Time"} />}>
  //         <div className="NodeTime">
  //           <div className="NodeTimeIcon">
  //             <EuiIcon className="NodeIcon" size="m" type="clock" />
  //           </div>
  //           <div className="NodeTimeUnit">{time} ms</div>
  //         </div>
  //       </EuiToolTip>
  //       <EuiToolTip position="bottom" content={<NodeToolTipContent content={"Records Produced"} />}>
  //         <div className="NodeContentInfo">
  //           <div className="NodeContentUnit">
  //             <span>{counter}</span>
  //           </div>
  //           <div className="NodeContentIcon">
  //             <EuiIcon className="NodeIcon" size="m" type="iInCircle" />
  //           </div>
  //         </div>
  //       </EuiToolTip>
  //     </div>
  //   </div>
  // )

  let items = {}

  if (counter !== undefined) {
    items['Counter'] = counter;
  }

  if (size !== undefined) {
    items['Size'] = size;
  }


  return (
    <div className="ProfileContainer">
      <div className="Main">
        <div>{data ? data : type}</div>
        <div className="Type">{[EntityType.GEO, EntityType.NUMERIC, EntityType.TEXT, EntityType.TAG].includes(type) ? type : ''}</div>
      </div>
      <div className="MetaData">
        <EuiToolTip content={<NodeToolTipContent content={"Execution Time"} />}>
          <div className="Time">
            <div className="IconContainer"><EuiIcon className="NodeIcon" size="m" type="clock" /></div>
            <div>{time}</div>
          </div>
        </EuiToolTip>
        <EuiToolTip content={<NodeToolTipContent items={items} />}>
          <div className="Size">
            <div>{counter}</div>
            <div className="IconContainer"><EuiIcon className="NodeIcon" size="m" type="iInCircle" /></div>
          </div>
        </EuiToolTip>
      </div>
    </div>
  )
}
