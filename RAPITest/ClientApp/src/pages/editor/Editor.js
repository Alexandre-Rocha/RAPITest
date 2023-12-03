import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import ReactFlow, { addEdge, Background, Controls, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider, Panel } from 'reactflow';
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

import { LOG_LEVELS as level, rapiLog } from './utils';


import Dagre from 'dagre';


import './Editor.css'


const YAML = require('json-to-pretty-yaml');
const jsYaml = require('js-yaml')


const initialNodes = []
const initialEdges = []

const proOptions = { hideAttribution: true };

const nodeTypes = { status: StatusVerificationNode, testID: TestIDNode, wf: WorkflowNode, schema: SchemaVerificationNode, query: QueryNode, body: BodyNode, headers: HeadersNode, retain: RetainNode, stress: StressTestNode, match: MatchVerificationNode, custom: CustomVerificationNode, contains: ContainsVerificationNode, count: CountVerificationNode }


//dagre
const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, options) => {
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) => g.setNode(node.id, node));

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const { x, y } = g.node(node.id);

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};


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
    const { fitView } = useReactFlow(); //dagre

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

    const [dict, setDict] = useState({})

    const [dictFile, setDictFile] = useState()
    const [dllFileArr, setDllFileArr] = useState([])

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



    const onCustomVerificationChange = (selectedCustomVerif, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Custom = selectedCustomVerif    //TODO:  need to grab custom verif
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

    const onCountKeyChangeCallback = (newCountKey, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            if (!newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Count) {
                newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Count = { key: '', value: '' }
            }
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Count.key = newCountKey
            return newWorkflows
        })
    }

    const onCountValueChangeCallback = (newCountValue, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            if (!newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Count) {
                newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Count = { key: '', value: '' }
            }
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Count.value = newCountValue
            return newWorkflows
        })
    }

    const onMatchKeyChangeCallback = (newMatchKey, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            if (!newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Match) {
                newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Match = { key: '', value: '' }
            }
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Match.key = newMatchKey
            return newWorkflows
        })
    }

    const onMatchValueChangeCallback = (newMatchValue, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            if (!newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Match) {
                newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Match = { key: '', value: '' }
            }
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Match.value = newMatchValue
            return newWorkflows
        })
    }

    const onContainsChangeCallback = (newContains, _wfIndex, _testIndex) => {
        setWorkflows(oldWorkflows => {
            const newWorkflows = deepCopy(oldWorkflows)
            newWorkflows[_wfIndex].Tests[_testIndex].Verifications[0].Contains = newContains
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


    const onBodyRefChangeCallback = (newBodyRef, _wfIndex, _testIndex) => {
        let bodyRef = `$ref/dictionary/${newBodyRef}`
        console.log(bodyRef);
        onBodyTextChangeCallback(bodyRef, _wfIndex, _testIndex);
    }



    const onBodyTextChangeCallback = (newBodyText, _wfIndex, _testIndex) => {
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


    //dagre
    const onLayout = useCallback(
        (direction) => {
            const layouted = getLayoutedElements(nodes, edges, { direction });

            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);

            window.requestAnimationFrame(() => {
                fitView();
            });
        },
        [nodes, edges]
    );


    // #region Create Nodes

    const createWorkflowNode = (wfIndex = -1, wfName = "", x = Math.random() * 500, y = Math.random() * 500) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        rapiLog(level.DEBUG, "[Editor] Creating new Workflow node with ID: ", id)

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
                x: x,
                y: y
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
                    servers: apiFile.servers,
                    httpMethods: ["Get", "Delete", "Post", "Put"], //TODO: shouldnt be hardcoded here prob
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

    const createBodyNode = (initialBodyText = null, initialBodyRef = null, _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        //TODO: verify bodytext and bodyref?

        console.log("initibodyref", initialBodyRef);

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
                    bodyRefChangeCallback: onBodyRefChangeCallback,
                    bodyText: initialBodyText,
                    bodyRef: initialBodyRef
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


    const createContainsVerificationNode = (initialContains = "", _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        //TODO: verify contains? no i think

        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                custom: {
                    containsChangeCallback: onContainsChangeCallback,
                    contains: initialContains,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'contains'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }


    const createCountVerificationNode = (initialCountKey = "", initialCountValue = "", _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    valueChangeCallback: onCountValueChangeCallback,
                    keyChangeCallback: onCountKeyChangeCallback,
                    key: initialCountKey,
                    value: initialCountValue,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'count'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }


    const createMatchVerificationNode = (initialMatchKey = "", initialMatchValue = "", _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    valueChangeCallback: onMatchValueChangeCallback,
                    keyChangeCallback: onMatchKeyChangeCallback,
                    key: initialMatchKey,
                    value: initialMatchValue,
                    _wfIndex: _wfIndex,
                    _testIndex: _testIndex
                }
            },
            type: 'match'
        };
        reactFlowInstance.addNodes(newNode);

        return id;
    }



    const createCustomVerificationNode = (inititalDllName = "", _wfIndex = -1, _testIndex = -1, x = Math.random() * 500, y = Math.random() * 500) => {
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
                    customVerifChangeCallback: onCustomVerificationChange,
                    dllName: inititalDllName,
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

    const processWorkflow = (wf, currX, currY) => {

        rapiLog(level.DEBUG, "[Editor] Workflow found when recreating state. Assigned ID: ", wf._wfIndex)

        const wfNodeId = createWorkflowNode(maxWfIndex.current, wf.WorkflowID, currX, currY) //WorkflowID is wf name TODO: whats the diff between yammlwfindex and maxwfindex

        return wfNodeId
    }

    const processStress = (wf, yamlWfIndex, currX, currY) => {

        rapiLog(level.DEBUG, "[Editor] Stress found when recreating state for workflow with ID ", yamlWfIndex)

        const initialCount = wf.Stress.Count
        const initialThreads = wf.Stress.Threads
        const initialDelay = wf.Stress.Delay
        const stressTestId = createStressNode(initialCount, initialThreads, initialDelay, yamlWfIndex, currX, currY)

        return stressTestId
    }

    const processTest = (test, yamlWfIndex, currYamlTestIndex, currX, currY) => {

        rapiLog(level.DEBUG, "[Editor] Test found when recreating state for workflow with ID ", yamlWfIndex)

        const testNodeServer = test.Server
        const testNodePath = test.Path
        const testNodeMethod = test.Method

        const testNodeId = createTestNode(test.TestID, testNodeServer, testNodePath, testNodeMethod, yamlWfIndex, currYamlTestIndex, currX, currY) //TODO: the node has a test property however inside the values are the default ones not the ones in the state

        return testNodeId
    }

    const processBody = (bodyText, bodyRef, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Body found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        const bodyNodeId = createBodyNode(bodyText, bodyRef, yamlWfIndex, currYamlTestIndex, currX, currY)

        return bodyNodeId
    }

    const processHeaders = (headers, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Headers found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        //headers is array with here, like this: ["Accept:application/xml"]
        //must process it //TODO: also test with more than 1 header

        let processedHeaders = headers.map(headerString => {
            let parts = headerString.split(":");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        const headersNodeId = createHeadersNode(processedHeaders, yamlWfIndex, currYamlTestIndex, currX, currY)

        return headersNodeId
    }

    const processQuery = (query, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Query found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)
        //TODO: need to test this, dont have any example tsl file w query i think...
        let processedQuery = query.map(queryString => {
            let parts = queryString.split(":");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        const queryNodeId = createQueryNode(processedQuery, yamlWfIndex, currYamlTestIndex, currX, currY)

        return queryNodeId
    }

    const processRetain = (retain, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Retain found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        let processedRetain = retain.map(retainString => {
            let parts = retainString.split("#$.");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        const retainNodeId = createRetainNode(processedRetain, yamlWfIndex, currYamlTestIndex, currX, currY)

        return retainNodeId
    }

    const processStatusVerif = (status, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Status verification found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        const statusVerifNodeId = createStatusVerificationNode(status, yamlWfIndex, currYamlTestIndex, currX, currY)

        return statusVerifNodeId
    }

    const processSchemaVerif = (schema, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Schema verification found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        const schemaVerifNodeId = createSchemaVerificationNode(schema, yamlWfIndex, currYamlTestIndex, currX, currY)

        return schemaVerifNodeId
    }

    const processContainsVerif = (contains, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Contains verification found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        //TODO: transform contains here or before process is called?
        const containsVerifNodeId = createContainsVerificationNode(contains, yamlWfIndex, currYamlTestIndex, currX, currY)

        return containsVerifNodeId
    }

    const processCountVerif = (matchString, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Count verification found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        // TODO: process key and value here or before calling processmethod?

        let processedMatch = matchString.split("#");
        let key = processedMatch[0]
        let value = processedMatch[1]


        const countVerifNodeId = createCountVerificationNode(key, value, yamlWfIndex, currYamlTestIndex, currX, currY)

        return countVerifNodeId
    }

    const processMatchVerif = (matchString, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Match verification found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        //TODO: preocess key and value here or before calling processmetdo?

        let processedMatch = matchString.split("#");
        let key = processedMatch[0]
        let value = processedMatch[1]

        const matchVerifNodeId = createMatchVerificationNode(key, value, yamlWfIndex, currYamlTestIndex, currX, currY)

        return matchVerifNodeId
    }

    const processCustomVerif = (dllName, yamlWfIndex, currYamlTestIndex, currX, currY) => {
        // TODO:
        rapiLog(level.DEBUG, "[Editor] Match verification found when recreating state for test with ID " + currYamlTestIndex + ", workflow with ID " + yamlWfIndex)

        //TODO: process dll name here or begore
        const customVerifNodeId = createCustomVerificationNode(dllName, yamlWfIndex, currYamlTestIndex, currX, currY)

        return customVerifNodeId
    }



    //TODO: improve algorithm, its kinda hardcoded atm, missing some nodes, etc
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

            const wfNodeID = processWorkflow(wf, currX, currY)

            currX = currX + offsetX

            if (wf.Stress) {
                const stressNodeId = processStress(wf, yamlWfIndex, currX, currY)

                const newEdgeWfStress = {
                    id: "wf:" + wfNodeID.toString() + "-stress:" + stressNodeId.toString(),
                    source: wfNodeID.toString(),
                    target: stressNodeId.toString()
                }

                edgesList.push(newEdgeWfStress)
                currY = currY + offsetY //TODO: pensar melhor nos layputs mais complexos
            }


            wf.Tests.forEach(test => {

                test._testIndex = currYamlTestIndex

                // ------------ REQUEST ------------

                const testNodeId = processTest(test, yamlWfIndex, currYamlTestIndex, currX, currY)

                testNodeIdsList.push(testNodeId)

                //check optional stuff

                if (test.Body) {
                    let bodyText = null
                    let bodyRef = null
                    //TODO: body text and ref


                    if (test.Body.startsWith("$")) {
                        //ref
                        let auxbodyRef = test.Body

                        let dictionaryIndex = auxbodyRef.indexOf("dictionary/");
                        if (dictionaryIndex !== -1) {

                            let result = auxbodyRef.substring(dictionaryIndex + "dictionary/".length);
                            bodyRef = result

                        }
                    } else {
                        //text
                        bodyText = test.Body
                    }

                    console.log("bodyref", bodyRef);
                    console.log("bodytext", bodyText);
                    const bodyNodeId = processBody(bodyText, bodyRef, yamlWfIndex, currYamlTestIndex, currX, currY)
                    currY = currY + offsetY

                    const newEdgeTestBody = {
                        id: "test:" + testNodeId.toString() + "-get:" + bodyNodeId.toString(),
                        source: testNodeId.toString(),
                        target: bodyNodeId.toString()
                    }

                    edgesList.push(newEdgeTestBody)
                }

                if (test.Headers) {
                    rapiLog(level.WARN, "test.Headers")
                    rapiLog(level.INFO, test)
                    rapiLog(level.INFO, test.Headers)

                    const headersNodeId = processHeaders(test.Headers)
                    currY = currY + offsetY

                    const newEdgeTestHeaders = {
                        id: "test:" + testNodeId.toString() + "-get:" + headersNodeId.toString(),
                        source: testNodeId.toString(),
                        target: headersNodeId.toString()
                    }

                    edgesList.push(newEdgeTestHeaders)
                }

                if (test.Query) {
                    const queryNodeId = processQuery(test.Query, yamlWfIndex, currYamlTestIndex)
                    currY = currY + offsetY

                    const newEdgeTestQuery = {
                        id: "test:" + testNodeId.toString() + "-get:" + queryNodeId.toString(),
                        source: testNodeId.toString(),
                        target: queryNodeId.toString()
                    }

                    edgesList.push(newEdgeTestQuery)
                }

                if (test.Retain) {
                    const retainNodeId = processRetain(test.Retain, yamlWfIndex, currYamlTestIndex)
                    currY = currY + offsetY

                    const newEdgeTestRetain = {
                        id: "test:" + testNodeId.toString() + "-get:" + retainNodeId.toString(),
                        source: testNodeId.toString(),
                        target: retainNodeId.toString()
                    }

                    edgesList.push(newEdgeTestRetain)
                }


                // ----------- VERIFICATIONS ------------


                const statusNodeCode = test.Verifications[0].Code   //Verifications is an array for some reason but always 1 element
                currY = currY + offsetY

                const statusVerifNodeId = createStatusVerificationNode(statusNodeCode, yamlWfIndex, currYamlTestIndex, currX, currY)

                const newEdgeTestStatus = {
                    id: "test:" + testNodeId.toString() + "-get:" + statusVerifNodeId.toString(),
                    source: testNodeId.toString(),
                    target: statusVerifNodeId.toString()
                }

                edgesList.push(newEdgeTestStatus)


                //check optional stuff TODO:falta cenas

                if (test.Verifications[0].Schema) {
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

                if (test.Verifications[0].Contains) {
                    const containsVerifNodeId = processContainsVerif(test.Verifications[0].Contains, yamlWfIndex, currYamlTestIndex, currX, currY)
                    currY = currY + offsetY

                    const newEdgeTestContains = {
                        id: "test:" + testNodeId.toString() + "-get:" + containsVerifNodeId.toString(),
                        source: testNodeId.toString(),
                        target: containsVerifNodeId.toString()
                    }

                    edgesList.push(newEdgeTestContains)
                }

                if (test.Verifications[0].Count) {
                    const countVerifNodeId = processCountVerif(test.Verifications[0].Count, yamlWfIndex, currYamlTestIndex, currX, currY)
                    currY = currY + offsetY

                    const newEdgeTestCount = {
                        id: "test:" + testNodeId.toString() + "-get:" + countVerifNodeId.toString(),
                        source: testNodeId.toString(),
                        target: countVerifNodeId.toString()
                    }

                    edgesList.push(newEdgeTestCount)
                }

                if (test.Verifications[0].Match) {
                    const matchVerifNodeId = processMatchVerif(test.Verifications[0].Match, yamlWfIndex, currYamlTestIndex, currX, currY)
                    currY = currY + offsetY

                    const newEdgeTestMatch = {
                        id: "test:" + testNodeId.toString() + "-get:" + matchVerifNodeId.toString(),
                        source: testNodeId.toString(),
                        target: matchVerifNodeId.toString()
                    }

                    edgesList.push(newEdgeTestMatch)
                }

                if (test.Verifications[0].Custom) {
                    const customVerifNodeId = processCustomVerif(test.Verifications[0].Custom, yamlWfIndex, currYamlTestIndex, currX, currY)
                    currY = currY + offsetY

                    const newEdgeTestCustom = {
                        id: "test:" + testNodeId.toString() + "-get:" + customVerifNodeId.toString(),
                        source: testNodeId.toString(),
                        target: customVerifNodeId.toString()
                    }

                    edgesList.push(newEdgeTestCustom)
                }



                //create the edge for this test

                const newEdgeWfTest = {
                    id: "wf:" + wfNodeID.toString() + "-test:" + testNodeId.toString(),
                    source: wfNodeID.toString(),
                    target: testNodeId.toString()
                }





                edgesList.push(newEdgeWfTest)

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

    const onClickWip = () => {
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

            // process each workflow
            for (let wfIndex = 0; wfIndex < newWorkflows.length; wfIndex++) {

                const workflow = newWorkflows[wfIndex];
                delete workflow._wfIndex

                // process Stress Test
                // TODO: No processing required?

                // process each test for this workflow
                for (let testIndex = 0; testIndex < workflow.Tests.length; testIndex++) {

                    const test = workflow.Tests[testIndex];
                    delete test._testIndex

                    // process Headers
                    if (test.Headers) {
                        const transformedHeaders = test.Headers.map(({ key, value }) => `${key}:${value}`);
                        test.Headers = transformedHeaders
                    }

                    // process Query
                    if (test.Query) {
                        const transformedQuery = test.Query.map(({ key, value }) => `${key}=${value}`);
                        test.Query = transformedQuery
                    }

                    // process Retain
                    if (test.Retain) {
                        const transformedRetain = test.Retain.map(({ key, value }) => `${key}#$.${value}`);
                        test.Retain = transformedRetain
                    }

                    // process Body
                    if (test.Body) {
                        //TODO: nothing needed?
                    }



                    // process Verifications
                    for (let ver = 0; ver < test.Verifications.length; ver++) { // this loop should only be executed once, i think
                        const verification = test.Verifications[ver];

                        // process Status
                        // TODO: No processing required?

                        // process Schema
                        if (verification.Schema) {
                            let schemaStr = "$ref/definitions/" + verification.Schema
                            verification.Schema = schemaStr
                        }

                        // process Count
                        if (verification.Count) {
                            const transformedCount = `${verification.Count.key}#${verification.Count.value}`;
                            verification.Count = transformedCount
                        }

                        // process Match
                        if (verification.Match) {
                            const transformedMatch = `$.${verification.Match.key}#${verification.Match.value}`;
                            verification.Match = transformedMatch
                        }

                        // process Contains
                        // TODO: No processing required?

                        // process Custom
                        // TODO:
                        if (verification.Custom) {
                            const transformedCustom = `[${verification.Custom}]`;
                            verification.Custom = transformedCustom
                        }
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


        if (dictFile) {
            console.log("appending dictionary...");
            data.append('dictionary.txt', dictFile); //TODO: this is file or json?
        }


        let i = 1
        if (testSpecification !== null) {
            for (const file of testSpecification) {
                data.append("tsl_" + i + ".yaml", file)
                i++
            }
        }


        if (dllFileArr) {
            for (const file of dllFileArr) {
                console.log("appending dll file...");
                data.append(file.name, file)
            }
        }



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

        console.log("----------------------------");
        console.log("Dictionary file:");
        console.log(dict);
    }

    const collapseNodes = () => {
        console.log("collapsing nodes");
        let nodesArr = reactFlowInstance.getNodes();
        nodesArr.forEach(
            e => {
                if (e.data.custom.collapseAccordion) {
                    console.log("collapse");
                    e.data.custom.collapseAccordion()
                }
                else {
                    console.log("no collapse");
                    console.log(e);
                }
            }
        )
        console.log("nodes collapsed");

    }

    const openNodes = () => {
        let nodesArr = reactFlowInstance.getNodes();
        nodesArr.forEach(
            e => {
                if (e.data.custom.openAccordion) {
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


    function parseDictionary(dictString) {
        const lines = dictString.split('\n');
        const dictionary = {};
        let currentKey = '';
        let currentExample = '';

        lines.forEach((line) => {
            if (line.startsWith('dictionaryID:')) {
                if (currentKey && currentExample) {
                    dictionary[currentKey] = currentExample.trim();
                }
                currentKey = line.split('dictionaryID:')[1].trim();
                currentExample = '';
            } else {
                currentExample += line + '\n';
            }
        });

        if (currentKey && currentExample) {
            dictionary[currentKey] = currentExample.trim();
        }

        return dictionary;
    }

    const onDictionaryDrop = (txtFile) => {
        //somehow relay info to bodyNode
        console.log("dic drop received, now need to relay");
        let nodesArr = reactFlowInstance.getNodes();

        if (txtFile) {

            setDictFile(txtFile)

            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContents = event.target.result;

                console.log(fileContents);
                //here i have file contents. what do?
                //gotta send all info to body node

                let dictObj = parseDictionary(fileContents)

                console.log("setting dicitonary");
                console.log(dictObj);
                setDict(dictObj)

                nodesArr.forEach(
                    node => {
                        if (node.type === "body") {
                            console.log("found body node with id:", node.id);
                            node.data = {
                                ...node.data,
                                custom: {
                                    ...node.data.custom,
                                    dictObj: dictObj
                                }

                            }

                            console.log("new node data:");
                            console.log(node.data);
                        }
                    }
                )

                setNodes(nodesArr)

            };

            reader.readAsText(txtFile);
        }
    }

    const onDllDrop = (dllArr) => {
        //somehow relay info to customVerifNode
        console.log("dll drop receivd, now need to relay");

        console.log("fll");
        console.log(dllArr);

        setDllFileArr(dllArr)

        let namesArr = []

        dllArr.forEach((ddlFile) => { console.log(namesArr.push(ddlFile.name)); })
        console.log(namesArr);

        let nodesArr = reactFlowInstance.getNodes();

        nodesArr.forEach(
            node => {
                if (node.type === "custom") {
                    console.log("found node with id:", node.id);
                    node.data = {
                        ...node.data,
                        custom: {
                            ...node.data.custom,
                            dllNames: namesArr
                        }

                    }

                    console.log("new node data:");
                    console.log(node.data);
                }
            }
        )

        setNodes(nodesArr)
    }

    const onTslDrop = (tslFile) => {
        //somehow recreate state

        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContents = event.target.result;

            console.log(fileContents);

            const newstate = jsYaml.load(fileContents)

            console.log("mewstate");
            console.log(newstate);

            setWorkflows(newstate)

            createNodes(newstate)
        };

        reader.readAsText(tslFile);



    }


    return (
        <div>
            <div className='editor-container'>


                <Sidebar className='sidebar'
                    onRunGeneratedChange={onRunGeneratedChange}
                    onRunImmediatelyChange={onRunImmediatelyChange}
                    onRunIntervalChange={onRunIntervalChange}
                    apiTitle={testConfName}
                    handlerAPI={handlerAPI}
                    onTestConfNameChange={onTestConfNameChange}
                    onDictionaryDrop={onDictionaryDrop}
                    onDllDrop={onDllDrop}
                    onTslDrop={onTslDrop}
                    buttonsArray={[
                        { section: "Flow-related", title: "Workflow", onClick: onClickWorkflowNode, class: "wf", tooltip: "Workflow tooltip" },
                        { section: "Flow-related", title: "Test", onClick: onClickTestNode, class: "test" },
                        { section: "Flow-related", title: "Stress Test", onClick: onClickStressTestNode, class: "stress" },
                        { section: "HTTP Requests", title: "Body", onClick: onClickBodyNode, class: "http" },
                        { section: "HTTP Requests", title: "Headers", onClick: onClickHeadersNode, class: "http" },
                        { section: "HTTP Requests", title: "Query", onClick: onClickQueryNode, class: "http" },
                        { section: "HTTP Requests", title: "Retain", onClick: onClickRetainNode, class: "http" },
                        { section: "Verifications", title: "Status Code ", onClick: onClickStatus, class: "verif" },
                        { section: "Verifications", title: "Schema", onClick: onClickSchema, class: "verif" },
                        { section: "Verifications", title: "Contains ", onClick: onClickContains, class: "verif" },
                        { section: "Verifications", title: "Count ", onClick: onClickCount, class: "verif" },
                        { section: "Verifications", title: "Match ", onClick: onClickMatch, class: "verif" },
                        { section: "Verifications", title: "Custom ", onClick: onClickCustom, class: "verif" },
                        { section: "Setup-related", title: "Save changes", onClick: saveWorkflow, class: "setup" },
                        { section: "Setup-related", title: "Finish Setup", onClick: finishSetup, class: "setup" },
                        { section: "Dev", title: "Change entire Workflow", onClick: onClickChangeWf, class: "setup" },
                        { section: "Dev", title: "Dump state", onClick: dumpState, class: "setup" },
                        { section: "Dev", title: "Collapse nodes", onClick: collapseNodes, class: "setup" },
                        { section: "Dev", title: "Open nodes", onClick: openNodes, class: "setup" },
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
                        /* dagre */
                        //fitView
                    >
                        <Background color='#000000' variant={'dots'} />
                        <Controls />

                        {/* dagre */}
                        <Panel position="top-right">
                            <button onClick={() => onLayout('TB')}>vertical layout</button>
                            <button onClick={() => onLayout('LR')}>horizontal layout</button>
                        </Panel>
                    </ReactFlow>

                </div>
            </div>
        </div>
    );
}


function Editor() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}


export default Editor;
