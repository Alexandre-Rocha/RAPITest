import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, { applyEdgeChanges, applyNodeChanges, addEdge, Panel, Background, Controls, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import ApiFileNode from './nodes/apiFileNode';
import GetRequestNode from './nodes/getRequestNode';
import ServerURLNode from './nodes/serverURLNode';
import StatusVerificationNode from './nodes/statusVerificationNode';
import TestNameNode from './nodes/testNameNode';

import authService from './api-authorization/AuthorizeService';
import TestIDNode from './nodes/testIDNode';
import WorkflowNode from './nodes/workflowNode';
import DeleteRequestNode from './nodes/deleteRequestNode';
import SchemaVerificationNode from './nodes/schemaVerificationNode';

const YAML = require('json-to-pretty-yaml');


const initialNodes = []
const initialEdges = []

const nodeTypes = { getRequest: GetRequestNode, testName: TestNameNode, status: StatusVerificationNode, apiFile: ApiFileNode, testID: TestIDNode, wf: WorkflowNode, deleteRequest: DeleteRequestNode, schema:SchemaVerificationNode }

function deepCopy(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepCopy);
    }

    const newObj = {};
    for (let key in obj) {
        newObj[key] = deepCopy(obj[key]);
    }

    return newObj;
}

function Flow() {
    console.log("Component rendering");
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);


    const [testName, setTestName] = useState("oopo")
    const [apiFile, setApiFile] = useState()
    const [serverURL, setServerURL] = useState("")
    const [path, setPath] = useState("") //new
    const [httpMethod, setHttpMethod] = useState("Get")
    const [verificationStatus, setVerificationStatus] = useState()


    const [testConfName, setTestConfName] = useState("New test configuration")


    const [timerSettings, setTimerSettings] = useState({    //TODO: hardcoded
        runimmediately: 'true',
        interval: 'Never',
        rungenerated: 'true'
    })

    const nodeId = useRef(1)
    const currWfIndex = useRef(-1)
    const currTestIndex = useRef(-1)

    const reactFlowInstance = useReactFlow()

    const [workflows, setWorkflows] = useState([])




    /*
    this comment is just to visualize state schema

    workflows = [wf1,wf2,...]
    wf = {WorkflowID,Stress,Tests[t1,t2,...]}
    Tests = {
        Server,TestID,Path,Method,Headers[h1,h2...],Body,Verifications[v1,v2...]
    }
    Headers = {
        keyItem,valueItem
    }
    Verifications = {
        Code,Schema //TODO:missing some verifications
    }

    workflows[currWorkflow].Tests[currTest].Path
    */




    const saveWorkflow = useCallback(() => {

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)

            for (let wfIndex = 0; wfIndex < newWorkflows.length; wfIndex++) {
                const workflow = newWorkflows[wfIndex];
                delete workflow.Stress
                delete workflow._wfIndex

                for (let testIndex = 0; testIndex < workflow.Tests.length; testIndex++) {
                    const test = workflow.Tests[testIndex];
                    delete test.Headers
                    delete test.Body
                    delete test._testIndex
                    for (let ver = 0; ver < test.Verifications.length; ver++) {
                        const verification = test.Verifications[ver];
                        if (!verification.Schema) {
                            delete verification.Schema
                        }
                    }
                }
            }
            /*
            delete newWorkflows[0].Stress
            delete newWorkflows[0].Tests[0].Headers
            delete newWorkflows[0].Tests[0].Body
            delete newWorkflows[0].Tests[0].Verifications.Schema
            */

            return newWorkflows
        })

    }, [workflows]);

    const finishSetup = useCallback(async () => {
        let newFile = YAML.stringify(workflows);
        console.log(newFile);
        var blob = new Blob([newFile], {
            type: 'text/plain'
        });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'Created_TSL.yaml';
        a.click();

        const file = new File([blob], 'sample.txt')

        let testSpecification = [file]

        let data = new FormData();
        /* if (dictionary !== null) {
          data.append('dictionary.txt', dictionary);
        } */
        let i = 1
        if (testSpecification !== null) {
            for (const file of testSpecification) {
                data.append("tsl_" + i + ".yaml", file)
                i++
            }
        }
        /* if (dllFiles !== null) {
          for (const file of dllFiles) {
            data.append(file.name, file)
          }
        } */
        data.append('runimmediately', timerSettings.runimmediately);
        data.append('interval', timerSettings.interval);
        data.append('rungenerated', timerSettings.rungenerated);

        const token = await authService.getAccessToken();

        fetch(`SetupTest/UploadFile`, {
            method: 'POST',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
            body: data
        }).then(res => {
            if (!res.ok) {
                console.error("Test setup failed...");
            } else {
                console.log("Test setup was successful!")
            }
        })
    }, [workflows])
    async function a() {

        //TODO: meio que tá feito por agora; falta dps apagar comentários para suportar mais coisas e tentar perceber pq é o testSpecification tem de ser array

        // Build TSL file
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

        let testSpecification = [file]

        let data = new FormData();
        /* if (dictionary !== null) {
          data.append('dictionary.txt', dictionary);
        } */
        let i = 1
        if (testSpecification !== null) {
            for (const file of testSpecification) {
                data.append("tsl_" + i + ".yaml", file)
                i++
            }
        }
        /* if (dllFiles !== null) {
          for (const file of dllFiles) {
            data.append(file.name, file)
          }
        } */
        data.append('runimmediately', timerSettings.runimmediately);
        data.append('interval', timerSettings.interval);
        data.append('rungenerated', timerSettings.rungenerated);

        const token = await authService.getAccessToken();

        fetch(`SetupTest/UploadFile`, {
            method: 'POST',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
            body: data
        }).then(res => {
            if (!res.ok) {
                console.error("Test setup failed...");
            } else {
                console.log("Test setup was successful!")
            }
        })

    }


    const onTestNameChange = useCallback((newTestName) => {
        console.log("New test name: ", newTestName);
        setTestName(newTestName)
    }, [])

    const onApiFileChange = useCallback((newApiFile) => {
        console.log("New API file: ", newApiFile);
        setApiFile(newApiFile)
    }, [])

    const onTestIDChange = useCallback((newTestID, _wfIndex, _testIndex) => {
        console.log("New test id: ", newTestID);
        //setTestName(newTestID)
        console.log("New test id: ", _wfIndex);
        console.log("New test id: ", _testIndex);
        
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].TestID = newTestID
            return newWorkflows
        })
    }, [workflows])

    const onServerURLChange = useCallback((newURL, _wfIndex, _testIndex) => {
        console.log("New server URL: ", newURL);
        setServerURL(newURL)

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Server = newURL
            return newWorkflows
        })

    }, [workflows])

    const onPathChange = useCallback((newPath, _wfIndex, _testIndex) => {
        console.log("New path: ", newPath);
        setPath(newPath)

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Path = newPath
            return newWorkflows
        })

    }, [workflows])

    const onHttpMethodChange = useCallback((newHttpMethod,  _wfIndex, _testIndex) => {
        console.log("New HTTP Method: ", newHttpMethod);
        setHttpMethod(newHttpMethod)

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Method = newHttpMethod    //TODO: hardcoded 0
            return newWorkflows
        })

    }, [workflows])

    const onWfNameChange = useCallback((newWfId) => {

        console.log("New workflow: ", newWfId);
        console.log("Curr workflow: ", currWfIndex.current);


        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows[currWfIndex.current].WorkflowID = newWfId;
            return newWorkflows;
        });
    }, []);

    const onVerificationStatusChange = useCallback((newStatus, _wfIndex, _testIndex) => {
        console.log("New verification status: ", newStatus);
        setVerificationStatus(newStatus)

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Code = newStatus    //TODO: hardcoded 0
            return newWorkflows
        })
    }, [workflows])


    const onVerificationSchemaChange = useCallback((newStatus, _wfIndex, _testIndex) => {
        console.log("New verification schema: ", newStatus);
        setVerificationStatus(newStatus)

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Schema = newStatus    //TODO: hardcoded 0
            return newWorkflows
        })
    }, [workflows])

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
        (connection) => {

            const { source, target } = connection;

            let sourceNode = reactFlowInstance.getNode(source)
            let targetNode = reactFlowInstance.getNode(target)

            if (sourceNode.type == "wf") {
                onConnectWorkflow(sourceNode, targetNode, connection)
            }
            else if (sourceNode.type == "testID") {
                onConnectTest(sourceNode, targetNode, connection)
            }
            else {
                onConnectNormal(sourceNode, targetNode, connection)
            }

        }, [setEdges, workflows, setWorkflows]
    );

    const onConnectWorkflow = useCallback(
        (sourceNode, targetNode, connection) => {

            // this method is called if sourceNode is workflow node

            let sourceWorkflow = sourceNode.data.custom._wfIndex

            if (targetNode.type == "wf") {  //reject
                alert("u cant do that")
                return false
            }
            else if (targetNode.type == "testID") {  //accept
                // set test index to next one (in wf node)
                
                console.log("wfs: ",workflows)
                console.log("wfinex: ",sourceNode.data.custom._wfIndex)
                console.log("polsf: ",workflows[sourceNode.data.custom._wfIndex])
                let newTestIndex = workflows[sourceNode.data.custom._wfIndex].Tests.length//sourceNode.data.custom.Tests.length 
                
                targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow, _testIndex: newTestIndex } };   // set wfId of test node(tgt) to be the same as wf node(src)
                setNodes((nodes) =>
                    nodes.map((node) => (node.id == targetNode.id ? targetNode : node))
                );

                //TODO: here is when i should connect the test and wf

                let newtest = targetNode.data.custom.test
                newtest._testIndex = newTestIndex //it be a lil confusing but i think it work

                setWorkflows(oldWorkflows => {
                    const newWorkflows = deepCopy(oldWorkflows);
                    newWorkflows[sourceWorkflow].Tests.push(newtest)
                    return newWorkflows;
                });


            }
            else {   //reject
                alert("u cant do that")
                return false
            }

            setEdges((eds) => addEdge(connection, eds))

        }, [setEdges, workflows, setWorkflows]
    );

    const onConnectTest = useCallback(
        (sourceNode, targetNode, connection) => {

            // this method is called if sourceNode is test node

            let targetWorkflow = targetNode.data.custom._wfIndex
            let sourceWorkflow = sourceNode.data.custom._wfIndex

            let sourceTest = sourceNode.data.custom._testIndex


            if (targetNode.type == "testID") {  //reject
                alert("u cant do that")
                return false
            }
            else if (targetNode.type == "wf") {  //accept
                sourceNode.data = { ...sourceNode.data, custom: { ...sourceNode.data.custom, _wfIndex: targetWorkflow } };    // set wfId of test node(src) to be the same as wf node(tgt)
                setNodes((nodes) =>
                    nodes.map((node) => (node.id === sourceNode.id ? sourceNode : node))
                );
            }
            else {  //accept

                //TODO: handle connection to normal node

                // can only do this if test node is already connected to workflow node
                // and if normal node not connected to anything else
                const testIsConToWf = (sourceNode.data.custom._wfIndex != -1 && sourceNode.data.custom._testIndex != -1)
                const normalIsNotConn = (targetNode.data.custom._wfIndex == -1 || targetNode.data.custom._testIndex == -1)

                if (testIsConToWf && normalIsNotConn) {
                    targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow, _testIndex: sourceTest } };   // set wfId and testId of normal node(tgt) to be the same as test node(src)
                    setNodes((nodes) =>
                        nodes.map((node) => (node.id == targetNode.id ? targetNode : node))
                    );
                }
                else {
                    alert("u cant do that")
                    return false
                }
            }

            setEdges((eds) => addEdge(connection, eds))

        }, [setEdges]
    );

    const onConnectNormal = useCallback(
        (sourceNode, targetNode, connection) => {

            // this method is called if sourceNode is a normal node (not wf, not test)

            let targetWorkflow = targetNode.data.custom._wfIndex
            let sourceWorkflow = sourceNode.data.custom._wfIndex

            let sourceTest = sourceNode.data.custom._testIndex
            let targetTest = targetNode.data.custom._testIndex

            if (targetNode.type == "wf") {  //reject
                alert("u cant do that")
                return false

            }
            else if (targetNode.type == "testID") {  //accept
                //TODO: handle connection to test node
            }
            else {   //target is regular node; accept
                //TODO: handle connection to normal node
                //falta ver as condiçoes

                const normalSrcIsConToTest = (sourceNode.data.custom._wfIndex != -1 && sourceNode.data.custom._testIndex != -1)
                const normalTrgIsNotConn = (targetNode.data.custom._wfIndex == -1 || targetNode.data.custom._testIndex == -1)

                const normalSrcIsNotConn = (sourceNode.data.custom._wfIndex == -1 && sourceNode.data.custom._testIndex == -1)
                const normalTrgIsConToTest = (targetNode.data.custom._wfIndex != -1 || targetNode.data.custom._testIndex != -1)

                if (normalSrcIsConToTest && normalTrgIsNotConn) {

                    targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow, _testIndex: sourceTest } };   // set wfId and testId of normal node(tgt) to be the same as normal node(src)
                    setNodes((nodes) =>
                        nodes.map((node) => (node.id == targetNode.id ? targetNode : node))
                    );
                }

                else if (normalSrcIsNotConn && normalTrgIsConToTest) {
                    sourceNode.data = { ...sourceNode.data, custom: { ...sourceNode.data.custom, _wfIndex: targetWorkflow, _testIndex: targetTest } };    // set wfId and testId of normal node(src) to be the same as normal node(tgt)
                    setNodes((nodes) =>
                        nodes.map((node) => (node.id === sourceNode.id ? sourceNode : node))
                    );
                }
                else {
                    alert("u cant to that")
                    return false
                }


            }

            setEdges((eds) => addEdge(connection, eds))

        }, [setEdges]
    );


    const dumpState = () => {
        console.log("Logging the state...")
        console.log("Test name: ", testName);
        console.log("API file: ", apiFile);
        console.log("Server URL: ", serverURL);
        console.log("HTTP Method: ", httpMethod);
        console.log("Verification Status: ", verificationStatus);
        console.log("----------------------------");
        console.log("Workflows: ");
        console.log(workflows);
        console.log("Current workflow: ", currWfIndex);
        console.log("Current test: ", currTestIndex);

    }

    const onClickName = useCallback(() => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
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
        const id = `${nodeId.current}`;
        nodeId.current += 1
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
                    mycallback2: onPathChange,
                    methodcallback: onHttpMethodChange,
                    _wfIndex: -1,
                    _testIndex: -1
                }
            },
            type: 'getRequest'
        };
        reactFlowInstance.addNodes(newNode);
    }, []);


    const onClickDelete = useCallback(() => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
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
                    mycallback2: onPathChange,
                    methodcallback: onHttpMethodChange,
                    _wfIndex: -1,
                    _testIndex: -1
                }
            },
            type: 'deleteRequest'
        };
        reactFlowInstance.addNodes(newNode);
    }, []);

    const onClickID = useCallback(() => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        let newTest = {
            _testIndex: -1,
            Server: serverURL, //https://petstore3.swagger.io/api/v3    
            TestID: "NEW TEST",
            Path: path,//   /pet/1
            Method: httpMethod,
            Headers: [{
                keyItem: '',
                valueItem: ''
            }],//[{keyItem:'',valueItem: ''}]   OPTIONAL
            Body: '',                           //OPTIONAL
            Verifications: [{ Code: 200, Schema: '' }]//Verifications: {     Code: 0,     Schema: ""   }    //ONLY CODE VERIFICATON IS MANDATORY
        }

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                //label: `Node ${id}`,
                custom: {
                    mycallback: onTestIDChange,
                    //mycallback2: onPathChange
                    _wfIndex: -1,
                    _testIndex: -1,   //TODO:
                    test: newTest
                }
            },
            type: 'testID'
        };
        reactFlowInstance.addNodes(newNode);

        
        /*
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows[currWfIndex.current].Tests.push(newTest)
            return newWorkflows;
        });*/

        currTestIndex.current += 1

    }, []);

    const onClickApi = useCallback(() => {
        console.log("LLLLLLLLLLLLLLLLLLLLL");
        console.log(testName);
        const id = `${nodeId.current}`;
        nodeId.current += 1
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



    const onClickWorkflowNode = useCallback(() => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        currWfIndex.current += 1

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                //label: `Node ${id}`,
                custom: {
                    mycallback: onWfNameChange,
                    //mycallback2: onPathChange
                    _wfIndex: currWfIndex.current
                }
            },
            type: 'wf'
        };
        reactFlowInstance.addNodes(newNode);


        let newWf = {
            _wfIndex: currWfIndex.current,
            WorkflowID: "NEW WORKFLOW",
            Stress: null, //{Delay: 1, Count:1, Threads: 3}
            Tests: []
        }   //TODO:here

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows.push(newWf)
            return newWorkflows;
        });



        //setCurrWorkflow(prevIndex => prevIndex + 1)

        //onNewWorkflow() //TODO:HERE?


    }, [workflows, setWorkflows]);





    const onClickStatus = useCallback(() => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                //label: `Node ${id}`,
                custom: {
                    mycallback: onVerificationStatusChange,
                    _wfIndex: -1,
                    _testIndex: -1
                }
            },
            type: 'status'
        };
        reactFlowInstance.addNodes(newNode);
    }, []);


    const onClickSchema = useCallback(() => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                //label: `Node ${id}`,
                custom: {
                    mycallback: onVerificationSchemaChange,
                    _wfIndex: -1,
                    _testIndex: -1
                }
            },
            type: 'schema'
        };
        reactFlowInstance.addNodes(newNode);
    }, []);


    const onClickUrl = useCallback(() => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
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

    const onTestConfNameChange = (newTestConfName) => {
        const newName = newTestConfName.target.value
        console.log("New test configuration name: ", newName);
        setTestConfName(newName)
    }

    const onApiSpecChange = () => {
        //...
    }

    const onTimerSettingsChange = (newTimerSettings) => {
        const newSettings = newTimerSettings.target.value
        console.log("New timer settings: ", newTimerSettings);
        setTestConfName(newTimerSettings)
    }

    return (

        <div>

            <div id="side-menu">
                <label>Name of test configuration:</label>
                <input id="text" name="text" onChange={onTestConfNameChange} className="nodrag" />

                <label>API Specification:</label>

                <label>Timer settings:</label>
            </div>

            <div style={{ height: 700, width: 1300 }}>
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

            <button onClick={onClickWorkflowNode} className="btn-add">
                add workflow node
            </button>

            <button onClick={onClickID} className="btn-add">
                add test ID
            </button>


            <button onClick={onClickGet} className="btn-add">
                add get request node
            </button>

            <button onClick={onClickDelete} className="btn-add">
                add delete request node
            </button>

            <button onClick={onClickStatus} className="btn-add">
                add verification status code node
            </button>

            <button onClick={onClickSchema} className="btn-add">
                add verification schema node
            </button>

            <button onClick={dumpState} className="btn-add">
                log all state
            </button>

            <button onClick={saveWorkflow} className="btn-add">
                saveChanges
            </button>

            <button onClick={finishSetup} className="btn-add">
                finishSetup
            </button>
            {/*
            <button onClick={() => currWfIndex.current += 1} className="btn-add">
                +1 workflow
            </button>

            <button onClick={() => currWfIndex.current -= 1} className="btn-add">
                -1 workflow
            </button>

            <button onClick={() => currTestIndex.current += 1} className="btn-add">
                +1 testID
            </button>

            <button onClick={() => currTestIndex.current -= 1} className="btn-add">
                -1 testID
            </button>

            */}
            
        </div>
    );
}


function Rflow5() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}


export default Rflow5;
