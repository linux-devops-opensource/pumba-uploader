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
  async handleUploadRequest(
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
      fs.mkdirSync(localFilesLocation, {recursive: true}, (err: any) => {console.log(err);});
    }

    const packageStats = await this.uploadPackages(packages, session_id, localFilesLocation);

    // // TODO someday -- fix this lol
    // // POD CLEANUP AFTER UPLOAD
    // fs.rmdir(`${localFilesLocation}/`, {recursive: true})
    //   .then(() => console.log('directory cleaned!'));

    console.log("STATS  " + packageStats);
    return packageStats;

  };

  // returns list of objects
  async uploadPackages(packages: string[], session_id: string, localFilesLocation: string) {
    let uploadResponses: any = [];

    for (const packageName of packages) {
      const res = await this.handlePackage(packageName, session_id, localFilesLocation);
      uploadResponses.push(res);
    }

    return uploadResponses;
  }


  // download package + try to upload, returns upload status
  async handlePackage(packageName: string, session_id: string, localFilesLocation: string) {
    try {
      await this.downloadPackageLocally(`${storageApiUrl}/packages/${session_id}/${packageName}`, `${localFilesLocation}/${packageName}`);

      const uploadRes = await this.uploadSinglePackage(packageName, session_id);
      return uploadRes;

    } catch (e) {
      console.log("ERROR in handlePackage");
      console.log(e);
    }
  }


  // download the package from the storage maneger, returns void
  async downloadPackageLocally(fileUrl: string, outputLocationPath: string) {
    console.log(outputLocationPath);
    console.log(fileUrl);
    console.log("starting download!!!!!!!!!")

    const writer = fs.createWriteStream(outputLocationPath);

    try {
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
              console.log(fileUrl, ' download complete')
              res(true);
            }
          });
        });
      }).catch((err) => {console.log(err);});
    } catch (e) {
      console.log("ERROR in downloadPackageLocally");
      console.log(e);
    }
  }


  // uploads npm package to nexus, returns an upload status (success/error)
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

      try {
        let res = await this.promisifiedRequest(options);
        console.log(res);
        return {"packageName": assetName, "status": "success"};
      } catch (e) {
        console.log("ERROR in req to nexus in uploadSinglePackage");
        console.log(e);
        return {"packageName": assetName, "status": e};
      }

    } catch (e) {
      console.log("ERROR in uploadSinglePackage");
      console.log(e);
      return {"packageName": assetName, "status": e};
    }
  }


  promisifiedRequest(options: any) {
    return new Promise((resolve, reject) => {
      request(options, (error: any, response: any, body: any) => {
        if (response) {
          return resolve(response);
        }
        if (error) {
          return reject(error);
        }
      });
    });
  };
  // requests is (deprecated and old and also) very much not async
  // https://stackoverflow.com/questions/45778474/proper-request-with-async-await-in-node-js/54791697#54791697

}
