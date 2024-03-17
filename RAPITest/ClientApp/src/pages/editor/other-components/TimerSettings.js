import React, { useState } from "react"
import { Form } from 'react-bootstrap'

function TimerSettings(props) {

    const { onRunGeneratedChange, onRunImmediatelyChange, onRunIntervalChange } = props

    const [selectedRunGen, setRunGen] = useState("true")
    const [selectedRunImm, setRunImm] = useState("true")
    const [selectedRunInt, setRunInt] = useState("Never")

    const runGenChange = (evt) => {
        setRunGen(evt.target.value)
        onRunGeneratedChange(evt)
    }

    const runImmChange = (evt) => {
        setRunImm(evt.target.value)
        onRunImmediatelyChange(evt)
    }

    const runIntChange = (evt) => {
        setRunInt(evt.target.value)
        onRunIntervalChange(evt)
    }

    return (
        <Form>
            <Form.Group>
                <Form.Label style={{ fontWeight: 'bold' }}>Run Generated?</Form.Label>
                <div>
                    <Form.Check
                        inline
                        type="radio"
                        label="Yes"
                        name="runGenerated"
                        value="true"
                        onChange={runGenChange}
                        checked={selectedRunGen === "true"}
                        id="runGeneratedYes"
                    />
                    <Form.Check
                        inline
                        type="radio"
                        label="No"
                        name="runGenerated"
                        value="false"
                        onChange={runGenChange}
                        checked={selectedRunGen === "false"}
                        id="runGeneratedNo"
                    />
                </div>
            </Form.Group>
            <Form.Group>
                <Form.Label style={{ fontWeight: 'bold' }}>Run Immediately?</Form.Label>
                <div>
                    <Form.Check
                        inline
                        type="radio"
                        label="Yes"
                        name="runImmediately"
                        value="true"
                        onChange={runImmChange}
                        checked={selectedRunImm === "true"}
                        id="runImmediatelyYes"
                    />
                    <Form.Check
                        inline
                        type="radio"
                        label="No"
                        name="runImmediately"
                        value="false"
                        onChange={runImmChange}
                        checked={selectedRunImm === "false"}
                        id="runImmediatelyNo"
                    />
                </div>
            </Form.Group>
            <Form.Group>
                <Form.Label style={{ fontWeight: 'bold' }}>Select Run Interval:</Form.Label>
                <div>
                    {["1 hour", "12 hours", "24 hours", "1 week", "Never"].map((interval, index) => (
                        <Form.Check
                            key={index}
                            inline
                            type="radio"
                            label={interval}
                            name="runInterval"
                            value={interval}
                            onChange={runIntChange}
                            checked={selectedRunInt === interval}
                            id={`runInterval${index}`}
                        />
                    ))}
                </div>
            </Form.Group>
        </Form>
    )
}

export default TimerSettings