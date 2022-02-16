import { Entity, model, property } from '@loopback/repository';

/**
a package is essentially a string i think?
seems a bit exessive to make a Pkg class, but maybe some day we'll want to expand this and add more things? 
so currently keeping this a class
 */

@model()
export class Pkg extends Entity {
	@property({
		type: 'string',
		id: true,
		generated: false,
		required: true
	})
	name: string;

	@property({
		type: 'number'
	})
	statusCode?: number;

	@property({
		type: 'string'
	})
	info?: string;

	constructor(data?: Partial<Pkg>) {
		super(data);
	}
}

export interface PkgRelations {
	// describe navigational properties here
}

export type PkgWithRelations = Pkg & PkgRelations;
