import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';
import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import './css/workflowNode.css'
import './css/generalNode.css'


function WorkflowNode({ data, isConnectable, xPos, yPos }) {

  const [wfIndex, setWfIndex] = useState(data.custom._wfIndex)
  const [wfName, setWfName] = useState(data.custom.wfName || "")

  const accordionRef = useRef(null);

  function collapseAccordion () {
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && !childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  function openAccordion () {
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  data.custom.collapseAccordion = collapseAccordion
  data.custom.openAccordion = openAccordion


  console.log("[Workflow node] Workflow ID: ", wfIndex)

  console.log("[Workflow node] X pos: ", xPos)
  console.log("[Workflow node] Y pos: ", yPos)


  const onWfNameChange = (evt) => {
    console.log("[Workflow node] Workflow name: ", evt.target.value);
    setWfName(evt.target.value)
    data.custom.nameChangeCallback(evt.target.value)
  };

  //TODO: Think better on how to implement changing WF order; for now this works
  const onIncrement = () => {
    setWfIndex(oldWfIndex => oldWfIndex + 1)
  }
  const onDecrement = () => {
    setWfIndex(oldWfIndex => oldWfIndex - 1)
  }


  const renderWfTitle = () =>{
    let str = wfName == false? "Workflow":wfName
    return str
  }

  return (
    <div className="workflow-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='workflow-area area' eventKey="0">
          <Accordion.Header ref={accordionRef} className='workflow-header header'>
           <div className='headerDiv'>{renderWfTitle()}</div> </Accordion.Header>
          <Accordion.Body className='nodrag'>

            <label htmlFor="text">Workflow name</label>
            <Form.Control value={wfName} onChange={onWfNameChange} className="test-name" type="text" placeholder="Enter text" />

            <div>
              Wf: {wfIndex}
              <button onClick={onIncrement}>+1</button>
              <button onClick={onDecrement}>-1</button>
            </div>

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default WorkflowNode;
