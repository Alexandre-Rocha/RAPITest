import { useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/generalNode.css'
import SimpleAccordion from '../other-components/SimpleAccordion';


function GeneralNode({ data, isConnectable, children, nodeClass, header, accItemClass, accHeaderClass, accBodyClass, accIconClass, doubleHandle = false, topHandle=true, bottomHandle=true }) {


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
            {topHandle? <Handle type="target" position={Position.Top} id="topHandle" style={{ backgroundColor:"#464545" }} isConnectable={isConnectable} /> : <></>}

            <SimpleAccordion accItemClass={accItemClass} accHeaderClass={accHeaderClass} accBodyClass={accBodyClass} accIconClass={accIconClass} header={header} headerRef={accordionRef}>

                {children}

            </SimpleAccordion>


            {doubleHandle ? (
                <>
                    <Handle type="source" position={Position.Bottom} id="leftHandle" style={{ left: "25%", right: "auto", transform:"none" }} isConnectable={isConnectable} />
                    <Handle type="source" position={Position.Bottom} id="rightHandle" style={{ left: "auto",right: "25%", transform:"none" }} isConnectable={isConnectable} />
                </>
            ) : bottomHandle ? (
                <Handle type="source" position={Position.Bottom} id="bottomHandle" isConnectable={isConnectable} />
              ) : <></>}
        </div>
    );
}


export default GeneralNode;
