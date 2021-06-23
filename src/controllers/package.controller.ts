// Uncomment these imports to begin using these cool features!
import {param, post, requestBody} from "@loopback/rest";
import axios from 'axios';
const fs = require('fs');

// import {inject} from '@loopback/core';

const tempFileLocation: string = "/tmp/fileUpload";
const storageApiUrl: string = "http://20.73.218.20:3000/";
const nexusUrl: string = "http://20.82.12.78:8081/";
const uiUrl: string = "http://20.50.49.79:80";
const authToken: string = "Basic cHVtYmEtdXBsb2FkZXI6ZGV2b3BzNEVWRVI=";

const schema = {
  type: 'object',
  properties: {
    packages: {
      type: 'array',
      items: {
        'x-ts-type': 'string',
      },
    }
  }
};

export class PackageController {
  constructor() { }

  @post('/api/package/{session_id}')
  async pay(
    @param.path.number('session_id') session_id: number,
    @requestBody({
      content: {
        'application/json': schema
      }
    }) info: object)
    : Promise<object> {

    let packages: [] = Object.values(info)[0];


    // let a = {packages: ["askdjhas.asd", "asdk"]}
    // console.log(a.packages)
    // let keys = Object.keys(info)
    // console.log(keys)
    // console.log(Object.values(info)[0])
    // // console.log(info.packages)
    // console.log(typeof (info))
    // let strJson = JSON.stringify(info)
    // let json = JSON.parse(strJson)

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
    axios({method: "post", url: uiUrl, data: packageStats});

    fs.rmdir(`${tempFileLocation}/${session_id}/`, {recursive: true})
      .then(() => console.log('directory removed!'));

    return packages;
    // return {};

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
    let headers = {"Authorization": authToken};
    axios({method: 'POST', url: url, data: {payload, params}, headers: headers})
      .then(res => {return {"name": assetName, "status": "success"};})
      .catch(err => {return {"name": assetName, "status": err};})
  }


}
