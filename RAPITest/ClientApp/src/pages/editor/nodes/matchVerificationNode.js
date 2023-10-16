import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import './css/statusVerificationNode.css'
import './css/generalNode.css'

function MatchVerificationNode({ data, isConnectable, xPos, yPos }) {

  const [key, setKey] = useState("")
  const [value, setValue] = useState("")

  console.log("[Match node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Match node] Test ID: ", data.custom._testIndex)

  console.log("[Match node] X pos: ", xPos)
  console.log("[Match node] Y pos: ", yPos)

  const accordionRef = useRef(null);

  /* function toggleAccordion () {
    //accordionRef.current.click();
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement) {
      childElement.click();
    }
  } */

  function collapseAccordion() {
    //accordionRef.current.click();
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && !childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  function openAccordion() {
    //accordionRef.current.click();
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
          <Accordion.Header ref={accordionRef} className='statusVerif-header header'>Match wip</Accordion.Header>
          <Accordion.Body className='nodrag'>


            <label htmlFor="text">Match wip</label>


            <Form.Control value={key} onChange={(e) => handleKeyChange(e.target.value)} className="key-field" type="text" placeholder="Key" />

            <Form.Control value={value} onChange={(e) => handleValueChange(e.target.value)} className="value-field" type="text" placeholder="Value" />

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


export default MatchVerificationNode;
