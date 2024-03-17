import { useState } from 'react';
import React from 'react';

import SimpleModalComp from '../../../components/SimpleModalComp';

import { useSettings } from './SettingsContext';

import {AwesomeButton} from 'react-awesome-button';

import './css/ToggleAwesomeButton.css'

function ToggleAwesomeButton(props) {

    
    const [toggle, setToggle] = useState(true)

    const {onPress} = props

    const {textOn, textOff} = props

    const toggleOnOff = () => {
        setToggle(!toggle)
        onPress()
    };
    
    const renderTextOn = () => {
        if (textOn != undefined && textOn != null) {
            return textOn
        }
        else return "On"
    }

    const renderTextOff = () => {
        if (textOff != undefined && textOff != null) {
            return textOff
        }
        else return "Off"
    }

    return (
        <div className='inlineToggleButton'>
                {toggle ? 
                <AwesomeButton type="primary" onPress={toggleOnOff}>
                    {renderTextOn()}
                </AwesomeButton>

                :

                <AwesomeButton type="secondary" onPress={toggleOnOff} >
                    {renderTextOff()}
                </AwesomeButton>}
        </div>
    );
}


export default ToggleAwesomeButton;
