import React, { useState } from "react"


function TimerSettings(props) {


    const {onRunGeneratedChange, onRunImmediatelyChange, onRunIntervalChange} = props 

    const [selectedRunGen, setRunGen] = useState("true")
    const [selectedRunImm, setRunImm] = useState("true")
    const [selectedRunInt, setRunInt] = useState("Never")

    const runGenChange = (evt)=>{
        setRunGen(evt.target.value)
        onRunGeneratedChange(evt)
    }

    const runImmChange = (evt)=>{
        setRunImm(evt.target.value)
        onRunImmediatelyChange(evt)
    }

    const runIntChange = (evt)=>{
        setRunInt(evt.target.value)
        onRunIntervalChange(evt)
    }
    
    return (
        <div>
{/*             <label><b>Timer settings:</b></label>
 */}
            <div>
                <div>
                    <label>Run Generated?</label>
                    <div>
                        <input className='node-radio' type="radio" id="runGeneratedYes" name="runGenerated" value="true" onChange={runGenChange} checked={selectedRunGen === "true"} />
                        <label htmlFor="runGeneratedYes">Yes</label>

                        <input className='node-radio' type="radio" id="runGeneratedNo" name="runGenerated" value="false" onChange={runGenChange} checked={selectedRunGen === "false"} />
                        <label htmlFor="runGeneratedNo">No</label>
                    </div>
                </div>
                <div>
                    <label>Run Immediately?</label>
                    <div>
                        <input className='node-radio' type="radio" id="runImmediatelyYes" name="runImmediately" value="true" onChange={runImmChange} checked={selectedRunImm === "true"}/>
                        <label htmlFor="runImmediatelyYes">Yes</label>

                        <input className='node-radio' type="radio" id="runImmediatelyNo" name="runImmediately" value="false" onChange={runImmChange} checked={selectedRunImm === "false"}/>
                        <label htmlFor="runImmediatelyNo">No</label>
                    </div>
                </div>
                <div>
                    <label>Select Run Interval:</label>
                    <div>
                        <input className='node-radio' type="radio" id="runInterval1" name="runInterval" value="1 hour" onChange={runIntChange} checked={selectedRunInt === "1 hour"}/>
                        <label htmlFor="runInterval1">1 hour</label>

                        <input className='node-radio' type="radio" id="runInterval2" name="runInterval" value="12 hours" onChange={runIntChange} checked={selectedRunInt === "12 hours"}/>
                        <label htmlFor="runInterval2">12 hours</label>

                        <input className='node-radio' type="radio" id="runInterval3" name="runInterval" value="24 hours" onChange={runIntChange}checked={selectedRunInt === "24 hours"} />
                        <label htmlFor="runInterval3">24 hours</label>

                        <input className='node-radio' type="radio" id="runInterval4" name="runInterval" value="1 week" onChange={runIntChange}
                        checked={selectedRunInt === "1 week"} />
                        <label htmlFor="runInterval4">1 week</label>

                        <input className='node-radio' type="radio" id="runInterval5" name="runInterval" value="Never" onChange={runIntChange}
                        checked={selectedRunInt === "Never"} />
                        <label htmlFor="runInterval5">Never</label>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default TimerSettings