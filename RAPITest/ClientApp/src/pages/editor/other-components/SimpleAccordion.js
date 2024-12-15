import React from "react"
import { Accordion } from "react-bootstrap"

import "./css/sidebar.css"

function SimpleAccordion({ header, headerRef, children, eventKey = '0', defaultActiveKey = '0', accItemClass, accHeaderClass, accBodyClass, accIconClass }) {

    return (
        <div>
            <Accordion defaultActiveKey={defaultActiveKey}>
                <Accordion.Item className={`acc-item ${accItemClass}`} eventKey={eventKey}>
                    <Accordion.Header ref={headerRef} className={`acc-header ${accHeaderClass}`}>
                        {accIconClass ? 
                            <div className={`acc-icon ${accIconClass}`} />
                        : 
                            <div></div>
                        }
                        <div className="acc-header-text">
                            {header}
                        </div>
                    </Accordion.Header>
                    <Accordion.Body className={accBodyClass}>

                        {children}

                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    )
}

export default SimpleAccordion