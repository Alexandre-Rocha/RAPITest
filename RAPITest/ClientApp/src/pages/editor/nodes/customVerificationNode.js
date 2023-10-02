import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import './css/statusVerificationNode.css'
import './css/generalNode.css'

function CustomVerificationNode({ data, isConnectable, xPos, yPos }) {

  const [statusCode, setStatusCode] = useState();

  console.log("[Status node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Status node] Test ID: ", data.custom._testIndex)

  console.log("[Status node] X pos: ", xPos)
  console.log("[Status node] Y pos: ", yPos)

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

  const onStatusCodeChange = (evt) => {

    
  };


  return (
    <div className="statusVerif-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='statusVerif-area area' eventKey="0">
          <Accordion.Header ref={accordionRef} className='statusVerif-header header'>Custom wip</Accordion.Header>
          <Accordion.Body className='nodrag'>


          <label htmlFor="text">Custom wip</label>
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


export default CustomVerificationNode;
