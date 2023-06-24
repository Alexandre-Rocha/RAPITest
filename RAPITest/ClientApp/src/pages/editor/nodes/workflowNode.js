import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/workflowNode.css'

const handleStyle = { left: 10 };


function WorkflowNode({ data, isConnectable }) {

  


  const [wfIndex, setWfIndex] = useState(data.custom._wfIndex || 0)

  const [wfName, setWfName] = useState(data.custom.wfName || "") //TODO:there must be smth here in case data has nothing
  
  console.log("[Workflow node] Workflow ID: ", wfIndex)


  const onChange = (evt) => {
    console.log(evt.target.value);
    setWfName(evt.target.value)
    data.custom.nameChangeCallback(evt.target.value)
  };
  

  const onIncrement = ()=> {
    setWfIndex(oldWfIndex => oldWfIndex + 1)
  }

  const onDecrement = ()=> {
    setWfIndex(oldWfIndex => oldWfIndex - 1)
  }
  

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="text">Name of new workflow:</label>
        <input value={wfName} id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <div>
        wf: {wfIndex}
        <button onClick={onIncrement}>increment</button>
        <button onClick={onDecrement}>decrement</button>
      </div>
      {/* <div>
        <label htmlFor="readonly">Read-only field:</label>
        <input
          id="readonly"
          name="readonly"
          type="text"
          readOnly
          value={testName}
          className="nodrag"
        />
      </div> */}
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      /> */}
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default WorkflowNode;
