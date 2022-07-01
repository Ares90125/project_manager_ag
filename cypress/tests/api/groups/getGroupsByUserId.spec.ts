/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`getGroupsByUserId`,
	'Unauthorized',
	'Not Authorized to access getGroupsByUserId on type GroupsConnection',
	1,
	28
);
describe(`Security test cases for getGroupsByUserId`, () => {
	it(`C42106 :Verify that query getGroupsByUserId throw an error when using an incorrect user ID for fetching groups.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsByUserId = query({
			operation: `getGroupsByUserId`,
			variables: {
				userId: {value: this.userDataJson.addModeratorDetails.inviterUserId, required: true}
			},
			fields: [`items{id}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getGroupsByUserId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42106 :Verify that query getGroupsByUserId throw an error when using an brandAdminToken fetching groups.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsByUserId = query({
			operation: `getGroupsByUserId`,
			variables: {
				userId: {value: this.userDataJson.addModeratorDetails.inviterUserId, required: true}
			},
			fields: [`items{id}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getGroupsByUserId
		}).then(({body}) => {
			const {
				data: {getGroupsByUserId},
				errors: [{errorType, message}]
			} = body;
			expect(getGroupsByUserId).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access getGroupsByUserId on type GroupsConnection`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});

	it(`C42106 :Verify that query getGroupsByUserId throw an error when using an csAdminToken fetching groups.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsByUserId = query({
			operation: `getGroupsByUserId`,
			variables: {
				userId: {value: this.userDataJson.addModeratorDetails.inviterUserId, required: true}
			},
			fields: [`items{id}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getGroupsByUserId
		}).then(({body}) => {
			const {
				data: {getGroupsByUserId},
				errors: [{errorType, message}]
			} = body;
			expect(getGroupsByUserId).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access getGroupsByUserId on type GroupsConnection`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});

	it(`C42106 :Verify that query getGroupsByUserId returns data with valid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsByUserId = query({
			operation: `getGroupsByUserId`,
			variables: {
				userId: {value: this.userDataJson.addModeratorDetails.inviterAdminId, required: true}
			},
			fields: [`items{id,areMetricsAvailable,name,privacy,iconUrl,email}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupsByUserId
		}).then(({body}) => {
			const {
				data: {
					getGroupsByUserId: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.id).to.be.not.null.and.not.to.be.undefined;
				expect(data.areMetricsAvailable).to.be.not.null.and.not.to.be.undefined;
				expect(data.name).to.be.not.null.and.not.to.be.undefined;
				expect(data.privacy).to.be.not.null.and.not.to.be.undefined;
				expect(data.iconUrl).to.be.not.null.and.not.to.be.undefined;
				expect(data.email).to.be.not.null.and.not.to.be.undefined;
			});
		});
	});

	it(`C42106 :Verify that query getGroupsByUserId returns error without  required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsByUserId = query({
			operation: `getGroupsByUserId`,
			variables: {},
			fields: [`items{id,areMetricsAvailable,name,privacy,iconUrl,email}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupsByUserId
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument userId @ 'getGroupsByUserId'`
			);
		});
	});

	it(`C42106 :Verify that query getGroupsByUserId returns error with invalid variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsByUserId = query({
			operation: `getGroupsByUserId`,
			variables: {userId: {value: 'invalid', required: true}},
			fields: [`items{id,areMetricsAvailable,name,privacy,iconUrl,email}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupsByUserId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
