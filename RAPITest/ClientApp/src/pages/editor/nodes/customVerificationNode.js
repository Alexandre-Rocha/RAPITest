import React from 'react';
import { useState } from 'react';

import { Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/customVerificationNode.css'
import GeneralNode from './generalNode';

function CustomVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [dllName, setDllName] = useState(data.custom.dllName || null)

    rapiLog(level.DEBUG, "[Custom node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Custom node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Custom node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Custom node] Y pos: ", yPos)


    const onSelectedDllChange = (evt) => {
        const newSelectedDll = evt.target.value
        setDllName(newSelectedDll)
    };


    const getDllNames = () => {
        if (data.custom.dllNames) {
            return data.custom.dllNames
        }
        else return []
    }


    const getState = () => {
        const state = {
            dllName: dllName
        }
        return state
    }

    data.custom.getState = getState

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'custom-node',
        accItemClass: 'custom-item',
        accHeaderClass: 'custom-header',
        accBodyClass: 'nodrag',
        accIconClass: 'customVerif-icon',
        header: 'Custom'
    };


    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <Form.Select aria-label="Default select example" onChange={onSelectedDllChange} value={dllName ? dllName : ""}>
                    <option value=""></option>
                    {getDllNames().map((item, index) => {
                        return (
                            <option key={index} value={item}>{item}</option>
                        )
                    })}
                </Form.Select>

            </GeneralNode>
        </div>
    );
}


export default CustomVerificationNode;
