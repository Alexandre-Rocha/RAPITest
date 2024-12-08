import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import ReactFlow, { addEdge, Background, Controls, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider, Panel, ControlButton } from 'reactflow';
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

import { onCLS, onFCP, onLCP, onINP, onTTFB } from 'web-vitals';


import Alert from 'react-bootstrap/Alert';

import { Tooltips } from './editor-strings';

import { LOG_LEVELS as level, rapiLog } from './utils';


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

const flowNodeTypes = [NodeType.WORKFLOW, NodeType.TEST, NodeType.STRESS]
const requestNodeTypes = [NodeType.BODY, NodeType.HEADERS, NodeType.QUERY, NodeType.RETAIN]
const verificationNodeTypes = [NodeType.STATUS, NodeType.SCHEMA, NodeType.MATCH, NodeType.CONTAINS, NodeType.COUNT, NodeType.CUSTOM]

const httpMethods = ["Get", "Delete", "Post", "Put"]  //TSL only supports the 4 main HTTP methods, in the future would be nice to support to more and derive them from the api as well

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

    //rapiLog(level.INFO, "Flow component rendered")

    // #region State and Hooks

    const [nodesCreatedFromState, setNodesCreatedFromState] = useState(false) //TODO: organize

    //#region state related to React, ReactFlow and Dagre

    const location = useLocation(); // needed to enable pre-filling stuff when coming from Monitor Tests page
    const reactFlowInstance = useReactFlow()
    const { fitView } = useReactFlow(); // for dagre

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    //#endregion


    //#region state related to API

    const [testConfName, setTestConfName] = useState(location?.state?.APITitle || "") // the test conf name is kind of bound to the api spec due to how server works //TODO: look deeper into this, improve this comment or even move this outside of this region if possible

    const [apiFile, setApiFile] = useState(location?.state?.apiFile || null) // This will have servers, paths, schemas and schemavalues

    const [apiId, setApiId] = useState(location?.state?.ApiId || null) //TODO: add comment

    const [apiUploaded, setApiUploaded] = useState(location?.state?.ApiId ? true : false) // Whether or not api spec has been uploaded //TODO: is it being set properly when throug old config?
    //#endregion


    //#region state related to Timer settings

    //TODO: cant grab from db for already conf tests...think of something
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


    //for dagre (layout algorithm)
    const onLayout = (direction) => {
        console.log("[Editor] onLayout");
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
        //const run = aux === "true" ? "true" : "false"
        console.log("[Editor] Run generated: ", run);
        setRunGenerated(run)
    }, [])

    const onRunImmediatelyChange = useCallback((runImmediately) => {
        const run = runImmediately.target.value
        //const run = aux === "true" ? "true" : "false"
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
            alert('something went wrong')
            return false
        }

    }

    const onConnectWorkflow = (targetNode, connection) => {

        // this method is called if sourceNode is workflow node

        if (targetNode.type === NodeType.WORKFLOW) {
            alert("you cant do that")
            return false
        }

        else if (targetNode.type === NodeType.TEST) {

            if (connection.sourceHandle !== "rightHandle") { //rightHandle is the one for tests, so others arent allowed
                alert("you cant do that")
                return false
            }
        }

        else if (targetNode.type === NodeType.STRESS) {

            if (connection.sourceHandle !== "leftHandle") { //leftHandle is the one for stress tests, so others arent allowed
                alert("you cant do that")
                return false
            }

        }
        else {   //cant connect workflow to any other nodes
            alert("you cant do that")
            return false
        }

        setEdges((eds) => addEdge(connection, eds))
    }

    const onConnectTest = (targetNode, connection) => {

        // this method is called if sourceNode is test node

        if (requestNodeTypes.includes(targetNode.type)) {
            if (connection.sourceHandle !== "leftHandle") { // leftHandle is the one for request components, so others arent allowed
                alert("you cant do that")
                return false
            }
        }

        else if (verificationNodeTypes.includes(targetNode.type)) {
            if (connection.sourceHandle !== "rightHandle") {    // rightHandle is the one for request components, so others arent allowed
                alert("you cant do that")
                return false
            }
        }

        else {  //cant connect test to any other nodes
            alert("you cant do that")
            return false
        }

        setEdges((eds) => addEdge(connection, eds))
    }

    const onConnectRequestComponent = (sourceNode, targetNode, connection) => {

        // this method is called if sourceNode is a request component node

        if (!requestNodeTypes.includes(targetNode.type)) {  //can only connect to other request nodes
            alert("you cant do that")
            return false
        }

        const nodesInSourceChain = getNodesInLinearChainBidirectional(sourceNode)
        const nodesInTargetChain = getNodesInLinearChainBidirectional(targetNode)

        const sourceNodeTypes = nodesInSourceChain.map(node => node.type);
        const targetNodeTypes = nodesInTargetChain.map(node => node.type);

        const hasOverlappingTypes = sourceNodeTypes.some(type => targetNodeTypes.includes(type));

        if (hasOverlappingTypes) {
            alert('already have a node of that type connected')
            return false
        }

        setEdges((eds) => addEdge(connection, eds))
    }

    const onConnectVerification = (sourceNode, targetNode, connection) => {

        // this method is called if sourceNode is a verification node

        if (!verificationNodeTypes.includes(targetNode.type)) { //can only connect to other verification nodes
            alert("you cant do that")
            return false
        }

        const nodesInSourceChain = getNodesInLinearChainBidirectional(sourceNode)
        const nodesInTargetChain = getNodesInLinearChainBidirectional(targetNode)

        const sourceNodeTypes = nodesInSourceChain.map(node => node.type);
        const targetNodeTypes = nodesInTargetChain.map(node => node.type);

        const hasOverlappingTypes = sourceNodeTypes.some(type => targetNodeTypes.includes(type));

        if (hasOverlappingTypes) {
            alert('already have a node of that type connected')
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

        rapiLog(level.DEBUG, "[Editor] Workflow found when recreating state. Assigned ID: ", wf._wfIndex)

        //const wfNodeId = createWorkflowNode(maxWfIndex.current, wf.WorkflowID, currX, currY) //WorkflowID is wf name TODO: whats the diff between yammlwfindex and maxwfindex

        const nodeData = {
            wfName: wf.WorkflowID,
            _wfIndex: maxWfIndex.current        //TODO: not needed anymore?
        }
        const wfNodeId = createNode(NodeType.WORKFLOW, nodeData)

        return wfNodeId
    }

    const processStress = (wf) => {

        //rapiLog(level.DEBUG, "[Editor] Stress found when recreating state for workflow with ID ", yamlWfIndex)

        //const initialCount = wf.Stress.Count
        //const initialThreads = wf.Stress.Threads
        //const initialDelay = wf.Stress.Delay
        //const stressTestId = createStressNode(initialCount, initialThreads, initialDelay, yamlWfIndex, currX, currY)

        const nodeData = {
            count: wf.Stress.Count,
            threads: wf.Stress.Threads,
            delay: wf.Stress.Delay
        }
        const stressTestId = createNode(NodeType.STRESS, nodeData)

        return stressTestId
    }

    const processTest = (test, currYamlTestIndex) => {

        //rapiLog(level.DEBUG, "[Editor] Test found when recreating state for workflow with ID ", yamlWfIndex)

        //const testNodeServer = test.Server
        //const testNodePath = test.Path
        //const testNodeMethod = test.Method

        //const testNodeId = createTestNode(test.TestID, testNodeServer, testNodePath, testNodeMethod, yamlWfIndex, currYamlTestIndex, currX, currY) //TODO: the node has a test property however inside the values are the default ones not the ones in the state
        //TODO: THIS THE ISSUE, names not same as the ones in getState method
        const nodeData = {
            testName: test.TestID,
            server: test.Server,
            path: test.Path,
            method: test.Method,
            paths: apiFile.paths,
            servers: apiFile.servers,
            httpMethods: httpMethods, // TSL only supports the 4 main HTTP methods, in the future would be nice to support to more and derive them from the api as well
            _testIndex: currYamlTestIndex   //TODO: is this needed ?
        }
        const testNodeId = createNode(NodeType.TEST, nodeData)

        return testNodeId
    }

    const processBody = (body) => {

        //const bodyNodeId = createBodyNode(bodyText, bodyRef, yamlWfIndex, currYamlTestIndex, currX, currY)

        let bodyText = null
        let bodyRef = null
        let useBodyRef = null

        if (body.startsWith("$")) {
            useBodyRef = true
            console.log("USE BODY REF");

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
            // TODO: missing the dictObj
        }
        console.log(nodeData);
        const bodyNodeId = createNode(NodeType.BODY, nodeData)

        return bodyNodeId
    }

    const processHeaders = (headers) => {


        //headers is array with here, like this: ["Accept:application/xml"]
        //must process it 

        let processedHeaders = headers.map(headerString => {
            let parts = headerString.split(":");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        //const headersNodeId = createHeadersNode(processedHeaders, yamlWfIndex, currYamlTestIndex, currX, currY)

        const nodeData = {
            headers: processedHeaders
        }
        const headersNodeId = createNode(NodeType.HEADERS, nodeData)

        return headersNodeId
    }

    const processQuery = (query) => {

        //TODO: need to test this, dont have any example tsl file w query i think...


        let processedQuery = query.map(queryString => {
            let parts = queryString.split("=");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

        console.log("QUERY: ", query);
        console.log("PROCESSED QUERY: ", processedQuery);

        //const queryNodeId = createQueryNode(processedQuery, yamlWfIndex, currYamlTestIndex, currX, currY)

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

        //const retainNodeId = createRetainNode(processedRetain, yamlWfIndex, currYamlTestIndex, currX, currY)

        const nodeData = {
            retains: processedRetain
        }
        const retainNodeId = createNode(NodeType.RETAIN, nodeData)

        return retainNodeId
    }

    const processStatusVerif = (status) => {

        //const statusVerifNodeId = createStatusVerificationNode(status, yamlWfIndex, currYamlTestIndex, currX, currY)

        const nodeData = {
            initialStatusCode: status
        }
        const statusVerifNodeId = createNode(NodeType.STATUS, nodeData)

        return statusVerifNodeId
    }

    const processSchemaVerif = (schema) => {

        //const schemaVerifNodeId = createSchemaVerificationNode(schema, yamlWfIndex, currYamlTestIndex, currX, currY)

        const processedSchema = schema.split("$ref/definitions/")[1] //TODO: kinda hardcoded

        //const schemas = apiFile.schemas.concat(Object.keys(dictObj))
        
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

        //TODO: transform contains here or before process is called?
        //const containsVerifNodeId = createContainsVerificationNode(contains, yamlWfIndex, currYamlTestIndex, currX, currY)

        const nodeData = {
            contains: contains
        }
        const containsVerifNodeId = createNode(NodeType.CONTAINS, nodeData)

        return containsVerifNodeId
    }

    const processCountVerif = (matchString) => {

        // TODO: process key and value here or before calling processmethod?

        const processedMatch = matchString.split("#");
        const key = processedMatch[0]
        const value = processedMatch[1]

        //const countVerifNodeId = createCountVerificationNode(key, value, yamlWfIndex, currYamlTestIndex, currX, currY)

        const nodeData = {
            key: key,
            value: value
        }
        const countVerifNodeId = createNode(NodeType.COUNT, nodeData)

        return countVerifNodeId
    }

    const processMatchVerif = (matchString) => {

        //TODO: preocess key and value here or before calling processmetdo?

        //TODO: i am removing the dollar so that in the node it doesnt show, then in the end i manually add dollar to tsl file
        // does this make sense though?


        const processedMatch = matchString.split("#");
        const key = processedMatch[0].replace(/^[$.]+/, '');
        const value = processedMatch[1]

        //const matchVerifNodeId = createMatchVerificationNode(key, value, yamlWfIndex, currYamlTestIndex, currX, currY)

        const nodeData = {
            key: key,
            value: value
        }
        const matchVerifNodeId = createNode(NodeType.MATCH, nodeData)

        return matchVerifNodeId
    }

    const processCustomVerif = (dllName) => {

        //TODO: process dll name here or begore
        //const customVerifNodeId = createCustomVerificationNode(dllName, yamlWfIndex, currYamlTestIndex, currX, currY)
        console.log('bualasfa');
        console.log(dllNamesArr);
        console.log(dllName[0]);
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

        let isTryingToUseDictionary = false
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

                //TODO: at the moment, the whole algorithm for example the status below kinda assumes a correct tsl strucuture, probably does not work and may crash with incorrect TSL

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

        //TODO: remove hardcoded warning
        if (isTryingToUseDll && dllFileArr.length === 0) {
            setTslUploadedWarnings(tslUploadedWarnings.concat("Warning: Some nodes attempt to make use of auxiliary files that are not yet uploaded."))
        }

        setCanCollapse(true)
        //collapseNodesWhenReady

    }

    // when state is recreated and nodes are created and ready to be collapsed
    // the canCollapse flag is set to true
    // when that happens, this function is executed which collapses the nodes after 100 ms
    // the reason this needs to happen in useEffect after state update is because the nodes and edges etc are state updates
    // as well, and React takes a bit to process those. so I cant call collapseNodes directly before the state updates are processed.
    // this solution perhaps could be more elegant but it makes sense and works fine
    // TODO: alternativas?/comment cleanup
    useEffect(() => {
        if (canCollapse) {
            setTimeout(() => {
                collapseNodes();
                setCanCollapse(false)
            }, 200); //100
        }
    }, [canCollapse]);

    // #endregion


    // #region onClick in Editor


    const checkIfApiFile = () => {
        if (apiFile) {
            return true
        } else {
            //alert('WIP - you cant add nodes before uploading api file')
            setShowNodesAlert(true)
            return false
        }
    }

    const onClickWorkflowNode = () => {

        if (!checkIfApiFile()) return

        console.log("[Editor] Adding Workflow node");
        maxWfIndex.current += 1

        const nodeData = {
            wfName: "",
            _wfIndex: maxWfIndex.current    //TODO: think this is worthless now
        }
        createNode(NodeType.WORKFLOW, nodeData)
    }

    const onClickTestNode = () => {

        if (!checkIfApiFile()) return

        console.log("[Editor] Adding Test node");
        const nodeData = {
            paths: apiFile.paths,
            servers: apiFile.servers,
            httpMethods: ["Get", "Delete", "Post", "Put"], //TODO: shouldnt be hardcoded here prob
        }
        createNode(NodeType.TEST, nodeData)
    }

    //TODO: all of these below are wrong???
    const onClickStatus = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Status Verification node");
        createNode(NodeType.STATUS)
    }

    const onClickWip = () => {
        if (!checkIfApiFile()) return
        console.log("Work in progress");
        alert('wip')
    }

    const onClickCount = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Count Verification node");
        createNode(NodeType.COUNT)
    }

    const onClickContains = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Contains Verification node");
        createNode(NodeType.CONTAINS)
    }

    const onClickMatch = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Match Verification node");
        createNode(NodeType.MATCH)
    }

    const onClickCustom = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Custom Verification node");
        console.log('asdasaddafsf');
        console.log(dllNamesArr);
        const nodeData = {
            dllNames: dllNamesArr
        }
        createNode(NodeType.CUSTOM, nodeData)
    }


    const onClickSchema = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Schema Verification node");
        
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
        console.log("[Editor] Adding Body node");
        createNode(NodeType.BODY)
    }

    const onClickHeadersNode = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Headers node");
        createNode(NodeType.HEADERS)
    }

    const onClickQueryNode = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Query node");
        createNode(NodeType.QUERY)
    }

    const onClickRetainNode = () => {
        if (!checkIfApiFile()) return
        console.log("[Editor] Adding Retain node");
        createNode(NodeType.RETAIN)
    }

    const onClickStressTestNode = () => {
        if (!checkIfApiFile()) return
        console.log('[Editor] Adding Stress test node');
        createNode(NodeType.STRESS)
    }

    // #endregion


    //#region other callbacks to other components

    //TODO: maybe I can analyse this to see how the schemasvalues are passed to do same in MonitorTests
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
                        if (node.type === "body") {
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
        //somehow relay info to customVerifNode
        console.log("dll drop receivd, now need to relay");

        console.log("fll");
        console.log(dllArr);

        setDllFileArr(dllArr)

        let namesArr = []

        dllArr.forEach((ddlFile) => { console.log(namesArr.push(ddlFile.name)); })

        setDllNamesArr(namesArr)

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

        setNodes([])
        setEdges([])

        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContents = event.target.result;

            console.log(fileContents);


            // file load will start
            const startTotal = performance.now();


            const newstate = jsYaml.load(fileContents)

            const endFile = performance.now();

            //setWorkflows(newstate)

            const startEditor = performance.now();

            createNodes(newstate)

            //after this nodes are created so operation ends
            const endTotal = performance.now();
            //log time taken to load file and create nodes
            console.log(`[TOTAL] Time taken: ${endTotal - startTotal}ms`);

            console.log(`[EDITOR] Time taken: ${endTotal - startEditor}ms`);

            console.log(`[FILE] Time taken: ${endFile - startTotal}ms`);




            //TODO: hardcoded
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
        const elements = document.querySelectorAll('.sidebar-simple-header .accordion-button'); //TODO: kinda hardcoded

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
                    behavior: 'smooth', // Optional: Defines the transition animation
                    block: 'nearest' // Scrolls so that the targetItem is aligned to the top of the sidebar
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

            //createNodes(workflows)
            createNodes(location?.state?.tslState) // was above line before but like this can remove state var
            //setTimeout(()=>onLayout('TB'),2000) // TODO: not working
            setNodesCreatedFromState(true)
        } else {
            console.log('[Editor] No state has been found; no nodes will be created');
        }
    }, []); // Empty dependency array ensures the effect runs only once -> THIS IS WHY ESLINT IS DISABLED (dependencies dont matter)
    /* eslint-enable */

    useEffect(() => {
        if (nodesCreatedFromState) {
            console.log("created from state use effect");

            setTimeout(() => {
                document.getElementById('layout-button').click()
                //onLayout('TB')
                //onLayout('TB') // TODO: not working
            }, 1200);
            setNodesCreatedFromState(false)
        }
    }, [nodesCreatedFromState])

    // TODO: improve to clean files/etc (full reset)?
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

    //TODO:no save changes (agr ja nao ]e, ver num desses embaixo) remover headers vazios

    const scanEditorState = () => {
        const workflows = []
        let error = false

        const nodes = reactFlowInstance.getNodes()
        const wfNodes = nodes.filter(node => node.type === NodeType.WORKFLOW);

        wfNodes.forEach(wfNode => {

            const wfState = wfNode.data.custom.getState() // {name: "", _wfIndex: ""}

            const workflow = {
                _wfIndex: wfState._wfIndex,
                WorkflowID: wfState.name,
                Tests: []
            }

            const connectedStressNodes = getConnectedNodes(wfNode, NodeType.STRESS)
            if (connectedStressNodes.length > 1) {
                alert('can only have 1 stress test')
                error = true
                return false
            }
            if (connectedStressNodes.length === 1) {
                const stressState = connectedStressNodes[0].data.custom.getState() // {count: "", threads:"", delay:""}
                workflow.Stress = stressState
            }

            const connectedTestNodes = getConnectedNodes(wfNode, NodeType.TEST)
            if (connectedTestNodes.length < 1) {
                alert('workflows must have at least 1 test')
                error = true
                return false
            }
            connectedTestNodes.forEach(testNode => {
                const testState = testNode.data.custom.getState() // {name: "", server:"", path:"", method:"", _testIndex: ""}

                const test = {
                    _testIndex: testState._testIndex,
                    Server: testState.server,
                    TestID: testState.name,
                    Path: testState.path,
                    Method: testState.method,
                    Verifications: [{ Code: -1 }]
                }


                // get request nodes from test
                const connectedRequestNodes = getConnectedNodesByHandle(testNode, "leftHandle")
                if (connectedRequestNodes.length >= 1) {
                    if (connectedRequestNodes.length > 1) {
                        alert('only one request node can be connected directly to a test node')
                        return false
                    }

                    const connectedRequestNode = connectedRequestNodes[0]
                    if (!requestNodeTypes.includes(connectedRequestNode.type)) {
                        alert('something wrong w connection')
                        return false
                    }
                    const restOfTheRequestNodes = getNodesInLinearChain(connectedRequestNode)
                    const allRequestNodes = connectedRequestNodes.concat(restOfTheRequestNodes)
                    if (!allRequestNodes.every(node => requestNodeTypes.includes(node.type))) {
                        alert('something wrong w connection')
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


                // get request nodes from test
                const connectedVerificationNodes = getConnectedNodesByHandle(testNode, "rightHandle")
                if (connectedVerificationNodes.length === 0) {
                    alert('you need at least the status verification on every test')
                    error = true
                    return false
                }

                if (connectedVerificationNodes.length > 1) {
                    alert('only one verification node can be connected directly to a test node')
                    error = true
                    return false
                }

                const connectedVerificationNode = connectedVerificationNodes[0]
                if (!verificationNodeTypes.includes(connectedVerificationNode.type)) {
                    alert('something wrong w connection')
                    error = true
                    return false
                }
                const restOfTheVerificationNodes = getNodesInLinearChain(connectedVerificationNode)
                const allVerificationNodes = connectedVerificationNodes.concat(restOfTheVerificationNodes)
                if (!allVerificationNodes.every(node => verificationNodeTypes.includes(node.type))) {
                    alert('something wrong w connection')
                    error = true
                    return false
                }

                if (connectedVerificationNodes.length === 0) {
                    alert('you need at least the status verification on every test')
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
                        const transformedCustom = [`${verification.Custom}`]; // TODO why is this array again? can it be more than1? if so this wrong.
                        verification.Custom = transformedCustom
                    }
                }
            }
        }

        return orderedWorkflows
    }

    const finalizeDataSetup = (workflows) => {
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
                console.log("appending dll file...");
                data.append(file.name, file)
            }
        }



        data.append('runimmediately', runImmediately);
        data.append('interval', runInterval);
        data.append('rungenerated', runGenerated);

        return data
    }

    const finalizeConfiguration = async (data) => {

        //const data = finalizeDataSetup(workflows) //processedWorkflows

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
                //TODO: remove hardcoded
                setFinishSetupAlert(true)
            }
        })
    }

    const finishSetup = async () => {

        /*
        //check for invalid timer settings
        console.log("whaaaat");
        console.log(runImmediately);
        console.log(runInterval);
        console.log(runInterval.includes('Never'));
        debugger


        const cond1 = !runImmediately // this will be true when run immeditaly is false
        console.log("cond1: ",cond1);
        const cond2 = runInterval.includes('Never') // this will be true when run interval is never
        console.log("cond2: ",cond2);

        const invalidTimerSettings = cond1 && cond2 // this will be true when run immeditaly is false and run interval is never
        console.log("flag: ",invalidTimerSettings);

        debugger*/

        if (runInterval.includes('Never') && runImmediately.includes('false')) {
            console.log("why??");
            alert('Invalid Timer settings - Please select either "Run Immediately" or one of the timed "Run Intervals"')
            return false
        }
        else {
            console.log("valid timer settings");
        }

        const workflows = scanEditorState()
        console.log('finish setup, workflows:');
        console.log(workflows);

        if (!workflows) {
            console.log('Something still wrong with workflows, cannot finish setup');
            return
        }

        const processedWorkflows = postProcessState(workflows)
        console.log('finish setup, processed workflows:');
        console.log(processedWorkflows);

        if (!processedWorkflows) {
            console.log('Something still wrong with workflows, cannot finish setup');
            return
        }

        const data = finalizeDataSetup(processedWorkflows)

        const isNewConfiguration = location?.state == null ? true : false // depending on if new or old, create or edit in backend
        if (isNewConfiguration) { //create
            finalizeConfiguration(data)
        }
        else { //edit
            editTestConfiguration(data)
        }

        //finalizeConfiguration(processedWorkflows)
    }

    //#endregion


    //#region Alerts

    // control timer of showNodesAlert (for fade and auto close)
    useEffect(() => {
        let timer;
        console.log("Checking nodes alert...");
        if (showNodesAlert) {
            setFadeClass('fade-in');

            timer = setTimeout(() => {
                setFadeClass('fade-out');
                setTimeout(() => {
                    setShowNodesAlert(false);
                    console.log("Hiding nodes alert...");
                }, 800)


            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [showNodesAlert]);


    // control timer of tslUploadedAlert (for fade and auto close)
    useEffect(() => {
        let timer;
        console.log("Checking tsl alert...");

        if (tslUploadedAlert && tslUploadedWarnings.length === 0) {
            setFadeClass('fade-in');

            // only set timeout to auto close alert if setup is successfull
            timer = setTimeout(() => {
                setFadeClass('fade-out');
                setTimeout(() => {
                    setTslUploadedAlert(false);
                    console.log("Hiding tsl alert...");
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
        console.log("Checking finish setup alert...");

        if (finishSetupAlert && finishSetupWarnings.length === 0) {
            setFadeClass('fade-in');

            // only set timeout to auto close alert if setup is successfull
            timer = setTimeout(() => {
                setFadeClass('fade-out');
                setTimeout(() => {
                    setTslUploadedAlert(false);
                    console.log("Hiding finish setup alert...");
                }, 800)

            }, 4000);
        }

        if (finishSetupAlert && finishSetupWarnings.length > 0) {
            setFadeClass('fade-in');
        }

        return () => clearTimeout(timer);

    }, [finishSetupAlert]);

    //#endregion


    const logMetric = ({ name, value }) => {
        console.log(`${name}: ${value}`);
    };



    const memoryCheck = () => {
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

    }

    const editTestConfiguration = async (data) => {
        const token = await authService.getAccessToken();

        //const workflows = scanEditorState()
        //const processedWorkflows = postProcessState(workflows)

        //const data = finalizeDataSetup(processedWorkflows)

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

    const logFunction = () => {
        console.log("-------------------");
        console.log("schemas:");
        console.log(apiFile.schemas);

        console.log("schemasValues:");
        console.log(apiFile.schemasValues);


        console.log("-------------------");
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
                    /* { section: "Setup", title: "Save changes", onClick: onClickWip, class: "setup", iconClass: "gear-icon" }, */
                    { section: "Setup", title: "Clear editor", onClick: clearEditor, class: "setup", iconClass: "gear-icon", tooltip: Tooltips.clearEditorTooltip },
                    { section: "Setup", title: location?.state == null ? "Finish Setup" : "Save changes", onClick: finishSetup, class: "setup", iconClass: "gear-icon", tooltip: Tooltips.finishSetupTooltip },
                    { section: "Dev", title: "Memory Check", onClick: memoryCheck, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Test edit", onClick: editTestConfiguration, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "log", onClick: logFunction, class: "setup", iconClass: "gear-icon" }
                    /* { section: "Dev", title: "Change entire Workflow", onClick: onClickChangeWf, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Dump state", onClick: dumpState, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Collapse nodes", onClick: collapseNodes, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Open nodes", onClick: openNodes, class: "setup", iconClass: "gear-icon" }, */
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
                    {tslUploadedAlert && tslUploadedWarnings.length != 0 && (
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
                    {finishSetupAlert && finishSetupWarnings.length != 0 && (
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
