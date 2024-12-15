import React from 'react';
import { AwesomeButton } from 'react-awesome-button';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import SimpleAccordion from './SimpleAccordion';

import "./css/buttons.css"

/* data should be an array in the form: 
[
    {section:"Section A", title: "Node A", onClick: onNodeAClickCallback, class: "node-class", icon-class: "node-icon-class", tooltip: "Node A tooltip"},
    {...},
    ...
]
*/
const ButtonArea = (props) => {

    const { buttonsArray } = props
    const data = buttonsArray
    const sections = [...new Set(data.map((buttonData) => buttonData.section))];

    return (
        <div className='button-area'>
            {sections.map((section, index) => (
                <div className='single-button-area' key={index} >
                    <p></p>
                    <SimpleAccordion header={section}accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={`acc-icon ${section}`}>
                    {data
                        .filter((buttonData) => buttonData.section === section)
                        .map((buttonData, buttonIndex) => (

                            <OverlayTrigger delay={{ show: 500, hide: 100 }} key={buttonIndex} placement="right" overlay={<Tooltip className="sidebar-tooltip" id="tooltip" >
                                {buttonData.tooltip ? buttonData.tooltip : "no tooltip available"}
                            </Tooltip>}>

                                <div >
                                    <AwesomeButton key={buttonIndex} onPress={buttonData.onClick} className={`node-button ${buttonData.class}`}
                                    >
                                        {buttonData.title}
                                    </AwesomeButton>
                                </div>


                            </OverlayTrigger>
                        ))}
                    </SimpleAccordion>
                    
                </div>
            ))}
        </div>
    );
};

export default ButtonArea;

