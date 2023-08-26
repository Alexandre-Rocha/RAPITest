import React from 'react';
import {AwesomeButton} from 'react-awesome-button';


/* data should be an array in the form: 
[
    {section:"Section A", title: "Node A", onClick: onNodeAClickCallback},
    {...},
    ...
]
Sections must be: "Flow" OR "HTTP" OR "Verifications" OR "Setup" OR "Others" OR "Dev" - nvm everything works now
*/
const ButtonArea = (props) => {

    const {buttonsArray} = props
    const data = buttonsArray
    const sections = [...new Set(data.map((buttonData) => buttonData.section))];

  return (
    <div className='button-area'>
      {sections.map((section, index) => (
        <div className='single-button-area' key={index}>
          <p></p>
          <b>{section}</b>
          {data
            .filter((buttonData) => buttonData.section === section)
            .map((buttonData, buttonIndex) => (
              
              <AwesomeButton key={buttonIndex} onPress={buttonData.onClick} className={`node-button ${buttonData.class}`}
              >
              {buttonData.title}
            </AwesomeButton>
            ))}
        </div>
      ))}
    </div>
  );
  };

export default ButtonArea;


/* <button key={buttonIndex} onClick={buttonData.onClick} className="node-button">
                {buttonData.title}
              </button> */