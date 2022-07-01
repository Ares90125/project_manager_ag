/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`getCMCReportMetricsV2`,
	'Unauthorized',
	'Not Authorized to access getCMCReportMetricsV2 on type CMCReportMetricsV2',
	1,
	32
);
describe(`Security test cases for getCmcReportMetrics`, () => {
	it(`C215203 : Verify that an error is returned when hitting getCmcReportMetrics API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getCMCReportMetricsV2 = query({
			operation: `getCMCReportMetricsV2`,
			variables: {
				campaignId: {value: this.userDataJson.campaignDetails.campaignId, required: true}
			},
			fields: [`numBeforeCatConversations`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getCMCReportMetricsV2
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C215203 : Verify that an error is not returned when hitting getCmcReportMetrics API for the group with both cs admin and brand admin token auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		[this.tokensJson.csAdminToken, this.tokensJson.brandAdminToken].forEach(token => {
			const getCMCReportMetricsV2 = query({
				operation: `getCMCReportMetricsV2`,
				variables: {
					campaignId: {value: '02f49a25-3cb7-4caa-9360-d18107a572e2', required: true}
				},
				fields: [
					`afterSOV,
			afterSentimentMap,
			beforeSOV,
			beforeSentimentMap,
			campaignHighlights,
			campaignId,
			duringSOV,
			duringSentimentMap,
			numAdminPosts,
			numAfterBrandConversations,
			numAfterBrandMentions,
			numAfterCatConversations,
			numAudience,
			numBeforeBrandConversations,
			numBeforeBrandMentions,
			numBeforeCatConversations,
			numCommentAdminPost,
			numCommentUGCPost,
			numCompletedCampaignPost,
			numDuringBrandConversations,
			numDuringBrandMentions,
			numDuringCatConversations,
			numGroups,
			numLeadsGenerated,
			numPosts,
			totalCampaignPost,
			phaseMetrics,
			numUGCPosts,
			numReactionUGCPost,
			numReactionAdminPost`
				]
			});
			// @ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: token
				},
				body: getCMCReportMetricsV2
			}).then(({body}) => {
				const {
					data: {getCMCReportMetricsV2}
				} = body;
				expect(getCMCReportMetricsV2.afterSOV).to.be.not.null.and.not.to.be.undefined.and.not.to.be.empty;
				expect(getCMCReportMetricsV2.afterSentimentMap).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.beforeSOV).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.beforeSentimentMap).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.campaignHighlights).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.campaignHighlights.length).to.be.greaterThan(0);
				expect(getCMCReportMetricsV2.campaignId).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.duringSOV).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.duringSentimentMap).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numAdminPosts).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numAdminPosts).above(0);
				expect(getCMCReportMetricsV2.numAfterBrandConversations).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numAfterBrandConversations).above(-1);
				expect(getCMCReportMetricsV2.numAfterBrandMentions).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numAfterBrandConversations).above(-1);
				expect(getCMCReportMetricsV2.numAfterCatConversations).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numAudience).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numBeforeBrandConversations).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numBeforeBrandMentions).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numBeforeCatConversations).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numCommentUGCPost).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numCompletedCampaignPost).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numDuringBrandConversations).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numDuringBrandMentions).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numDuringCatConversations).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numGroups).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numLeadsGenerated).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numPosts).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.totalCampaignPost).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.phaseMetrics).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numUGCPosts).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numReactionUGCPost).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numReactionAdminPost).to.be.not.null.and.not.to.be.undefined;
				expect(getCMCReportMetricsV2.numAfterCatConversations).above(-1);
				expect(getCMCReportMetricsV2.numAudience).above(-1);
				expect(getCMCReportMetricsV2.numBeforeBrandConversations).above(-1);
				expect(getCMCReportMetricsV2.numBeforeBrandMentions).above(-1);
				expect(getCMCReportMetricsV2.numBeforeCatConversations).above(-1);
				expect(getCMCReportMetricsV2.numCommentUGCPost).above(-1);
				expect(getCMCReportMetricsV2.numCompletedCampaignPost).above(-1);
				expect(getCMCReportMetricsV2.numDuringBrandConversations).above(-1);
				expect(getCMCReportMetricsV2.numDuringBrandMentions).above(-1);
				expect(getCMCReportMetricsV2.numDuringCatConversations).above(-1);
				expect(getCMCReportMetricsV2.numGroups).above(-1);
				expect(getCMCReportMetricsV2.numLeadsGenerated).above(-1);
				expect(getCMCReportMetricsV2.numPosts).above(-1);
				expect(getCMCReportMetricsV2.totalCampaignPost).above(-1);
				expect(getCMCReportMetricsV2.numUGCPosts).above(-1);
				expect(getCMCReportMetricsV2.numReactionUGCPost).above(-1);
				expect(getCMCReportMetricsV2.numReactionAdminPost).above(-1);
			});
		});
	});
});
