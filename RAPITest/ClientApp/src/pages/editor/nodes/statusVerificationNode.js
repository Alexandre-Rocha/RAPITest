import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion, Form } from 'react-bootstrap';

import './css/statusVerificationNode.css'
import './css/generalNode.css'

function StatusVerificationNode({ data, isConnectable, xPos, yPos }) {

  const [statusCode, setStatusCode] = useState(data.custom.initialStatusCode);

  console.log("[Status node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Status node] Test ID: ", data.custom._testIndex)

  console.log("[Status node] X pos: ", xPos)
  console.log("[Status node] Y pos: ", yPos)

  const accordionRef = useRef(null);


  function collapseAccordion() {
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && !childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  function openAccordion() {
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  data.custom.collapseAccordion = collapseAccordion
  data.custom.openAccordion = openAccordion

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
          <Accordion.Header ref={accordionRef} className='statusVerif-header header'>Status Code</Accordion.Header>
          <Accordion.Body className='nodrag'>

            <label htmlFor="text">Status Code</label>
            <Form.Control value={statusCode} onChange={onStatusCodeChange} className="test-name" type="text" placeholder="Enter text" />


          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default StatusVerificationNode;
