

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
            Server: https://petstore3.swagger.io/api/v3 ,
            TestID: "test1",
            Path: /pet/1 ,
            Method: "Get"   // Get, Post, Put, Delete (case sensitive)
            Headers: [{   
                keyItem: '',
                valueItem: ''
            }],                     // headers are OPTIONAL  
            Body: '',               // OPTIONAL
            Verifications: [{
               Code: 200, 
               Schema: '' 
            }]                   //Verifications is mandatory; inside only Code is mandatory
        }
*/
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
  
    if (!isValidVerifications(obj.Verifications)) {
      return false;
    }
  
    return true;
  }