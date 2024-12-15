import { useEffect, useState } from 'react';
import React from 'react';
import { Combobox } from 'react-widgets';
import { Form } from 'react-bootstrap';

import './css/testIDNode.css'
import GeneralNode from './generalNode';
import { LOG_LEVELS as level, rapiLog } from '../utils';


function TestIDNode({ data, isConnectable, xPos, yPos }) {

    const [testIndex, setTestIndex] = useState(data.custom._testIndex || 1)
    const [testName, setTestName] = useState(data.custom.testName || "");
    const [server, setServer] = useState(data.custom.server || "");
    const [path, setPath] = useState(data.custom.path || "");
    const [method, setMethod] = useState(data.custom.method || "");

    rapiLog(level.DEBUG, "[Test node] Test ID: ", testIndex)
    rapiLog(level.DEBUG, "[Test node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Test node] Y pos: ", yPos)

    rapiLog(level.DEBUG, "[Test node] Test name: ", testName)
    rapiLog(level.DEBUG, "[Test node] Server: ", server)
    rapiLog(level.DEBUG, "[Test node] Path: ", path)
    rapiLog(level.DEBUG, "[Test node] Method: ", method)


    const onTestNameChange = (evt) => {
        const _testName = evt.target.value
        rapiLog(level.INFO, "[Test node] Test name: ", _testName)
        setTestName(_testName)
    };

    const onChangeServer = (event) => {
        const _server = event
        rapiLog(level.INFO, "[Test node] Selected server: ", _server)
        setServer(_server)
    };

    const onChangePath = (event) => {
        const _path = event
        rapiLog(level.INFO, "[Test node] Selected path: ", _path)
        setPath(_path)
    };

    const onChangeMethod = (event) => {
        const _method = event
        rapiLog(level.INFO, "[Test node] Selected method: ", _method)
        setMethod(_method)
    };


    /* eslint-disable */
    useEffect(() => {
        // If text index from props change, reflect onto own state
        if (data.custom._testIndex !== testIndex) {
            setTestIndex(data.custom._testIndex);
        }
    }, [data.custom._testIndex]); //we dont want testIndex here because it will lead to infinite rerender-> THIS IS WHY ESLINT IS DISABLED
    /* eslint-enable */


    const renderTestTitle = () => {
        let str = (!Boolean(testName) ? "Test" : testName)
        return str
    }


    const getState = () => {
        const state = {
            name: testName,
            server: server,
            path: path,
            method: method,
            _testIndex: testIndex
        }
        return state
    }

    data.custom.getState = getState

    const onChange = (change) => {
        const value = Math.max(1, change.target.value)
        setTestIndex(value)
    }

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'test-node',
        accItemClass: 'test-item',
        accHeaderClass: 'test-header',
        accBodyClass: 'nodrag',
        accIconClass: 'test-icon',
        header: renderTestTitle(),
        doubleHandle: true
    };

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label htmlFor='testName'>Test name:</label>
                <Form.Control id='testName' value={testName} onChange={onTestNameChange} className="test-name" type="text" placeholder="Enter text" />

                <label htmlFor="servers">Test settings:</label>
                <Combobox id='servers' className='nowheel'
                    data={data.custom.servers}
                    filter={false}
                    onChange={onChangeServer}
                    defaultValue={data.custom.server || "Servers:"}
                />

                <Combobox id='paths' className='nowheel'
                    data={data.custom.paths}
                    filter={false}
                    onChange={onChangePath}
                    defaultValue={data.custom.path || "Paths:"}
                />

                <Combobox id='methods' className='nowheel'
                    data={data.custom.httpMethods}
                    filter={false}
                    onChange={onChangeMethod}
                    defaultValue={data.custom.method || "Methods:"}
                />


                <p></p>

                <div>
                    <span style={{ fontWeight: 'bold' }}>Test order: </span>
                    <Form.Control
                        type="number"
                        value={testIndex || 1}
                        onChange={onChange}
                        style={{ width: '54px', display: 'inline-block' }}
                        min={1}
                    />
                </div>

            </GeneralNode>
        </div>
    );
}


export default TestIDNode;
