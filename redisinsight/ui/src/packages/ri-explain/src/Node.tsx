import React from 'react'
import { AntHierarchyInput } from './parser';

interface INodeProps {
  label: string
  numRecords?: string
  executionTime?: string
  snippet?: string
}


export function ExplainNode(props: INodeProps) {
  const data = (props as any).node.getData();
  const label = data ? data.label : '';
  const snippet = data ? data.snippet : '';
  return (
    <div className="ExplainContainer">
      <div className="Main">
        <div className="Info">
          <div>{label}</div>
          {data.type === 'Expr' && <div className="Type">text</div> }
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
