import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';
import { Combobox } from 'react-widgets';
import { Form } from 'react-bootstrap';
import { Accordion } from 'react-bootstrap';

import './css/testIDNode.css'
import './css/generalNode.css'



function TestIDNode({ data, isConnectable }) {

  const [testIndex, setTestIndex] = useState(data.custom._testIndex || -1) // Either id from pre-exisitng TSL or -1 (not assigned)
  const [testName, setTestName] = useState(data.custom.testName || ""); // Either name from pre-existing TSL or empty name 

  const [httpMethods, setHttpMethods] = useState(["Get", "Delete", "Post", "Put"]) //TODO: ideally this comes from parent

  const [serverURL, setServerURL] = useState(data.custom.initialServer);
  const [path, setPath] = useState(data.custom.initialPath);
  const [method, setMethod] = useState(data.custom.initialMethod)


  const onChangeServer = (event) => {
    const _server = event
    setServerURL(_server)
    console.log("[Test node] Selected server: ", _server)
    data.custom.serverChangeCallback(_server, data.custom._wfIndex, data.custom._testIndex)
  };

  const onChangePath = (event) => {
    const _path = event
    setPath(_path)
    console.log("[Test node] Selected path: ", _path)
    data.custom.pathChangeCallback(_path, data.custom._wfIndex, data.custom._testIndex)
  };

  const onChangeMethod = (event) => {
    const _method = event
    setMethod(_method)
    console.log("[Test node] Selected method: ", _method)
    data.custom.methodChangeCallback("Get", data.custom._wfIndex, data.custom._testIndex) //TODO: ONLY GET????
  };



  /* eslint-disable */
  useEffect(() => {
    // If text index from props change, reflect onto own state
    if (data.custom._testIndex !== testIndex) {
      setTestIndex(data.custom._testIndex);
    }
  }, [data.custom._testIndex]); //we dont want testIndex here because it will lead to infinite rerender-> THIS IS WHY ESLINT IS DISABLED
  /* eslint-enable */


  console.log("[Test node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Test node] Test ID: ", testIndex)


  const onTestNameChange = (evt) => {
    const _testName = evt.target.value
    console.log("[Test node] Test name: ", _testName)
    setTestName(_testName)
    data.custom.nameChangeCallback(_testName, data.custom._wfIndex, data.custom._testIndex)
  };

  //TODO: Think better on how to implement changing Test order; for now this works
  const onIncrement = () => {
    setTestIndex(oldTestIndex => oldTestIndex + 1)
  }
  const onDecrement = () => {
    setTestIndex(oldTestIndex => oldTestIndex - 1)
  }


  return (
    <div className="test-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='test-area area' eventKey="0">
          <Accordion.Header className='test-header header'>Test</Accordion.Header>
          <Accordion.Body className='nodrag'>

            <label htmlFor="text">Test name</label>
            <Form.Control value={testName} onChange={onTestNameChange} className="test-name" type="text" placeholder="Enter text" />


            <label htmlFor="text">Server</label>
            <Combobox className='nowheel'
              data={data.custom.servers}
              filter={false}
              onChange={onChangeServer}
              defaultValue={data.custom.initialServer || "Servers:"}
            />

<label htmlFor="text">Path</label>
            <Combobox className='nowheel'
              data={data.custom.paths}
              filter={false}
              onChange={onChangePath}
              defaultValue={data.custom.initialPath || "Paths:"}
            />

<label htmlFor="text">Method</label>
            <Combobox className='nowheel'
              data={httpMethods}
              filter={false}
              onChange={onChangeMethod}
              defaultValue={data.custom.initialMethod || "Methods:"}
            />

            <div>
              Wf: {data.custom._wfIndex}
            </div>
            <div>
              Test: {testIndex}
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


export default TestIDNode;
