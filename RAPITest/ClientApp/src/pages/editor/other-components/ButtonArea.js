import React from 'react';


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
    <div>
      {sections.map((section, index) => (
        <div key={index}>
          <h3>{section}</h3>
          {data
            .filter((buttonData) => buttonData.section === section)
            .map((buttonData, buttonIndex) => (
              <button key={buttonIndex} onClick={buttonData.onClick} className="node-button">
                {buttonData.title}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
  };

export default ButtonArea;