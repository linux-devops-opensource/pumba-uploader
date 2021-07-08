import {param, post, requestBody} from "@loopback/rest";
import axios from 'axios';
import request from 'request';
const fs = require('fs');


const tempFileLocation: string = "/tmp/fileUpload";
const storageApiUrl: string = "http://20.73.218.20:3000";
const nexusUrl: string = "http://20.76.247.10:8081";
const authToken: string = "Basic YWRtaW46ZGV2b3BzNEVWRVI=";

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
  async uploadPackage(
    @param.path.string('session_id') session_id: string,
    @requestBody({
      content: {
        'application/json': schema
      }
    }) info: object)
    : Promise<object> {

    // BANDAID
    // from some reason it wont recognize info as an object so u can take packages out of it
    let packages: [] = Object.values(info)[0];

    // get + download packages from storage by name in tempFileLocation
    console.log(session_id);
    console.log(info);
    console.log(packages);

    const localFilesLocation = `${tempFileLocation}/${session_id}`

    // if the folder doesnt exist, create it
    if (!fs.existsSync(localFilesLocation)) {
      console.log("folder does not exist@@@@@@@@@@@2")
      fs.mkdirSync(localFilesLocation, {recursive: true}, (err: any) => {console.log(err);});
    }
    // await new Promise(r => setTimeout(r, 5000));
    console.log("starting download!!!!!!!!!")

    let packageStats: any = [];
    packageStats = await packages.forEach(packageName => {
      this.downloadPackageLocally(`${storageApiUrl}/packages/${session_id}/${packageName}`, `${localFilesLocation}/${packageName}`)
        .then(_res => {
          console.log(_res);
          console.log("starting send%%%%%%%%%%%%%%%%%%%%%%");
          this.uploadSinglePackage(packageName, session_id).then(npmRes => {return npmRes;})
        });
    })

    // upload packages -- send req to nexus
    // check if npms -- divide by type of package in future
    // packages.forEach(async packageName => {
    //   packageStats.push(await this.uploadSinglePackage(packageName, session_id));
    // });

    // send results back to ui + wipe tempFileLocation

    // // TODO someday -- fix this lol
    // // POD CLEANUP AFTER UPLOAD
    // fs.rmdir(`${localFilesLocation}/`, {recursive: true})
    //   .then(() => console.log('directory cleaned!'));

    console.log("STATS  " + packageStats);
    return packageStats;

  }

  // download the package from the storage maneger
  async downloadPackageLocally(fileUrl: string, outputLocationPath: string) {
    console.log(outputLocationPath);
    console.log(fileUrl);
    const writer = fs.createWriteStream(outputLocationPath);

    try {
      return axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
      }).then((response) => {
        console.log("GOT FILE FROM AXIOS@@@@@@@@@@@@@2")
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
            console.log("CLOSED FILE &&&&&&&&&&")
            if (!error) {
              console.log(fileUrl, ' download complete')
              res(true);
            }
          });
        });
      }).catch((err) => {console.log(err);});
    } catch (e) {
      console.log(e);
    }
  }

  // sends npm packages to the nexus, tries to upload them and returns a status
  async uploadSinglePackage(assetName: string, session_id: string) {
    // todo someday -- make this general and not only npm
    console.log(assetName);
    console.log(session_id);

    let url = nexusUrl + "/service/rest/v1/components?repository=npm-public";

    try {

      const data = {
        value: fs.createReadStream(`${tempFileLocation}/${session_id}/${assetName}`),
        type: 'type=application/x-compressed',
        options: {'filename': assetName, 'contentType': null}
      };

      let payload = {
        "npm.asset": data
      };


      let headers = {
        "Authorization": authToken,
        'accept': 'application/json',
        "Content-Type": "multipart/form-data",
      };

      let options = {
        method: 'POST',
        url: url,
        headers: headers,
        formData: payload
      };

      await request(options, function (err: any, response: any, body: any) {
        console.log(options);
        if (err) {
          console.log(err)
          return {"packageName": assetName, "status": err};
        } else {
          // success
          console.log(response.statusCode)
          return {"packageName": assetName, "status": "success"};
        }
      })
    } catch (e) {
      console.log("ERROR in uploadSinglePackage ", e);
      return {"packageName": assetName, "status": e};
    }
  }

}
