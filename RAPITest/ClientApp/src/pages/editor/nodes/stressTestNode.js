import { useState } from 'react';
import React from 'react';
import { Form, Tooltip, OverlayTrigger } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/stressTestNode.css'
import GeneralNode from './generalNode';


function StressTestNode({ data, isConnectable, xPos, yPos }) {


    const [count, setCount] = useState(data.custom.count ?? "")
    const [threads, setThreads] = useState(data.custom.threads ?? "")
    const [delay, setDelay] = useState(data.custom.delay ?? "")


    rapiLog(level.DEBUG, "[Stress test node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Stress test node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Stress test node] Y pos: ", yPos)


    const onCountChange = (evt) => {
        rapiLog(level.INFO, "[Stress test node] Count: ", evt.target.value)
        setCount(evt.target.value)
        //data.custom.countChangeCallback(evt.target.value, data.custom._wfIndex)
    };

    const onThreadsChange = (evt) => {
        rapiLog(level.INFO, "[Stress test node] Threads: ", evt.target.value)
        setThreads(evt.target.value)
        //data.custom.threadsChangeCallback(evt.target.value, data.custom._wfIndex)
    };

    const onDelayChange = (evt) => {
        rapiLog(level.INFO, "[Stress test node] Delay: ", evt.target.value)
        setDelay(evt.target.value)
        //data.custom.delayChangeCallback(evt.target.value, data.custom._wfIndex)
    };

    const countTooltip = (
        <Tooltip className="custom-tooltip" id="count-tooltip">
            The number of times this workflow will be distributed across the different threads.
        </Tooltip>
    );

    const threadsTooltip = (
        <Tooltip className="custom-tooltip" id="threads-tooltip">
            The number of threads that will concurrentely execute this workflow.
        </Tooltip>
    );

    const delayTooltip = (
        <Tooltip className="custom-tooltip" id="delay-tooltip">
            The delay in milliseconds between each execution of this workflow.
        </Tooltip>
    );

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'stress-node',
        accItemClass: 'stress-item',
        accHeaderClass: 'stress-header',
        accBodyClass: 'nodrag',
        accIconClass: 'stress-icon',
        header: 'Stress Test',
        bottomHandle: false
    };

    const getState = () => {
        const state = {
            count: count,
            threads: threads,
            delay: delay
        }
        return state
    }

    data.custom.getState = getState

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label htmlFor="count">Count <OverlayTrigger placement="right" overlay={countTooltip}>
                        <span>  🛈</span>
                    </OverlayTrigger></label>
                <Form.Control id='count' value={count} onChange={onCountChange} className="test-name" type="text" placeholder="Enter text" />

                <label htmlFor="threads">Threads <OverlayTrigger placement="right" overlay={threadsTooltip}>
                        <span>  🛈</span>
                    </OverlayTrigger></label>
                <Form.Control id='threads' value={threads} onChange={onThreadsChange} className="test-name" type="text" placeholder="Enter text" />

                <label htmlFor="delay">Delay<OverlayTrigger placement="right" overlay={delayTooltip}>
                        <span>  🛈</span>
                    </OverlayTrigger></label>
                <Form.Control id='delay' value={delay} onChange={onDelayChange} className="test-name" type="text" placeholder="Enter text" />

            </GeneralNode>
        </div>
    );
}


export default StressTestNode;
