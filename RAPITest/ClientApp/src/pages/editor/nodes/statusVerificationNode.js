import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import './css/statusVerificationNode.css'
import './css/generalNode.css'

function StatusVerificationNode({ data, isConnectable }) {

  const [statusCode, setStatusCode] = useState(data.custom.initialStatusCode);

  console.log("[Status node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Status node] Test ID: ", data.custom._testIndex)

  const onStatusCodeChange = (evt) => {
    console.log("[Status node] Status code: ", evt.target.value)
    setStatusCode(evt.target.value)
    data.custom.statusChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };


  return (
    <div className="statusVerif-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='statusVerif-area area' eventKey="0">
          <Accordion.Header className='statusVerif-header header'>Status Code</Accordion.Header>
          <Accordion.Body className='nodrag'>


          <label htmlFor="text">Status Code</label>
              <Form.Control value={statusCode} onChange={onStatusCodeChange} className="test-name" type="text" placeholder="Enter text" />


      {/* <label htmlFor="readonly">Status code node</label>

      <div>
        <label htmlFor="text">Status code:</label>
        <input value={statusCode} id="text" name="text" onChange={onStatusCodeChange} className="nodrag" />
      </div> */}


      </Accordion.Body>
        </Accordion.Item>
      </Accordion>


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default StatusVerificationNode;
