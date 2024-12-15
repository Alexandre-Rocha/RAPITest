import { useState } from 'react';
import React from 'react';
import { Combobox } from 'react-widgets';


import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/statusVerificationNode.css'
import GeneralNode from './generalNode';

function StatusVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [statusCode, setStatusCode] = useState(data.custom.initialStatusCode);

    const commonStatusCodes = ['200', '201', '400', '401' , '404', '500'];

    rapiLog(level.DEBUG, "[Status node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Status node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Status node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Status node] Y pos: ", yPos)


    const onStatusCodeChange = (evt) => {
        rapiLog(level.INFO, "[Status node] Status code: ", evt)
        setStatusCode(evt)
    };

    const getState = () => {
        const state = {
            status: statusCode
        }
        return state
    }

    data.custom.getState = getState

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'status-node',
        accItemClass: 'status-item',
        accHeaderClass: 'status-header',
        accBodyClass: 'nodrag',
        accIconClass: 'statusVerif-icon',
        header: 'Status Code'
    };


    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label htmlFor="status">Status Code</label>

                <Combobox id='paths' className='nowheel'
                    data={commonStatusCodes}
                    filter={false}
                    onChange={onStatusCodeChange}
                    defaultValue={data.custom.initialStatusCode || ""}
                />

            </GeneralNode>
        </div>
    );
}


export default StatusVerificationNode;
