import React from "react"
import { SmallApiUpload } from "./SmallApiUpload"
import NodeArea from "./ButtonArea"
import TimerSettings from "./TimerSettings"
import ApiUploadArea from "./ApiUploadArea"
import ButtonArea from "./ButtonArea"

import { Form, Accordion, Tooltip, OverlayTrigger } from 'react-bootstrap';

//import Dropzone from "react-dropzone"

import Dropzone from "../../../components/Dropzone"

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


    const { onDictionaryDrop, onDllDrop, onTslDrop } = props


    const onDropTsl = (accept, reject) => {


        if (reject.length !== 0 || accept.length > 1) {
            alert("WIP- one yaml file only!")
            return
        }

        const tslFile = accept[0]
        console.log("tsl uploaded");

        //TODO: more verifs? idk
        onTslDrop(tslFile)

    }


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

                <SimpleAccordion header={"Upload TSL file"} accHeaderClass={"sidebar-simple-header"}>

                    Recreate state from an existing TSL file (WIP)

                    <Dropzone className="sidebar-dropzone"
                        accept=".yaml"
                        onDrop={onDropTsl}
                        text={
                            <div align="center">
                                <p>Upload TSL (.yaml)</p>
                            </div>}
                    />

                </SimpleAccordion>

                <p></p>

                <SimpleAccordion header={"Auxiliary Files"} accHeaderClass={"sidebar-simple-header"}>

                    <AuxFilesArea onDictionaryDrop={onDictionaryDrop} onDllDrop={onDllDrop}></AuxFilesArea>

                </SimpleAccordion>


                <p></p>

                <SimpleAccordion header={"Timer Settings"} accHeaderClass={"sidebar-simple-header"}>

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