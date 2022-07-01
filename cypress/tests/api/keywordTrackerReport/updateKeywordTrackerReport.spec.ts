/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder'; //Clean this part
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`updateKeywordTrackerReport`,
	'Unauthorized',
	'Not Authorized to access updateKeywordTrackerReport on type KeywordTrackerReport',
	2,
	3
);
describe(`Security Test cases for UpdateKeywordTrackerReport`, () => {
	it(`C42111 : should throw an error when hitting UpdateKeywordTrackerReport API for the group with the authtoken of moderator.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateKeywordTrackerReport = mutation({
			operation: `updateKeywordTrackerReport`,
			variables: {
				input: {
					value: {
						ownerId: this.userDataJson.addModeratorDetails.moderatorGroupId,
						name: this.userDataJson.addModeratorDetails.inviterUserId,
						displayName: 'Spamming and Promotions',
						keywords:
							'channel|youtube|below link|join group|contact me|inbox me|ping me|subscribe|buy this|join my|follow me|instagram|check this article|whatsapp me|my page|join my|Test'
					},
					required: true,
					type: 'UpdateKeywordTrackerReportInput'
				}
			},
			fields: [`displayName,id`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.moderatorToken
			},
			body: updateKeywordTrackerReport
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`should throw an error when hitting UpdateKeywordTrackerReport API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateKeywordTrackerReport = mutation({
			operation: `updateKeywordTrackerReport`,
			variables: {
				input: {
					value: {
						ownerId: this.userDataJson.addModeratorDetails.moderatorGroupId,
						name: this.userDataJson.addModeratorDetails.inviterUserId,
						displayName: 'Spamming and Promotions',
						keywords:
							'channel|youtube|below link|join group|contact me|inbox me|ping me|subscribe|buy this|join my|follow me|instagram|check this article|whatsapp me|my page|join my|Test'
					},
					required: true,
					type: 'UpdateKeywordTrackerReportInput'
				}
			},
			fields: [`displayName,id`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: updateKeywordTrackerReport
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`Verify that keywords are updated successfully for the respective report by passing valid required variables.`, () => {
		cy.get(`@userDataJson`).then(
			({addModeratorDetails: {moderatorGroupId}, keywordsDetails: {payloadKeywords, keywordReportName}}: any) => {
				cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
					const appSyncUrl = Cypress.env(`developAppSyncUrl`);
					const updateKeywordTrackerReport = mutation({
						operation: `updateKeywordTrackerReport`,
						variables: {
							input: {
								value: {
									ownerId: moderatorGroupId,
									name: 'Admin',
									displayName: keywordReportName,
									keywords: payloadKeywords
								},
								required: true,
								type: 'UpdateKeywordTrackerReportInput'
							}
						},
						fields: [`displayName,keywords,reportLevel,ownerId,numOfActionRequired,numOfBlockedUser,numOfOccurances`]
					});

					// @ts-ignore
					cy.api({
						method: `POST`,
						url: appSyncUrl,
						headers: {
							authorization: groupAdminToken
						},
						body: updateKeywordTrackerReport
					}).then(({body}) => {
						const {
							data: {
								updateKeywordTrackerReport: {
									displayName,
									keywords,
									reportLevel,
									ownerId,
									numOfActionRequired,
									numOfBlockedUser,
									numOfOccurances
								}
							}
						} = body;

						expect(displayName).to.be.equal(keywordReportName);
						expect(keywords).to.be.equal(payloadKeywords);
						expect(reportLevel).to.be.equal(`Group`);
						expect(ownerId).to.be.equal(moderatorGroupId);
						expect(numOfActionRequired).to.be.not.null;
						expect(numOfBlockedUser).to.be.not.null;
						expect(numOfOccurances).to.be.not.null;
					});
				});
			}
		);
	});

	it(`Verify that keywords are not updated successfully for the respective report without passing valid required variables.`, () => {
		cy.get(`@userDataJson`).then(({keywordsDetails: {payloadKeywords, keywordReportName}}: any) => {
			cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
				const appSyncUrl = Cypress.env(`developAppSyncUrl`);
				const updateKeywordTrackerReport = mutation({
					operation: `updateKeywordTrackerReport`,
					variables: {
						input: {
							value: {
								name: '091d9c7f-4ae7-4443-8dcd-bbe8e4bb099c',
								displayName: keywordReportName,
								keywords: payloadKeywords
							},
							required: true,
							type: 'UpdateKeywordTrackerReportInput'
						}
					},
					fields: [
						`displayName,keywords,reportLevel,ownerId,
					numOfActionRequired,numOfBlockedUser,numOfOccurances`
					]
				});

				// @ts-ignore
				cy.api({
					method: `POST`,
					url: appSyncUrl,
					headers: {
						authorization: groupAdminToken
					},
					body: updateKeywordTrackerReport
				}).then(({body}) => {
					const {
						errors: [{message}]
					} = body;

					expect(message).to.be.equal(`Variable 'input' has coerced Null value for NonNull type 'String!'`);
				});
			});
		});
	});

	it(`Verify that keywords are not updated successfully for the respective report by passing invalid required variables.`, () => {
		cy.get(`@userDataJson`).then(({keywordsDetails: {payloadKeywords, keywordReportName}}: any) => {
			cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
				const appSyncUrl = Cypress.env(`developAppSyncUrl`);
				const updateKeywordTrackerReport = mutation({
					operation: `updateKeywordTrackerReport`,
					variables: {
						input: {
							value: {
								ownerId: 'invalid',
								name: '091d9c7f-4ae7-4443-8dcd-bbe8e4bb099c',
								displayName: keywordReportName,
								keywords: payloadKeywords
							},
							required: true,
							type: 'UpdateKeywordTrackerReportInput'
						}
					},
					fields: [
						`displayName,keywords,reportLevel,ownerId,
					numOfActionRequired,numOfBlockedUser,numOfOccurances`
					]
				});

				// @ts-ignore
				cy.api({
					method: `POST`,
					url: appSyncUrl,
					headers: {
						authorization: groupAdminToken
					},
					body: updateKeywordTrackerReport
				}).then(({body}) => {
					const {
						data: {updateKeywordTrackerReport},
						errors: [{errorType, message}]
					} = body;

					expect(updateKeywordTrackerReport).to.be.null;
					expect(message).to.be.equal(
						`Not Authorized to access updateKeywordTrackerReport on type KeywordTrackerReport`
					);
					expect(errorType).to.be.equal(`Unauthorized`);
				});
			});
		});
	});
});
