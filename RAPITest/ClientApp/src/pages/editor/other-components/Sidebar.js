import React from "react"
import { SmallApiUpload } from "./SmallApiUpload"
import NodeArea from "./ButtonArea"
import TimerSettings from "./TimerSettings"
import ApiUploadArea from "./ApiUploadArea"
import ButtonArea from "./ButtonArea"

import { useState } from "react"

import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import '../nodes/css/workflowNode.css'
import '../nodes/css/generalNode.css'

import './css/sidebar.css'; // Create this CSS file for styling

import menu from '../../../assets/burger-menu-svgrepo-com.svg'

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
    //TODO: maybe eventualmentepor accordions nas sectoes p serem colapsibles

    return (
        <div className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : ''} `}>

            <button className="toggle-button" onClick={toggleSidebar}>
            {/* {isCollapsed? "+" : "-"} */}
            <img src={menu} alt="Menu Icon"  width="35" height="35" />
            </button>
            {/* TODO: uploaded hardocded false */}
            <div className={className}>
                <ApiUploadArea
                    uploaded={false}
                    apiTitle={apiTitle}
                    handlerAPI={handlerAPI}
                    onTestConfNameChange={onTestConfNameChange}>
                </ApiUploadArea>

                <TimerSettings
                    onRunGeneratedChange={onRunGeneratedChange}
                    onRunImmediatelyChange={onRunImmediatelyChange}
                    onRunIntervalChange={onRunIntervalChange}>
                </TimerSettings>

                <ButtonArea buttonsArray={buttonsArray}></ButtonArea>

            </div>
        </div>
    )
}

export default Sidebar