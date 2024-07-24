import { useState } from 'react';
import React from 'react';


import { useSettings } from './SettingsContext';

import ToggleAwesomeButton from './ToggleAwesomeButton';

import { Row, Col, Form } from 'react-bootstrap';


import './css/Settings.css'

function Settings() {

    const { settings, updateSetting } = useSettings();

    const toggleTheme = () => {
        updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light');
    };

    const toggleShowTips = () => {
        updateSetting('showTips', settings.showTips === true ? false : true);
    };

    const toggleShowTooltips = () => {
        updateSetting('showTooltips', settings.theme === true ? false : true);
    };

    return (
        <div className='settings'>
            {/* <h4></h4> */}
            <Row >
                <Form.Label className='settingsLabel' >Theme (not implemented)</Form.Label>
                <ToggleAwesomeButton textOn="Light" textOff="Dark" onPress={toggleTheme} ></ToggleAwesomeButton>
            </Row>

            <p></p>

            <Row >
                <Form.Label className='settingsLabel' >Show Tips (partially implemented)</Form.Label>
                <ToggleAwesomeButton onPress={toggleShowTips} ></ToggleAwesomeButton>
            </Row>

            <p></p>

            <Row >
                <Form.Label className='settingsLabel' >Show Tooltips (partially implemented)</Form.Label>
                <ToggleAwesomeButton onPress={toggleShowTooltips} ></ToggleAwesomeButton>
                
            </Row>


        </div>
    );
}


export default Settings;
