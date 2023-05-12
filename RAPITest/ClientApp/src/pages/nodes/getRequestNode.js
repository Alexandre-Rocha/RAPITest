import { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './getRequestNode.css'

const handleStyle = { left: 10 };


function GetRequestNode({ data, isConnectable }) {


  console.log("[Get request node] Workflow ID: ",data.custom._wfIndex)
  console.log("[Get request node] Test ID: ",data.custom._testIndex)


  const [testName, setTestName] = useState(""); // p sure this is supposed to be server, not testName
  const [path, setPath] = useState(""); 
  

  const onChange = (evt) => {
    console.log(evt.target.value);
    setTestName(evt.target.value)
    data.custom.mycallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };

  const onChange2 = (evt) => {
    console.log(evt.target.value);
    setPath(evt.target.value)
    data.custom.mycallback2(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
    data.custom.methodcallback("Get", data.custom._wfIndex, data.custom._testIndex)
  };
  

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="readonly">GET node example</label>
      </div>
      <div>
        <label htmlFor="text">Server URL:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>

      <div>
        <label htmlFor="text">Path:</label>
        <input id="text" name="text" onChange={onChange2} className="nodrag" />
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


export default GetRequestNode;
