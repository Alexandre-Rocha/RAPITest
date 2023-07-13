import React from "react"
import { SmallApiUpload } from "./SmallApiUpload"
import NodeArea from "./NodeArea"
import TimerSettings from "./TimerSettings"


function Sidebar(props) {

    const {onRunGeneratedChange, onRunImmediatelyChange, onRunIntervalChange} = props

    const {apiTitle, handlerAPI} = props

    return (
        <div>
            <label><b>Timer settings:</b></label>
            <SmallApiUpload
            apiTitle={apiTitle}
            handlerAPI={handlerAPI}>
            </SmallApiUpload>
            
            <TimerSettings 
            onRunGeneratedChange={onRunGeneratedChange}
            onRunImmediatelyChange={onRunImmediatelyChange}
            onRunIntervalChange={onRunIntervalChange}>
            </TimerSettings>

            <NodeArea></NodeArea>
            
        </div>
    )
}

export default Sidebar