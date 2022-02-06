import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { SessionsDsDataSource } from '../datasources/sessionds.datasource';
import { Session, SessionRelations } from '../models/session.model';

/**
 * allows to take info from the session datasource
 * which is a "link" to the session db 
 */
export class SessionRepository extends DefaultCrudRepository<Session, typeof Session.prototype.sid, SessionRelations> {
	constructor(@inject('datasources.SessionsDs') dataSource: SessionsDsDataSource) {
		super(Session, dataSource);
	}
}
