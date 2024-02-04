import { useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/generalNode.css'
import SimpleAccordion from '../other-components/SimpleAccordion';


function GeneralNode({ data, isConnectable, children, nodeClass, header, accItemClass, accHeaderClass, accBodyClass, accIconClass }) {

    
    const accordionRef = useRef(null);

    function collapseAccordion() {
        const childElement = accordionRef.current.querySelector('.accordion-button');
        if (childElement && !childElement.classList.contains('collapsed')) {
            childElement.click();
        }
    }

    function openAccordion() {
        const childElement = accordionRef.current.querySelector('.accordion-button');
        if (childElement && childElement.classList.contains('collapsed')) {
            childElement.click();
        }
    }

    data.custom.collapseAccordion = collapseAccordion
    data.custom.openAccordion = openAccordion


    return (
        <div className={`${nodeClass} node`}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

            <SimpleAccordion accItemClass={accItemClass} accHeaderClass={accHeaderClass} accBodyClass={accBodyClass} accIconClass={accIconClass} header={header} headerRef={accordionRef}>

                {children}

            </SimpleAccordion>


            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
        </div>
    );
}


export default GeneralNode;
