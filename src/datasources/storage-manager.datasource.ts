import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';

const STORAGE_MANAGER_URL = process.env.STORAGE_MANAGER_URL;

if (STORAGE_MANAGER_URL == undefined) {
	throw new Error('base variables are undefined somehow -- storageManagerds');
}

// DOCUMENTATION, under this theres an encoding null option
// lb4 + express use request module after everthing, and if you
// know the file you're getting back is binary u need to set it
// https://www.npmjs.com/package/request#:~:text=during%20redirect%20chain.-,encoding,-%2D%20encoding%20to%20be
// https://github.com/loopbackio/loopback-connector-rest#configure-options-for-request

const config = {
	name: 'storageManagerds',
	connector: 'rest',
	baseURL: STORAGE_MANAGER_URL,
	crud: false,
	options: {
		headers: {
			// accept: 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'content-type': 'application/json'
		}
	},
	operations: [
		{
			template: {
				method: 'GET',
				url: STORAGE_MANAGER_URL + `/sessions/{sessionId}/file/{fileName}`,
				options: {
					encoding: null
				},
				fullResponse: true
			},
			functions: {
				getPackage: [ 'sessionId', 'fileName' ]
			}
		}
	]
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class StorageManagerdsDataSource extends juggler.DataSource implements LifeCycleObserver {
	static dataSourceName = 'storageManagerds';
	static readonly defaultConfig = config;

	constructor(
		@inject('datasources.config.storageManagerds', { optional: true })
		dsConfig: object = config
	) {
		super(dsConfig);
	}
}
