import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './testIDNode.css'

const handleStyle = { left: 10 };


function TestIDNode({ data, isConnectable }) {

  console.log("[Test node] Workflow ID: ",data.custom._wfIndex)
  console.log("[Test node] Test ID: ",data.custom._testIndex)



  const [testName, setTestName] = useState(data?.myData || ""); 
  
  const setStateTestName = (newTestName) => {
    console.log('setStateTestName is being called with', newTestName);
    setTestName(newTestName)
  }

  const onChange = (evt) => {
    console.log(evt.target.value);
    setStateTestName(evt.target.value)//todo:achoq e preciso
    data.custom.mycallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };
  

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="text">Name of new test ID:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <div>
        <label htmlFor="readonly">Read-only field:</label>
        <input
          id="readonly"
          name="readonly"
          type="text"
          readOnly
          value={testName}
          className="nodrag"
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default TestIDNode;
