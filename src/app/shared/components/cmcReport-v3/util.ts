import {CMCReportMetricsV2} from '@sharedModule/models/graph-ql.model';

import {IUpdatedKPISection} from './kpis/kpis.component';

export function calculateKpiMetrics(report: CMCReportMetricsV2, brandName: string): IUpdatedKPISection['content'] {
	const beforeSovAsPercentage = convertAbsoluteToPercentage(JSON.parse(report?.beforeSOV || '{}'));
	const duringSovAsPercentage = convertAbsoluteToPercentage(JSON.parse(report?.duringSOV || '{}'));
	return {
		// Admin Posts
		numAdminPosts: report?.numAdminPosts || 0,
		numAdminPostsBefore: 0,
		numAdminPostsTarget: 0,
		numAdminPostsVisibleToBrand: false,

		// Category Conversations
		numBeforeCatConversations: report?.numBeforeCatConversations || 0,
		numDuringCatConversations: report?.numDuringCatConversations || 0,
		numTargetCatConversations: 0,
		categoryConversationVisibleToBrand: false,

		// Brand Mentions
		numDuringBrandMentions: report?.numDuringBrandMentions,
		numBeforeBrandMentions: report?.numBeforeBrandMentions,
		numTargetBrandMentions: 0,
		brandMentionsVisibleToBrand: false,

		// SOV
		brandPercentageBeforeSov: beforeSovAsPercentage[brandName] || 0,
		brandPercentageDuringSov: duringSovAsPercentage[brandName] || 0,
		brandPercentageTargetSov: 0,
		brandShareofVoiceVisibleToBrand: false,

		// Total UGC
		totalUGCVisibleToBrand: false,
		totalUGCTarget: 0,

		// UGC-Comments
		numUGCComments: report?.numCommentUGCPost || 0,
		numUGCCommentsBefore: 0,
		numUGCCommentsTarget: 0,
		numUGCCommentsVisibleToBrand: false,

		// UGC- New Posts
		numUGCPosts: report?.numUGCPosts,
		numUGCPostsBefore: 0,
		numUGCPostsTarget: 0,
		numUGCPostsVisibleToBrand: false,

		// Total Reaction and Comment
		totalReactionAndCommentVisibleToBrand: false,
		totalReactAnCommentTarget: 0,

		// Reaction and Comments: Admin Post
		numReactionAndCommentAdminPost: (report?.numReactionAdminPost || 0) + (report.numCommentAdminPost || 0),
		numReactionAndCommentAdminPostBefore: 0,
		numReactionAndCommentAdminPostTarget: 0,
		numReactionAndCommentAdminPostVisibleToBrand: false,

		// Reaction and Comments: UGC Post
		numReactionAndCommentUGCPost: (report?.numCommentUGCPost || 0) + (report?.numReactionUGCPost || 0),
		numReactionAndCommentUGCPostBefore: 0,
		numReactionAndCommentUGCPostTarget: 0,
		numReactionAndCommentUGCPostVisibleToBrand: false,

		// Estimated Impression
		estimateImpressionBeforeCampaign: 0,
		estimateImpressionDuringCampaign: calculateEstimateImpression(report),
		estimateImpressionTargetCampaign: 0,
		estimateImpressionVisibleToBrand: false,

		// Total Engagement
		totalEngagementBeforeCampaign: 0,
		totalEngagementDuringCampaign: calculateTotalEngagement(report),
		totalEngagementTargetCampaign: 0,
		totalEngagementVisibleToBrand: false
	};
}

function calculateEstimateImpression(report: CMCReportMetricsV2) {
	if (!report) {
		return 0;
	}
	const adminReactionAndComments = (report?.numReactionAdminPost || 0) + (report?.numCommentAdminPost || 0);
	const ugcReactionAnCommments = (report?.numCommentUGCPost || 0) + (report?.numReactionUGCPost || 0);
	const ugcPosts = report?.numUGCPosts || 0;
	const noOfUGCContent = ugcPosts + (report?.numCommentUGCPost || 0);
	return adminReactionAndComments + ugcReactionAnCommments + noOfUGCContent - (ugcPosts ? ugcPosts / 0.5 : 0);
}

function calculateTotalEngagement(report: CMCReportMetricsV2) {
	if (!report) {
		return 0;
	}
	const adminReactionAndComments = (report?.numReactionAdminPost || 0) + (report?.numCommentAdminPost || 0);
	const ugcReactionAnCommments = (report?.numCommentUGCPost || 0) + (report?.numReactionUGCPost || 0);

	const changeInCategoryConversation = Math.max(
		(report?.numDuringCatConversations || 0) - (report?.numBeforeCatConversations || 0),
		0
	);
	const changeInBrandMentions = (report?.numDuringBrandMentions || 0) - (report?.numBeforeBrandMentions || 0);
	const ugcPosts = report?.numUGCPosts || 0;
	return (
		adminReactionAndComments + ugcReactionAnCommments + changeInCategoryConversation + changeInBrandMentions + ugcPosts
	);
}

/**
 *
 * @description Convert the absolute value to percentage of each property in the given object.
 * The Percentage is based upon their own total. The Values are upto 2 decimal places
 */
export function convertAbsoluteToPercentage(data: {[key: string]: number}): {[key: string]: number} {
	const total = Object.values(data).reduce((a: number, b: number) => (a || 0) + (b || 0));
	const newDataAsPercentage = {};
	Object.keys(data).forEach(brand => {
		if (!data[brand]) {
			return (newDataAsPercentage[brand] = 0);
		}
		const percentage = (data[brand] / total) * 100;
		newDataAsPercentage[brand] = Math.round(percentage * 100) / 100;
	});
	return newDataAsPercentage;
}
