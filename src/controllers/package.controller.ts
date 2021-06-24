import {param, post, requestBody} from "@loopback/rest";
import axios from 'axios';
import request from 'request';
const fs = require('fs');


// const tempFileLocation: string = "/tmp/fileUpload";
const tempFileLocation: string = "C:\\Users\\adidush\\Desktop\\army-stuff\\fileUpload";
const storageApiUrl: string = "http://20.73.218.20:3000/";
const nexusUrl: string = "http://20.76.247.10:8081/";
const uiUrl: string = "http://20.50.49.79:80";
// const authToken: string = "Basic admin2:devops4EVER";
//const authToken: string = "Basic YWRtaW46ZGV2b3BzNEVWRVI=";
//const authToken: string = "Basic YWRtaW4yOmRldm9wczRFVkVS";
const authToken: string = "Basic admin2:devops4EVER";

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

    // get + download packages from storage by name in tempFileLocation
    // packages.forEach(async packageName => {
    //   await this.downloadPackage(`${storageApiUrl}${packageName}`, `${tempFileLocation}\\${session_id}\\${packageName}`);
    // })

    // upload packages -- send req to nexus
    // check if npms
    let packageStats: void[] = [];
    packages.forEach(async packageName => {
      packageStats.push(await this.sendNpmPackages(packageName, session_id));
    });


    // send results back to ui + wipe tempFileLocation

    // // TODO TO BE UNCOMMENTED
    // // POD CLEANUP AFTER UPLOAD
    // fs.rmdir(`${tempFileLocation}/${session_id}/`, {recursive: true})
    //   .then(() => console.log('directory removed!'));

    return packageStats;

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
  async sendNpmPackages(assetName: string, session_id: number) {
    let url = nexusUrl + "/service/rest/v1/components";

    const data = {
      value: fs.createReadStream(`${tempFileLocation}\\${session_id}\\${assetName}`),
      options: {filename: assetName, contentType: null}
    };

    let payload = {
      "npm.asset": data
    };

    let repoData = {"repository": "npm-public2"};

    let headers = {
      "Authorization": authToken,
      // "Content-Type": "application/json"
      "Content-Type": "multipart/form-data",
      // "type": "application/x-compressed"
    };

    let options = {
      method: 'POST',
      url: url,
      qs: repoData,
      headers: headers,
      formData: payload
    };

    await request(options, function (error: any, response: any, body: any) {
      if (error) {
        console.log(error)
        return {"packageName": assetName, "status": error};
      } else {
        // success
        console.log(response.statusCode)
        console.log(response.body)
        return {"packageName": assetName, "status": "success"};
      }
    })
  }
}
