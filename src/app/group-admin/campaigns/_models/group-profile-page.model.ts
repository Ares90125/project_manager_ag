import {GroupProfileReview, OnboardingStageEnum, ProfilePublishStatusEnum} from '@sharedModule/models/graph-ql.model';

export class GroupProfilePageModel {
	id: string;
	name: string;
	profileUrl: string;
	createdAtUTC: string;
	updatedAtUTC: string;
	groupId: string;
	groupName: string;
	coverImageUrl: string;
	description: string;
	category: string;
	country: string;
	groupPrivacyType: string;
	fbGroupId: string;
	keyStats: {
		totalMembers: number;
		totalMembersJoinedLastWeek: number;
		monthlyConversations: number;
		engagementRate: number;
		activityRate: number;
	};
	featureConversations: {
		showConversation: boolean;
		topicName: string;
		screenShots: {
			title: string;
			screenShotUrl: string;
		}[];
	}[] = [];
	audienceInsightsSheetUID: string;
	stage?: OnboardingStageEnum;
	popularTopics: {
		showTopic: boolean;
		keyword: string;
	}[] = [];
	mostTalkedAboutBrands: {
		brandName: string;
		brandImageURL: string;
		isSelected: boolean;
		isCustomBrand: boolean;
		customBrandID: string;
	}[];
	admins: {
		userDisplayName: string;
		userProfileImageURL: string;
		userCountry: string;
		userProfileLink: string;
		userId: string;
		showUser: boolean;
	}[];
	influencers: {
		userDisplayName: string;
		userProfileImageURL: string;
		userCountry: string;
		userProfileLink: string;
		userId: string;
		showUser: boolean;
	}[];
	filesDetails: {
		fileType?: string;
		fileSize?: string;
		fileName: string;
		fileURL?: string;
		fileUUID?: string;
		fileThumbnailURL?: string;
		fileToBeUploaded?: any;
		updateToFileName?: string;
		isFileNameChanged?: boolean;
		isFileBeingDownloaded?: boolean;
	}[] = [];
	topCountries?: {
		name?: string;
		value?: number;
	}[];
	topCities?: {
		name?: string;
		value?: number;
	}[];
	ageMetrics?: {
		ageRange?: string;
		percentageMen?: number;
		percentageWomen?: number;
		percentageCustomGender?: number;
		male?: number;
		female?: number;
		others?: number;
	}[];
	reviews?: GroupProfileReview[];
	visibleReviews?: GroupProfileReview[];
	showReviews: boolean;
	showAdmins: boolean;
	showInfluencers: boolean;
	showMonthlyConversations?: boolean;
	showEngagementRate?: boolean;
	showActivityRate?: boolean;
	showPopularTopics?: boolean;
	showFeatureConversation?: boolean;
	showMostTalkedAboutBrands: boolean;
	showFiles: boolean;
	isPublished: boolean;
	showAudienceInsights?: boolean;
	showAgeAndGender?: boolean;
	showTopCountries?: boolean;
	showTopCities?: boolean;

	isSavingCoverImageNeeded: boolean;
	coverImageToBeSaved;

	isReviewsSectionPreferenceChanged?: boolean;
	isAdminsSectionPreferenceChanged: boolean;
	isInfluencersSectionPreferenceChanged: boolean;
	isOverviewSectionChanged: boolean;
	isKeyStatisticsSectionChanged: boolean;
	isPopularTopicsSectionChanged: boolean;
	isMostTalkedAboutBrandsSectionChanged: boolean;
	isFilesSectionChanged: boolean;
	publishedStatus?: ProfilePublishStatusEnum;
	isCustomCoverAdded: boolean;
	isSuccessAnimationNeeded: boolean;
	isDefaultProfile: boolean;
	createdByUserId: string;
	isAudienceInsightsSectionChanged: boolean;
	averageRating: number;
	ratingCount: number;
	totalRating: number;
	currentUserReview: GroupProfileReview;
	isCurrentUserAdmin: boolean;
	banners: {
		title: string;
		message: string;
		bannerColor: string;
		buttonColor: string;
		buttonText: string;
		bannerType: string;
		bannerBorder: string;
	};
}
