import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';
import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import './css/workflowNode.css'
import './css/generalNode.css'


function WorkflowNode({ data, isConnectable, xPos, yPos }) {

  const [wfIndex, setWfIndex] = useState(data.custom._wfIndex) // Either id from pre-exisitng TSL or -1 (not assigned) //TODO: in the future this will likely change as it doesnt make sense for it to start at -1; Rflow should start it at a value that makes sense (prob number of existing workflows +1). ACTUALLY CANT DO THAT CUZ 0 IS FALSY I THINK TRULY SAD
  const [wfName, setWfName] = useState(data.custom.wfName || "") // Either name from pre-existing TSL or empty name




  /* const [activeKey, setActiveKey] = useState('0'); // Initialize activeKey to the default expanded section

  const handleCollapse = (event, key) => {
    event.preventDefault();
    setActiveKey(activeKey === key ? null : key);
  };
 */

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

            {/* <div>
              <label htmlFor="text">Workflow name:</label>
              <input value={wfName} id="text" name="text" onChange={onWfNameChange} className="nodrag" />
            </div> */}

            <div>
              Wf: {wfIndex}
              <button onClick={onIncrement}>+1</button>
              <button onClick={onDecrement}>-1</button>
            </div>

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

   {/* {   <button onClick={toggleAccordion}>
        Toggle Section 0
      </button>} */}


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default WorkflowNode;
