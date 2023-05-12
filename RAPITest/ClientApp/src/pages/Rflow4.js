import React, { useCallback, useState } from 'react';
import ReactFlow, { applyEdgeChanges, applyNodeChanges, addEdge, Panel, Background, Controls, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import ApiFileNode from './nodes/apiFileNode';
import GetRequestNode from './nodes/getRequestNode';
import ServerURLNode from './nodes/serverURLNode';
import StatusVerificationNode from './nodes/statusVerificationNode';
import TestNameNode from './nodes/testNameNode';

import authService from './api-authorization/AuthorizeService';

const YAML = require('json-to-pretty-yaml');


const initialNodes = []

/*const initialNodes = [
  {
    id: '1',
    data: { label: 'Input node' },
    position: { x: 0, y: 0 },
    type: 'input',
  },
  {
    id: '2',
    data: { label: 'Mixed node' },
    position: { x: 50, y: 50 },
  },
  {
    id: '3',
    data: { label: 'Output node' },
    position: { x: 100, y: 100 },
    type: 'output'
  },
  {
    id: '4',
    data: { label: 'Getn node' },
    position: { x: 150, y: 150 },
    type: 'getRequest'
  },
  {
    id: '5',
    data: { label: 'tname node' },
    position: { x: 150, y: 150 },
    type: 'testName'
  },

  {
    id: '6',
    data: { label: 'stys node' },
    position: { x: 170, y: 170 },
    type: 'status'
  },
];*/

const initialEdges = [{ id: 'e2-3', source: '2', target: '3', animated: true },];

const nodeTypes = { getRequest: GetRequestNode, testName: TestNameNode, status: StatusVerificationNode, apiFile: ApiFileNode }

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [testName, setTestName] = useState("oopo")
  const [apiFile, setApiFile] = useState()
  const [serverURL, setServerURL] = useState("")
  const [path, setPath] = useState("") //new
  const [httpMethod, setHttpMethod] = useState("Get")
  const [verificationStatus, setVerificationStatus] = useState()

  const [testSpecification, setTestSpecification] = useState(null);


  const [timeSpecification, setTimeSpecification] = useState({
    runimmediately: 'true',
    interval: 'Never',
    rungenerated: 'true'
  });

  const [workflows, setWorkflows] = useState() //formato do CreateTSL...mudar dps

  const reactFlowInstance = useReactFlow()

  const gottaDoThisSomewhere = () => {
    let wf = {
      WorkflowID: "wftest1",
      Stress: null,
      Tests: []
    }

    let test = {
      Server: serverURL, //https://petstore3.swagger.io/api/v3
      TestID: "test1",
      Path: path,//   /pet/1
      Method: httpMethod,
      Headers: [{
        keyItem: '',
        valueItem: ''
      }],//[{keyItem:'',valueItem: ''}]
      Body: '',
      Verifications: [{ Code: 200, Schema: '' }]//Verifications: {     Code: 0,     Schema: ""   }
    }

    delete wf.Stress
    delete test.Headers
    delete test.Body
    delete test.Verifications.Schema

    wf.Tests.push(test)
    //let tslFile //file that i need to build with the user inputs

    let workflows = [wf]
    setWorkflows(workflows)

    console.log(wf)
    let newFile = YAML.stringify(workflows);
    var blob = new Blob([newFile], {
      type: 'text/plain'
    });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'Created_TSL.yaml';
    a.click();

    const file = new File([blob], 'sample.txt')


    setTestSpecification([file])
  };

  async function finishSetup() {

    //gottaDoThisSomewhere();

    console.log("test spec:");
    console.log(testSpecification)

    let data = new FormData();
    /* if (dictionary !== null) {
      data.append('dictionary.txt', dictionary);
    } */
    let i = 1
    console.log("finishSetup");
    if (testSpecification !== null) {
      console.log("tsl if");
      for (const file of testSpecification) {
        console.log("tsl if for");
        data.append("tsl_" + i + ".yaml", file)
        i++
      }
    }
    /* if (dllFiles !== null) {
      for (const file of dllFiles) {
        data.append(file.name, file)
      }
    } */
    data.append('runimmediately', timeSpecification.runimmediately);
    data.append('interval', timeSpecification.interval);
    data.append('rungenerated', timeSpecification.rungenerated);

    const token = await authService.getAccessToken();

    for (const [key, value] of data.entries()) {
      console.log(`${key}: ${value}`);
    }
    fetch(`SetupTest/UploadFile`, {
      method: 'POST',
      headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
      body: data
    }).then(res => {
      if (!res.ok) {
        console.log("res not ok");
      } else {
        for (const [key, value] of data.entries()) {
          console.log(`${key}: ${value}`);
        }
        console.log("over");
      }
    })

  }


  let nodeId = 7;


  const onTestNameChange = (newTestName) => {
    console.log("New test name: ", newTestName);
    setTestName(newTestName)
  }

  const onApiFileChange = (newApiFile) => {
    console.log("New API file: ", newApiFile);
    setApiFile(newApiFile)
  }

  const onServerURLChange = (newURL) => {
    console.log("New server URL: ", newURL);
    setServerURL(newURL)
  }

  const onPathChange = (newPath) => {
    console.log("New path: ", newPath);
    setPath(newPath)
  }

  const onHttpMethodChange = (newHttpMethod) => {
    console.log("New HTTP Method: ", newHttpMethod);
    setHttpMethod(newHttpMethod)
  }

  const onVerificationStatusChange = (newStatus) => {
    console.log("New verification status: ", newStatus);
    setVerificationStatus(newStatus)
  }

  const handleUpdateNodeProps = () => {
    const node = reactFlowInstance.getNodes().find(el => el.id === '2');
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.data = {
            ...node.data,
            custom: {
              ...node.data.custom,
              apiName: "newName"
            }
          };
        }

        return node;
      }))
  };

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );


  const dumpState = () => {
    console.log("Logging the state...")
    console.log("Test name: ", testName);
    console.log("API file: ", apiFile);
    console.log("Server URL: ", serverURL);
    console.log("HTTP Method: ", httpMethod);
    console.log("Verification Status: ", verificationStatus);
  }

  const onClickName = useCallback(() => {
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        //label: `Node ${id}`,
        custom: {
          mycallback: onTestNameChange,
          //mycallback2: onPathChange
        }
      },
      type: 'testName'
    };
    reactFlowInstance.addNodes(newNode);
  }, []);

  const onClickGet = useCallback(() => {
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        //label: `Node ${id}`,
        custom: {
          mycallback: onServerURLChange,
          mycallback2: onPathChange
        }
      },
      type: 'getRequest'
    };
    reactFlowInstance.addNodes(newNode);
  }, []);

  const onClickApi = useCallback(() => {
    console.log("LLLLLLLLLLLLLLLLLLLLL");
    console.log(testName);
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        //label: `Node ${id}`,
        custom: {
          mycallback: onApiFileChange,
          newApiName: testName
        }
      },
      type: 'apiFile'
    };
    reactFlowInstance.addNodes(newNode);
  }, [testName]);
  /* const onClickApi = () => {
    console.log("LLLLLLLLLLLLLLLLLLLLL");
    console.log(testName);
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        //label: `Node ${id}`,
        custom: {
          mycallback: onApiFileChange,
          //apiName: "whw"
        }
      },
      type: 'apiFile'
    };
    reactFlowInstance.addNodes(newNode);
  }; */

  const onClickStatus = useCallback(() => {
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        //label: `Node ${id}`,
        custom: {
          mycallback: onVerificationStatusChange
        }
      },
      type: 'status'
    };
    reactFlowInstance.addNodes(newNode);
  }, []);


  const onClickUrl = useCallback(() => {
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        //label: `Node ${id}`,
        custom: {
          mycallback: onServerURLChange
        }
      },
      type: 'url'
    };
    reactFlowInstance.addNodes(newNode);
  }, []);

  return (

    <div>

      <div style={{ height: 600, width: 900 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Background variant={'dots'} />
          <Controls />
        </ReactFlow>

      </div>
      <button onClick={onClickName} className="btn-add">
        add test name node
      </button>

      <button onClick={onClickApi} className="btn-add">
        add API file node
      </button>


      <button onClick={onClickGet} className="btn-add">
        add get request node
      </button>

      <button onClick={onClickStatus} className="btn-add">
        add verification status code node
      </button>

      <button onClick={dumpState} className="btn-add">
        log all state
      </button>

      <button onClick={gottaDoThisSomewhere} className="btn-add">
        saveChanges
      </button>

      <button onClick={finishSetup} className="btn-add">
        finishSetup
      </button>
    </div>
  );
}


function Rflow4() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}


export default Rflow4;
