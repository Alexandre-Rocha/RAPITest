import React from "react"
import TimerSettings from "./TimerSettings"
import ApiUploadArea from "./ApiUploadArea"
import ButtonArea from "./ButtonArea"

import { useState } from "react"

import AuxFilesArea from "./AuxFilesArea"

import '../nodes/css/workflowNode.css'
import '../nodes/css/generalNode.css'

import './css/sidebar.css'; 

import menu from '../../../assets/burger-menu-svgrepo-com.svg'
import SimpleAccordion from "./SimpleAccordion"
import TslUploadArea from "./TslUploadArea"

function Sidebar(props) {


    const [isCollapsed, setIsCollapsed] = useState(false);

    const { onRunGeneratedChange, onRunImmediatelyChange, onRunIntervalChange } = props

    const { apiTitle, handlerAPI } = props

    const {onToggleCollapse} = props

    const { onTestConfNameChange } = props

    const { buttonsArray } = props

    const { className } = props

    const { apiFile } = props

    const {dllFiles} = props

    const { dictFile } = props

    const  {uploadedDic} = props

    const { uploadedDll } = props

    const [apiUploaded, setApiUploaded] = useState(props.apiUploaded);

    const { onDictionaryDrop, onDllDrop, onTslDrop } = props

    const toggleSidebar = (dontCollapseClass) => {
        let dntClClass = ""
        if (typeof dontCollapseClass === "string") {
            dntClClass = dontCollapseClass
        }
        onToggleCollapse(!isCollapsed, dntClClass)
        setIsCollapsed((prevState) => !prevState);
    };

    const onDropTsl = (accept, reject) => {

        if (reject.length !== 0 || accept.length > 1) {
            alert("Invalid - Please upload a single .yaml file")
            return
        }

        const tslFile = accept[0]
        
        onTslDrop(tslFile)

    }

    function setApiUploadedCallback(toggle){
        setApiUploaded(toggle)
    }


    return (
        <div className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : ''} `}>

            <button className="toggle-button" onClick={toggleSidebar}>
                {<img src={menu} alt="Menu Icon" width="35" height="35" />}
            </button>

            {isCollapsed ?

                <div className="sidebar-icon-area">
                    <button className="name-icon sidebar-icon" onClick={()=>{toggleSidebar('name-icon')}}/>
                    <button className="api-icon sidebar-icon" onClick={()=>{toggleSidebar('api-icon')}}/>
                    <button className="tsl-icon sidebar-icon" onClick={()=>{toggleSidebar('tsl-icon')}}/>
                    <button className="file-icon sidebar-icon" onClick={()=>{toggleSidebar('file-icon')}}/>
                    <button className="timer-icon sidebar-icon" onClick={()=>{toggleSidebar('timer-icon')}}/>
                    <button className="flow-icon sidebar-icon" onClick={()=>{toggleSidebar('Flow')}}/>
                    <button className="test-icon sidebar-icon" onClick={()=>{toggleSidebar('Request')}}/>
                    <button className="verifs-icon sidebar-icon" onClick={()=>{toggleSidebar('Verifications')}}/>
                    <button className="setup-icon sidebar-icon" onClick={()=>{toggleSidebar('Setup')}}/>
                </div>

                :

                <div className={className}>

                    <p></p>

                    <div className="sidebarTextDivider">Configuration</div>

                    <p></p>
                    
                    <ApiUploadArea
                        uploaded={apiUploaded}
                        apiTitle={apiTitle}
                        apiFile={apiFile}
                        handlerAPI={handlerAPI}
                        setApiUploadedCallback={setApiUploadedCallback}
                        onTestConfNameChange={onTestConfNameChange}>
                    </ApiUploadArea>

                    <p></p>

                    <TslUploadArea
                        uploaded={false}
                        apiUploaded={apiUploaded}
                        onDropTsl={onDropTsl}>
                    </TslUploadArea> 

                    <p></p>
                    

                    <SimpleAccordion header={"Auxiliary Files"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"file-icon"}>

                        <AuxFilesArea uploadedDic={uploadedDic} uploadedDll={uploadedDll} dictFile={dictFile} dllFiles={dllFiles} apiUploaded={apiUploaded} onDictionaryDrop={onDictionaryDrop} onDllDrop={onDllDrop}></AuxFilesArea>

                    </SimpleAccordion>

                    <p></p>

                    <SimpleAccordion header={"Timer Settings"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"timer-icon"}>

                        <TimerSettings
                            onRunGeneratedChange={onRunGeneratedChange}
                            onRunImmediatelyChange={onRunImmediatelyChange}
                            onRunIntervalChange={onRunIntervalChange}>
                        </TimerSettings>
                    </SimpleAccordion>

                    <p></p>

                    <div className="sidebarTextDivider">Editor</div> 

                    <ButtonArea buttonsArray={buttonsArray}></ButtonArea>

                    <p></p>

                </div>
            }

        </div>
    )
}


export default Sidebar