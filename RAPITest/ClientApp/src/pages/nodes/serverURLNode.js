import { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './serverURLNode.css'

const handleStyle = { left: 10 };


function ServerURLNode({ data, isConnectable }) {

  console.log("[Server URL node] Workflow ID: ",data.custom.workflowID)


  const [testName, setTestName] = useState(data?.myData || ""); 
  
  const setStateTestName = (newTestName) => {
    console.log('setStateTestName is being called with', newTestName);
    setTestName(newTestName)
  }

  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
    setStateTestName(evt.target.value)
  }, []);
  

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="text">Server URL:</label>
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


export default ServerURLNode;
