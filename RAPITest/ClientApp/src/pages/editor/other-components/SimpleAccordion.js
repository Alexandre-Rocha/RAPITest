import React from "react"
import { Accordion } from "react-bootstrap"

import "./css/sidebar.css"

function SimpleAccordion({ header, children, eventKey = '0', defaultActiveKey = '0', accItemClass, accHeaderClass, accBodyClass }){

    return (
        <div>
            <Accordion defaultActiveKey={defaultActiveKey}>
                    <Accordion.Item className={`body-area area ${accItemClass}`} eventKey={eventKey}>
                        <Accordion.Header className={`body-header header sidebar-simple-header ${accHeaderClass}`}>{header}</Accordion.Header>
                        <Accordion.Body className={accBodyClass}>

                            {children}

                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
        </div>
    )
}

export default SimpleAccordion