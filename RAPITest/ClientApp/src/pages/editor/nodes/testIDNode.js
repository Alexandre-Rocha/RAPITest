import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/testIDNode.css'

const handleStyle = { left: 10 };


function TestIDNode({ data, isConnectable }) {

  


  const [testIndex, setTestIndex] = useState(data.custom._testIndex || -1) //TODO: idk

  const [testName, setTestName] = useState(data.custom.testName); 

  useEffect(() => {
    console.log("kiokiokio");
    console.log(data.custom._testIndex);
    console.log(testIndex);
    if (data.custom._testIndex !== testIndex) {
      console.log("INSIDE IF");
      console.log("below this should never be false");
      console.log(data.custom_testIndex !== testIndex);
      console.log(data.custom._testIndex);
      console.log(testIndex);
      console.log("smsmmsm");
      setTestIndex(data.custom._testIndex);
    }
  }, [data.custom._testIndex]); //TODO:
  

  console.log("[Test node] Workflow ID: ",data.custom._wfIndex)
  console.log("[Test node] Test ID: ", testIndex)

  const setStateTestName = (newTestName) => {
    console.log('setStateTestName is being called with', newTestName);
    setTestName(newTestName)
  }

  const onChange = (evt) => {
    console.log(evt.target.value);
    setStateTestName(evt.target.value)//todo:achoq e preciso
    data.custom.nameChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };

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
        <label htmlFor="text">Name of new test ID:</label>
        <input value={testName} id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <div>
        wf: {data.custom._wfIndex}
      </div>
      <div>
        test: {testIndex}
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


export default TestIDNode;
