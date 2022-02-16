// import { inject, Provider } from '@loopback/core';
// import { getService } from '@loopback/service-proxy';
// import { Readable } from 'stream';
// import { NexusdsDataSource } from '../datasources/nexusds.datasource';
// // import {NexusAsset} from '../models';

// export interface Nexus {
// 	// this is where you define the Node.js methods that will be
// 	// mapped to REST/SOAP/gRPC operations as stated in the datasource
// 	// json file.
// 	// TODO
// 	uploadFile(repository: string, payload: Buffer, mimetype: string, filename: string): Promise<object>;
// 	// searchAssetBySha1(sha1: string): Promise<NexusAsset>;
// }

// export class NexusProvider implements Provider<Nexus> {
// 	constructor(
// 		// nexusds must match the name property in the datasource json file
// 		@inject('datasources.nexusds') protected dataSource: NexusdsDataSource = new NexusdsDataSource()
// 	) {}

// 	value(): Promise<Nexus> {
// 		return getService(this.dataSource);
// 	}
// }
