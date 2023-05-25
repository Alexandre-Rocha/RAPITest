import {  useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';
import { UploadApiSpecification } from '../../../pages/steps/UploadApiSpecification';


const handleStyle = { left: 10 };



const handlerAPI = function (paths, servers, schemas, schemasValues, setUploadedAPI, setParentStateCallback) {

  console.log("hadnlerapi")
  let obj = { paths, servers, schemas, schemasValues }
  console.log(obj);
  setUploadedAPI(true)

  setParentStateCallback(obj)

  //sendTest()

  /*this.setState({
      paths: paths,
      servers: servers,
      schemas: schemas,
      schemasValues: schemasValues,
      step:3
  })*/
}

/*
const handlerTest = function(tsl, dictionary, dll, setUploadedTest, sendTest, setDic, setTestSpec, setDll ) {
  
  console.log("handlertest")
  let obj = { tsl, dictionary, dll }
  console.log(obj);
  setUploadedTest(true)

  setDic(dictionary)
  setTestSpec(tsl)
  setDll(dll)

  console.log("tsl1");
  console.log(tsl);

  //sendTest()

}*/



function ApiFileNode({ data, isConnectable }) {

  const [uploaded, setUploaded] = useState(false); 

  //const [dictionary, setDictionary] = useState(null);
  //const [testSpecification, setTestSpecification] = useState(null);
  //const [dllFiles, setDllFiles] = useState(null);


  //data.custom.mycallback(evt.target.value)
/*
  const [apiName, setApiName] = useState(""); 
  
  const setStateFunctionTSL = (newValue) => {
    console.log('setStateFunction is being called with', newValue);
    setTestSpecification(newValue)
    console.log(testSpecification);
    
  }

  const [timeSpecification, setTimeSpecification] = useState({
    runimmediately: 'true',
    interval: 'Never',
    rungenerated: 'false'
  });
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');


  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
    setApiName(evt.target.value)
  }, []);*/


  /*async function sendTestSetup() {

    console.log("tsl2");
  console.log(testSpecification);
    let data = new FormData();
    if (dictionary !== null) {
      data.append('dictionary.txt', dictionary);
    }
    let i = 1
    console.log("sendtestsetup");
    if (testSpecification !== null) {
      console.log("tsl if");
      for (const file of testSpecification) {
        console.log("tsl if for");
        data.append("tsl_" + i + ".yaml", file)
        i++
      }
    }
    if (dllFiles !== null) {
      for (const file of dllFiles) {
        data.append(file.name, file)
      }
    }
    data.append('runimmediately', timeSpecification.runimmediately);
    data.append('interval', timeSpecification.interval);
    data.append('rungenerated', timeSpecification.rungenerated);
  
    const token = await authService.getAccessToken();
    console.log("lalala")
    console.log(data)
    for (const [key, value] of data.entries()) {
      console.log(`${key}: ${value}`);
    }
  
  }*/

  let defApiName = "defaultApiName";
  if(data.custom.newApiName != null) defApiName = data.custom.newApiName

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="text">API File upload</label>

      </div>
      {uploaded === false ?
        <UploadApiSpecification handlerAPI={(paths, servers, schemas, schemasValues) => handlerAPI(paths, servers, schemas, schemasValues, setUploaded, data.custom.mycallback)} apiTitle={defApiName} ></UploadApiSpecification> : <div>api uploaded</div>}
    
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}




export default ApiFileNode;
