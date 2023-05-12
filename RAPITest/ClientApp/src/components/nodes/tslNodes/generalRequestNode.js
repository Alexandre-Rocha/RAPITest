import { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

const handleStyle = { left: 10 };


function GeneralRequestNode({ data, isConnectable }) {

    const [testName, setTestName] = useState(data?.myData || "");

    const setStateTestName = (newTestName) => {
        console.log('setStateTestName is being called with', newTestName);
        setTestName(newTestName)
    }

    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
        //setStateTestName(evt.target.value)
    }, []);


    return (
        <div className="text-updater-node">
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <label htmlFor="readonly">Custom HTTP Request node</label>
            </div>
            <div>
                <label htmlFor="text">Server URL:</label>
                <input id="text" name="text" onChange={onChange} className="nodrag" />
            </div>
            <div>
                <label htmlFor="readonly">HTTP Method:</label>
                <select>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
            </div>
            <div>
                <label htmlFor="text">Request Body:</label>
                <textarea id="text" name="text" onChange={onChange} className="nodrag" />
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="a"
                style={handleStyle}
                isConnectable={isConnectable}
            />
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
        </div>
    );
}


export default GeneralRequestNode;
