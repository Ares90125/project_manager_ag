/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {functions} from 'lodash';
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
describe(`API test cases for createBrand and updateBrand mutuation`, () => {
	const apierror = unauthorizedErrorObject(
		`createBrand`,
		'Unauthorized',
		`Not Authorized to access createBrand on type Brand`,
		2,
		3
	);
	it(`C157464 : Verify that an error is displayed in response when using group admin auth token for creating a brand.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createBrand = mutation({
			operation: `createBrand`,
			variables: {
				input: {
					value: {
						name: `Test`,
						iconUrl: `https://iconscout.com/icon/bajaj-2709179`
					},
					required: true,
					type: `CreateBrandInput`
				}
			},
			fields: [`name`, `id`, `status`, `iconUrl`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: createBrand
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C157464 : Verify that an error is displayed in response when using brand admin auth token for creating a brand.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createBrand = mutation({
			operation: `createBrand`,
			variables: {
				input: {
					value: {
						name: `Test`,
						iconUrl: `https://iconscout.com/icon/bajaj-2709179`
					},
					required: true,
					type: `CreateBrandInput`
				}
			},
			fields: [`name`, `id`, `status`, `iconUrl`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: createBrand
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C157464 : Verify that an error is displayed in response when using cs admin auth token for creating a brand without required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response = withoutValidParameterObject(
			"Variable 'input' has coerced Null value for NonNull type 'String!'",
			1,
			11
		);
		const createBrand = mutation({
			operation: `createBrand`,
			variables: {
				input: {
					value: {
						iconUrl: `https://iconscout.com/icon/bajaj-2709179`
					},
					required: true,
					type: `CreateBrandInput`
				}
			},
			fields: [`name`, `id`, `status`, `iconUrl`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: createBrand
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;
			expect(message).to.be.equal(`Variable 'input' has coerced Null value for NonNull type 'String!'`);
		});
	});
	it(`C157464 : Verify that brand is successfully created and updated when using cs admin auth token for creating a brand.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createBrand = mutation({
			operation: `createBrand`,
			variables: {
				input: {
					value: {
						name: `Test`
					},
					required: true,
					type: `CreateBrandInput`
				}
			},
			fields: [`name`, `id`, `status`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: createBrand
		}).then(({body}) => {
			const {
				data: {
					createBrand: {name, id, status}
				}
			} = body;
			expect(name).to.be.equal(`Test`);
			expect(id).to.be.not.null;
			expect(id).to.be.not.empty;
			expect(status).to.be.equal(`Draft`);
			cy.wrap(id).as(`brandId`);
		});
		cy.get(`@brandId`).then(brandId => {
			const updateBrand = mutation({
				operation: `updateBrand`,
				variables: {
					input: {
						value: {
							name: `Test1`,
							id: brandId
						},
						required: true,
						type: `UpdateBrandInput`
					}
				},
				fields: [`name`, `id`, `status`]
			});
			//@ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: this.tokensJson.csAdminToken
				},
				body: updateBrand
			}).then(({body}) => {
				const {
					data: {
						updateBrand: {name, id, status}
					}
				} = body;
				expect(name).to.be.equal(`Test1`);
				expect(id).to.be.equal(brandId);
				expect(status).to.be.equal(`Draft`);
			});
			cy.task(`deleteBrand`, brandId);
		});
	});
});
