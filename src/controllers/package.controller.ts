// Uncomment these imports to begin using these cool features!

import { post, requestBody } from "@loopback/rest";

// import {inject} from '@loopback/core';


export class PackageController {
  constructor() {}

  @post('/packages')
  pay(@requestBody() name: any): Object {
  name.status = "success";
  return name;
}
}
