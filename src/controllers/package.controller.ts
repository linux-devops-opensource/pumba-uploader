// Uncomment these imports to begin using these cool features!

import { param, post, oas, Response, requestBody } from "@loopback/rest";
import http from 'http';
import axios from 'axios'; 
const fs = require('fs');

// import {inject} from '@loopback/core';

const tempFileLocation : string = "/tmp/fileUpload";
const storageApiUrl : string = "api-whatever-lol"; 


export class PackageController {
  constructor() {}

  @post('/api/package/{session_id}')
  async pay(
    @param.path.number('session_id') session_id: number, 
    @requestBody() packages: Array<string>)
  : Promise<Object> {

    // get + download packages from storage by name in tempFileLocation 
    packages.forEach(async packageName => {
      await this.downloadPackage(`${storageApiUrl}${packageName}`, `${tempFileLocation}/${packageName}`); 
    })

    // upload packages -- send req to nexus


    // send results back to ui + wipe tempFileLocation 

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
}
