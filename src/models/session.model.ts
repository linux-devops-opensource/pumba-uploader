import { Entity, model, property } from '@loopback/repository';
import { Pkg } from './pkg.model';

/**
// represents a session type entity
// original schema from package.controller.ts
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
 */
@model()
export class Session extends Entity {
	@property({
		type: 'string',
		id: true,
		generated: false,
		required: true
	})
	sid: string;

	@property({
		type: 'string',
		required: true
	})
	type: string;

	@property({
		type: 'string'
	})
	repository?: string;

	@property.array(Pkg, {
		type: 'array',
		itemType: 'object',
		required: true
	})
	pkgs: Pkg[];

	// Define well-known properties here

	constructor(data?: Partial<Session>) {
		super(data);
	}
}

export interface SessionRelations {
	// describe navigational properties here
}

export type SessionWithRelations = Session & SessionRelations;
