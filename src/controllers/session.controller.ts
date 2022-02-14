import { inject } from '@loopback/core';
import { FilterExcludingWhere, repository } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, put, del, requestBody, response, Response } from '@loopback/rest';
import { Session } from '../models/session.model';
import { SessionRepository } from '../repositories/session.repository';
import { Nexus } from '../services/nexus.service';
import { StorageManager } from '../services/storage-manager.service';
import { fromBuffer } from 'file-type';

const parser = require('form-parser');

const STORAGE_MANAGER_URL = process.env.STORAGE_MANAGER_URL;
if (STORAGE_MANAGER_URL == undefined) {
	throw new Error('base variables are undefined somehow -- session controller');
}

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
		console.log('got to router !~~~~');
		let repoName: string;
		if (!session.repository) {
			// if (session.type == 'npm') {
			repoName = 'npm-local-test';
			// }
		} else {
			repoName = session.repository;
		}
		for (let pkg of session.pkgs) {
			console.log(pkg.name);

			// this.storageManagerService.getPackage(session.sid, pkg.name).on('end')
			let fileContent: any = await this.storageManagerService.getPackage(session.sid, pkg.name);

			// console.log(typeof fileContent.body);
			if (!fileContent.headers) {
				throw new Error();
			}
			console.log(fileContent.headers);
			console.log(Buffer.byteLength(fileContent.body));
			// console.log(typeof fileContent.body);
			// console.log(fileContent.headers['content-type']);
			// // the storage manager returns an 'application/octet-stream'
			// const buff = Buffer.from(fileContent.body, 'binary');
			// console.log(buff);
			const attrs = await fromBuffer(fileContent.body);
			console.log(attrs);
			if (!attrs) {
				throw new Error();
			}

			console.log('trying to send to nexus post parsing!!~~');

			const payload = {
				'npm.asset': {
					value: fileContent.body,
					type: `type=${attrs.mime}`,
					// type: 'type=application/x-compressed',
					options: { filename: pkg.name, contentType: null }
				}
			};

			try {
				let nexusRes = await this.nexusService.uploadFile(
					repoName,
					// payload.toString(),
					fileContent.body,
					// attrs.mime,
					'multipart/form-data',
					// fileContent.headers['content-type'],
					pkg.name,
					fileContent.headers['content-length']
				);
				console.log(nexusRes);
			} catch (e) {
				console.log('in catch ~~~~~~~');
				console.log(e);
			}
			// await parser(fileContent, async (filed: any) => {

			// 	// TODO figure this out lmao

			// 	// await this.s3Service.publicAccess(id, filed.fieldContent.fileName, process.env.S3_TOKEN ?? 'S3_TOKEN is not defined')
			// 	// file = {
			// 	//   name: filed.fieldContent.fileName,
			// 	//   sid: id
			// 	// }
			// });
		}

		console.log(session);

		return this.sessionRepository.create(session);
	}
}
