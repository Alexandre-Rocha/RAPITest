import React from "react"


function TimerSettings() {


    return (
        <div>
            <label><b>Timer settings:</b></label>

            <div>
                <div>
                    <label>Run Generated?</label>
                    <div>
                        <input className='node-radio' type="radio" id="runGeneratedYes" name="runGenerated" value="yes" onChange={onRunGeneratedChange} />
                        <label htmlFor="runGeneratedYes">Yes</label>
                        <input className='node-radio' type="radio" id="runGeneratedNo" name="runGenerated" value="no" onChange={onRunGeneratedChange} />
                        <label htmlFor="runGeneratedNo">No</label>
                    </div>
                </div>
                <div>
                    <label>Run Immediately?</label>
                    <div>
                        <input className='node-radio' type="radio" id="runImmediatelyYes" name="runImmediately" value="yes" onChange={onRunImmediatelyChange} />
                        <label htmlFor="runImmediatelyYes">Yes</label>
                        <input className='node-radio' type="radio" id="runImmediatelyNo" name="runImmediately" value="no" onChange={onRunImmediatelyChange} />
                        <label htmlFor="runImmediatelyNo">No</label>
                    </div>
                </div>
                <div>
                    <label>Select Run Interval:</label>
                    <div>
                        <input className='node-radio' type="radio" id="runInterval1" name="runInterval" value="1 hour" onChange={onRunIntervalChange} />
                        <label htmlFor="runInterval1">1 hour</label>
                        <input className='node-radio' type="radio" id="runInterval2" name="runInterval" value="12 hours" onChange={onRunIntervalChange} />
                        <label htmlFor="runInterval2">12 hours</label>
                        <input className='node-radio' type="radio" id="runInterval3" name="runInterval" value="24 hours" onChange={onRunIntervalChange} />
                        <label htmlFor="runInterval3">24 hours</label>
                        <input className='node-radio' type="radio" id="runInterval4" name="runInterval" value="1 week" onChange={onRunIntervalChange} />
                        <label htmlFor="runInterval4">1 week</label>
                        <input className='node-radio' type="radio" id="runInterval5" name="runInterval" value="Never" onChange={onRunIntervalChange} />
                        <label htmlFor="runInterval5">Never</label>
                    </div>
                </div>
            </div>
        </div>
    )
}