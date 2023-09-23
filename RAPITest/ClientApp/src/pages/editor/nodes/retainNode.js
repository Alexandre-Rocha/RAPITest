import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';


import {Button} from 'react-bootstrap';

import { Form } from 'react-bootstrap';

import { Accordion } from 'react-bootstrap';

import './css/generalNode.css'
import './css/retainNode.css'

function RetainNode({ data, isConnectable, xPos, yPos }) {

  const [retains, setRetains] = useState(data.custom.retains || [{ key: '', value: '' }]);

  const handleKeyChange = (index, value) => {
    const updatedRetains = [...retains];
    updatedRetains[index].key = value;
    setRetains(updatedRetains);
    data.custom.keyChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex)
  };

  const handleValueChange = (index, value) => {
    const updatedRetains = [...retains];
    updatedRetains[index].value = value;
    setRetains(updatedRetains);
    data.custom.valueChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex)
  };

  const addRetain = () => {
    setRetains([...retains, { key: '', value: '' }]);
    data.custom.addRetainCallback(data.custom._wfIndex, data.custom._testIndex)
  };

  const removeRetain = (index) => {
    const updatedRetains = [...retains];
    updatedRetains.splice(index, 1);
    setRetains(updatedRetains);
    data.custom.removeRetainCallback(index, data.custom._wfIndex, data.custom._testIndex)
  };

  const logState = () => {
    console.log("log state");
    console.log(retains);
  };


  console.log("[Retain node] X pos: ", xPos)
  console.log("[Retain node] Y pos: ", yPos)

  return (
    <div className="retain-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='retain-area area' eventKey="0">
          <Accordion.Header className='retain-header header'>Retain</Accordion.Header>
          <Accordion.Body>

            <div>
              <label htmlFor="text">Retain</label>
            </div>

            {retains.map((retain, index) => (
              <div className='header-line' key={index}>

                <Form.Control  value={retain.key} onChange={(e) => handleKeyChange(index, e.target.value)} className="key-field" type="text" placeholder="Key" />

                <Form.Control value={retain.value} onChange={(e) => handleValueChange(index, e.target.value)} className="value-field" type="text" placeholder="Value" />

                {/* <input
                  type="text"
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                /> */}
                <Button className='remove-header' variant="light" size="sm" onClick={() => removeRetain(index)}>-</Button>
              </div>
            ))}

            <button onClick={addRetain}>Add Retain</button>
            <button onClick={logState}>Log State</button> {/* HERE */}


          </Accordion.Body>
        </Accordion.Item>
      </Accordion>


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default RetainNode;