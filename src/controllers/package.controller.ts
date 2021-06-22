// Uncomment these imports to begin using these cool features!

import { param, post, oas, Response, requestBody, response } from "@loopback/rest";
import http from 'http';
import axios from 'axios'; 
const fs = require('fs');

// import {inject} from '@loopback/core';

const tempFileLocation : string = "/tmp/fileUpload";
const storageApiUrl : string = "http://20.73.218.20:3000/"; 
const nexusUrl : string = "http://20.82.12.78:8081/"; 
const uiUrl : string = "http://20.50.49.79:80"; 
const authToken : string = "Basic cHVtYmEtdXBsb2FkZXI6ZGV2b3BzNEVWRVI="; 


export class PackageController {
  constructor() {}

  @post('/api/package/{session_id}')
  async pay(
    @param.path.number('session_id') session_id: number, 
    @requestBody(
      content: {
        'application/json': {
          type: 'array',
          schema: {
            type: 'string',      
          },
        },
      }) data: any)
  : Promise<Object> {

    // get + download packages from storage by name in tempFileLocation 
    packages.forEach(async packageName => {
      await this.downloadPackage(`${storageApiUrl}${packageName}`, `${tempFileLocation}/${session_id}/${packageName}`); 
    })

    // upload packages -- send req to nexus
    // check if npms 
    let packageStats: void[] = []; 
    packages.forEach(async packageName => {
      packageStats.push(await this.sendNpmPackages(packageName)); 
    }); 


    // send results back to ui + wipe tempFileLocation 

    // TODO compatibility with ui 
    axios({ method : "post", url : uiUrl, data: packageStats}); 
    
    fs.rmdir(`${tempFileLocation}/${session_id}/`, { recursive: true })
      .then(() => console.log('directory removed!'));

    return packages; 

  }

  // download the package from the storage maneger 
  async downloadPackage(fileUrl: string, outputLocationPath: string) {
    const writer = fs.createWriteStream(outputLocationPath);
    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then((response) => {
      return new Promise((res, rej) => {
        response.data.pipe(writer);
        let error: null = null;
        writer.on('error', (err: null) => {
          error = err;
          writer.close();
          console.log(err)
          rej(err);
        });
        writer.on('close', () => {
            if (!error) {
                console.log(fileUrl, 'download complete')
                res(true);
            }
        });
      });
    });
  } 

  // sends npm packages to the nexus, tries to upload them and returns a status 
  async sendNpmPackages(assetName: string) {
    let url = nexusUrl + "/components"; 
    let payload = {
      "npm.asset": [assetName, fs.open(assetName, 'rb')]
    };
    let params = {
      "repository": "npm-public",
      "type": "application/gzip", 
      "accept": "application/json", 
      "Content-Type": "multippart/form-data"
    };
    let headers = { "Authorization": authToken }; 
    axios({method : 'POST', url : url, data : {payload, params }, headers : headers})
      .then(res => { return { "name" : assetName, "status": "success"}; })
      .catch(err => { return { "name" : assetName, "status": err}; })
  }


}
