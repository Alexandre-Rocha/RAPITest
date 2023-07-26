import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';
import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';



import './css/stressTestNode.css'
import './css/generalNode.css'


function StressTestNode({ data, isConnectable }) {


  const [count, setCount] = useState(data.custom.count || "") // Either name from pre-existing TSL or empty name

  const [threads, setThreads] = useState(data.custom.threads || "") // Either name from pre-existing TSL or empty name

  const [delay, setDelay] = useState(data.custom.delay || "") // Either name from pre-existing TSL or empty name

  console.log("[Stress test node] Workflow ID: ", data.custom._wfIndex)


  const onCountChange = (evt) => {
    console.log("[Stress test node] Count: ", evt.target.value);
    setCount(evt.target.value)
    data.custom.countChangeCallback(evt.target.value, data.custom._wfIndex)
  };

  const onThreadsChange = (evt) => {
    console.log("[Stress test node] Threads: ", evt.target.value);
    setThreads(evt.target.value)
    data.custom.threadsChangeCallback(evt.target.value, data.custom._wfIndex)
  };

  const onDelayChange = (evt) => {
    console.log("[Stress test node] Delay: ", evt.target.value);
    setDelay(evt.target.value)
    data.custom.delayChangeCallback(evt.target.value, data.custom._wfIndex)
  };



  return (
    <div className="stress-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />


      <Accordion defaultActiveKey="0">
        <Accordion.Item className='stress-area area' eventKey="0">
          <Accordion.Header className='stress-header header'>Stress Test</Accordion.Header>
          <Accordion.Body className='nodrag'>

              <label htmlFor="text">Count</label>
              <Form.Control value={count} onChange={onCountChange} className="test-name" type="text" placeholder="Enter text" />


              <label htmlFor="text">Threads</label>
              <Form.Control value={threads} onChange={onThreadsChange} className="test-name" type="text" placeholder="Enter text" />


              <label htmlFor="text">Delay</label>
              <Form.Control value={delay} onChange={onDelayChange} className="test-name" type="text" placeholder="Enter text" />





            {/* <div>
        <label htmlFor="text">Count:</label>
        <input value={count} id="text" name="text" onChange={onCountChange} className="nodrag" />
      </div>

      <div>
        <label htmlFor="text">Threads:</label>
        <input value={threads} id="text" name="text" onChange={onThreadsChange} className="nodrag" />
      </div>

      <div>
        <label htmlFor="text">Delay:</label>
        <input value={delay} id="text" name="text" onChange={onDelayChange} className="nodrag" />
      </div> */}

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default StressTestNode;
