/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`communityDiscoveryAPI`,
	'Unauthorized',
	'Not Authorized to access communityDiscoveryAPI on type Query',
	1,
	44
);
describe(`API test cases for CommunityDiscoveryAPI`, () => {
	it(`C214817 : Verify that an data is returned when hitting CommunityDiscoveryAPI API with cs admin auth token without any filter`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const CommunityDiscoveryAPI = query({
			operation: `communityDiscoveryAPI`,
			variables: {
				input: {
					value: {},
					required: true,
					type: 'communityDiscoveryInput'
				}
			},
			fields: [`eligibleCommunitiesCount,selectedCommunities{groupId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: CommunityDiscoveryAPI
		}).then(({body}) => {
			const {
				data: {
					communityDiscoveryAPI: {
						eligibleCommunitiesCount,
						selectedCommunities: [groupId]
					}
				}
			} = body;

			expect(eligibleCommunitiesCount).to.not.be.null;
			expect(eligibleCommunitiesCount).to.be.greaterThan(0);
			expect(groupId).to.not.be.null;
			expect(groupId).to.not.be.empty;
		});
	});

	it(`C214817 : Verify that an data is returned when hitting CommunityDiscoveryAPI API with cs admin auth token with Category filter`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const CommunityDiscoveryAPI = query({
			operation: `communityDiscoveryAPI`,
			variables: {
				input: {
					value: {
						businessCategory: [`Buy & Sell`]
					},
					required: true,
					type: 'communityDiscoveryInput'
				}
			},
			fields: [`eligibleCommunitiesCount,selectedCommunities{groupId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: CommunityDiscoveryAPI
		}).then(({body}) => {
			const {
				data: {
					communityDiscoveryAPI: {
						eligibleCommunitiesCount,
						selectedCommunities: [groupId]
					}
				}
			} = body;

			expect(eligibleCommunitiesCount).to.not.be.null;
			expect(eligibleCommunitiesCount).to.be.greaterThan(0);
			expect(groupId).to.not.be.null;
			expect(groupId).to.not.be.empty;
		});
	});

	it(`C214817 : Verify that error is returned when hitting CommunityDiscoveryAPI API with group  admin auth token with Category filter`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const CommunityDiscoveryAPI = query({
			operation: `communityDiscoveryAPI`,
			variables: {
				input: {
					value: {
						businessCategory: [`Buy & Sell`]
					},
					required: true,
					type: 'communityDiscoveryInput'
				}
			},
			fields: [`eligibleCommunitiesCount,selectedCommunities{groupId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: CommunityDiscoveryAPI
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
