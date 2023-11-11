import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Button, Form, Accordion } from 'react-bootstrap';

import './css/generalNode.css'
import './css/queryNode.css'

function QueryNode({ data, isConnectable, xPos, yPos }) {


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
    data.custom.addQueryCallback(data.custom._wfIndex, data.custom._testIndex)
  };

  const removeQuery = (index) => {
    const updatedQuery = [...query];
    updatedQuery.splice(index, 1);
    setQuery(updatedQuery);
    data.custom.removeQueryCallback(index, data.custom._wfIndex, data.custom._testIndex)
  };


  console.log("[Query node] X pos: ", xPos)
  console.log("[Query node] Y pos: ", yPos)

  return (
    <div className="query-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='query-area area' eventKey="0">
          <Accordion.Header className='query-header header'>Query</Accordion.Header>
          <Accordion.Body>

            <div>
              <label htmlFor="text">Query</label>
            </div>

            {query.map((queryItem, index) => (
              <div className='header-line' key={index}>

                <Form.Control value={queryItem.key} onChange={(e) => handleKeyChange(index, e.target.value)} className="key-field" type="text" placeholder="Key" />
                <Form.Control value={queryItem.value} onChange={(e) => handleValueChange(index, e.target.value)} className="value-field" type="text" placeholder="Value" />
                <Button className='remove-header' variant="light" size="sm" onClick={() => removeQuery(index)}>-</Button>

              </div>
            ))}

            <button onClick={addQuery}>Add Query</button>

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default QueryNode;