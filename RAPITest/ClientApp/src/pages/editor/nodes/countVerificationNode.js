import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion, Form } from 'react-bootstrap';

import './css/statusVerificationNode.css'
import './css/generalNode.css'

function CountVerificationNode({ data, isConnectable, xPos, yPos }) {

  const [key, setKey] = useState("")
  const [value, setValue] = useState("")

  console.log("[Count node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Count node] Test ID: ", data.custom._testIndex)

  console.log("[Count node] X pos: ", xPos)
  console.log("[Count node] Y pos: ", yPos)

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


  const handleKeyChange = (key) => {
    setKey(key)
    data.custom.keyChangeCallback(key, data.custom._wfIndex, data.custom._testIndex)
  };

  const handleValueChange = (value) => {
    setValue(value)
    data.custom.valueChangeCallback(value, data.custom._wfIndex, data.custom._testIndex)
  };


  return (
    <div className="statusVerif-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='statusVerif-area area' eventKey="0">
          <Accordion.Header ref={accordionRef} className='statusVerif-header header'>Count </Accordion.Header>
          <Accordion.Body className='nodrag'>

            <label htmlFor="text">Count </label>
            <Form.Control value={key} onChange={(e) => handleKeyChange(e.target.value)} className="key-field" type="text" placeholder="Key" />
            <Form.Control value={value} onChange={(e) => handleValueChange(e.target.value)} className="value-field" type="text" placeholder="Value" />


          </Accordion.Body>
        </Accordion.Item>
      </Accordion>


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default CountVerificationNode;
