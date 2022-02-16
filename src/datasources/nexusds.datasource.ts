// import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
// import { juggler } from '@loopback/repository';

// // TODO change these too
// const NEXUS_URL = process.env.NEXUS_BASE_URL;
// const AUTH_TOKEN = process.env.NEXUS_UPLOAD_AUTH_TOKEN;
// const UPLOAD_URL = `/service/rest/v1/components?repository=`;

// if (NEXUS_URL == undefined || AUTH_TOKEN == undefined) {
// 	throw new Error('base variables are undefined somehow -- nexusds');
// }

// const config = {
// 	name: 'nexusds',
// 	connector: 'rest',
// 	baseURL: NEXUS_URL,
// 	crud: false,
// 	options: {
// 		headers: {
// 			accept: 'application/json'
// 			// 'content-type': 'application/json'
// 		}
// 	},
// 	// TODO -- change the function here for file upload
// 	operations: [
// 		{
// 			template: {
// 				method: 'POST',
// 				url: NEXUS_URL + UPLOAD_URL + '{repository}',
// 				headers: {
// 					Authorization: AUTH_TOKEN,
// 					accept: 'application/json',
// 					'Content-Type': 'multipart/form-data',
// 					'Content-Disposition': 'attachment; filename: {filename}'
// 				},
// 				body: {
// 					'npm.asset': {
// 						value: '{payload}',
// 						type: 'type=application/x-compressed',
// 						options: { filename: '{filename}', contentType: null }
// 					}
// 				},
// 				fullResponse: true
// 			},
// 			functions: {
// 				uploadFile: [ 'repository', 'payload', 'mimetype', 'filename' ]
// 			}
// 		}
// 	]
// };

// // Observe application's life cycle to disconnect the datasource when
// // application is stopped. This allows the application to be shut down
// // gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// // Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
// @lifeCycleObserver('datasource')
// export class NexusdsDataSource extends juggler.DataSource implements LifeCycleObserver {
// 	static dataSourceName = 'nexusds';
// 	static readonly defaultConfig = config;

// 	constructor(
// 		@inject('datasources.config.nexusds', { optional: true })
// 		dsConfig: object = config
// 	) {
// 		super(dsConfig);
// 	}
// }
