import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/schemaVerificationNode.css'

const handleStyle = { left: 10 };


function SchemaVerificationNode({ data, isConnectable }) {

  console.log("[Schema node] Workflow ID: ",data.custom._wfIndex)
  console.log("[Schema node] Test ID: ",data.custom._testIndex)

  const [testName, setTestName] = useState(""); 

  const onChange = (evt) => {
    console.log(evt.target.value);
    setTestName(evt.target.value)
    data.custom.mycallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)

  };
  

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="readonly">schema verification node example</label>
      </div>
      <div>
        <label htmlFor="text">paste the schema:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <div>
        <label htmlFor="readonly">Read-only field - state is working:</label>
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


export default SchemaVerificationNode;
