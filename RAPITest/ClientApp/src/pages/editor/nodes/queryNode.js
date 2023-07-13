import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

function QueryNode({ data, isConnectable }) {


  const [query, setQuery] = useState(data.custom.query || [{ key: '', value: '' }]);

  const handleKeyChange = (index, value) => {
    const updatedQuery = [...query];
    updatedQuery[index].key = value;
    setQuery(updatedQuery);
    data.custom.keyChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex);
  };
  
  const handleValueChange = (index, value) => {
    const updatedQuery = [...query];
    updatedQuery[index].value = value;
    setQuery(updatedQuery);
    data.custom.valueChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex);
  };
  
  const addQuery = () => {
    setQuery([...query, { key: '', value: '' }]);
  };
  
  const removeQuery = (index) => {
    const updatedQuery = [...query];
    updatedQuery.splice(index, 1);
    setQuery(updatedQuery);
  };
  
  const logState = () => {
    console.log("log state");
    console.log(query);
  };
  
  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
  
      <div>
        <label htmlFor="text">Query node</label>
      </div>
  
      {query.map((queryItem, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Key"
            value={queryItem.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
          />
          <input
            type="text"
            placeholder="Value"
            value={queryItem.value}
            onChange={(e) => handleValueChange(index, e.target.value)}
          />
          <button onClick={() => removeQuery(index)}>-</button>
        </div>
      ))}
  
      <button onClick={addQuery}>Add Query</button>
      <button onClick={logState}>Log State</button>
  
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
  
}


export default QueryNode;