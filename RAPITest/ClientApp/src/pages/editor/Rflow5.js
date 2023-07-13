import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import ReactFlow, { addEdge, Background, Controls, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import StatusVerificationNode from './nodes/statusVerificationNode';

import authService from '../api-authorization/AuthorizeService';
import TestIDNode from './nodes/testIDNode';
import WorkflowNode from './nodes/workflowNode';
import SchemaVerificationNode from './nodes/schemaVerificationNode';

import QueryNode from './nodes/queryNode';
import BodyNode from './nodes/bodyNode';
import HeadersNode from './nodes/headersNode';
import RetainNode from './nodes/retainNode';

import './Rflow5.css'

import { SmallApiUpload } from './other-components/SmallApiUpload';

const YAML = require('json-to-pretty-yaml');
const jsYaml = require('js-yaml')


const initialNodes = []
const initialEdges = []

const nodeTypes = { status: StatusVerificationNode, testID: TestIDNode, wf: WorkflowNode, schema: SchemaVerificationNode, query: QueryNode, body: BodyNode, headers: HeadersNode, retain: RetainNode }

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

    // #region State and Hooks
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
   
    const location = useLocation();
    const reactFlowInstance = useReactFlow()

    // This will have servers, paths, schemas and schemavalues
    const [apiFile, setApiFile] = useState(location?.state?.apiFile || null)

    // Whether or not api spec has been uploaded //TODO: is it being set properly when throug old config?
    const [uploaded, setUploaded] = useState(false)

    const [testConfName, setTestConfName] = useState(location?.state?.APITitle || "")

    //TODO: have the defaults be shown to user too
    const [runImmediately, setRunImmediatly] = useState('true')
    const [runInterval, setRunInterval] = useState('Never')
    const [runGenerated, setRunGenerated] = useState('true')

    // aux variables to see current max nodeId and n of workflows
    const nodeId = useRef(1)
    const maxWfIndex = useRef(-1)

    // Comes pre-set if from old config, otherwise empty
    const [workflows, setWorkflows] = useState(location?.state?.tslState || []);

    // #endregion


    // #region onChange in Editor

    const onTestConfNameChange = (newTestConfName) => {
        const newName = newTestConfName.target.value
        console.log("[Editor] New test configuration name: ", newName);
        setTestConfName(newName)
    }

    //TODO: why is there no onApiUpload?

    const onRunGeneratedChange = (runGenerated) => {
        const aux = runGenerated.target.value
        const run = aux === "yes" ? "true" : "false"
        console.log("[Editor] Run generated: ", run);
        setRunGenerated(run)
    }
    const onRunImmediatelyChange = (runImmediately) => {
        const aux = runImmediately.target.value
        const run = aux === "yes" ? "true" : "false"
        console.log("[Editor] Run immediately: ", run);
        setRunImmediatly(run)
    }
    const onRunIntervalChange = (runInterval) => {
        const run = runInterval.target.value
        console.log("[Editor] Run interval: ", run);
        setRunInterval(run)
    }

    // #endregion


    // #region onChange callbacks

    const onTestIDChange = (newTestID, _wfIndex, _testIndex) => {

        //TODO: ver isto melhor; ya as conexoes n tao bem com isto

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                newWorkflows[_wfIndex].Tests[_testIndex].TestID = newTestID
                return newWorkflows
            })
        }

    }

    const onServerURLChange = (newURL, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Server = newURL
            return newWorkflows
        })
    }

    const onPathChange = (newPath, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Path = newPath
            return newWorkflows
        })
    }

    const onHttpMethodChange = (newHttpMethod, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Method = newHttpMethod
            return newWorkflows
        })
    }

    const onWfNameChange = (newWfId) => {

        console.log("New workflow: ", newWfId);
        console.log("Curr workflow: ", maxWfIndex.current);


        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows[maxWfIndex.current].WorkflowID = newWfId;
            return newWorkflows;
        });
    }

    const onVerificationStatusChange = (newStatus, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Code = newStatus    //TODO: hardcoded 0
            return newWorkflows
        })
    }


    const onVerificationSchemaChange = (newStatus, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Schema = newStatus    //TODO: hardcoded 0
            return newWorkflows
        })
    }

    const onHeaderKeyChangeCallback = (index, key, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers) {
                    console.log("if");
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers = []
                    console.log(newWorkflows);
                }
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers[index]) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers[index] = {key:'',value:''}
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Headers[index].key = key
                console.log(newWorkflows);
                return newWorkflows
            })
        }
    }

    const onHeaderValueChangeCallback = (index, value, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers = []
                }
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers[index]) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers[index] = {key:'',value:''}
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Headers[index].value = value
                return newWorkflows
            })
        }
    }

    const onHeaderAddCallback = (_wfIndex, _testIndex)=>{
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Headers.push({key:'',value:''})
                return newWorkflows
            })
        }
    }

    const onHeaderRemoveCallback = (index, _wfIndex, _testIndex)=>{
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Headers.splice(index,1)
                return newWorkflows
            })
        }
    }


    const onQueryKeyChangeCallback = (index, key, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Query) {
                    console.log("if");
                    newWorkflows[_wfIndex].Tests[_testIndex].Query = []
                    console.log(newWorkflows);
                }
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Query[index]) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Query[index] = {key:'',value:''}
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Query[index].key = key
                console.log(newWorkflows);
                return newWorkflows
            })
        }
    }


    const onQueryValueChangeCallback = (index, value, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Query) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Query = []
                }
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Query[index]) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Query[index] = {key:'',value:''}
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Query[index].value = value
                return newWorkflows
            })
        }
    }

    // #endregion


    // #region Connection logic

    const onConnect =
        (connection) => {

            const { source, target } = connection;

            let sourceNode = reactFlowInstance.getNode(source)
            let targetNode = reactFlowInstance.getNode(target)

            console.log("onConnect; source: %s; target: %s;", sourceNode.type, targetNode.type)

            if (sourceNode.type === "wf") {
                onConnectWorkflow(sourceNode, targetNode, connection)
            }
            else if (sourceNode.type === "testID") {
                onConnectTest(sourceNode, targetNode, connection)
            }
            else {
                onConnectNormal(sourceNode, targetNode, connection)
            }

        }

    const onConnectWorkflow =
        (sourceNode, targetNode, connection) => {

            // this method is called if sourceNode is workflow node

            let sourceWorkflow = sourceNode.data.custom._wfIndex

            if (targetNode.type === "wf") {  //reject
                alert("you cant do that")
                return false
            }
            else if (targetNode.type === "testID") {  //accept
                // set test index to next one (in wf node)

                console.log("wfs: ", workflows)
                console.log("wfinex: ", sourceNode.data.custom._wfIndex)
                console.log("polsf: ", workflows[sourceNode.data.custom._wfIndex])
                let newTestIndex = workflows[sourceNode.data.custom._wfIndex].Tests.length //sourceNode.data.custom.Tests.length TODO:added +1 recently, check this better...nvm



                targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow, _testIndex: newTestIndex } };   // set wfId of test node(tgt) to be the same as wf node(src)

                console.log("targetNodeId");
                console.log(typeof targetNode.id);
                console.log(targetNode.id);

                setNodes((nodes) =>
                    nodes.map((node) => (node.id === targetNode.id ? targetNode : node))
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
                alert("you cant do that")
                return false
            }

            setEdges((eds) => addEdge(connection, eds))

        }
    const onConnectTest =
        (sourceNode, targetNode, connection) => {

            // this method is called if sourceNode is test node

            let targetWorkflow = targetNode.data.custom._wfIndex
            let sourceWorkflow = sourceNode.data.custom._wfIndex

            let sourceTest = sourceNode.data.custom._testIndex


            if (targetNode.type === "testID") {  //reject
                alert("you cant do that")
                return false
            }
            else if (targetNode.type === "wf") {  //accept
                sourceNode.data = { ...sourceNode.data, custom: { ...sourceNode.data.custom, _wfIndex: targetWorkflow } };    // set wfId of test node(src) to be the same as wf node(tgt)
                setNodes((nodes) =>
                    nodes.map((node) => (node.id === sourceNode.id ? sourceNode : node))
                );
            }
            else {  //accept

                //TODO: handle connection to normal node

                // can only do this if test node is already connected to workflow node
                // and if normal node not connected to anything else
                const testIsConToWf = (sourceNode.data.custom._wfIndex !== -1 && sourceNode.data.custom._testIndex !== -1)
                const normalIsNotConn = (targetNode.data.custom._wfIndex === -1 || targetNode.data.custom._testIndex === -1)

                if (testIsConToWf && normalIsNotConn) {
                    targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow, _testIndex: sourceTest } };   // set wfId and testId of normal node(tgt) to be the same as test node(src)
                    setNodes((nodes) =>
                        nodes.map((node) => (node.id === targetNode.id ? targetNode : node))
                    );
                }
                else {
                    alert("you cant do that")
                    return false
                }
            }

            setEdges((eds) => addEdge(connection, eds))

        }

    const onConnectNormal =
        (sourceNode, targetNode, connection) => {

            // this method is called if sourceNode is a normal node (not wf, not test)

            let targetWorkflow = targetNode.data.custom._wfIndex
            let sourceWorkflow = sourceNode.data.custom._wfIndex

            let sourceTest = sourceNode.data.custom._testIndex
            let targetTest = targetNode.data.custom._testIndex

            if (targetNode.type === "wf") {  //reject
                alert("you cant do that")
                return false

            }
            else if (targetNode.type === "testID") {  //accept
                //TODO: handle connection to test node
            }
            else {   //target is regular node; accept
                //TODO: handle connection to normal node
                //falta ver as condiçoes

                const normalSrcIsConToTest = (sourceNode.data.custom._wfIndex !== -1 && sourceNode.data.custom._testIndex !== -1)
                const normalTrgIsNotConn = (targetNode.data.custom._wfIndex === -1 || targetNode.data.custom._testIndex === -1)

                const normalSrcIsNotConn = (sourceNode.data.custom._wfIndex === -1 && sourceNode.data.custom._testIndex === -1)
                const normalTrgIsConToTest = (targetNode.data.custom._wfIndex !== -1 || targetNode.data.custom._testIndex !== -1)

                if (normalSrcIsConToTest && normalTrgIsNotConn) {

                    targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow, _testIndex: sourceTest } };   // set wfId and testId of normal node(tgt) to be the same as normal node(src)
                    setNodes((nodes) =>
                        nodes.map((node) => (node.id === targetNode.id ? targetNode : node))
                    );
                }

                else if (normalSrcIsNotConn && normalTrgIsConToTest) {
                    sourceNode.data = { ...sourceNode.data, custom: { ...sourceNode.data.custom, _wfIndex: targetWorkflow, _testIndex: targetTest } };    // set wfId and testId of normal node(src) to be the same as normal node(tgt)
                    setNodes((nodes) =>
                        nodes.map((node) => (node.id === sourceNode.id ? sourceNode : node))
                    );
                }
                else {
                    alert("you cant to that")
                    return false
                }


            }

            setEdges((eds) => addEdge(connection, eds))

        }

    // #endregion


    
    // #region Create Nodes

  const createWorkflowNode = (wfIndex, wfName) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {
                    nameChangeCallback: onWfNameChange,
                    wfName: wfName,
                    _wfIndex: wfIndex
                }
            },
            type: 'wf'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    const createTestNode = (testName, initialServer = "", initialPath = "", initialMethod = "",_wfIndex = -1, _testIndex = -1) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        let newTest = {
            _testIndex: -1,
            Server: "", //https://petstore3.swagger.io/api/v3    
            TestID: testName,
            Path: "",//   /pet/1
            Method: "",
            /* Headers: [{
                keyItem: '',
                valueItem: ''
            }],//[{keyItem:'',valueItem: ''}]   OPTIONAL
            Body: '',                           //OPTIONAL */
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
                    nameChangeCallback: onTestIDChange,
                    serverChangeCallback: onServerURLChange,
                    pathChangeCallback: onPathChange,
                    methodChangeCallback: onHttpMethodChange,
                    initialServer: initialServer,
                    initialPath: initialPath,
                    initialMethod: initialMethod,
                    paths: apiFile.paths,
                    servers: apiFile.servers,//TODO: add http methods somehow nvm only the classic 4 are supported
                    //mycallback2: onPathChange
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex,
                    test: newTest,
                    testName: testName //TODO:this info is also in test, maybe test is not necessart? idk
                }
            },
            type: 'testID'
        };
        reactFlowInstance.addNodes(newNode);

        //currTestIndex.current += 1

        return id;
    }

    const createHeadersNode = (initialHeadersArr = [], _wfIndex = -1, _testIndex = -1)=>{
        const id = `${nodeId.current}`;
        nodeId.current += 1

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {
                    keyChangeCallback: onHeaderKeyChangeCallback,
                    valueChangeCallback: onHeaderValueChangeCallback,
                    addHeaderCallback: onHeaderAddCallback,
                    removeHeaderCallback: onHeaderRemoveCallback,
                    headers: initialHeadersArr,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'headers'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    const createQueryNode = (initialQueryArr = [], _wfIndex = -1, _testIndex = -1)=>{
        const id = `${nodeId.current}`;
        nodeId.current += 1

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {
                    keyChangeCallback: onQueryKeyChangeCallback,
                    valueChangeCallback: onQueryValueChangeCallback,
                    query: initialQueryArr,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'query'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    const createBodyNode = ()=>{
        const id = `${nodeId.current}`;
        nodeId.current += 1

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {
                    
                }
            },
            type: 'body'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    const createRetainNode = (initialRetainArr = [], _wfIndex = -1, _testIndex = -1)=>{
        const id = `${nodeId.current}`;
        nodeId.current += 1

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {

                }
            },
            type: 'retain'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }
    


    const createStatusVerificationNode = (status = "", _wfIndex = -1, _testIndex = -1) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {
                    onStatusCodeChange: onVerificationStatusChange,
                    initialStatusCode: status,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'status'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    //TODO: improve algorithm, its kinda hardcoded atm, missing stress, some nodes, etc
    const createNodes = (newstate) => {

        let yamlWfIndex = 0;
        let currYamlTestIndex = 0;

        let listOfEdgesLists = []

        newstate.forEach(wf => {
            
            let testNodeIdsList = []
            let edgesList = []
            
            wf._wfIndex = yamlWfIndex
            maxWfIndex.current += 1
            const wfNodeID = createWorkflowNode(maxWfIndex.current, wf.WorkflowID) //WorkflowID is wf name

            
            if (wf.Stress) {
                console.log("stress found");
            }
            

            wf.Tests.forEach(test => {
                
                test._testIndex = currYamlTestIndex

                // ------------ REQUEST ------------
                
                const testNodeServer = test.Server
                const testNodePath = test.Path
                const testNodeMethod = test.Method

                const testNodeId = createTestNode(test.TestID, testNodeServer, testNodePath, testNodeMethod, yamlWfIndex, currYamlTestIndex) //TODO: the node has a test property however inside the values are the default ones not the ones in the state

                testNodeIdsList.push(testNodeId)

                //check optional stuff

                if (test.Body) {
                    console.log("body found");
                }

                if (test.Headers) {
                    console.log("headers found");

                    test.Headers.forEach( header=>{
                        
                    })
                }

                if (test.Query) {
                    console.log("query found");
                }

                if (test.Retain) {
                    console.log("retain found");
                }


                // ----------- VERIFICATIONS ------------




                const statusNodeCode = test.Verifications[0].Code   //Verifications is an array for some reason but always 1 element

                const statusVerifNodeId = createStatusVerificationNode(statusNodeCode, yamlWfIndex, currYamlTestIndex)

                //create the edge for this test

                const newEdgeWfTest = {
                    id: "wf:" + wfNodeID.toString() + "-test:" + testNodeId.toString(),
                    source: wfNodeID.toString(),
                    target: testNodeId.toString()
                }


                const newEdgeTestStatus = {
                    id: "test:" + testNodeId.toString() + "-get:" + statusVerifNodeId.toString(),
                    source: testNodeId.toString(),
                    target: statusVerifNodeId.toString()
                }





                edgesList.push(newEdgeWfTest)
                edgesList.push(newEdgeTestStatus)

                currYamlTestIndex = currYamlTestIndex + 1


            })

            currYamlTestIndex = 0

            listOfEdgesLists = listOfEdgesLists.concat(edgesList)

            yamlWfIndex = yamlWfIndex + 1;


        });

        setEdges((edges) => {
            let newEdges = edges.concat(listOfEdgesLists)
            return newEdges
        })



        console.log("edges set");
    }

    // #endregion

    
    // #region onClick in Editor

    const onClickWorkflowNode = () => {

        //create node with wf index equal to the max current index + 1
        //ex if there are 3 workflows currently, the maxWfIndex is 3 and will be 4 after creating wf (which will have wfIndex 4)
        maxWfIndex.current += 1
        createWorkflowNode(maxWfIndex.current)


        //create the actual workflow
        let newWf = {
            _wfIndex: maxWfIndex.current,
            WorkflowID: "NEW WORKFLOW",
            Stress: null, //{Delay: 1, Count:1, Threads: 3}
            Tests: []
        }
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows.push(newWf)
            return newWorkflows;
        });

    }

    const onClickTestNode = () => {

        //create node with no wfIndex and no textIndex because that will be decided on connection
        //node is created with an empty test inside so that when connection to wfNode happens, test is put in correct position
        createTestNode("new test name")


        /*
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows[currWfIndex.current].Tests.push(newTest)
            return newWorkflows;
        });*/



    }


    const onClickStatus = () => {
        createStatusVerificationNode()
    }

    //TODO:
    const onClickSchema = () => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {
                    mycallback: onVerificationSchemaChange,
                    _wfIndex: -1,
                    _testIndex: -1
                }
            },
            type: 'schema'
        };
        reactFlowInstance.addNodes(newNode);
    }

    const onClickBodyNode = () =>{
        console.log("[Editor] Adding Body node");
    }

    const onClickHeadersNode = () =>{
        console.log("[Editor] Adding Headers node");
        createHeadersNode()
    }

    const onClickQueryNode = () =>{
        console.log("[Editor] Adding Query node");
        createQueryNode()
    }

    const onClickRetainNode = () =>{
        console.log("[Editor] Adding Retain node");
    }

    // #endregion


    // #region others/misc

    const onClickChangeWf = () => {


        //TODO: add way to upload tsl as file similar to this
        const workflowsA = [
            {
                "WorkflowID": "wf1",
                "Tests": [
                    {
                        "Server": "https://petstore3.swagger.io/api/v3",
                        "TestID": "t1",
                        "Path": "/pet/1",
                        "Method": "Get",
                        "Verifications": [
                            {
                                "Code": "200"
                            }
                        ]
                    },
                    {
                        "Server": "https://petstore3.swagger.io/api/v3",
                        "TestID": "t2",
                        "Path": "/pet/2",
                        "Method": "Get",
                        "Verifications": [
                            {
                                "Code": "200"
                            }
                        ]
                    }
                ]
            }
        ]


        const yamlFlows = YAML.stringify(workflowsA)

        const newstate = jsYaml.load(yamlFlows)

        setWorkflows(newstate)

        createNodes(newstate)

    }

    
    //TODO: in the future check this as well as finishSetup()
    const saveWorkflow = () => {

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)

            for (let wfIndex = 0; wfIndex < newWorkflows.length; wfIndex++) {
                const workflow = newWorkflows[wfIndex];
                delete workflow.Stress
                delete workflow._wfIndex

                for (let testIndex = 0; testIndex < workflow.Tests.length; testIndex++) {
                    const test = workflow.Tests[testIndex];
                    //delete test.Headers TODO: testing headers

                    const transformedHeaders = test.Headers.map(({ key, value }) => `${key}:${value}`);
                    test.Headers = transformedHeaders

                    /* const transformedQuery = test.Query.map(({ key, value }) => `${key}:${value}`);
                    test.Query = transformedQuery */

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

    };

    const finishSetup = async () => {
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
        data.append('runimmediately', runImmediately);
        data.append('interval', runInterval);
        data.append('rungenerated', runGenerated);

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

    const dumpState = () => {
        console.log("Logging the state...")
        console.log("API file: ", apiFile);

        console.log("----------------------------");
        console.log("Workflows: ");
        console.log(workflows);

        console.log("----------------------------");
        console.log("Nodes: ");
        console.log(nodes);

        console.log("----------------------------");
        console.log("Edges: ");
        console.log(edges);
    }



    //TODO: maybe I can analyse this to see how the schemasvalues are passed to do same in MonitorTests
    const handlerAPI = function (paths, servers, schemas, schemasValues) {
        let apiContents = { paths, servers, schemas, schemasValues }
        setUploaded(true)
        setApiFile(apiContents)
    }

    /* eslint-disable */
    // If there is state coming from MonitorTests, create corresponding nodes
    useEffect(() => {
        if (location?.state?.tslState) {
            createNodes(workflows)
        } else {
            console.log('[Editor] No state has been found; no nodes will be created');
        }
    }, []); // Empty dependency array ensures the effect runs only once -> THIS IS WHY ESLINT IS DISABLED (dependencies dont matter)
    /* eslint-enable */

    // #endregion


    return (
        <div>
            <div className='editor-container'>
                <aside className="sidebar">
                    <div id="side-menu" className="sidebarDiv">
                        <p></p>
                        <label><b>Name of test configuration:</b></label>
                        <input value={testConfName} id="text" name="text" onChange={onTestConfNameChange} className="nodrag" />

                        <label><b>API Specification:</b></label>

                        {(uploaded === false && location?.state?.APITitle === undefined) ?
                            <SmallApiUpload handlerAPI={handlerAPI} apiTitle={testConfName} ></SmallApiUpload> : <div>api uploaded</div>}


                        <label><b>Timer settings:</b></label>

                        <div>
                            <div>
                                <label>Run Generated?</label>
                                <div>
                                    <input className='node-radio' type="radio" id="runGeneratedYes" name="runGenerated" value="yes" onChange={onRunGeneratedChange} />
                                    <label htmlFor="runGeneratedYes">Yes</label>
                                    <input className='node-radio' type="radio" id="runGeneratedNo" name="runGenerated" value="no" onChange={onRunGeneratedChange} />
                                    <label htmlFor="runGeneratedNo">No</label>
                                </div>
                            </div>
                            <div>
                                <label>Run Immediately?</label>
                                <div>
                                    <input className='node-radio' type="radio" id="runImmediatelyYes" name="runImmediately" value="yes" onChange={onRunImmediatelyChange} />
                                    <label htmlFor="runImmediatelyYes">Yes</label>
                                    <input className='node-radio' type="radio" id="runImmediatelyNo" name="runImmediately" value="no" onChange={onRunImmediatelyChange} />
                                    <label htmlFor="runImmediatelyNo">No</label>
                                </div>
                            </div>
                            <div>
                                <label>Select Run Interval:</label>
                                <div>
                                    <input className='node-radio' type="radio" id="runInterval1" name="runInterval" value="1 hour" onChange={onRunIntervalChange} />
                                    <label htmlFor="runInterval1">1 hour</label>
                                    <input className='node-radio' type="radio" id="runInterval2" name="runInterval" value="12 hours" onChange={onRunIntervalChange} />
                                    <label htmlFor="runInterval2">12 hours</label>
                                    <input className='node-radio' type="radio" id="runInterval3" name="runInterval" value="24 hours" onChange={onRunIntervalChange} />
                                    <label htmlFor="runInterval3">24 hours</label>
                                    <input className='node-radio' type="radio" id="runInterval4" name="runInterval" value="1 week" onChange={onRunIntervalChange} />
                                    <label htmlFor="runInterval4">1 week</label>
                                    <input className='node-radio' type="radio" id="runInterval5" name="runInterval" value="Never" onChange={onRunIntervalChange} />
                                    <label htmlFor="runInterval5">Never</label>
                                </div>
                            </div>
                        </div>

                        <p></p>
                        <b>Nodes</b>
                        <label>Flow-related</label>

                        {/* <button onClick={onClickApi} className="node-button">
                            Add API spec
                        </button> */}

                        <button onClick={onClickWorkflowNode} className="node-button">
                            Add Workflow
                        </button>

                        <button onClick={onClickTestNode} className="node-button">
                            Add Test
                        </button>

                        <label>HTTP Requests</label>

                        <button onClick={onClickBodyNode} className="node-button">
                            Add Body
                        </button>

                        <button onClick={onClickHeadersNode} className="node-button">
                            Add Headers
                        </button>

                        <button onClick={onClickQueryNode} className="node-button">
                            Add Query
                        </button>

                        <button onClick={onClickRetainNode} className="node-button">
                            Add Retain
                        </button>

                        <label>Verifications</label>

                        <button onClick={onClickStatus} className="node-button">
                            Add Status Code verification
                        </button>

                        <button onClick={onClickSchema} className="node-button">
                            Add Schema verification
                        </button>

                        <label>Setup-related</label>



                        <button onClick={saveWorkflow} className="node-button">
                            Save changes
                        </button>

                        <button onClick={finishSetup} className="node-button">
                            Finish Setup
                        </button>


                        <p></p>
                        <label>Dev </label>

                        <button onClick={onClickChangeWf} className="node-button">
                            Change entire Workflow
                        </button>

                        <button onClick={dumpState} className="node-button">
                            Dump state
                        </button>



                    </div>
                </aside>

                <div className='editor-outline' style={{ height: 750, width: 1300 }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                    >
                        <Background color='#000000' variant={'dots'} />
                        <Controls />
                    </ReactFlow>

                </div>
            </div>
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
