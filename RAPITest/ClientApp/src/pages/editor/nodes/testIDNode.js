import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/testIDNode.css'



function TestIDNode({ data, isConnectable }) {
  
  const [testIndex, setTestIndex] = useState(data.custom._testIndex || -1) // Either id from pre-exisitng TSL or -1 (not assigned)
  const [testName, setTestName] = useState(data.custom.testName || ""); // Either name from pre-existing TSL or empty name 

  const [httpMethods, setHttpMethods] = useState(["Get","Delete","Post","Put"]) //TODO: ideally this comes from parent

  const [serverURL, setServerURL] = useState(data.custom.initialServer);
  const [path, setPath] = useState(data.custom.initialPath);
  const [method, setMethod] = useState(data.custom.initialMethod)


  const onChangeServer = (event) => {
    setServerURL(event.target.value)
    console.log("[Test node] Selected server: ", event.target.value)
    data.custom.serverChangeCallback(event.target.value, data.custom._wfIndex, data.custom._testIndex)
    //data.custom.methodChangeCallback("Get", data.custom._wfIndex, data.custom._testIndex) //TODO: this is probably not necessary more than once
  };

  const onChangePath = (event) => {
    setPath(event.target.value)
    console.log("[Test node] Selected path: ", event.target.value)
    data.custom.pathChangeCallback(event.target.value, data.custom._wfIndex, data.custom._testIndex)
    //data.custom.methodChangeCallback("Get", data.custom._wfIndex, data.custom._testIndex) //TODO: this is probably not necessary more than once
  };

  const onChangeMethod = (event) => {
    setMethod(event.target.value)
    console.log("[Test node] Selected method: ", event.target.value)
    data.custom.methodChangeCallback("Get", data.custom._wfIndex, data.custom._testIndex) //TODO: this is probably not necessary more than once
  };



  /* eslint-disable */
  useEffect(() => {
    // If text index from props change, reflect onto own state
    if (data.custom._testIndex !== testIndex) {
      setTestIndex(data.custom._testIndex);
    }
  }, [data.custom._testIndex]); //we dont want testIndex here because it will lead to infinite rerender-> THIS IS WHY ESLINT IS DISABLED
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
        <label htmlFor="readonly">Server URL </label>
        <input
          type="text"
          value={serverURL}
          onChange={onChangeServer}
        />
        <select value={serverURL} onChange={onChangeServer}>
          <option value="">Servers:</option>
          {data.custom.servers.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="readonly">Path </label>
        <input
          type="text"
          value={path}
          onChange={onChangePath}
        />
        <select value={path} onChange={onChangePath}>
          <option value="">Paths:</option>
          {data.custom.paths.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>


      <div>
        <label htmlFor="readonly">Method </label>
        <input
          type="text"
          value={method}
          onChange={onChangeMethod}
        />
        <select value={method} onChange={onChangeMethod}>
          <option value="">Method:</option>
          {httpMethods.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
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
