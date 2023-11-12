import React from "react"
import { SmallApiUpload } from "./SmallApiUpload"
import NodeArea from "./ButtonArea"
import TimerSettings from "./TimerSettings"
import ApiUploadArea from "./ApiUploadArea"
import ButtonArea from "./ButtonArea"

import { Form, Accordion, Tooltip, OverlayTrigger } from 'react-bootstrap';

import Dropzone from "react-dropzone"

import { useState } from "react"

import AuxFilesArea from "./AuxFilesArea"


import '../nodes/css/workflowNode.css'
import '../nodes/css/generalNode.css'

import './css/sidebar.css'; // Create this CSS file for styling

import menu from '../../../assets/burger-menu-svgrepo-com.svg'
import SimpleAccordion from "./SimpleAccordion"

function Sidebar(props) {


    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed((prevState) => !prevState);
    };

    const { onRunGeneratedChange, onRunImmediatelyChange, onRunIntervalChange } = props

    const { apiTitle, handlerAPI } = props

    const { onTestConfNameChange } = props

    const { buttonsArray } = props

    const { className } = props


    const { onDictionaryDrop, onDllDrop } = props




    return (
        <div className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : ''} `}>

            <button className="toggle-button" onClick={toggleSidebar}>
                {/* {isCollapsed? "+" : "-"} */}
                <img src={menu} alt="Menu Icon" width="35" height="35" />
            </button>
            {/* TODO: uploaded hardocded false */}
            <div className={className}>



                    <ApiUploadArea
                        uploaded={false}
                        apiTitle={apiTitle}
                        handlerAPI={handlerAPI}
                        onTestConfNameChange={onTestConfNameChange}>
                    </ApiUploadArea>

                <p></p>

                <SimpleAccordion header={"Auxiliary Files"} accHeaderClass={"sidebar-simple-header"}>

                    <AuxFilesArea onDictionaryDrop={onDictionaryDrop} onDllDrop={onDllDrop}></AuxFilesArea>

                </SimpleAccordion>


                <p></p>

                <SimpleAccordion header={"Timer Settings"}accHeaderClass={"sidebar-simple-header"}>

                    <TimerSettings
                        onRunGeneratedChange={onRunGeneratedChange}
                        onRunImmediatelyChange={onRunImmediatelyChange}
                        onRunIntervalChange={onRunIntervalChange}>
                    </TimerSettings>
                </SimpleAccordion>




                <ButtonArea buttonsArray={buttonsArray}></ButtonArea>

            </div>
        </div>
    )
}

//TODO: check class names in all acordions from everywhere!

export default Sidebar