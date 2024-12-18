import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import ReactFlow, { addEdge, Background, Controls, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider, ControlButton } from 'reactflow';
import 'reactflow/dist/style.css';

import authService from '../api-authorization/AuthorizeService';

import WorkflowNode from './nodes/workflowNode';
import TestIDNode from './nodes/testIDNode';

import StatusVerificationNode from './nodes/statusVerificationNode';
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

//import { onCLS, onFCP, onLCP, onINP, onTTFB } from 'web-vitals';

import Alert from 'react-bootstrap/Alert';

import { Tooltips } from './editor-strings';

//import { LOG_LEVELS as level, rapiLog } from './utils';

import Dagre from 'dagre';

import './Editor.css'

import SimpleModalComp from '../../components/SimpleModalComp';
import Settings from './other-components/Settings';


const YAML = require('json-to-pretty-yaml');
const jsYaml = require('js-yaml')

const initialNodes = []
const initialEdges = []

const proOptions = { hideAttribution: true };

const NodeType = Object.freeze({
    WORKFLOW: "workflow",
    TEST: "test",
    STRESS: "stress",
    BODY: "body",
    HEADERS: "headers",
    QUERY: "query",
    RETAIN: "retain",
    STATUS: "status",
    SCHEMA: "schema",
    MATCH: "match",
    CONTAINS: "contains",
    COUNT: "count",
    CUSTOM: "custom"
})

const nodeTypes = {
    [NodeType.WORKFLOW]: WorkflowNode,
    [NodeType.TEST]: TestIDNode,
    [NodeType.STRESS]: StressTestNode,
    [NodeType.BODY]: BodyNode,
    [NodeType.HEADERS]: HeadersNode,
    [NodeType.QUERY]: QueryNode,
    [NodeType.RETAIN]: RetainNode,
    [NodeType.STATUS]: StatusVerificationNode,
    [NodeType.SCHEMA]: SchemaVerificationNode,
    [NodeType.MATCH]: MatchVerificationNode,
    [NodeType.CONTAINS]: ContainsVerificationNode,
    [NodeType.COUNT]: CountVerificationNode,
    [NodeType.CUSTOM]: CustomVerificationNode,
}

//const flowNodeTypes = [NodeType.WORKFLOW, NodeType.TEST, NodeType.STRESS]
const requestNodeTypes = [NodeType.BODY, NodeType.HEADERS, NodeType.QUERY, NodeType.RETAIN]
const verificationNodeTypes = [NodeType.STATUS, NodeType.SCHEMA, NodeType.MATCH, NodeType.CONTAINS, NodeType.COUNT, NodeType.CUSTOM]

const httpMethods = ["Get", "Delete", "Post", "Put"]  //TSL only supports the 4 main HTTP methods, in the future would be nice to support to more and derive them from the api as well

const tslSchemaPrefix = "$ref/definitions/" // aux var to help process schema coming from premade TSL

const sidebarAccordionClass = '.sidebar-simple-header .accordion-button' // aux var to help collapse sidebar sections

//dagre

let g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));


const getLayoutedElements = (nodes, edges, options) => {
    g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({})); //to "reset" graph otherwise old values can mess it up; possibly there's a more efficient way to do this
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    //nodes.forEach((node) => g.setNode(node.id, node));
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

const NODE_LEFT_HANDLE = "leftHandle"
const NODE_RIGHT_HANDLE = "rightHandle"

function Flow() {

    // #region State and Hooks

    //#region state related to React, ReactFlow and Dagre

    const location = useLocation(); // needed to enable pre-filling stuff when coming from Monitor Tests page
    const reactFlowInstance = useReactFlow()
    const { fitView } = useReactFlow(); // for dagre

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    //#endregion


    //#region state related to API

    const [testConfName, setTestConfName] = useState(location?.state?.APITitle || "") // the name of the test configuration

    const [apiFile, setApiFile] = useState(location?.state?.apiFile || null) // This will have servers, paths, schemas and schemavalues

    const [apiId, setApiId] = useState(location?.state?.ApiId || null) // Id of the test configuration (used when editing a configuration, instead of creating a new one)

    const [apiUploaded, setApiUploaded] = useState(location?.state?.ApiId ? true : false) // Whether or not api spec has been uploaded 

    //const [unfinishedConfig, setUnfinishedConfig] = useState(true); // if current config has been finalized will be false, otherwise true

    //#endregion


    //#region state related to Timer settings

    /*For already configured tests, it's not simple to get these 3 values from the database.
    The values are not saved there, we would have to do some math and other logic with timestamps to extract based on the value of the next text execution in DB
    For now this is not done, and instead we present the default values (user can still change them when editing)
    So it requires a deeper look to have the functionality be "ideal", but in any case this is not critical and current behavior is fine also
    */
    const [runImmediately, setRunImmediatly] = useState('true')
    const [runInterval, setRunInterval] = useState('Never')
    const [runGenerated, setRunGenerated] = useState('true')
    //#endregion


    //#region state related to aux files

    const [dictObj, setDictObj] = useState(location?.state?.dictObj || {}) //js object of the dictionary (processed)
    const [dllNamesArr, setDllNamesArr] = useState(location?.state?.dllFileArr ? location?.state?.dllFileArr.map(file => file.name) : []) //arr with names of dll files

    const [dictFile, setDictFile] = useState(location?.state?.dictFile) // dictionary, actual file to send to server
    const [dllFileArr, setDllFileArr] = useState(location?.state?.dllFileArr || []) // dll files, actual files to send to server

    const [dictUploaded, setDictUploaded] = useState(location?.state?.dictFile ? true : false) // whether or not dictionary has been uploaded
    const [dllUploaded, setDllUploaded] = useState(location?.state?.dllFileArr?.length > 0 ? true : false) // whether or not dll files have been uploaded
    //#endregion


    //#region state related to alerts

    const [fadeClass, setFadeClass] = useState(''); //for all alerts

    const [showNodesAlert, setShowNodesAlert] = useState(false);

    const [tslUploadedAlert, setTslUploadedAlert] = useState(false);
    const [tslUploadedWarnings, setTslUploadedWarnings] = useState([]);

    const [finishSetupAlert, setFinishSetupAlert] = useState(false);
    const [finishSetupWarnings, setFinishSetupWarnings] = useState([]);
    //#endregion


    //#region state related to UI (collapse, expand, visible, etc)

    const [canCollapse, setCanCollapse] = useState(false) // if nodes can be collapsed

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // controls if sidebar is collapsed
    const [dontCollapseClass, setDontCollapseClass] = useState("")  // when clicking in an icon when sidebar is collapsed, take note of which icon user wants to go to here; that zone will not be collapsed when sidebar opens

    const [settingsVisible, setSettingsVisible] = useState(false) // controls if settings are visible

    const [nodesCreatedFromState, setNodesCreatedFromState] = useState(false)

    //#endregion

    // #endregion

    // aux variables to see current max nodeId and n of workflows
    const nodeId = useRef(1)
    const maxWfIndex = useRef(0)

    /* adds custom class to body and removes it when component unmounts
    this is so i have more freedom applying custom css effects while making sure they dont affect the app elsewhere (as in outside the editor page)*/
    useEffect(() => {
        document.body.classList.add('editor-page');

        return () => {
            document.body.classList.remove('editor-page');
        };
    }, []);

    // when user leaves editor, cleanup unfinished test configurations
    // this requires further testing to ensure we don't accidentally remove other configurations (since the backend implementation is not very safe), so will be disabled for now
    /* useEffect(() => {
        setUnfinishedConfig(true);
        return () => {

            const cleanup = async () => {
                const unfinished = unfinishedConfig;

                if (unfinished) {
                    const token = await authService.getAccessToken();
                    await fetch(`SetupTest/RemoveUnfinishedSetup`, {
                        method: 'POST',
                        headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
                    });
                }
            };
            cleanup();
        };
    }, []); */


    //for dagre (layout algorithm)
    const onLayout = (direction) => {
        const layouted = getLayoutedElements(nodes, edges, { direction });

        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        window.requestAnimationFrame(() => {
            fitView();
        });
    }


    // #region onChange in Editor

    const onTestConfNameChange = useCallback((newTestConfName) => {
        const newName = newTestConfName.target.value
        console.log("[Editor] New test configuration name: ", newName);
        setTestConfName(newName)
    }, [])

    const onRunGeneratedChange = useCallback((runGenerated) => {
        const run = runGenerated.target.value
        console.log("[Editor] Run generated: ", run);
        setRunGenerated(run)
    }, [])

    const onRunImmediatelyChange = useCallback((runImmediately) => {
        const run = runImmediately.target.value
        console.log("[Editor] Run immediately: ", run);
        setRunImmediatly(run)
    }, [])

    const onRunIntervalChange = useCallback((runInterval) => {
        const run = runInterval.target.value
        console.log("[Editor] Run interval: ", run);
        setRunInterval(run)
    }, [])

    // #endregion


    // #region Connection logic


    const getNodesInLinearChainBidirectional = (startNode) => {
        let allNodes = reactFlowInstance.getNodes();
        let allEdges = reactFlowInstance.getEdges();

        let result = [startNode];
        let currentNode = startNode;

        // Forward search: Find all succeeding nodes
        while (true) {
            const nextEdge = allEdges.find(edge => edge.source === currentNode.id);
            if (!nextEdge) break;

            const nextNode = allNodes.find(node => node.id === nextEdge.target);
            if (!nextNode) break;

            result.push(nextNode);
            currentNode = nextNode;
        }

        // Reset current node for backward search
        currentNode = startNode;

        // Backward search: Find all preceding nodes
        while (true) {
            const prevEdge = allEdges.find(edge => edge.target === currentNode.id);
            if (!prevEdge) break;

            const prevNode = allNodes.find(node => node.id === prevEdge.source);
            if (!prevNode) break;

            result.unshift(prevNode);
            currentNode = prevNode;
        }

        return result;
    };


    const onConnect = (connection) => {

        const { source, target } = connection;

        const sourceNode = reactFlowInstance.getNode(source)
        const targetNode = reactFlowInstance.getNode(target)

        if (sourceNode.type === NodeType.WORKFLOW) {
            onConnectWorkflow(targetNode, connection)
        }

        else if (sourceNode.type === NodeType.TEST) {
            onConnectTest(targetNode, connection)
        }

        // no need to check for stress test because there isnt a way to connect stress test to anything

        else if (requestNodeTypes.includes(sourceNode.type)) {
            onConnectRequestComponent(sourceNode, targetNode, connection)
        }

        else if (verificationNodeTypes.includes(sourceNode.type)) {
            onConnectVerification(sourceNode, targetNode, connection)
        }

        else {
            //should never come here
            alert('Something went wrong')
            return false
        }

    }

    const onConnectWorkflow = (targetNode, connection) => {

        // this method is called if sourceNode is workflow node

        if (targetNode.type === NodeType.WORKFLOW) {
            alert("Invalid connection")
            return false
        }

        else if (targetNode.type === NodeType.TEST) {

            if (connection.sourceHandle !== "rightHandle") { //rightHandle is the one for tests, so others arent allowed
                alert("Invalid connection")
                return false
            }
        }

        else if (targetNode.type === NodeType.STRESS) {

            if (connection.sourceHandle !== "leftHandle") { //leftHandle is the one for stress tests, so others arent allowed
                alert("Invalid connection")
                return false
            }

        }
        else {   //cant connect workflow to any other nodes
            alert("Invalid connection")
            return false
        }

        setEdges((eds) => addEdge(connection, eds))
    }

    const onConnectTest = (targetNode, connection) => {

        // this method is called if sourceNode is test node

        if (requestNodeTypes.includes(targetNode.type)) {
            if (connection.sourceHandle !== "leftHandle") { // leftHandle is the one for request components, so others arent allowed
                alert("Invalid connection")
                return false
            }
        }

        else if (verificationNodeTypes.includes(targetNode.type)) {
            if (connection.sourceHandle !== "rightHandle") {    // rightHandle is the one for verifications, so others arent allowed
                alert("Invalid connection")
                return false
            }
        }

        else {  //cant connect test to any other nodes
            alert("Invalid connection")
            return false
        }

        setEdges((eds) => addEdge(connection, eds))
    }

    const onConnectRequestComponent = (sourceNode, targetNode, connection) => {

        // this method is called if sourceNode is a request component node

        if (!requestNodeTypes.includes(targetNode.type)) {  //can only connect to other request nodes
            alert("Invalid connection")
            return false
        }

        const nodesInSourceChain = getNodesInLinearChainBidirectional(sourceNode)
        const nodesInTargetChain = getNodesInLinearChainBidirectional(targetNode)

        const sourceNodeTypes = nodesInSourceChain.map(node => node.type);
        const targetNodeTypes = nodesInTargetChain.map(node => node.type);

        const hasOverlappingTypes = sourceNodeTypes.some(type => targetNodeTypes.includes(type));

        if (hasOverlappingTypes) {
            alert('Invalid connection')
            return false
        }

        setEdges((eds) => addEdge(connection, eds))
    }

    const onConnectVerification = (sourceNode, targetNode, connection) => {

        // this method is called if sourceNode is a verification node

        if (!verificationNodeTypes.includes(targetNode.type)) { //can only connect to other verification nodes
            alert("Invalid connection")
            return false
        }

        const nodesInSourceChain = getNodesInLinearChainBidirectional(sourceNode)
        const nodesInTargetChain = getNodesInLinearChainBidirectional(targetNode)

        const sourceNodeTypes = nodesInSourceChain.map(node => node.type);
        const targetNodeTypes = nodesInTargetChain.map(node => node.type);

        const hasOverlappingTypes = sourceNodeTypes.some(type => targetNodeTypes.includes(type));

        if (hasOverlappingTypes) {
            alert('Invalid connection')
            return false
        }

        setEdges((eds) => addEdge(connection, eds))
    }

    // #endregion


    // #region Create Nodes


    /**
     * Function to create a React Flow node. 
     * 
     * @param {string} type - the type of node to be created. for example NodeType.TEST, NodeType.Body, ...
     * @param {*} nodeData - the data to be passed to the node. it will be passed as data.custom. typically has at least _wfIndex and _testIndex props
     * @param {x:number, y:number} [position] - should be an object that has x and y coordinates that represent where the node will be placed
     * @returns 
     */
    const createNode = (type, nodeData = {}, position = { x: Math.random() * 500, y: Math.random() * 500 }) => {
        const id = `${nodeId.current}`;
        nodeId.current += 1

        const newNode = {
            id,
            position: position,
            data: {
                custom: nodeData
            },
            type: type
        }

        reactFlowInstance.addNodes(newNode)

        return id
    }

    const processWorkflow = (wf) => {

        const nodeData = {
            wfName: wf.WorkflowID,  //WorklowID is the name of the workflow
            _wfIndex: maxWfIndex.current
        }
        const wfNodeId = createNode(NodeType.WORKFLOW, nodeData)

        return wfNodeId
    }

    const processStress = (wf) => {

        const nodeData = {
            count: wf.Stress.Count,
            threads: wf.Stress.Threads,
            delay: wf.Stress.Delay
        }
        const stressTestId = createNode(NodeType.STRESS, nodeData)

        return stressTestId
    }

    const processTest = (test, currYamlTestIndex) => {

        const nodeData = {
            testName: test.TestID,
            server: test.Server,
            path: test.Path,
            method: test.Method,
            paths: apiFile.paths,
            servers: apiFile.servers,
            httpMethods: httpMethods, // TSL only supports the 4 main HTTP methods, in the future would be nice to support to more and derive them from the api as well
            _testIndex: currYamlTestIndex
        }
        const testNodeId = createNode(NodeType.TEST, nodeData)

        return testNodeId
    }

    const processBody = (body) => {

        let bodyText = null
        let bodyRef = null
        let useBodyRef = null

        if (body.startsWith("$")) {
            useBodyRef = true

            let auxbodyRef = body
            let dictionaryIndex = auxbodyRef.indexOf("dictionary/");
            if (dictionaryIndex !== -1) {
                let result = auxbodyRef.substring(dictionaryIndex + "dictionary/".length);
                bodyRef = result
            }
        }
        else {
            useBodyRef = false
            bodyText = body
        }

        const nodeData = {
            bodyText: bodyText,
            bodyRef: bodyRef,
            useBodyRef: useBodyRef,
            dictObj: dictObj
        }

        const bodyNodeId = createNode(NodeType.BODY, nodeData)

        return bodyNodeId
    }

    const processHeaders = (headers) => {

        //headers is array here, like this: ["Accept:application/xml"]
        //must process it 

        let processedHeaders = headers.map(headerString => {
            let parts = headerString.split(":");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        const nodeData = {
            headers: processedHeaders
        }
        const headersNodeId = createNode(NodeType.HEADERS, nodeData)

        return headersNodeId
    }

    const processQuery = (query) => {

        let processedQuery = query.map(queryString => {
            let parts = queryString.split("=");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        const nodeData = {
            query: processedQuery
        }
        const queryNodeId = createNode(NodeType.QUERY, nodeData)

        return queryNodeId
    }

    const processRetain = (retain) => {

        let processedRetain = retain.map(retainString => {
            let parts = retainString.split("#$.");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        const nodeData = {
            retains: processedRetain
        }
        const retainNodeId = createNode(NodeType.RETAIN, nodeData)

        return retainNodeId
    }

    const processStatusVerif = (status) => {

        const nodeData = {
            initialStatusCode: status
        }
        const statusVerifNodeId = createNode(NodeType.STATUS, nodeData)

        return statusVerifNodeId
    }

    const processSchemaVerif = (schema) => {

        const processedSchema = schema.split(tslSchemaPrefix)[1]

        const schemaMap = {};
        apiFile.schemas.forEach((schema, index) => {
            schemaMap[schema] = apiFile.schemasValues[index];
        });

        const nodeData = {
            initialSchema: processedSchema,
            schemas: apiFile.schemas,
            schemasValues: apiFile.schemasValues,
            schemaMap: schemaMap
        }
        const schemaVerifNodeId = createNode(NodeType.SCHEMA, nodeData)


        return schemaVerifNodeId
    }

    const processContainsVerif = (contains) => {

        const nodeData = {
            contains: contains
        }
        const containsVerifNodeId = createNode(NodeType.CONTAINS, nodeData)

        return containsVerifNodeId
    }

    const processCountVerif = (matchString) => {

        const processedMatch = matchString.split("#");
        const key = processedMatch[0]
        const value = processedMatch[1]

        const nodeData = {
            key: key,
            value: value
        }
        const countVerifNodeId = createNode(NodeType.COUNT, nodeData)

        return countVerifNodeId
    }

    const processMatchVerif = (matchString) => {

        // removing the dollar so that in the node it doesn't show, then in the end when setup finalized we manually add dollar to tsl file

        const processedMatch = matchString.split("#");
        const key = processedMatch[0].replace(/^[$.]+/, '');
        const value = processedMatch[1]

        const nodeData = {
            key: key,
            value: value
        }
        const matchVerifNodeId = createNode(NodeType.MATCH, nodeData)

        return matchVerifNodeId
    }

    const processCustomVerif = (dllName) => {

        const nodeData = {
            dllName: dllName[0],
            dllNames: dllNamesArr
        }
        const customVerifNodeId = createNode(NodeType.CUSTOM, nodeData)

        return customVerifNodeId
    }


    const createNodes = (newstate) => {

        let currYamlTestIndex = 1;

        let listOfEdgesLists = []

        /*
        might need to be a global variable, since currentlywe will only know if tsl is trying to use dictionary or not in the aux methods (processBody, processSchema, etc)
        currently not used, but it's same principle as isTryingToUseDll (and we now get the dic and dll files from DB for previous configurations, so it's not as needed)
        */
        //let isTryingToUseDictionary = false 

        let isTryingToUseDll = false

        newstate.forEach(wf => {

            let testNodeIdsList = []
            let edgesList = []

            wf._wfIndex = maxWfIndex.current
            maxWfIndex.current += 1

            const wfNodeID = processWorkflow(wf)

            if (wf.Stress) {
                const stressNodeId = processStress(wf)

                const newEdgeWfStress = {
                    id: "wf:" + wfNodeID.toString() + "-stress:" + stressNodeId.toString(),
                    source: wfNodeID.toString(),
                    sourceHandle: NODE_LEFT_HANDLE,
                    target: stressNodeId.toString()
                }

                edgesList.push(newEdgeWfStress)
            }


            wf.Tests.forEach(test => {

                test._testIndex = currYamlTestIndex
                const testNodeId = processTest(test, currYamlTestIndex)
                testNodeIdsList.push(testNodeId)

                // ------------ REQUEST ------------

                let currLeafId = testNodeId

                if (test.Body) {
                    const bodyNodeId = processBody(test.Body)

                    const newEdgeTestBody = {
                        id: currLeafId.toString() + bodyNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_LEFT_HANDLE,
                        target: bodyNodeId.toString()
                    }

                    currLeafId = bodyNodeId

                    edgesList.push(newEdgeTestBody)
                }

                if (test.Headers) {
                    const headersNodeId = processHeaders(test.Headers)

                    const newEdgeTestHeaders = {
                        id: currLeafId.toString() + headersNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_LEFT_HANDLE,
                        target: headersNodeId.toString()
                    }

                    currLeafId = headersNodeId

                    edgesList.push(newEdgeTestHeaders)
                }

                if (test.Query) {
                    const queryNodeId = processQuery(test.Query)

                    const newEdgeTestQuery = {
                        id: currLeafId.toString() + queryNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_LEFT_HANDLE,
                        target: queryNodeId.toString()
                    }

                    currLeafId = queryNodeId

                    edgesList.push(newEdgeTestQuery)
                }

                if (test.Retain) {
                    const retainNodeId = processRetain(test.Retain)

                    const newEdgeTestRetain = {
                        id: currLeafId.toString() + retainNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_LEFT_HANDLE,
                        target: retainNodeId.toString()
                    }

                    currLeafId = retainNodeId

                    edgesList.push(newEdgeTestRetain)
                }


                // ----------- VERIFICATIONS ------------

                //TODO: at the moment, the whole algorithm assumes a correct tsl strucuture, probably does not work and may crash with incorrect TSL
                //for "real world / production" , we should add tsl validation to make it more robust

                const statusVerifNodeId = processStatusVerif(test.Verifications[0].Code)    //Verifications is an array for some reason but always 1 element

                currLeafId = testNodeId

                const newEdgeTestStatus = {
                    id: currLeafId.toString() + statusVerifNodeId.toString(),
                    source: currLeafId.toString(),
                    sourceHandle: NODE_RIGHT_HANDLE,
                    target: statusVerifNodeId.toString()
                }

                currLeafId = statusVerifNodeId

                edgesList.push(newEdgeTestStatus)

                if (test.Verifications[0].Schema) {
                    const schemaVerifId = processSchemaVerif(test.Verifications[0].Schema)

                    const newEdgeTestSchema = {
                        id: currLeafId.toString() + schemaVerifId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_RIGHT_HANDLE,
                        target: schemaVerifId.toString()
                    }

                    currLeafId = schemaVerifId

                    edgesList.push(newEdgeTestSchema)
                }

                if (test.Verifications[0].Contains) {
                    const containsVerifNodeId = processContainsVerif(test.Verifications[0].Contains)

                    const newEdgeTestContains = {
                        id: currLeafId.toString() + containsVerifNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_RIGHT_HANDLE,
                        target: containsVerifNodeId.toString()
                    }

                    currLeafId = containsVerifNodeId

                    edgesList.push(newEdgeTestContains)
                }

                if (test.Verifications[0].Count) {
                    const countVerifNodeId = processCountVerif(test.Verifications[0].Count)

                    const newEdgeTestCount = {
                        id: currLeafId.toString() + countVerifNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_RIGHT_HANDLE,
                        target: countVerifNodeId.toString()
                    }

                    currLeafId = countVerifNodeId

                    edgesList.push(newEdgeTestCount)
                }

                if (test.Verifications[0].Match) {
                    const matchVerifNodeId = processMatchVerif(test.Verifications[0].Match)

                    const newEdgeTestMatch = {
                        id: currLeafId.toString() + matchVerifNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_RIGHT_HANDLE,
                        target: matchVerifNodeId.toString()
                    }

                    currLeafId = matchVerifNodeId

                    edgesList.push(newEdgeTestMatch)
                }

                if (test.Verifications[0].Custom) {

                    isTryingToUseDll = true

                    const customVerifNodeId = processCustomVerif(test.Verifications[0].Custom)

                    const newEdgeTestCustom = {
                        id: currLeafId.toString() + customVerifNodeId.toString(),
                        source: currLeafId.toString(),
                        sourceHandle: NODE_RIGHT_HANDLE,
                        target: customVerifNodeId.toString()
                    }

                    currLeafId = customVerifNodeId

                    edgesList.push(newEdgeTestCustom)
                }

                const newEdgeWfTest = {
                    id: wfNodeID.toString() + testNodeId.toString(),
                    source: wfNodeID.toString(),
                    sourceHandle: NODE_RIGHT_HANDLE,
                    target: testNodeId.toString()
                }

                edgesList.push(newEdgeWfTest)

                currYamlTestIndex = currYamlTestIndex + 1

            })

            currYamlTestIndex = 0

            listOfEdgesLists = listOfEdgesLists.concat(edgesList)

        });

        setEdges((edges) => {
            let newEdges = edges.concat(listOfEdgesLists)
            return newEdges
        })

        if (isTryingToUseDll && dllFileArr.length === 0) {
            setTslUploadedWarnings(tslUploadedWarnings.concat("Warning: Some nodes attempt to make use of auxiliary files that are not yet uploaded."))
        }

        setCanCollapse(true)
    }

    /* when state is recreated and nodes are created and ready to be collapsed the canCollapse flag is set to true;
    when that happens, this function is executed which collapses the nodes after X milliseconds
    the reason this needs to happen in useEffect after state update is because the nodes and edges etc are state updates as well,
    and React takes a bit to process those. so I cant call collapseNodes directly before the state updates are processed.
    this solution perhaps could be more elegant but it makes sense and works fine */
    useEffect(() => {
        if (canCollapse) {
            setTimeout(() => {
                collapseNodes();
                setCanCollapse(false)
            }, 200);
        }
    }, [canCollapse]);

    // #endregion


    // #region onClick in Editor


    const checkIfApiFile = () => {
        if (apiFile) {
            return true
        } else {
            setShowNodesAlert(true)
            return false
        }
    }

    const onClickWorkflowNode = () => {

        if (!checkIfApiFile()) return

        maxWfIndex.current += 1

        const nodeData = {
            wfName: "",
            _wfIndex: maxWfIndex.current
        }
        createNode(NodeType.WORKFLOW, nodeData)
    }

    const onClickTestNode = () => {

        if (!checkIfApiFile()) return

        const nodeData = {
            paths: apiFile.paths,
            servers: apiFile.servers,
            httpMethods: httpMethods //TSL only supports the 4 main HTTP methods, in the future would be nice to support to more and derive them from the api as well
        }
        createNode(NodeType.TEST, nodeData)
    }

    const onClickStatus = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.STATUS)
    }

    const onClickCount = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.COUNT)
    }

    const onClickContains = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.CONTAINS)
    }

    const onClickMatch = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.MATCH)
    }

    const onClickCustom = () => {
        if (!checkIfApiFile()) return
        const nodeData = {
            dllNames: dllNamesArr
        }
        createNode(NodeType.CUSTOM, nodeData)
    }


    const onClickSchema = () => {
        if (!checkIfApiFile()) return

        const schemaMap = {};
        apiFile.schemas.forEach((schema, index) => {
            schemaMap[schema] = apiFile.schemasValues[index];
        });

        const nodeData = {
            schemas: apiFile.schemas,
            schemasValues: apiFile.schemasValues,
            schemaMap: schemaMap
        }
        createNode(NodeType.SCHEMA, nodeData)
    }

    const onClickBodyNode = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.BODY)
    }

    const onClickHeadersNode = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.HEADERS)
    }

    const onClickQueryNode = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.QUERY)
    }

    const onClickRetainNode = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.RETAIN)
    }

    const onClickStressTestNode = () => {
        if (!checkIfApiFile()) return
        createNode(NodeType.STRESS)
    }

    // aux, can be deleted but is useful for testing
    /* const onClickWip = () => {
        if (!checkIfApiFile()) return
        console.log("Work in progress");
        alert('wip')
    } */

    // #endregion


    //#region other callbacks to other components

    const handlerAPI = function (paths, servers, schemas, schemasValues) {
        let apiContents = { paths, servers, schemas, schemasValues }
        setApiUploaded(true)
        setApiFile(apiContents)
    }

    //#endregion


    //#region file management

    // process the dictionary file, turn into js dictionary
    function parseDictionary(dictString) {
        const lines = dictString.split('\n');
        const dictionary = {};
        let currentKey = '';
        let currentExample = '';

        lines.forEach((line) => {
            if (line.startsWith('dictionaryID:')) {
                if (currentKey && currentExample) {
                    //if new entry is not the first one, trim text of previous entry
                    dictionary[currentKey] = currentExample.trim();
                }
                //new entry, so set new key and start new example(value)
                currentKey = line.split('dictionaryID:')[1].trim();
                currentExample = '';
            } else {
                //if line is not new entry, add to current with line separator
                currentExample += line + '\n';
            }
        });

        if (currentKey && currentExample) {
            // trim example of last entry
            dictionary[currentKey] = currentExample.trim();
        }

        return dictionary;
    }

    const onDictionaryDrop = (txtFile) => {
        if (txtFile) {

            let nodesArr = reactFlowInstance.getNodes();
            setDictFile(txtFile)

            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContents = event.target.result;

                let dictObj = parseDictionary(fileContents)

                setDictObj(dictObj)

                nodesArr.forEach(
                    node => {
                        if (node.type === NodeType.BODY) {
                            node.data = {
                                ...node.data,
                                custom: {
                                    ...node.data.custom,
                                    dictObj: dictObj
                                }

                            }
                        }
                    }
                )
                setNodes(nodesArr)
            };
            reader.readAsText(txtFile);
        }
    }

    const onDllDrop = (dllArr) => {

        setDllFileArr(dllArr)

        let namesArr = []

        dllArr.forEach((ddlFile) => { namesArr.push(ddlFile.name) })

        setDllNamesArr(namesArr)

        let nodesArr = reactFlowInstance.getNodes();

        nodesArr.forEach(
            node => {
                if (node.type === NodeType.CUSTOM) {
                    node.data = {
                        ...node.data,
                        custom: {
                            ...node.data.custom,
                            dllNames: namesArr
                        }

                    }
                }
            }
        )

        setNodes(nodesArr)
    }

    const onTslDrop = (tslFile) => {

        setNodes([])
        setEdges([])

        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContents = event.target.result;

            // file load will start
            const startTotal = performance.now();

            const newstate = jsYaml.load(fileContents)

            const endFile = performance.now();

            const startEditor = performance.now();

            createNodes(newstate)

            //after this nodes are created so operation ends
            const endTotal = performance.now();
            //log time taken to load file and create nodes
            console.log(`[TOTAL] Time taken: ${endTotal - startTotal}ms`);

            console.log(`[EDITOR] Time taken: ${endTotal - startEditor}ms`);

            console.log(`[FILE] Time taken: ${endFile - startTotal}ms`);


            // should perhaps do a more thorough check before this, to ensure it's not triggered when upload fails
            // however at the moment if it reaches here then it was uploaded successfully, so it's fine for now
            setTslUploadedAlert(true)


            setTimeout(() => {
                document.getElementById('layout-button').click();
            }, 600)


        };

        reader.readAsText(tslFile);
    }

    //#endregion


    // #region others/misc

    const collapseNodes = () => {
        const nodesArr = reactFlowInstance.getNodes();
        nodesArr.forEach(
            e => {
                if (e.data.custom.collapseAccordion) {
                    e.data.custom.collapseAccordion()
                }
            }
        )
    }

    const openNodes = () => {
        const nodesArr = reactFlowInstance.getNodes();
        nodesArr.forEach(
            e => {
                if (e.data.custom.openAccordion) {
                    e.data.custom.openAccordion()
                }
            }
        )
    }


    // collapse the accordions inside the sidebar, except those with the "dontCollapseClass"
    const collapseSidebarAccordions = () => {
        const elements = document.querySelectorAll(sidebarAccordionClass);

        elements.forEach((element) => {
            const isNotCollapsed = !element.classList.contains('collapsed')

            const children = element.children

            let childHasDntClpsClass = false

            Array.from(children).forEach(child => {
                if (child.classList.contains(dontCollapseClass)) {
                    childHasDntClpsClass = true
                }
            });

            if (isNotCollapsed && !childHasDntClpsClass) {
                element.click()
            }
            else {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }

            childHasDntClpsClass = false

        });
    }

    const onToggleCollapse = (newCollapsedState, dontCollapseClass = "") => {
        setSidebarCollapsed(newCollapsedState)
        setDontCollapseClass(dontCollapseClass)
    }

    // whenever the sidebar is opened or closed, collapse accordions inside
    useEffect(() => {
        collapseSidebarAccordions()
    }, [sidebarCollapsed])

    /* eslint-disable */
    // If there is state coming from MonitorTests, create corresponding nodes
    useEffect(() => {
        if (location?.state?.tslState) {
            console.log('[Editor] External state has been found; creating nodes...');
            createNodes(location?.state?.tslState)
            setNodesCreatedFromState(true)
        } else {
            console.log('[Editor] No state has been found; no nodes will be created');
        }
    }, []); // Empty dependency array ensures the effect runs only once -> THIS IS WHY ESLINT IS DISABLED (dependencies dont matter)
    /* eslint-enable */

    useEffect(() => {
        if (nodesCreatedFromState) {

            setTimeout(() => {
                document.getElementById('layout-button').click()
                //for some reason calling onLayout('TB') is not working, so we manually click the layout button instead, need further check to see why
            }, 1200);
            setNodesCreatedFromState(false)
        }
    }, [nodesCreatedFromState])

    // Maybe would be more useful to change this method in the future to also clean files/etc (full reset)? At the moment only clears nodes and edges
    // probably good to add a confirmation button as well to prevent accidental resets
    function clearEditor() {
        setNodes([])
        setEdges([])
    }


    // #endregion


    //#region Finish Setup

    /**
     * Aux function to get connected nodes of a specific type given a single root node
     * 
     * @param {import('reactflow').Node} rootNode // the root node to grab the connect nodes from
     * @param {string} desiredType  // the type of the nodes to get (use NodeType.XXX)
     * @returns 
     */
    const getConnectedNodes = (rootNode, desiredType) => {
        const nodes = reactFlowInstance.getNodes()
        const edges = reactFlowInstance.getEdges()

        return edges
            .filter(edge => edge.source === rootNode.id || edge.target === rootNode.id) // Find connected edges
            .map(edge => edge.source === rootNode.id ? edge.target : edge.source) // Get connected node IDs
            .map(id => nodes.find(node => node.id === id)) // Map IDs to node objects
            .filter(node => node && node.type === desiredType);
    }


    const getConnectedNodesByHandle = (rootNode, sourceHandle) => {
        const nodes = reactFlowInstance.getNodes();
        const edges = reactFlowInstance.getEdges();

        const connectedEdges = edges.filter(edge => edge.source === rootNode.id && edge.sourceHandle === sourceHandle);
        const connectedNodes = connectedEdges.map(edge => nodes.find(node => node.id === edge.target));

        return connectedNodes
    }


    const getNodesInLinearChain = (startNode) => {
        let allNodes = reactFlowInstance.getNodes()
        let allEdges = reactFlowInstance.getEdges()

        let result = [startNode]; // Start with the initial node in the result set
        let currentNode = startNode;

        // Use a loop to follow the chain in one direction
        while (true) {
            const nextEdge = allEdges.find(edge => edge.source === currentNode.id);
            if (!nextEdge) break; // If there's no outgoing edge, we've reached the end of the chain

            const nextNode = allNodes.find(node => node.id === nextEdge.target);
            if (!nextNode) break; // Safety check, though in a linear chain this should never happen

            result.push(nextNode); // Add the connected node to the result
            currentNode = nextNode; // Move to the next node in the chain
        }

        return result;
    }

    const scanEditorState = () => {
        const workflows = []
        let error = false

        const nodes = reactFlowInstance.getNodes()
        const wfNodes = nodes.filter(node => node.type === NodeType.WORKFLOW);

        if (wfNodes.length < 1) {
            alert('Invalid settings - You must have at least 1 Workflow')
            error = true
            return false
        }

        const allWfNames = []
        const allTestNames = []

        wfNodes.forEach(wfNode => {

            if (error) return false
    
            const wfState = wfNode.data.custom.getState() // {name: "", _wfIndex: ""}

            const workflow = {
                _wfIndex: wfState._wfIndex,
                WorkflowID: wfState.name,
                Tests: []
            }

            allWfNames.push(wfState.name)

            const connectedStressNodes = getConnectedNodes(wfNode, NodeType.STRESS)
            if (connectedStressNodes.length > 1) {
                alert('Invalid settings - Only 1 Stress Test allowed per workflow')
                error = true
                return false
            }
            if (connectedStressNodes.length === 1) {
                const stressState = connectedStressNodes[0].data.custom.getState() // {count: "", threads:"", delay:""}
                workflow.Stress = stressState
            }

            const connectedTestNodes = getConnectedNodes(wfNode, NodeType.TEST)
            if (connectedTestNodes.length < 1) {
                alert('Invalid settings - Workflows must have at least 1 Test')
                error = true
                return false
            }
            connectedTestNodes.forEach(testNode => {

                if(error) return false

                const testState = testNode.data.custom.getState() // {name: "", server:"", path:"", method:"", _testIndex: ""}

                const test = {
                    _testIndex: testState._testIndex,
                    Server: testState.server,
                    TestID: testState.name,
                    Path: testState.path,
                    Method: testState.method,
                    Verifications: [{ Code: -1 }]
                }

                allTestNames.push(testState.name)

                // get request nodes from test
                const connectedRequestNodes = getConnectedNodesByHandle(testNode, "leftHandle")
                if (connectedRequestNodes.length >= 1) {
                    if (connectedRequestNodes.length > 1) {
                        alert('Invalid settings - Only one Request node can be connected directly to a Test node')
                        error = true
                        return false
                    }

                    const connectedRequestNode = connectedRequestNodes[0]
                    if (!requestNodeTypes.includes(connectedRequestNode.type)) {
                        //should never happen
                        alert('Something went wrong')
                        error = true
                        return false
                    }
                    const restOfTheRequestNodes = getNodesInLinearChain(connectedRequestNode)
                    const allRequestNodes = connectedRequestNodes.concat(restOfTheRequestNodes)
                    if (!allRequestNodes.every(node => requestNodeTypes.includes(node.type))) {
                        //should never happen
                        alert('Something went wrong')
                        error = true
                        return false
                    }

                    const headersNode = allRequestNodes.find(node => node.type === NodeType.HEADERS);
                    const bodyNode = allRequestNodes.find(node => node.type === NodeType.BODY);
                    const retainNode = allRequestNodes.find(node => node.type === NodeType.RETAIN);
                    const queryNode = allRequestNodes.find(node => node.type === NodeType.QUERY);

                    if (headersNode) {
                        const headersState = headersNode.data.custom.getState() // {[{ key: '', value: '' }]}
                        test.Headers = headersState
                    }

                    if (bodyNode) {
                        const bodyState = bodyNode.data.custom.getState() // {bodyText: "", bodyRef: "", useBodyRef: ""}
                        if (bodyState.useBodyRef) {
                            const ref = `$ref/dictionary/${bodyState.bodyRef}`
                            test.Body = ref
                        }
                        else test.Body = bodyState.bodyText
                    }

                    if (retainNode) {
                        const retainState = retainNode.data.custom.getState() // {[{ key: '', value: '' }]}
                        test.Retain = retainState
                    }

                    if (queryNode) {
                        const queryState = queryNode.data.custom.getState() // {[{ key: '', value: '' }]}
                        test.Query = queryState
                    }
                }


                // get verification nodes from test
                const connectedVerificationNodes = getConnectedNodesByHandle(testNode, "rightHandle")
                if (connectedVerificationNodes.length === 0) {
                    alert('Invalid settings - Status Verification is required for every test')
                    error = true
                    return false
                }

                if (connectedVerificationNodes.length > 1) {
                    alert('Invalid settings - Only one Verification node can be connected directly to a Test node')
                    error = true
                    return false
                }

                const connectedVerificationNode = connectedVerificationNodes[0]
                if (!verificationNodeTypes.includes(connectedVerificationNode.type)) {
                    //should never happen
                    alert('Something went wrong')
                    error = true
                    return false
                }
                const restOfTheVerificationNodes = getNodesInLinearChain(connectedVerificationNode)
                const allVerificationNodes = connectedVerificationNodes.concat(restOfTheVerificationNodes)
                if (!allVerificationNodes.every(node => verificationNodeTypes.includes(node.type))) {
                    //should never happen
                    alert('Something went wrong')
                    error = true
                    return false
                }

                if (!allVerificationNodes.some(node => node.type === NodeType.STATUS)) {
                    alert('Invalid settings - Status Verification is required for every test')
                    error = true
                    return false
                }

                const statusNode = allVerificationNodes.find(node => node.type === NodeType.STATUS);
                const schemaNode = allVerificationNodes.find(node => node.type === NodeType.SCHEMA);
                const matchNode = allVerificationNodes.find(node => node.type === NodeType.MATCH);
                const containsNode = allVerificationNodes.find(node => node.type === NodeType.CONTAINS);
                const countNode = allVerificationNodes.find(node => node.type === NodeType.COUNT);
                const customNode = allVerificationNodes.find(node => node.type === NodeType.CUSTOM);

                if (statusNode) {
                    const statusState = statusNode.data.custom.getState() // { status: "" }
                    test.Verifications[0].Code = statusState.status
                }

                if (schemaNode) {
                    const schemaState = schemaNode.data.custom.getState() // { schema: "" }
                    test.Verifications[0].Schema = schemaState.schema
                }

                if (matchNode) {
                    const matchState = matchNode.data.custom.getState() // { key: "", value: ""}
                    test.Verifications[0].Match = matchState
                }

                if (containsNode) {
                    const containsState = containsNode.data.custom.getState() // { key: "", value: ""}
                    test.Verifications[0].Contains = containsState
                }

                if (countNode) {
                    const countState = countNode.data.custom.getState() // { key: "", value: ""}
                    test.Verifications[0].Count = countState
                }

                if (customNode) {
                    const customState = customNode.data.custom.getState() // { dllName: "" }
                    test.Verifications[0].Custom = customState.dllName
                }


                workflow.Tests.push(test)

            });

            workflows.push(workflow)
        });

        const hasDuplicates = (array) => array.length !== new Set(array).size;

        if (hasDuplicates(allWfNames)) {
            alert('Invalid settings - All Workflow names must be unique')
            error = true
            return false
        }

        if (hasDuplicates(allTestNames)) {
            alert('Invalid settings - All Test names must be unique')
            error = true
            return false
        }

        if (error) {
            return false
        }
        return workflows
    }

    const postProcessState = (workflows) => {
        // order workflows based on _wfIndex
        const orderedWorkflows = workflows.sort((a, b) => a._wfIndex - b._wfIndex);

        // process each workflow
        for (let wfIndex = 0; wfIndex < orderedWorkflows.length; wfIndex++) {

            const workflow = orderedWorkflows[wfIndex];
            delete workflow._wfIndex

            // process Stress Test

            if (workflow.Stress) {
                workflow.Stress.Count = workflow.Stress.count
                workflow.Stress.Delay = workflow.Stress.delay
                workflow.Stress.Threads = workflow.Stress.threads
                delete workflow.Stress.count
                delete workflow.Stress.delay
                delete workflow.Stress.threads
            }



            // process each test for this workflow

            const orderedTests = workflow.Tests.sort((a, b) => a._testIndex - b._testIndex);
            workflow.Tests = orderedTests

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
                    // No processing required?
                }



                // process Verifications
                for (let ver = 0; ver < test.Verifications.length; ver++) { // this loop should only be executed once, i think
                    const verification = test.Verifications[ver];

                    // process Status
                    // No processing required?

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
                    if (verification.Contains) {
                        const transformedContains = verification.Contains.contains;
                        verification.Contains = transformedContains
                    }

                    // process Custom
                    if (verification.Custom) {
                        const transformedCustom = [`${verification.Custom}`];
                        verification.Custom = transformedCustom
                    }
                }
            }
        }

        return orderedWorkflows
    }

    const finalizeDataSetup = (workflows) => {
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


        if (dictFile) {
            data.append('dictionary.txt', dictFile);
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
                data.append(file.name, file)
            }
        }



        data.append('runimmediately', runImmediately);
        data.append('interval', runInterval);
        data.append('rungenerated', runGenerated);

        return data
    }

    const finalizeConfiguration = async (data) => {

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
                setFinishSetupAlert(true)
            }
        })
    }

    const finishSetup = async () => {

        if (!apiFile) {
            alert('Invalid settings - No API specification uploaded')
            return false
        }

        if (runInterval.includes('Never') && runImmediately.includes('false')) {
            alert('Invalid Timer settings - Please select either "Run Immediately" or one of the timed "Run Intervals"')
            return false
        }

        const workflows = scanEditorState()

        if (!workflows) {
            console.log('Something still wrong with workflows, cannot finish setup');
            return false
        }

        const processedWorkflows = postProcessState(workflows)

        if (!processedWorkflows) {
            console.log('Something still wrong with workflows, cannot finish setup');
            return false
        }

        const data = finalizeDataSetup(processedWorkflows)

        const isNewConfiguration = location?.state == null ? true : false // depending on if new or old, create or edit in backend
        if (isNewConfiguration) { //create
            finalizeConfiguration(data)
        }
        else { //edit
            editTestConfiguration(data)
        }

        //setUnfinishedConfig(false) //not used at the moment

    }

    //#endregion


    //#region Alerts

    // control timer of showNodesAlert (for fade and auto close)
    useEffect(() => {
        let timer;
        if (showNodesAlert) {
            setFadeClass('fade-in');

            timer = setTimeout(() => {
                setFadeClass('fade-out');
                setTimeout(() => {
                    setShowNodesAlert(false);
                }, 800)

            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [showNodesAlert]);


    // control timer of tslUploadedAlert (for fade and auto close)
    useEffect(() => {
        let timer;

        if (tslUploadedAlert && tslUploadedWarnings.length === 0) {
            setFadeClass('fade-in');

            // only set timeout to auto close alert if setup is successfull
            timer = setTimeout(() => {
                setFadeClass('fade-out');
                setTimeout(() => {
                    setTslUploadedAlert(false);
                }, 800)

            }, 3000);
        }

        if (tslUploadedAlert && tslUploadedWarnings.length > 0) {
            setFadeClass('fade-in');
        }

        return () => clearTimeout(timer);
    }, [tslUploadedAlert]);

    //control timer of finishSetupAlert (for fade and auto close)
    useEffect(() => {
        let timer;

        if (finishSetupAlert && finishSetupWarnings.length === 0) {
            setFadeClass('fade-in');

            // only set timeout to auto close alert if setup is successfull
            timer = setTimeout(() => {
                setFadeClass('fade-out');
                setTimeout(() => {
                    setTslUploadedAlert(false);
                }, 800)

            }, 4000);
        }

        if (finishSetupAlert && finishSetupWarnings.length > 0) {
            setFadeClass('fade-in');
        }

        return () => clearTimeout(timer);

    }, [finishSetupAlert]);

    //#endregion


    /* const logMetric = ({ name, value }) => {
        console.log(`${name}: ${value}`);
    }; */


    /* const memoryCheck = () => {
        console.log("Memory check...");
        const memoryInfo = performance.memory;
        console.log(`JS Heap Size Limit: ${memoryInfo.jsHeapSizeLimit}`);
        console.log(`Total JS Heap Size: ${memoryInfo.totalJSHeapSize}`);
        console.log(`Used JS Heap Size: ${memoryInfo.usedJSHeapSize}`);

        console.log("Web vitals...");
        // Hooking up Web Vitals metrics with log function
        onCLS(logMetric);    // Logs Cumulative Layout Shift (CLS)
        onFCP(logMetric);    // Logs First Contentful Paint (FCP)
        onLCP(logMetric);    // Logs Largest Contentful Paint (LCP)
        onINP(logMetric);    // Logs Interaction to Next Paint (INP)
        onTTFB(logMetric);   // Logs Time to First Byte (TTFB)

    } */

    const editTestConfiguration = async (data) => {
        const token = await authService.getAccessToken();

        fetch(`MonitorTest/ChangeApi?` + new URLSearchParams({
            apiId: apiId,
            newTitle: testConfName
        }), {
            method: 'PUT',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
            body: data
        }).then(resp => {
            if (resp.ok) {
                console.log("Test configuration edited sucessfully");
            }
            else {
                console.log("An error occurred while editing the test configuration");
            }
        })
    }

    // aux, for debugging, tied to button, function contents are not important
    const logFunction = async () => {
        console.log("-------------------");
        /* const token = await authService.getAccessToken();
        fetch(`SetupTest/RemoveUnfinishedSetup`, {
            method: 'POST',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
        }) */
        console.log("-------------------");
    }

    const cleanupUnfinishedConfigCallback = async () => {
        const token = await authService.getAccessToken();
        fetch(`SetupTest/RemoveUnfinishedSetup`, {
            method: 'POST',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
        })

        setApiFile(null); // this callback will be called when api file is removed by user
    }

    return (
        <div className='editor-container'>

            <Sidebar className='sidebar'
                onRunGeneratedChange={onRunGeneratedChange}
                onRunImmediatelyChange={onRunImmediatelyChange}
                onRunIntervalChange={onRunIntervalChange}
                onToggleCollapse={onToggleCollapse}
                apiTitle={testConfName}
                apiUploaded={apiUploaded}
                apiFile={apiFile}
                dictFile={dictFile}
                uploadedDic={dictUploaded}
                uploadedDll={dllUploaded}
                dllFiles={dllFileArr}
                handlerAPI={handlerAPI}
                onTestConfNameChange={onTestConfNameChange}
                onDictionaryDrop={onDictionaryDrop}
                onDllDrop={onDllDrop}
                onTslDrop={onTslDrop}
                isNewConfiguration={location?.state == null ? true : false}
                cleanupUnfinishedConfigCallback={cleanupUnfinishedConfigCallback}
                buttonsArray={[
                    { section: "Flow", title: "Workflow", onClick: onClickWorkflowNode, class: "wf", tooltip: Tooltips.workflowTooltip, iconClass: "flow-icon" },
                    { section: "Flow", title: "Test", onClick: onClickTestNode, class: "test", iconClass: "flow-icon", tooltip: Tooltips.testTooltip },
                    { section: "Flow", title: "Stress Test", onClick: onClickStressTestNode, class: "stress", iconClass: "flow-icon", tooltip: Tooltips.stressTestTooltip },
                    { section: "Request components", title: "Body", onClick: onClickBodyNode, class: "http", iconClass: "test-icon", tooltip: Tooltips.bodyTooltip },
                    { section: "Request components", title: "Headers", onClick: onClickHeadersNode, class: "http", iconClass: "test-icon", tooltip: Tooltips.headersTooltip },
                    { section: "Request components", title: "Query", onClick: onClickQueryNode, class: "http", iconClass: "test-icon", tooltip: Tooltips.queryTooltip },
                    { section: "Request components", title: "Retain", onClick: onClickRetainNode, class: "http", iconClass: "test-icon", tooltip: Tooltips.retainTooltip },
                    { section: "Verifications", title: "Status Code ", onClick: onClickStatus, class: "verif", iconClass: "verifs-icon", tooltip: Tooltips.statusCodeTooltip },
                    { section: "Verifications", title: "Schema", onClick: onClickSchema, class: "verif", iconClass: "verifs-icon", tooltip: Tooltips.schemaTooltip },
                    { section: "Verifications", title: "Contains ", onClick: onClickContains, class: "verif", iconClass: "verifs-icon", tooltip: Tooltips.containsTooltip },
                    { section: "Verifications", title: "Count ", onClick: onClickCount, class: "verif", iconClass: "verifs-icon", tooltip: Tooltips.countTooltip },
                    { section: "Verifications", title: "Match ", onClick: onClickMatch, class: "verif", iconClass: "verifs-icon", tooltip: Tooltips.matchTooltip },
                    { section: "Verifications", title: "Custom ", onClick: onClickCustom, class: "verif", iconClass: "verifs-icon", tooltip: Tooltips.customTooltip },
                    { section: "Setup", title: "Clear editor", onClick: clearEditor, class: "setup", iconClass: "gear-icon", tooltip: Tooltips.clearEditorTooltip },
                    { section: "Setup", title: location?.state == null ? "Finish Setup" : "Save changes", onClick: finishSetup, class: "setup", iconClass: "gear-icon", tooltip: Tooltips.finishSetupTooltip },
/*                     { section: "Dev", title: "Memory Check", onClick: memoryCheck, class: "setup", iconClass: "gear-icon" },
                  { section: "Dev", title: "log", onClick: logFunction, class: "setup", iconClass: "gear-icon" }*/   
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
                    <Controls>

                        <ControlButton onClick={collapseNodes} title='collapse all nodes'>
                            <div className='collapseButton' ></div>
                        </ControlButton>
                        <ControlButton onClick={openNodes} title='expand all nodes'>
                            <div className='expandButton' ></div>
                        </ControlButton>
                        <ControlButton id='layout-button' onClick={() => { onLayout('TB'); onLayout('TB'); }} title='auto layout nodes'>
                            <div className='layoutButton' ></div>
                        </ControlButton>
                        <ControlButton onClick={() => { setSettingsVisible(true) }} title='open settings window'>
                            <div className='settingsButton' ></div>
                        </ControlButton>
                        {/* <ControlButton title='© 2022 - RapiTest - ISEL'>
                            <div className='copyrightButton' ></div>
                        </ControlButton> */}
                    </Controls>

                </ReactFlow>
            </div>

            <SimpleModalComp className='settings'
                title={"Settings (WIP - not fully implemented)"}
                body={<Settings></Settings>}
                cancelButtonFunc={() => { setSettingsVisible(false) }}
                visible={settingsVisible}
            />

            <div className='alerts'>
                <div className='showNodesNoSpec'>
                    {showNodesAlert && (
                        <Alert className={`nodeAlert ${fadeClass}`} variant="warning" onClose={() => setShowNodesAlert(false)} dismissible>
                            <b>You must first upload the API Specification in order to add nodes.</b>
                        </Alert>
                    )}
                </div>

                <div className='tslUploadSuccess'>
                    {tslUploadedAlert && tslUploadedWarnings.length === 0 && (
                        <Alert className={`nodeAlert ${fadeClass}`} variant="success" onClose={() => setTslUploadedAlert(false)} dismissible>
                            <b>TSL uploaded successfully!</b>
                        </Alert>
                    )}
                </div>

                <div className='tslUploadWarnings'>
                    {tslUploadedAlert && tslUploadedWarnings.length !== 0 && (
                        <Alert className='nodeAlert' variant="warning" onClose={() => setTslUploadedAlert(false)} dismissible>
                            <b>TSL uploaded successfully, but some potential issues were found:</b>
                            <ul>
                                {tslUploadedWarnings.map((warning, index) => (
                                    <li key={index} style={{ textAlign: 'left' }} >{warning}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}
                </div>



                <div className='setupFinishSuccess'>
                    {finishSetupAlert && finishSetupWarnings.length === 0 && (
                        <Alert className={`nodeAlert ${fadeClass}`} variant="success" onClose={() => setFinishSetupAlert(false)} dismissible>
                            <b>Setup completed successfully! You can check the test configuration details on the Monitor Tests page.</b>
                        </Alert>
                    )}
                </div>

                <div className='setupFinishError'>
                    {finishSetupAlert && finishSetupWarnings.length !== 0 && (
                        <Alert className='nodeAlert' variant="warning" onClose={() => setFinishSetupAlert(false)} dismissible>
                            <b>Could not complete setup. Please address the issues below:</b>
                            <ul>
                                {tslUploadedWarnings.map((warning, index) => (
                                    <li key={index} style={{ textAlign: 'left' }} >{warning}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}
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
