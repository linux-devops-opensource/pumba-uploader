import { inject } from '@loopback/core';
import { FilterExcludingWhere, repository } from '@loopback/repository';
import { post, getModelSchemaRef, requestBody, response, Response } from '@loopback/rest';
import { Session } from '../models/session.model';
import { SessionRepository } from '../repositories/session.repository';
import { Nexus } from '../services/nexus.service';
import { StorageManager } from '../services/storage-manager.service';
import { fromBuffer } from 'file-type';
import request from 'request';
import { ReadStream } from 'fs';
const { Readable } = require('stream');

/* eslint-disable  @typescript-eslint/no-explicit-any-catch */

const NEXUS_URL = process.env.NEXUS_BASE_URL;
const AUTH_TOKEN = process.env.NEXUS_UPLOAD_AUTH_TOKEN;
const UPLOAD_URL = `/service/rest/v1/components?repository=`;

export class SessionsController {
	constructor(
		@repository(SessionRepository) public sessionRepository: SessionRepository,
		@inject('services.Nexus') protected nexusService: Nexus,
		@inject('services.StorageManager') protected storageManagerService: StorageManager
	) {}

	@post('/sessions')
	@response(200, {
		description: 'Session model instance',
		content: { 'application/json': { schema: getModelSchemaRef(Session) } }
	})
	async create(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(Session, {
						title: 'NewSession'
					})
				}
			}
		})
		session: Session
	): Promise<Session> {
		let repoName: string = this.getRepoName(session.repository);

		for (let pkg of session.pkgs) {
			console.log(pkg.name);

			// sigh
			let fileContent: any = await this.storageManagerService.getPackage(session.sid, pkg.name);

			const attrs = await fromBuffer(fileContent.body);
			console.log(attrs);
			if (!attrs) {
				// somethings wrong w the buffer
				throw new Error('something is wrong w the file in s3~~~');
			}

			console.log('trying to send to nexus post parsing!!~~');

			// const stream: ReadStream = Readable.from(fileContent.body);
			// console.log(stream);
			// const payload = {
			// 	'npm.asset': {
			// 		value: fileContent.body,
			// 		type: 'type=application/x-compressed',
			// 		options: { filename: pkg.name, contentType: null }
			// 	}
			// };
			// let options = {
			// 	method: 'POST',
			// 	url: NEXUS_URL + UPLOAD_URL + repoName,
			// 	headers: {
			// 		Authorization: AUTH_TOKEN,
			// 		accept: 'application/json'
			// 	},
			// 	formData: payload
			// };

			try {
				let res: Response = await this.nexusService.uploadFile(
					repoName,
					fileContent.body,
					// attrs.mime,
					pkg.name
				);
				// let res: request.Response = await this.promisifiedRequest(options);
				// console.log(res);

				console.log(res.statusCode);
				pkg.statusCode = res.statusCode;
			} catch (e) {
				console.log('caught error ~~~~~~~');
				// console.log(e);
				// pkg.statusCode = 500;
				pkg.statusCode = e.statusCode ? e.statusCode : 500;

				pkg.info = e.message ? e.message : 'probable server err :// contact ur fave system admin';
			}
		}

		console.log(session);

		return session;
		// return this.sessionRepository.create(session);
	}

	private promisifiedRequest(options: any): Promise<request.Response> {
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
	}
	// requests is (deprecated and old and also) very much not async
	// https://stackoverflow.com/questions/45778474/proper-request-with-async-await-in-node-js/54791697#54791697

	private getRepoName(repository: string | undefined): string {
		// TODO add support for other not npm packages
		if (!repository) {
			return 'npm-local-test';
		} else {
			return repository;
		}
	}
}
