import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import {Button} from 'react-bootstrap';

import { Form } from 'react-bootstrap';

import { Accordion } from 'react-bootstrap';

import './css/generalNode.css'
import './css/headersNode.css'

function HeadersNode({ data, isConnectable }) {


  const [headers, setHeaders] = useState(data.custom.headers || [{ key: '', value: '' }]);

  const handleKeyChange = (index, value) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index].key = value;
    setHeaders(updatedHeaders);
    data.custom.keyChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex)
  };

  const handleValueChange = (index, value) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index].value = value;
    setHeaders(updatedHeaders);
    data.custom.valueChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex)
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
    data.custom.addHeaderCallback(data.custom._wfIndex, data.custom._testIndex)
  };

  const removeHeader = (index) => {
    const updatedHeaders = [...headers];
    updatedHeaders.splice(index, 1);
    setHeaders(updatedHeaders);
    data.custom.removeHeaderCallback(index, data.custom._wfIndex, data.custom._testIndex)
  };

  const logState = () => {
    console.log("log state");
    console.log(headers);
  };

  //TODO: n tem nada aver aqui mas no save changes remover headers vazios

  return (
    <div className="headers-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />



      <Accordion defaultActiveKey="0">
        <Accordion.Item className='headers-area area' eventKey="0">
          <Accordion.Header className='headers-header header'>Headers</Accordion.Header>
          <Accordion.Body>

            <div>
              <label htmlFor="text">Headers</label>
            </div>

            {headers.map((header, index) => (
              <div className='header-line' key={index}>

                <Form.Control  value={header.key} onChange={(e) => handleKeyChange(index, e.target.value)} className="key-field" type="text" placeholder="Key" />

                <Form.Control value={header.value} onChange={(e) => handleValueChange(index, e.target.value)} className="value-field" type="text" placeholder="Value" />

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
                <Button className='remove-header' variant="light" size="sm" onClick={() => removeHeader(index)}>-</Button>
              </div>
            ))}

            <button onClick={addHeader}>Add Header</button>
            <button onClick={logState}>Log State</button> {/* HERE */}


          </Accordion.Body>
        </Accordion.Item>
      </Accordion>


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
};




export default HeadersNode;