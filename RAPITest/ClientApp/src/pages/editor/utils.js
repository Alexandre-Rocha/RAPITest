
    /*
    this comment is just to visualize state schema

    workflows = [wf1,wf2,...]
    wf = {WorkflowID,Stress,Tests[t1,t2,...]}
    Tests = {
        Server,TestID,Path,Method,Headers[h1,h2...],Body,Verifications[v1,v2...]
    }
    Headers = {
        keyItem,valueItem
    }
    Verifications = {
        Code,Schema //missing some verifications
    }

    workflows[currWorkflow].Tests[currTest].Path
    */


    export const LOG_LEVELS = {
      TRACE: 0,
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4
    };


    export function rapiLog(level, ...message){

    
      switch (level) {
        case LOG_LEVELS.TRACE:
          console.debug("TRACE logging level not currently supported. Using DEBUG instead.")
          console.debug(...message);
          break;
        case LOG_LEVELS.DEBUG:
          console.debug(...message);
          break;
        case LOG_LEVELS.INFO:
          console.info(...message);
          break;
        case LOG_LEVELS.WARN:
          console.warn(...message);
          break;
        case LOG_LEVELS.ERROR:
          console.error(...message);
          break;
        default:
          console.log("Unrecognized logging level. Using default log instead.")
          console.log(...message);
      }

    }

    
    


    const wfff = {
      WorkflowID: "cr_pet",
      Stress: {
        Count: 10,
        Threads: 2,
        Delay: 0
      },
      Tests: [
        {
          TestID: "createPet",
          Server: "https://petstore3.io/api/v3",
          Path: "/pet",
          Method: "Post",
          Headers: [
            { "Content-Type": "application/json" },
            { Accept: "application/json" }
          ],
          Body: "$ref/dictionary/petExample",
          Retain: [
            { "petId#$.id": null }
          ],
          Verifications: [
            {
              Code: 200,
              Schema: "$ref/definitions/Pet"
            }
          ]
        },
        {
          TestID: "readPet",
          Server: "https://petstore3.io/api/v3",
          Path: "/pet/{petId}",
          Method: "Get",
          Headers: [
            { Accept: "application/xml" }
          ],
          Verifications: [
            {
              Code: 200,
              Contains: "id",
              Count: "doggie#1",
              Schema: "$ref/definitions/Pet",
              Match: "/Pet/name#doggie",
              Custom: ["CustomVerificationTry1.dll"]
            }
          ]
        }
      ]
    };
    

/*
{
    runimmediately: 'true',
    interval: 'Never',          // 1 hour; 12 hours; 24 hours; 1 week; Never 
    rungenerated: 'true'
} 
    // all mandatory fields
*/
function isValidTimerSettings(obj) {
    if (!obj) {
        return false;
    }

    if (!obj.hasOwnProperty('runimmediately') ||
        !obj.hasOwnProperty('interval') ||
        !obj.hasOwnProperty('rungenerated')) {
        return false;
    }

    if (typeof obj.runimmediately != 'boolean' ||
        typeof obj.interval != 'string' ||
        typeof obj.rungenerated != 'boolean') {
        return false;
    }

    const validIntervals = ['1 hour', '12 hours', '24 hours', '1 week', 'Never'];
    if (!validIntervals.includes(obj.interval)) {
        return false;
    }

    return true;
}



/*
let stress = { Delay: 1, Count: 1, Threads: 3 };  //all mandatory fields
*/
function isValidStress(obj) {
    if (typeof obj != 'object' || obj == null) return false;
    if (typeof obj.Delay != 'number') return false;
    if (typeof obj.Count != 'number') return false;
    if (typeof obj.Threads != 'number') return false;
    return true;
}



/*
let verifications =  [{
               Code: 200, 
               Schema: '' 
            }]                   //Verifications is mandatory; inside only Code is mandatory
                                  //OU SEJA, aqui basta verificar Code e Schema, sendo que só Code é obrigatorio, no futuro acrecentar as outras
*/
function isValidVerification(verification) {
    if (!verification || !verification.hasOwnProperty('Code')) {
      return false;
    }
    
    if (typeof verification.Code != 'number') {
      return false;
    }
  
    return true;
  }

/*
let header = [{   
                keyItem: '',
                valueItem: ''
            }],                     // headers are OPTIONAL  //não ha headers obrigatorios 
*/
  function isValidHeaders(headers) {
    if (!Array.isArray(headers)) {
      return false;
    }
  
    for (const header of headers) {
      if (!header.hasOwnProperty('keyItem') || !header.hasOwnProperty('valueItem')) {
        return false;
      }
  
      if (typeof header.keyItem != 'string' || typeof header.valueItem != 'string') {
        return false;
      }
    }
  
    return true;
  }


/*
let test = {
            TestID: "test1",
            Server: https://petstore3.swagger.io/api/v3 ,                 //MANDATORY
            Path: /pet/1 ,                                                //MANDATORY
            Method: "Get",   // Get, Post, Put, Delete (case sensitive)   //MANDATORY
            Headers: [{   
                keyItem: '',
                valueItem: ''
            }],                     
            Query: //TODO:  
            Body: '',              
            Retain: //TODO:
            Verifications: [{
               Code: 200, 
               Schema: '' ,
               Contains: //TODO:
               Count: //TODO:
               Match: //TODO:
               Custom: //TODO:
            }]                   //Verifications is mandatory; inside only Code is mandatory
        }
*/

//TODO: missing query here
  function isValidTest(obj) {
    if (!obj) {
      return false;
    }
  
    if (!obj.hasOwnProperty('Server') || !obj.hasOwnProperty('TestID') || !obj.hasOwnProperty('Path') ||
        !obj.hasOwnProperty('Method') || !obj.hasOwnProperty('Verifications')) {
      return false;
    }
  
    if (typeof obj.Server != 'string' || typeof obj.TestID != 'string' ||
        typeof obj.Path != 'string' || typeof obj.Method != 'string') {
      return false;
    }

    if (!["Get", "Post", "Delete", "Put"].includes(obj.Method) ) return false;
  
    if (!isValidHeaders(obj.Headers)) {
      return false;
    }
  
    if (typeof obj.Body != 'string' && obj.Body != undefined) {
      return false;
    }
  
    /* if (!isValidVerifications(obj.Verifications)) {
      return false;
    } */
  
    return true;
  }