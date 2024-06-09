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



function Flow() {

    rapiLog(level.INFO, "Flow component rendered")

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

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [dontCollapseClass, setDontCollapseClass] = useState("")

    const [dict, setDict] = useState({})

    const [settingsVisible, setSettingsVisible] = useState(false)

    const [dictFile, setDictFile] = useState()
    const [dllFileArr, setDllFileArr] = useState([])


    const NODE_LEFT_HANDLE = "leftHandle"
    const NODE_RIGHT_HANDLE = "rightHandle"

    // #endregion

    // this is so i have more freedom applying custom css effects while making sure they dont affect the app elsewhere (as in outside the editor page)
    // adds custom class to body and removes it when component unmounts
    useEffect(() => {
        document.body.classList.add('editor-page');

        return () => {
            document.body.classList.remove('editor-page');
        };
    }, []);


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

        const nodeData = {
            testName: test.TestID,
            initialServer: test.Server,
            initialPath: test.Path,
            initialMethod: test.Method,
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
            useBodyRef: useBodyRef
            // TODO: missing the boolean flag?
        }
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
            let parts = queryString.split(":");
            return {
                key: parts[0],
                value: parts[1]
            };
        });

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

        const nodeData = {
            initialSchema: processedSchema,
            schemas: apiFile.schemas
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

        const processedMatch = matchString.split("#");
        const key = processedMatch[0]
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

        const nodeData = {
            dllName: dllName
        }
        const customVerifNodeId = createNode(NodeType.CUSTOM, nodeData)

        return customVerifNodeId
    }


    const createNodes = (newstate) => {

        let currYamlTestIndex = 0;

        let listOfEdgesLists = []

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
                        id: currLeafId.toString() +  headersNodeId.toString(),
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
                collapseNodes(); // Call collapseNodes after 1 second
                setCanCollapse(false)
            }, 100); //this is not optimal...
        }
    }, [canCollapse]);

    // #endregion


    // #region onClick in Editor


    const checkIfApiFile = () => {
        if (apiFile) {
            return true
        } else {
            alert('WIP - you cant add nodes before uploading api file')
            return false
        }
    }

    const onClickWorkflowNode = () => {

        if(!checkIfApiFile()) return

        console.log("[Editor] Adding Workflow node");
        maxWfIndex.current += 1

        const nodeData = {
            wfName: "",
            _wfIndex: maxWfIndex.current    //TODO: think this is worthless now
        }
        createNode(NodeType.WORKFLOW, nodeData)
    }

    const onClickTestNode = () => {

        if(!checkIfApiFile()) return

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
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Status Verification node");
        createNode(NodeType.STATUS)
    }

    const onClickWip = () => {
        if(!checkIfApiFile()) return
        console.log("Work in progress");
        alert('wip')
    }

    const onClickCount = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Count Verification node");
        createNode(NodeType.COUNT)
    }

    const onClickContains = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Contains Verification node");
        createNode(NodeType.CONTAINS)
    }

    const onClickMatch = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Match Verification node");
        createNode(NodeType.MATCH)
    }

    const onClickCustom = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Custom Verification node");
        createNode(NodeType.CUSTOM)
    }


    const onClickSchema = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Schema Verification node");
        const nodeData = {
            schemas: apiFile.schemas
        }
        createNode(NodeType.SCHEMA, nodeData)
    }

    const onClickBodyNode = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Body node");
        createNode(NodeType.BODY)
    }

    const onClickHeadersNode = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Headers node");
        createNode(NodeType.HEADERS)
    }

    const onClickQueryNode = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Query node");
        createNode(NodeType.QUERY)
    }

    const onClickRetainNode = () => {
        if(!checkIfApiFile()) return
        console.log("[Editor] Adding Retain node");
        createNode(NodeType.RETAIN)
    }

    const onClickStressTestNode = () => {
        if(!checkIfApiFile()) return
        console.log('[Editor] Adding Stress test node');
        createNode(NodeType.STRESS)
    }

    // #endregion


    // #region others/misc

    const onClickChangeWf = () => {


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

        createNodes(newstate)

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

    const collapseSidebarAccordions = () => {
        console.log("collapse sidebar accordions");
        const elements = document.querySelectorAll('.sidebar-simple-header .accordion-button');

        console.log("step 3");
        console.log(dontCollapseClass)

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
        console.log(" step 2 dontCollapseClass");
        console.log(dontCollapseClass);
        setDontCollapseClass(dontCollapseClass)
    }

    // whenever the sidebar is collapsed, the accordions inside should collapse too
    // the dependency is triggered 
    // TODO: isto é necessário? nao posso simplesmente passar collapseSidebarAccordions como callback à sidebar?
    useEffect(() => {
        collapseSidebarAccordions()
    }, [sidebarCollapsed])

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
            console.log('[Editor] External state has been found; creating nodes...');
            createNodes(workflows)
            //onLayout('TB') TODO: not working
            //onLayout('TB') // need to call twice for some reason
        } else {
            console.log('[Editor] No state has been found; no nodes will be created');
        }
    }, []); // Empty dependency array ensures the effect runs only once -> THIS IS WHY ESLINT IS DISABLED (dependencies dont matter)
    /* eslint-enable */


    const dumpState = () => {
        console.log("Logging the state...")
        //console.log("API file: ", apiFile);

        //console.log("Run Generated:", runGenerated);
        //console.log("Run Immediatly:", runImmediately);
        //console.log("Run Interval:", runInterval);

        console.log("----------------------------");
        console.log("Workflows: ");
        console.log(workflows);

        //console.log("----------------------------");
        //console.log("Nodes: ");
        //console.log(nodes);

        //console.log("----------------------------");
        //console.log("Edges: ");
        //console.log(edges);

        //console.log("----------------------------");
        //console.log("Dictionary file:");
        //console.log(dict);
    }

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

            //setWorkflows(newstate)

            createNodes(newstate)
        };

        reader.readAsText(tslFile);

    }


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
                return false 
            }
            if (connectedStressNodes.length === 1) {
                const stressState = connectedStressNodes[0].data.custom.getState() // {count: "", threads:"", delay:""}
                workflow.Stress = stressState
            }

            const connectedTestNodes = getConnectedNodes(wfNode, NodeType.TEST)
            if (connectedTestNodes.length < 1) {
                alert('workflows must have at least 1 test')
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
                    return false 
                }

                if (connectedVerificationNodes.length > 1) {
                    alert('only one verification node can be connected directly to a test node')
                    return false 
                }

                const connectedVerificationNode = connectedVerificationNodes[0]
                if (!verificationNodeTypes.includes(connectedVerificationNode.type)) {
                    alert('something wrong w connection')
                    return false 
                }
                const restOfTheVerificationNodes = getNodesInLinearChain(connectedVerificationNode)
                const allVerificationNodes = connectedVerificationNodes.concat(restOfTheVerificationNodes)
                if (!allVerificationNodes.every(node => verificationNodeTypes.includes(node.type))) {
                    alert('something wrong w connection')
                    return false 
                }

                if (connectedVerificationNodes.length === 0) {
                    alert('you need at least the status verification on every test')
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

        return workflows
    }

    const postProcessState = (workflows) => {
        const newWorkflows = workflows

        // process each workflow
        for (let wfIndex = 0; wfIndex < newWorkflows.length; wfIndex++) {

            const workflow = newWorkflows[wfIndex];
            delete workflow._wfIndex

            // process Stress Test
            // No processing required?

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
                    // No processing required?

                    // process Custom
                    if (verification.Custom) {
                        const transformedCustom = `[${verification.Custom}]`;
                        verification.Custom = transformedCustom
                    }
                }
            }
        }

        return newWorkflows
    }

    const finalizeConfiguration = async (workflows) => {

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

    const finishSetup = async () => {
        const workflows = scanEditorState()
        const processedWorkflows = postProcessState(workflows)
        finalizeConfiguration(processedWorkflows)
    }


    return (
        <div className='editor-container'>

            <Sidebar className='sidebar'
                onRunGeneratedChange={onRunGeneratedChange}
                onRunImmediatelyChange={onRunImmediatelyChange}
                onRunIntervalChange={onRunIntervalChange}
                onToggleCollapse={onToggleCollapse}
                apiTitle={testConfName}
                handlerAPI={handlerAPI}
                onTestConfNameChange={onTestConfNameChange}
                onDictionaryDrop={onDictionaryDrop}
                onDllDrop={onDllDrop}
                onTslDrop={onTslDrop}
                buttonsArray={[
                    { section: "Flow-related", title: "Workflow", onClick: onClickWorkflowNode, class: "wf", tooltip: "Workflow tooltip", iconClass: "flow-icon" },
                    { section: "Flow-related", title: "Test", onClick: onClickTestNode, class: "test", iconClass: "flow-icon" },
                    { section: "Flow-related", title: "Stress Test", onClick: onClickStressTestNode, class: "stress", iconClass: "flow-icon" },
                    { section: "Request components", title: "Body", onClick: onClickBodyNode, class: "http", iconClass: "test-icon" },
                    { section: "Request components", title: "Headers", onClick: onClickHeadersNode, class: "http", iconClass: "test-icon" },
                    { section: "Request components", title: "Query", onClick: onClickQueryNode, class: "http", iconClass: "test-icon" },
                    { section: "Request components", title: "Retain", onClick: onClickRetainNode, class: "http", iconClass: "test-icon" },
                    { section: "Verifications", title: "Status Code ", onClick: onClickStatus, class: "verif", iconClass: "verifs-icon" },
                    { section: "Verifications", title: "Schema", onClick: onClickSchema, class: "verif", iconClass: "verifs-icon" },
                    { section: "Verifications", title: "Contains ", onClick: onClickContains, class: "verif", iconClass: "verifs-icon" },
                    { section: "Verifications", title: "Count ", onClick: onClickCount, class: "verif", iconClass: "verifs-icon" },
                    { section: "Verifications", title: "Match ", onClick: onClickMatch, class: "verif", iconClass: "verifs-icon" },
                    { section: "Verifications", title: "Custom ", onClick: onClickCustom, class: "verif", iconClass: "verifs-icon" },
                    { section: "Setup-related", title: "Save changes", onClick: onClickWip, class: "setup", iconClass: "gear-icon" },
                    { section: "Setup-related", title: "Finish Setup", onClick: finishSetup, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Change entire Workflow", onClick: onClickChangeWf, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Dump state", onClick: dumpState, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Collapse nodes", onClick: collapseNodes, class: "setup", iconClass: "gear-icon" },
                    { section: "Dev", title: "Open nodes", onClick: openNodes, class: "setup", iconClass: "gear-icon" },
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
                        <ControlButton onClick={() => { onLayout('TB'); onLayout('TB') }} title='auto layout nodes'>
                            <div className='layoutButton' ></div>
                        </ControlButton>
                        <ControlButton onClick={() => { setSettingsVisible(true) }} title='open settings window'>
                            <div className='settingsButton' ></div>
                        </ControlButton>
                        <ControlButton title='© 2022 - RapiTest - ISEL'>
                            <div className='copyrightButton' ></div>
                        </ControlButton>
                    </Controls>

                </ReactFlow>
            </div>

            <div>
                
                <SimpleModalComp
                title={"Settings"}
                body={<Settings></Settings>}
                cancelButtonFunc={() => {setSettingsVisible(false)}}
                visible={settingsVisible}
            />
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
