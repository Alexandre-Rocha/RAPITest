import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import ReactFlow, { addEdge, Background, Controls, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import StatusVerificationNode from './nodes/statusVerificationNode';

import authService from '../api-authorization/AuthorizeService';
import TestIDNode from './nodes/testIDNode';
import WorkflowNode from './nodes/workflowNode';
import SchemaVerificationNode from './nodes/schemaVerificationNode';

import CustomVerificationNode from './nodes/customVerificationNode';
import CountVerificationNode from './nodes/countVerificationNode';
import MatchVerificationNode from './nodes/matchVerificationNode';
import ContainsVerificationNode from './nodes/containsVerificationNode';

import QueryNode from './nodes/queryNode';
import BodyNode from './nodes/bodyNode';
import HeadersNode from './nodes/headersNode';
import RetainNode from './nodes/retainNode';
import StressTestNode from './nodes/stressTestNode';

import Sidebar from './other-components/Sidebar';

import './Rflow5.css'

import { SmallApiUpload } from './other-components/SmallApiUpload';
import TimerSettings from './other-components/TimerSettings';

const YAML = require('json-to-pretty-yaml');
const jsYaml = require('js-yaml')


const initialNodes = []
const initialEdges = []

const proOptions = { hideAttribution: true };

const nodeTypes = { status: StatusVerificationNode, testID: TestIDNode, wf: WorkflowNode, schema: SchemaVerificationNode, query: QueryNode, body: BodyNode, headers: HeadersNode, retain: RetainNode, stress: StressTestNode, match: MatchVerificationNode, custom: CustomVerificationNode, contains: ContainsVerificationNode, count: CountVerificationNode }

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

    //TODO: cant grab from db for already conf tests...think of something
    const [runImmediately, setRunImmediatly] = useState('true')
    const [runInterval, setRunInterval] = useState('Never')
    const [runGenerated, setRunGenerated] = useState('true')

    // aux variables to see current max nodeId and n of workflows
    const nodeId = useRef(1)
    const maxWfIndex = useRef(-1)

    // Comes pre-set if from old config, otherwise empty
    const [workflows, setWorkflows] = useState(location?.state?.tslState || []);

    const [canCollapse, setCanCollapse] = useState(false)

    // #endregion


    // #region onChange in Editor

    const onTestConfNameChange = (newTestConfName) => {
        const newName = newTestConfName.target.value
        console.log("[Editor] New test configuration name: ", newName);
        setTestConfName(newName)
    }

    //TODO: why is there no onApiUpload?

    const onRunGeneratedChange = (runGenerated) => {
        const run = runGenerated.target.value
        //const run = aux === "true" ? "true" : "false"
        console.log("[Editor] Run generated: ", run);
        setRunGenerated(run)
    }
    const onRunImmediatelyChange = (runImmediately) => {
        const run = runImmediately.target.value
        //const run = aux === "true" ? "true" : "false"
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
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers[index] = { key: '', value: '' }
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
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers[index] = { key: '', value: '' }
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Headers[index].value = value
                return newWorkflows
            })
        }
    }

    const onHeaderAddCallback = (_wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Headers.push({ key: '', value: '' })
                return newWorkflows
            })
        }
    }

    const onHeaderRemoveCallback = (index, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Headers) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Headers = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Headers.splice(index, 1)
                return newWorkflows
            })
        }
    }

    const onQueryAddCallback = (_wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        //TODO: when i add withoout test id does nothing and will screw up after i think idk
        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Query) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Query = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Query.push({ key: '', value: '' })
                return newWorkflows
            })
        }
    }

    const onQueryRemoveCallback = (index, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Query) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Query = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Query.splice(index, 1)
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
                    newWorkflows[_wfIndex].Tests[_testIndex].Query[index] = { key: '', value: '' }
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
                    newWorkflows[_wfIndex].Tests[_testIndex].Query[index] = { key: '', value: '' }
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Query[index].value = value
                return newWorkflows
            })
        }
    }


    const onRetainAddCallback = (_wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        //TODO: when i add withoout test id does nothing and will screw up after i think idk
        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Retain) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Retain = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Retain.push({ key: '', value: '' })
                return newWorkflows
            })
        }
    }

    const onRetainRemoveCallback = (index, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Retain) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Retain = []
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Retain.splice(index, 1)
                return newWorkflows
            })
        }
    }


    const onRetainKeyChangeCallback = (index, key, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Retain) {
                    console.log("if");
                    newWorkflows[_wfIndex].Tests[_testIndex].Retain = []
                    console.log(newWorkflows);
                }
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Retain[index]) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Retain[index] = { key: '', value: '' }
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Retain[index].key = key
                console.log(newWorkflows);
                return newWorkflows
            })
        }
    }


    const onRetainValueChangeCallback = (index, value, _wfIndex, _testIndex) => {
        //TODO: ver isto melhor; ya as conexoes n tao bem com isto
        // o todo de cima foi copiado do do testID

        if (_wfIndex !== -1 && _testIndex !== -1) {
            setWorkflows(oldWorkflows => {
                const newWorkflows = deepCopy(oldWorkflows)
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Retain) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Retain = []
                }
                if (!newWorkflows[_wfIndex].Tests[_testIndex].Retain[index]) {
                    newWorkflows[_wfIndex].Tests[_testIndex].Retain[index] = { key: '', value: '' }
                }
                newWorkflows[_wfIndex].Tests[_testIndex].Retain[index].value = value
                return newWorkflows
            })
        }
    }


    const onBodyRefChangeCallback = (newBodyRef, _wfIndex, _testIndex)=>{
        //TODO: get body text from reference
        // alternatively put another bodyref prop and trim it and get text at the end
        onBodyTextChangeCallback("new body", _wfIndex, _testIndex)
    }
    

    const onBodyTextChangeCallback = (newBodyText, _wfIndex, _testIndex)=>{
        //TODO:
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows[_wfIndex].Tests[_testIndex].Body = newBodyText;
            return newWorkflows;
        });
    }
    


    const onStressCountChangeCallback = (count, _wfIndex) => {

        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)

            if (!newWorkflows[_wfIndex].Stress) {
                newWorkflows[_wfIndex].Stress = {
                    Count: -1,
                    Threads: -1,
                    Delay: -1
                }
            }
            newWorkflows[_wfIndex].Stress.Count = count
            return newWorkflows
        })
    }

    const onStressThreadsChangeCallback = (threads, _wfIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)

            if (!newWorkflows[_wfIndex].Stress) {
                newWorkflows[_wfIndex].Stress = {
                    Count: -1,
                    Threads: -1,
                    Delay: -1
                }
            }
            newWorkflows[_wfIndex].Stress.Threads = threads
            return newWorkflows
        })
    }

    const onStressDelayChangeCallback = (delay, _wfIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)

            if (!newWorkflows[_wfIndex].Stress) {
                newWorkflows[_wfIndex].Stress = {
                    Count: -1,
                    Threads: -1,
                    Delay: -1
                }
            }
            newWorkflows[_wfIndex].Stress.Delay = delay
            return newWorkflows
        })
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
            //TODO: else if stress test?
            else {
                onConnectNormal(sourceNode, targetNode, connection)
            }

        }

    const onConnectWorkflow =
        (sourceNode, targetNode, connection) => {

            // this method is called if sourceNode is workflow node

            let sourceWorkflow = sourceNode.data.custom._wfIndex
            console.log("srcWf" + sourceWorkflow);

            if (targetNode.type === "wf") {  //reject
                alert("you cant do that")
                return false
            }
            else if (targetNode.type === "testID") {  //accept
                // set test index to next one (in wf node)

                let newTestIndex = workflows[sourceNode.data.custom._wfIndex].Tests.length //sourceNode.data.custom.Tests.length TODO:added +1 recently, check this better...nvm


                targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow, _testIndex: newTestIndex } };   // set wfId of test node(tgt) to be the same as wf node(src)


                setNodes((nodes) =>
                    nodes.map((node) => (node.id === targetNode.id ? targetNode : node))
                );

                //TODO: here is when i should connect the test and wf

                let newtest = targetNode.data.custom.test
                newtest._testIndex = newTestIndex //it be a lil confusing but i think it work

                // TODO: tf is this? this even used anymore?
                setWorkflows(oldWorkflows => {
                    const newWorkflows = deepCopy(oldWorkflows);
                    newWorkflows[sourceWorkflow].Tests.push(newtest)
                    return newWorkflows;
                });


            }
            else if (targetNode.type === "stress") {
                console.log("target node stress"); //TODO: does this make sense here? idk

                console.log("target nodeb4");
                console.log(targetNode);

                console.log(targetNode.data.custom_wfIndex);

                targetNode.data = { ...targetNode.data, custom: { ...targetNode.data.custom, _wfIndex: sourceWorkflow } };   // set wfId of test node(tgt) to be the same as wf node(src)

                console.log("target node");
                console.log(targetNode);

                setNodes((nodes) =>
                    nodes.map((node) => (node.id === targetNode.id ? targetNode : node))
                );

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

    const createWorkflowNode = (wfIndex = -1, wfName = "", x = Math.random() * 500, y = Math.random() * 500) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1
        console.log("sffss");
        console.log(wfIndex);
        const newNode = {
            id,
            position: {
                x: x,
                y: y,
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

    const createTestNode = (testName = "", initialServer = "", initialPath = "", initialMethod = "", _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        // only mandatory fields
        let newTest = {
            _testIndex: -1,
            Server: "",
            TestID: testName,
            Path: "",
            Method: "",
            Verifications: [{ Code: -1 }]
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

    const createHeadersNode = (initialHeadersArr = [{ key: '', value: '' }], _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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

    const createQueryNode = (initialQueryArr = [{ key: '', value: '' }], _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    addQueryCallback: onQueryAddCallback,
                    removeQueryCallback: onQueryRemoveCallback,
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

    const createBodyNode = (_wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        const newNode = {
            id,
            position: {
                x: x,
                y: y
            },
            data: {
                custom: {
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex,
                    bodyTextChangeCallback: onBodyTextChangeCallback,
                    bodyRefChangeCallback: onBodyRefChangeCallback, //TODO: initials
                }
            },
            type: 'body'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    const createRetainNode = (initialRetainArr = [{ key: '', value: '' }], _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    keyChangeCallback: onRetainKeyChangeCallback,
                    valueChangeCallback: onRetainValueChangeCallback,
                    addRetainCallback: onRetainAddCallback,
                    removeRetainCallback: onRetainRemoveCallback,
                    retains: initialRetainArr,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'retain'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    const createStressNode = (initialCount = -1, initialThreads = -1, initialDelay = -1, _wfIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    count: initialCount,
                    threads: initialThreads,
                    delay: initialDelay,
                    _wfIndex: _wfIndex,
                    countChangeCallback: onStressCountChangeCallback,
                    threadsChangeCallback: onStressThreadsChangeCallback,
                    delayChangeCallback: onStressDelayChangeCallback
                }
            },
            type: 'stress'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }


    const createStatusVerificationNode = (initialStatus = "", _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    statusChangeCallback: onVerificationStatusChange,
                    initialStatusCode: initialStatus,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'status'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }


    const createContainsVerificationNode = (_wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
    
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'contains'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }


    const createCountVerificationNode = (_wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                  
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'count'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }


    const createMatchVerificationNode = ( _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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

                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'match'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }



    const createCustomVerificationNode = ( _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'custom'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }


    const createSchemaVerificationNode = (initialSchema = "", _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    schemaChangeCallback: onVerificationSchemaChange,
                    initialSchema: initialSchema,
                    schemas: apiFile.schemas,
                    _wfIndex: -1,
                    _testIndex: -1
                }
            },
            type: 'schema'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }

    //TODO: improve algorithm, its kinda hardcoded atm, missing stress, some nodes, etc
    const createNodes = (newstate) => {

        let yamlWfIndex = 0;
        let currYamlTestIndex = 0;

        let listOfEdgesLists = []

        let currX = 0
        let currY = 0

        const offsetX = 200
        const offsetY = 100

        newstate.forEach(wf => {

            let testNodeIdsList = []
            let edgesList = []

            wf._wfIndex = yamlWfIndex
            maxWfIndex.current += 1
            const wfNodeID = createWorkflowNode(maxWfIndex.current, wf.WorkflowID, currX, currY) //WorkflowID is wf name
            
            currX = currX + offsetX

            if (wf.Stress) {
                console.log("stress found");
                const initialCount = wf.Stress.Count
                const initialThreads = wf.Stress.Threads
                const initialDelay = wf.Stress.Delay
                const stressTestId = createStressNode(initialCount, initialThreads, initialDelay, yamlWfIndex, currX, currY)

                const newEdgeWfStress = {
                    id: "wf:" + wfNodeID.toString() + "-stress:" + stressTestId.toString(),
                    source: wfNodeID.toString(),
                    target: stressTestId.toString()
                }

                edgesList.push(newEdgeWfStress)

                currY = currY + offsetY //TODO: pensar melhor nos layputs mais complexos
            }


            wf.Tests.forEach(test => {

                test._testIndex = currYamlTestIndex

                // ------------ REQUEST ------------

                const testNodeServer = test.Server
                const testNodePath = test.Path
                const testNodeMethod = test.Method

                const testNodeId = createTestNode(test.TestID, testNodeServer, testNodePath, testNodeMethod, yamlWfIndex, currYamlTestIndex, currX, currY) //TODO: the node has a test property however inside the values are the default ones not the ones in the state

                testNodeIdsList.push(testNodeId)

                //check optional stuff

                if (test.Body) {
                    console.log("body found");
                    currY = currY + offsetY 
                }

                if (test.Headers) {
                    console.log("headers found");
                    currY = currY + offsetY 
                    test.Headers.forEach(header => {

                    })
                }

                if (test.Query) {
                    console.log("query found");
                    currY = currY + offsetY 
                }

                if (test.Retain) {
                    console.log("retain found");
                    currY = currY + offsetY 
                }


                // ----------- VERIFICATIONS ------------




                const statusNodeCode = test.Verifications[0].Code   //Verifications is an array for some reason but always 1 element
                currY = currY + offsetY 

                const statusVerifNodeId = createStatusVerificationNode(statusNodeCode, yamlWfIndex, currYamlTestIndex, currX, currY)




                //check optional stuff TODO:falta cenas

                if (test.Verifications[0].Schema) {
                    console.log("schema found");
                    currY = currY + offsetY 

                    const schema = test.Verifications[0].Schema.split("$ref/definitions/")[1] //TODO: kinda hardcoded
                    const schemaVerifId = createSchemaVerificationNode(schema, yamlWfIndex, currYamlTestIndex, currX, currY)


                    const newEdgeTestSchema = {
                        id: "test:" + testNodeId.toString() + "-get:" + schemaVerifId.toString(),
                        source: testNodeId.toString(),
                        target: schemaVerifId.toString()
                    }

                    edgesList.push(newEdgeTestSchema)

                }



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

        setCanCollapse(true)

        console.log("edges set");
    }

    useEffect(() => {
        console.log("can collapse");
        if (canCollapse) {
            setTimeout(() => {
                collapseNodes(); // Call collapseNodes after 1 second
                setCanCollapse(false)
              }, 100); //this is not optimal...
        }
      }, [canCollapse]);

    // #endregion


    // #region onClick in Editor

    const onClickWorkflowNode = () => {

        //create node with wf index equal to the max current index + 1
        //ex if there are 3 workflows currently, the maxWfIndex is 3 and will be 4 after creating wf (which will have wfIndex 4)
        maxWfIndex.current += 1
        console.log("dsdfs");
        console.log(maxWfIndex.current);
        createWorkflowNode(maxWfIndex.current, "")


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
        createTestNode()


        /*
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows);
            newWorkflows[currWfIndex.current].Tests.push(newTest)
            return newWorkflows;
        });*/



    }


    const onClickStatus = () => {
        console.log("[Editor] Adding Status Verification node");
        createStatusVerificationNode()
    }

    const onClickWip = () =>{
        console.log("Work in progress");
        
    }

    const onClickCount = () => {
        console.log("[Editor] Adding Count Verification node");
        createCountVerificationNode()
    }

    const onClickContains = () => {
        console.log("[Editor] Adding Contains Verification node");
        createContainsVerificationNode()
    }

    const onClickMatch = () => {
        console.log("[Editor] Adding Match Verification node");
        createMatchVerificationNode()
    }

    const onClickCustom = () => {
        console.log("[Editor] Adding Custom Verification node");
        createCustomVerificationNode()
    }





    //TODO:
    const onClickSchema = () => {
        console.log("[Editor] Adding Schema Verification node");
        createSchemaVerificationNode()
    }

    const onClickBodyNode = () => {
        console.log("[Editor] Adding Body node");
        createBodyNode()
    }

    const onClickHeadersNode = () => {
        console.log("[Editor] Adding Headers node");
        createHeadersNode()
    }

    const onClickQueryNode = () => {
        console.log("[Editor] Adding Query node");
        createQueryNode()
    }

    const onClickRetainNode = () => {
        console.log("[Editor] Adding Retain node");
        createRetainNode()
    }

    const onClickStressTestNode = () => {
        console.log('[Editor] Adding Stress test node');
        createStressNode()
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

                //if(!workflow.Stress) delete workflow.Stress
                delete workflow._wfIndex

                for (let testIndex = 0; testIndex < workflow.Tests.length; testIndex++) {
                    const test = workflow.Tests[testIndex];
                    //delete test.Headers TODO: testing headers

                    //if(!test.Headers) delete test.Headers

                    //if(!test.Retain) delete test.Retain

                    if (test.Headers) {
                        const transformedHeaders = test.Headers.map(({ key, value }) => `${key}:${value}`);
                        test.Headers = transformedHeaders //TODO: headers
                    }


                    /* const transformedQuery = test.Query.map(({ key, value }) => `${key}:${value}`);
                    test.Query = transformedQuery */

                    //if(!test.Body) delete test.Body
                    delete test._testIndex

                    for (let ver = 0; ver < test.Verifications.length; ver++) {
                        const verification = test.Verifications[ver];
                        if (verification.Schema) {
                            let schemaStr = "$ref/definitions/" + verification.Schema
                            verification.Schema = schemaStr
                        }
                        /* if (!verification.Schema) {
                            delete verification.Schema
                        } */
                    }
                }
            }

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

        console.log("Run Generated:", runGenerated);
        console.log("Run Immediatly:", runImmediately);
        console.log("Run Interval:", runInterval);

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

    const collapseNodes = () =>{
        console.log("collapsing nodes");
        let nodesArr = reactFlowInstance.getNodes();
        nodesArr.forEach(
            e=>{
                if(e.data.custom.collapseAccordion){
                    console.log("collapse");
                    e.data.custom.collapseAccordion()
                }
                else{console.log("no collapse");
                console.log(e);}
            }
        )
        console.log("nodes collapsed");

    }

    const openNodes = () =>{
        let nodesArr = reactFlowInstance.getNodes();
        nodesArr.forEach(
            e=>{
                if(e.data.custom.openAccordion){
                    console.log("open");
                    e.data.custom.openAccordion()
                }
                console.log("no open");
                console.log(e);
            }
        )
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


                <Sidebar className='sidebar' onRunGeneratedChange={onRunGeneratedChange}
                    onRunImmediatelyChange={onRunImmediatelyChange}
                    onRunIntervalChange={onRunIntervalChange}
                    apiTitle={testConfName}
                    handlerAPI={handlerAPI}
                    onTestConfNameChange={onTestConfNameChange}
                    buttonsArray={[
                        { section: "Flow-related", title: "Workflow", onClick: onClickWorkflowNode, class:"wf", tooltip:"Workflow tooltip" },
                        { section: "Flow-related", title: "Test", onClick: onClickTestNode, class:"test" },
                        { section: "Flow-related", title: "Stress Test", onClick: onClickStressTestNode , class:"stress"},
                        { section: "HTTP Requests", title: "Body", onClick: onClickBodyNode , class:"http"},
                        { section: "HTTP Requests", title: "Headers", onClick: onClickHeadersNode, class:"http" },
                        { section: "HTTP Requests", title: "Query", onClick: onClickQueryNode, class:"http" },
                        { section: "HTTP Requests", title: "Retain", onClick: onClickRetainNode, class:"http" },
                        { section: "Verifications", title: "Status Code ", onClick: onClickStatus, class:"verif" },
                        { section: "Verifications", title: "Schema", onClick: onClickSchema, class:"verif" },
                        { section: "Verifications", title: "Contains ", onClick: onClickContains, class:"verif" },
                        { section: "Verifications", title: "Count ", onClick: onClickCount, class:"verif" },
                        { section: "Verifications", title: "Match ", onClick: onClickMatch, class:"verif" },
                        { section: "Verifications", title: "Custom ", onClick: onClickCustom, class:"verif" },
                        { section: "Setup-related", title: "Save changes", onClick: saveWorkflow , class:"setup"},
                        { section: "Setup-related", title: "Finish Setup", onClick: finishSetup , class:"setup"},
                        { section: "Dev", title: "Change entire Workflow", onClick: onClickChangeWf , class:"setup"},
                        { section: "Dev", title: "Dump state", onClick: dumpState , class:"setup"},
                        { section: "Dev", title: "Collapse nodes", onClick: collapseNodes , class:"setup"},
                        { section: "Dev", title: "Open nodes", onClick: openNodes , class:"setup"},
                    ]}>
                </Sidebar>



                <div className='editor-outline'>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        proOptions={proOptions}
                        deleteKeyCode={'Delete'}
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
