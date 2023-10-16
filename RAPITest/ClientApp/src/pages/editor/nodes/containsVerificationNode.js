import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import './css/statusVerificationNode.css'
import './css/generalNode.css'

function ContainsVerificationNode({ data, isConnectable, xPos, yPos }) {

  const [contains, setContains] = useState("");

  console.log("[Contains node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Contains node] Test ID: ", data.custom._testIndex)

  console.log("[Contains node] X pos: ", xPos)
  console.log("[Contains node] Y pos: ", yPos)

  const accordionRef = useRef(null);

  /* function toggleAccordion () {
    //accordionRef.current.click();
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement) {
      childElement.click();
    }
  } */

  function collapseAccordion () {
    //accordionRef.current.click();
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && !childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  function openAccordion () {
    //accordionRef.current.click();
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  data.custom.collapseAccordion = collapseAccordion
  data.custom.openAccordion = openAccordion

  const onContainsChange = (evt) => {

    console.log("[Contains node] Status code: ", evt.target.value)
    setContains(evt.target.value)
    data.custom.containsChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };


  return (
    <div className="statusVerif-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='statusVerif-area area' eventKey="0">
          <Accordion.Header ref={accordionRef} className='statusVerif-header header'>Contains wip</Accordion.Header>
          <Accordion.Body className='nodrag'>


          <label htmlFor="text">Contains wip</label>
              <Form.Control value={contains} onChange={onContainsChange} className="test-name" type="text" placeholder="Enter text" />


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


export default ContainsVerificationNode;
