import { useState } from 'react';
import React from 'react';
import { Form} from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/workflowNode.css'
import GeneralNode from './generalNode';


function WorkflowNode({ data, isConnectable, xPos, yPos }) {

    const [wfIndex, setWfIndex] = useState(data.custom._wfIndex)
    const [wfName, setWfName] = useState(data.custom.wfName || "")


    rapiLog(level.DEBUG, "[Workflow node] Workflow ID: ", wfIndex)
    rapiLog(level.DEBUG, "[Workflow node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Workflow node] Y pos: ", yPos)


    const onWfNameChange = (evt) => {
        rapiLog(level.INFO, "[Workflow node] Workflow name: ", evt.target.value)

        setWfName(evt.target.value)
    };

    const onChange = (change) => {
        const value = Math.max(1, change.target.value)
        setWfIndex(value)
    }


    const renderWfTitle = () => {
        let str = (!Boolean(wfName) ? "Workflow" : wfName)
        return str
    }

    const getState = () => {
        return {
            name: wfName,
            _wfIndex: wfIndex
        }
    }

    data.custom.getState = getState


    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'workflow-node',
        accItemClass: 'workflow-item',
        accHeaderClass: 'workflow-header',
        accBodyClass: 'nodrag',
        accIconClass: 'workflow-icon',
        header: renderWfTitle(),
        doubleHandle: true,
        topHandle: false
    };

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label htmlFor='workflowName'>Workflow name</label>
                <Form.Control id='workflowName' value={wfName} onChange={onWfNameChange} className="workflow-name" type="text" placeholder="Enter text" />
                
                <p></p>

                <div>
                    <span style={{ fontWeight: 'bold' }}>Workflow order: </span>
                    <Form.Control
                    type="number"
                    value={wfIndex || 1}
                    onChange={onChange}
                    style={{ width: '54px',display:'inline-block' }} 
                />
                </div>


            </GeneralNode>
        </div>
    );
}


export default WorkflowNode;
