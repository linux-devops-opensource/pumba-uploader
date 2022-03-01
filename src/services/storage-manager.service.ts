import { inject, Provider } from '@loopback/core';
import { getService } from '@loopback/service-proxy';
import { StorageManagerdsDataSource } from '../datasources/storage-manager.datasource';
// import {StorageManagerAsset} from '../models';

export interface StorageManager {
	// this is where you define the Node.js methods that will be
	// mapped to REST/SOAP/gRPC operations as stated in the datasource
	// json file.

	getPackage(sessionId: string, fileName: string): Promise<object>;
}

export class StorageManagerProvider implements Provider<StorageManager> {
	constructor(
		// StorageManagerds must match the name property in the datasource json file
		@inject('datasources.storageManagerds')
		protected dataSource: StorageManagerdsDataSource = new StorageManagerdsDataSource()
	) {}

	value(): Promise<StorageManager> {
		return getService(this.dataSource);
	}
}
