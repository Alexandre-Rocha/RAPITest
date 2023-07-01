import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/getRequestNode.css'

function StatusVerificationNode({ data, isConnectable }) {

  const [statusCode, setStatusCode] = useState(data.custom.initialStatusCode);

  console.log("[Status node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Status node] Test ID: ", data.custom._testIndex)

  const onStatusCodeChange = (evt) => {
    console.log("[Status node] Status code: ", evt.target.value)
    setStatusCode(evt.target.value)
    data.custom.onStatusCodeChange(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };


  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <label htmlFor="readonly">Status code node</label>

      <div>
        <label htmlFor="text">Status code:</label>
        <input value={statusCode} id="text" name="text" onChange={onStatusCodeChange} className="nodrag" />
      </div>

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default StatusVerificationNode;
