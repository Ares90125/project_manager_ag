/// <reference types="Cypress" />
import {functions} from 'cypress/types/lodash';
import {query} from 'gql-query-builder';
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`getBrandsByUserId`,
	'Unauthorized',
	`Not Authorized to access getBrandsByUserId on type BrandConnection`,
	1,
	28
);
describe.skip(`Security Test for API getBrandByUserId`, () => {
	it(`C157464 : Verify that an error is displayed in response when using an incorrect userid for fetching brands`, function () {
		const data = this.userDataJson.userDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getBrandsByUserId = query({
			operation: `getBrandsByUserId`,
			variables: {
				userId: {value: data.userId, required: true}
			},
			fields: [`items{description}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getBrandsByUserId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C157464 : Verify that an error is displayed in response when using group admin token for fetching brands.`, function () {
		const data = this.userDataJson.userDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getBrandsByUserId = query({
			operation: `getBrandsByUserId`,
			variables: {
				userId: {value: data.userId, required: true}
			},
			fields: [`items{description}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getBrandsByUserId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C157464 : Verify that an error is displayed in response when using cs admin token fetching brands`, function () {
		const data = this.userDataJson.userDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getBrandsByUserId = query({
			operation: `getBrandsByUserId`,
			variables: {
				userId: {value: data.userId, required: true}
			},
			fields: [`items{description}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getBrandsByUserId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it.only(`C157464 : Verify that correct details for the brand are fetched and returned in response for API getBrandByUserId`, () => {
		cy.get(`@userDataJson`).then(({brandDetails: {babyDestinationUserId, babyDestinationBrandId}}: any) => {
			cy.get(`@tokensJson`).then(({brandAdminToken}: any) => {
				const appSyncUrl = Cypress.env(`developAppSyncUrl`);
				const getBrandsByUserId = query({
					operation: `getBrandsByUserId`,
					variables: {
						userId: {value: babyDestinationUserId, required: true}
					},
					fields: [`items{name,id,status}`]
				});

				// @ts-ignore
				cy.api({
					method: `POST`,
					url: appSyncUrl,
					headers: {
						authorization: brandAdminToken
					},
					body: getBrandsByUserId
				}).then(({body}) => {
					const {
						data: {getBrandsByUserId}
					} = body;
					getBrandsByUserId.forEach(data => {
						expect(data.id).to.be.equal(babyDestinationBrandId);
						expect(data.name).to.be.equal(`Baby Destination`);
					});
				});
			});
		});
	});
	it(`C154871 :Verify that an error is returned for API getBrandsByUserId without all required variables.`, () => {
		const response = withoutValidParameterObject(
			"Validation error of type MissingFieldArgument: Missing field argument userId @ 'getBrandsByUserId'",
			1,
			10
		);
		const getBrandsByUserId = query({
			operation: `getBrandsByUserId`,
			variables: {},
			fields: [`items{name, id, iconUrl}`]
		});
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
			// @ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: groupAdminToken
				},
				body: getBrandsByUserId
			})
				.its(`body`)
				.should(`deep.eq`, response);
		});
	});
});
