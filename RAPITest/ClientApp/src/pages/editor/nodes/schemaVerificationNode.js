import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/schemaVerificationNode.css'

//TODO: this whole node needs to be updated
function SchemaVerificationNode({ data, isConnectable }) {

  const [schema, setSchema] = useState()

  console.log("[Schema node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Schema node] Test ID: ", data.custom._testIndex)


  const onSchemaChange = (evt) => {
    console.log(evt.target.value);
    setSchema(evt.target.value)
    data.custom.mycallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)

  };


  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <label htmlFor="readonly">Schema node</label>

      <div>
        <label htmlFor="text">Paste the schema:</label>
        <input value={schema} id="text" name="text" onChange={onSchemaChange} className="nodrag" />
      </div>

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default SchemaVerificationNode;
