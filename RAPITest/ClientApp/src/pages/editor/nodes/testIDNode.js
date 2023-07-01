import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/testIDNode.css'


function TestIDNode({ data, isConnectable }) {
  
  const [testIndex, setTestIndex] = useState(data.custom._testIndex || -1) // Either id from pre-exisitng TSL or -1 (not assigned)
  const [testName, setTestName] = useState(data.custom.testName || ""); // Either name from pre-existing TSL or empty name 

  /* eslint-disable */
  useEffect(() => {
    // If text index from props change, reflect onto own state
    if (data.custom._testIndex !== testIndex) {
      setTestIndex(data.custom._testIndex);
    }
  }, [data.custom._testIndex]); //TODO: I think this is probably not necessary if I do things right.
  /* eslint-enable */

  
  console.log("[Test node] Workflow ID: ",data.custom._wfIndex)
  console.log("[Test node] Test ID: ", testIndex)


  const onTestNameChange = (evt) => {
    console.log("[Test node] Test name: ", evt.target.value)
    setTestName(evt.target.value)
    data.custom.nameChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };

  //TODO: Think better on how to implement changing Test order; for now this works
  const onIncrement = ()=> {
    setTestIndex(oldTestIndex => oldTestIndex + 1)
  }
  const onDecrement = ()=> {
    setTestIndex(oldTestIndex => oldTestIndex - 1)
  }
  

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <div>
        <label htmlFor="text">Test name:</label>
        <input value={testName} id="text" name="text" onChange={onTestNameChange} className="nodrag" />
      </div>

      <div>
        Wf: {data.custom._wfIndex}
      </div>
      <div>
        Test: {testIndex}
        <button onClick={onIncrement}>+1</button>
        <button onClick={onDecrement}>-1</button>
      </div>
     
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default TestIDNode;
