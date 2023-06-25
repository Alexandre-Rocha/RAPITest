//import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';
import { useState } from 'react';

import './css/getRequestNode.css'

const handleStyle = { left: 10 };

let optionsServers = ["Servers:"]
let optionsPaths = ["Paths:"]

function GetRequestNode({ data, isConnectable }) {


  const [selectedOption, setSelectedOption] = useState('');

  const [done, setDone] = useState(false);

  const [serverURL, setServerURL] = useState(data.custom.initialServer);
  const [path, setPath] = useState(data.custom.initialPath);

  const handleOptionChange = (event) => {
    //setSelectedOption(event.target.value);
  };

  const handleOptionChangeServer = (event) => {
    //setSelectedOption(event.target.value);
    setServerURL(event.target.value)
    data.custom.mycallback(event.target.value, data.custom._wfIndex, data.custom._testIndex)
    data.custom.methodcallback("Get", data.custom._wfIndex, data.custom._testIndex)
  };

  const handleOptionChangePath = (event) => {
    //setSelectedOption(event.target.value);
    setPath(event.target.value)
    data.custom.mycallback2(event.target.value, data.custom._wfIndex, data.custom._testIndex)
    data.custom.methodcallback("Get", data.custom._wfIndex, data.custom._testIndex) //TODO:
  };

  console.log("[Get request node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Get request node] Test ID: ", data.custom._testIndex)


  //const [testName, setTestName] = useState(""); // p sure this is supposed to be server, not testName
  //const [path, setPath] = useState(""); 


  const onChange = (evt) => {
    console.log(evt.target.value);
    //setTestName(evt.target.value)
    data.custom.mycallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };

  const onChange2 = (evt) => {
    console.log(evt.target.value);
    //setPath(evt.target.value)
    data.custom.mycallback2(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
    data.custom.methodcallback("Get", data.custom._wfIndex, data.custom._testIndex)
  };

  if (data.custom.paths && done === false) { //TODO: this is probabbly not good, use state or wtv
    optionsServers = optionsServers.concat(data.custom.servers);
    setDone(true)
  }

  if (data.custom.servers && done === false) {  //TODO: this is probabbly not good, use state or wtv
    optionsPaths = optionsPaths.concat(data.custom.paths);
    setDone(true)
  }

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <label htmlFor="readonly">GET node </label>

      <div>
      <label htmlFor="readonly">Server URL </label>
        <input
          type="text"
          value={serverURL}
          onChange={handleOptionChangeServer}
        />
        <select value={serverURL} onChange={handleOptionChangeServer}>
          {optionsServers.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <label htmlFor="readonly">Path </label>
      <input
        type="text"
        value={path}
        onChange={handleOptionChangePath}
      />
      <select value={path} onChange={handleOptionChangePath}>
        {optionsPaths.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div>

      </div>
      




      {/* <div>
        <input
          type="text"
          value={selectedOption}
          onChange={handleOptionChange}
        />
        <select value={selectedOption} onChange={handleOptionChange}>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div> */}

      {/* <div>
        <label htmlFor="text">Server URL:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div> */}

      {/* <div>
        <label htmlFor="text">Path:</label>
        <input id="text" name="text" onChange={onChange2} className="nodrag" />
      </div> */}

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
