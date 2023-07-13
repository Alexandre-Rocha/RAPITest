import { Handle, Position } from 'reactflow';
import React from 'react';
import { useState } from 'react';

import './css/getRequestNode.css'
import { useEffect } from 'react';


function GetRequestNode({ data, isConnectable }) {

  const [serverURL, setServerURL] = useState(data.custom.initialServer);
  const [path, setPath] = useState(data.custom.initialPath);

  console.log("[Get request node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Get request node] Test ID: ", data.custom._testIndex)

 /*  useEffect(()=>{
    data.custom.methodChangeCallback("Get", data.custom._wfIndex, data.custom._testIndex)
  }, [data.custom]) */ //TODO: cant do this yet cuz it crashes cuz it expects state in editor to exist already

  const onChangeServer = (event) => {
    setServerURL(event.target.value)
    console.log("[Get request node] Selected server: ", event.target.value)
    data.custom.serverChangeCallback(event.target.value, data.custom._wfIndex, data.custom._testIndex)
    data.custom.methodChangeCallback("Get", data.custom._wfIndex, data.custom._testIndex) //TODO: this is probably not necessary more than once
  };

  const onChangePath = (event) => {
    setPath(event.target.value)
    console.log("[Get request node] Selected path: ", event.target.value)
    data.custom.pathChangeCallback(event.target.value, data.custom._wfIndex, data.custom._testIndex)
    data.custom.methodChangeCallback("Get", data.custom._wfIndex, data.custom._testIndex) //TODO: this is probably not necessary more than once
  };


  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <label htmlFor="readonly">GET node </label>

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

      <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
    </div>
  );
}


export default GetRequestNode;
