import { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';
import { UploadApiSpecification } from '../../pages/steps/UploadApiSpecification';

import authService from '../../pages/api-authorization/AuthorizeService';
import { UploadMyOwnTSL } from '../../pages/steps/UploadMyOwnTSL';
import { Link } from 'react-router-dom';

const handleStyle = { left: 10 };



const handlerAPI = function (paths, servers, schemas, schemasValues, setUploadedAPI, sendTest) {

  console.log("hadnlerapi")
  let obj = { paths, servers, schemas, schemasValues }
  console.log(obj);
  setUploadedAPI(true)

  //sendTest()

  /*this.setState({
      paths: paths,
      servers: servers,
      schemas: schemas,
      schemasValues: schemasValues,
      step:3
  })*/
}


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

}



function TextUpdaterNode({ data, isConnectable }) {

  const [uploaded, setUploaded] = useState(false); 
  const [uploadedTest, setUploadedTest] = useState(false);

  const [dictionary, setDictionary] = useState(null);
  const [testSpecification, setTestSpecification] = useState(null);
  const [dllFiles, setDllFiles] = useState(null);


  const [apiName, setApiName] = useState(""); 
  
  const setStateFunctionTSL = (newValue) => {
    console.log('setStateFunction is being called with', newValue);
    setTestSpecification(newValue)
    console.log(testSpecification);
    
  }

  const [timeSpecification, setTimeSpecification] = useState({
    runimmediately: 'true',
    interval: 'Never',
    rungenerated: 'true'
  });
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');


  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
    setApiName(evt.target.value)
  }, []);


  async function sendTestSetup() {

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
    fetch(`SetupTest/UploadFile`, {
      method: 'POST',
      headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
      body: data
    }).then(res => {
      if (!res.ok) {
        console.log("res not ok");
      } else {
        console.log("lelele")
        console.log(data)
        console.log("RES");
        console.log(res);
        console.log("res end");
        for (const [key, value] of data.entries()) {
          console.log(`${key}: ${value}`);
        }
        console.log("over");
      }
    })
  
  }

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />

      </div>
      {uploaded == false ?
        <UploadApiSpecification handlerAPI={(paths, servers, schemas, schemasValues) => handlerAPI(paths, servers, schemas, schemasValues, setUploaded,sendTestSetup)} apiTitle={apiName} ></UploadApiSpecification> : <div>api uploaded</div>}
      {uploaded == false ?
       <div>api not uploaded yet</div> : <UploadMyOwnTSL handlerTest={(tsl,dictionary,dll) => {handlerTest(tsl, dictionary, dll, setUploadedTest, sendTestSetup, setDictionary, setStateFunctionTSL, setDllFiles);console.log("tsl render");console.log(tsl)}}  goBackToSelection={()=>console.log("go back")}></UploadMyOwnTSL>}
       {uploadedTest == false ?
       <div>test not uploaded</div> : <div>test uploaded!</div>}
       {uploadedTest == true ?
       <button onClick={sendTestSetup}>click to finish setup</button> : <div>...</div>}
       {uploadedTest == true ?
       <Link to={"/monitorTests"}>go to monitor tests to check your test</Link>: <div>...</div>}
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




export default TextUpdaterNode;
