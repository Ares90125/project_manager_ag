import {CEPOnboardingStateEnum} from '@campaigns/_enums/CEP-onboarding-state.enum';
import {UserAcceptanceEnum} from '@groupAdminModule/_enums/user-acceptance.enum';
import {PostStatusEnum} from '@groupAdminModule/models/facebook-post.model';
import {campaignAssetsStatus} from '@sharedModule/enums/campaign-asset-status.enum';
import {Role} from '../enums/role.enum';
import {ICampaignModelProperty} from './campaign.model';
import {GroupModel} from './group.model';
import {PaymentStatusEnum} from '@sharedModule/enums/payment-status.enum';
import {CampaignCommunityStatusEnum} from '@sharedModule/enums/campaign-type.enum';

export class CreateUsersInput {
	cognitoId: string;
	userType?: string | null;
	email?: string | null;
	givenname?: string | null;
	familyname?: string | null;
	middlename?: string | null;
	fullname?: string | null;
	nickname?: string | null;
	username?: string | null;
	birthdate?: string | null;
	gender?: string | null;
	locale?: string | null;
	mobileNumber?: string | null;
	mobileDialCode?: string | null;
	mobileCountryCode?: string | null;
	profilePictureUrl?: string | null;
	timezoneOffsetInMins?: number | null;
	timezoneInfo?: string | null;
	timezoneName?: string | null;
	fbUserAccessToken?: string | null;
	fbUserId?: string | null;
	expiresAt?: string | null;
	loginMethod?: string | null;
	notificationPrefs?: string | null;
	Notificationclass?: string | null;
	typeformResponseId?: string | null;
	fcmTokens?: string[] | null;
	CEPOnboardingState?: string | null;
	adminBioContactEmail?: string | null;
	ownsGroupProfile?: boolean | null;
}

export class UpdateUserInput {
	cognitoId: string;
	userType?: string | null;
	givenname?: string | null;
	familyname?: string | null;
	middlename?: string | null;
	fullname?: string | null;
	nickname?: string | null;
	birthdate?: string | null;
	gender?: string | null;
	locale?: string | null;
	mobileNumber?: string | null;
	mobileDialCode?: string | null;
	mobileCountryCode?: string | null;
	profilePictureUrl?: string | null;
	timezoneOffsetInMins?: number | null;
	timezoneInfo?: string | null;
	timezoneName?: string | null;
	fbUserAccessToken?: string | null;
	fbUserId?: string | null;
	expiresAt?: string | null;
	loginMethod?: string | null;
	notificationPrefs?: string | null;
	Notificationclass?: string | null;
	personaSurvey?: string | null;
	typeformResponseId?: string | null;
	lastLoggedInAtUTC?: string | null;
	whatsappSubscriptionStatus?: string | null;
	productDemoedAtDate?: string | null;
	joinedCSGroupAtDate?: string | null;
	monetizationWorkshopAttendedAtDate?: string | null;
	receiveNotifications?: boolean | null;
	receiveWANotifications?: boolean | null;
	receiveEmailNotifications?: boolean | null;
	hasAccessToReportGenerationFeature?: boolean | null;
	landbotCustomerId?: number | null;
	fcmTokens?: string[] | null;
	mobileNumberMasked?: string | null;
	CEPOnboardingState?: CEPOnboardingStateEnum | null;
	campaignUpdatesSubscribed?: string | null;
	adminBioContactEmail?: string | null;
	adminBioContactPhoneNumber?: string | null;
	sendAdminBioNotificationCampaign?: boolean | null;
	ownsGroupProfile?: boolean | null;
}

export class UpdateGroupInput {
	id: string = null;
	name?: string | null = null;
	description?: string | null = null;
	coverImageUrl?: string | null = null;
	coverImageOffsetX?: number | null = null;
	coverImageOffsetY?: number | null = null;
	iconUrl?: string | null = null;
	email?: string | null = null;
	groupType?: string | null = null;
	groupCategories?: string | null = null;
	groupSubCategories?: string | null = null;
	languages?: string | null = null;
	countries?: string | null = null;
	cities?: string | null = null;
	gender?: string | null = null;
	privacy?: string | null = null;
	targetType?: string | null = null;
	memberCount?: number | null = null;
	initiateInstallation?: boolean | null = null;
	initiateUninstallation?: boolean | null = null;
	groupCreatedAtUTC?: string | null = null;
	targetAudienceGender?: string | null = null;
	businessCategory?: string | null = null;
	country?: string | null = null;
	countryFromUTM?: string | null = null;
	recheckIfCSAppIsInstalledUsingUserId?: string | null = null;
	isDead?: boolean | null = null;
	facebookInsightsFileDetails?: FacebookInsightsDetails | null = null;
	noOfProfilePagesCreated?: number | null;
	defaultCommunityManager?: string | null = null;

	constructor(group: GroupModel | UpdateGroupInput) {
		Object.keys(group).forEach(key => {
			if (this.hasOwnProperty(key)) {
				this[key] = group[key];
			}
		});
	}
}

export class ResponseObject {
	__typename: 'ResponseObject';
	status: string | null;
}

export class Conversation {
	__typename: 'Conversation';
	id: string | null;
	recordid: string | null;
	fbgroupid: string | null;
	groupid: string | null;
	sourceId: string | null;
	parentSourceId: string | null;
	groupname: string | null;
	contentType: string | null;
	nrcsentimentpositive: number | null;
	nrcsentimentnegative: number | null;
	sentimentrscore: number | null;
	nrcsentimentneutral: string | null;
	sentimentrvalue: string | null;
	nrcanger: number | null;
	nrcanticipation: number | null;
	nrcjoy: number | null;
	nrcsadness: number | null;
	nrcdisgust: number | null;
	nrcsurprise: number | null;
	nrctrust: number | null;
	nrcfear: number | null;
	purchaseintent: string | null;
	recomendationtype: string | null;
	rawText: string;
	createdatutc: string | null;
	updatedatutc: string | null;
	createdatutcmonth: number | null;
	createdatutcweek: number | null;
	createdatutcday: number | null;
	createdatutchour: number | null;
	recordedatutc: string | null;
	groupType: string | null;
	tokens: string | null;
	createdatutcyear: number | null;
	actionTaken: string | null;
	photourl: string | null;
	videothumbnailurl: string | null;
	postedbyname: string | null;
	createdbyuser: string | null;
}

export class ListGroupKeywordMetricsByGroupIdQuery {
	__typename: 'GroupKeywordMetricsConnection';
	items: Array<{
		__typename: 'GroupKeywordMetrics';
		groupId: string;
		metricForDayUTCStartTick: number;
		viewName: string | null;
		createdAtUTC: string | null;
		updatedAtUTC: string | null;
		top10Tokens: string | null;
		top10Keywords: string | null;
		categories: string | null;
		numWeekOfMonth: number | null;
		metricForDayUTCYear: number | null;
		metricForDayUTCMonth: number | null;
		metricForDayUTCDay: number | null;
		metricForHourUTCHour: number | null;
		top10Bigrams: string | null;
	} | null> | null;
	nextToken: string | null;
}

export class TableStringFilterInput {
	contains?: string | null;
}

export class TableGroupsFilterInput {
	groupType?: TableStringFilterInput | null;
	targetType?: TableStringFilterInput | null;
	groupCategories?: TableStringFilterInput | null;
	groupSubCategories?: TableStringFilterInput | null;
	or?: Array<TableGroupsFilterInput | null> | null;
	and?: Array<TableGroupsFilterInput | null> | null;
}

export class GetBrandsByUserIdQuery {
	__typename: 'Brand';
	items: Array<{
		id: string;
		createdAtUTC: string | null;
		updatedAtUTC: string | null;
		name: string | null;
		description: string | null;
		iconUrl: string | null;
		status: string | null;
	} | null> | null;
	nextToken: string | null;
}

export class SaveAcqusitionQuery {
	error: string | null;
	message: string | null;
}

export class ListCampaignGroupsQuery {
	__typename: 'CampaignGroupConnection';
	items: Array<{
		groupInstallationStartedAtUTC;
		__typename: 'CampaignGroup';
		campaignId: string;
		groupId: string;
		id: string | null;
		createdAtUTC: string | null;
		groupName: string | null;
		updatedAtUTC: string | null;
		memberCount: number | null;
		memberEngagementRateUTC: number | null;
		postsEngagementRateLastNinetyDays: number | null;
		campaignPostEngagementRateLastNinetyDays: number | null;
		postEngagementRateUTC: number | null;
		weeklyConversationalVolume: number | null;
		businessCategory: string;
		state: string;
		groupTaskStatus: string;
		totalKeywordMentions: number | null;
		totalHashtagMentions: number | null;
		totalBrandMentions: number | null;
		iconUrl: string | null;
		fbGroupId: string | null;
		topTenCities: string | null;
		categoryDensity: string | null;
		location: string | null;
		communityManagerId: string | null;
		communityAdminName: string | null;
		communityAdminId: string | null;
		postType: PostContentTypeEnum;
		isAcceptedByCommunityAdmin: boolean | null;
		cohort: string | null;
		metadata: string | null;
		assetsKpis: {
			campaignAssetsApproved: number;
			campaignAssetsApprovedAll: boolean;
			campaignAssetsDeclined: number;
			campaignAssetsHasDeclined: boolean;
			campaignAssetsHasPending: boolean;
			campaignAssetsInitial: boolean;
			campaignAssetsPending: number;
			campaignAssetsStatus: campaignAssetsStatus;
		};
	} | null> | null;
	nextToken: string | null;
}

export class CampaignGroupAndTaskDetails {
	campaignId: string | null;
	groupId: string | null;
	id: string | null;
	groupName: string | null;
	memberCount: number | null;
	memberEngagementRateUTC: number | null;
	postEngagementRateUTC: number | null;
	businessCategory: string | null;
	state: string | null;
	groupInstallationStartedAtUTC: string | null;
	totalKeywordMentions: number | null;
	totalHashtagMentions: number | null;
	totalBrandMentions: number | null;
	iconUrl: string | null;
	campaignPostEngagementRateLastNinetyDays: number | null;
	postsEngagementRateLastNinetyDays: number | null;
	categoryDensity: number | null;
	fbGroupId: string | null;
	topTenCities: string | null;
	location: string | null;
	averageTopPostsReach: number | null;
	communityAdminId: string | null;
	communityAdminName: string | null;
	communityAdminContact: string | null;
	communityManagerId: string | null;
	pricing: number | null;
	currency: string | null;
	timezone: String;
	defaultTaskDate: string | null;
	modeOfCommunication: string | null;
	modeOfCommunicationVerificationStatus: VerificationStatusEnum;
	paymentStatus: PaymentStatusEnum;
	paymentRemarks: string | null;
	isPaymentInfoAvailable: Boolean;
	groupTaskStatus: CampaignCommunityStatusEnum;
	postType: PostContentTypeEnum;
	campaignGroupTaskId: string | null;
	isAcceptedByCommunityAdmin: Boolean;
	cohort: string | null;
	metadata: string | null;
	taskId: string | null;
	userId: string | null;
	userName: string | null;
	status: TaskStatusEnum;
	title: string | null;
	toBePerformedByUTC: string | null;
	type: TaskTypeEnum;
	text: string | null;
	imageUrls: [string];
	videoUrls: [string];
	linkUrls: [string];
	period: string | null;
	reasonForFailure: string | null;
	fbPermLink: boolean | null;
	isPlaceholder: boolean | null;
	errorFromSource: string | null;
	timezoneName: string | null;
	assetsKpis: {
		campaignAssetsApproved: number;
		campaignAssetsApprovedAll: boolean;
		campaignAssetsDeclined: number;
		campaignAssetsHasDeclined: boolean;
		campaignAssetsHasPending: boolean;
		campaignAssetsInitial: boolean;
		campaignAssetsPending: number;
		campaignAssetsStatus: campaignAssetsStatus;
	};
}

export class UserCampaignGroup {
	campaignId: string;
	groupId: string;
	groupName: string;
	brandName: string;
	pricing: number;
	currency: String;
	groupTaskStatus: string;
	campaignName: string;
	status: string;
	startDateAtUTC: string;
	endDateAtUTC: string;
	primaryObjective: string;
	campaignBriefForCommunityAdmin: string;
	toBePerformedAtUTC: string;
	isAcceptedByCommunityAdmin: boolean;
}

export class CreateCampaignTaskInput {
	brandId: string;
	campaignId: string;
	userId: string;
	userName: string;
	groupId: string;
	groupName: string;
	title: string;
	toBePerformedByUTC: string;
	type: TaskTypeEnum;
	postType: PostContentTypeEnum;
	text?: string | null;
	description?: string | null;
	mediaAllowed?: string | null;
	imageUrls?: Array<string | null> | null;
	videoUrls?: Array<string | null> | null;
	linkUrls?: Array<string | null> | null;
	isPlaceholder: boolean | null;
	timezoneName: string | null;
	communityManagerId: string | null;
	communityManagerName: string | null;
	pricing: number | null;
	currency: string | null;
}

export class CreateCMCCampaignGroupsInput {
	campaignId: string;
	groupId: string;
	fbGroupId: string;
	memberCount: string;
	engagementRate: string | null;
	activityRate: string | null;
	categoryConversationCount: number | null;
	topTenCities: string | null;
	categoryDensity: string | null;
	location: string | null;
	postType: PostContentTypeEnum;
	paymentDate: string | Date;
	paymentRemarks: string;
	paymentStatus: PaymentStatusEnum;
}

export class UpdateCampaignGroupInput {
	campaignId: string;
	groupId: string;
}

export class UpdateCampaignGroupSubscriptionsInputInternal {
	campaignId: string;
	groupId: string;
	groupTaskStatus: string;
	isAcceptedByCommunityAdmin: string;
}

export class UpdateCampaignGroupModeOfCommunicationInput {
	campaignId: string;
	groupId: string;
	communityAdminId: string;
	modeOfCommunication: string;
}

export class CreateCampaignPostInput {
	campaignId: string;
	sourceId: string;
	fbPermlink: string;
	groupName: string;
	postCreatedAtUTC: string;
	postCreatedByName: string;
	postRawText: string;
	postPhotoUrl: string;
}

export class UpdateCampaignPostInput {
	campaignId: string;
	sourceId: string;
	fbPermlink: string;
	groupName: string;
	reactionCount: number | null;
	commentCount: number | null;
	postCreatedAtUTC: string;
	postCreatedByName: string;
	postRawText: string;
	postPhotoUrl: string;
}

export enum TaskTypeEnum {
	Post = 'Post',
	Mention = 'Mention',
	LiveVideo = 'LiveVideo',
	Poll = 'Poll'
}

export enum scheduleTypeEnum {
	Adhoc = 'Adhoc',
	Recommendation = 'Recommendation',
	CommunityMarketing = 'CommunityMarketing'
}

export class UpdateBrandInput {
	id: string;
	status: string;
}

export class CreateCampaignInput {
	brandId: string;
	brandName: string;
	brandLogoURL: string;
	campaignName: string;
	details?: string | null;
	startDateAtUTC?: string | null;
	endDateAtUTC?: string | null;
	status?: CampaignStatusEnum | null;
	type?: CampaignTypeEnum | null;
	proposalEmails: Array<string | null>;
	objective?: string | null;
	keywords?: Array<string | null> | null;
	keywordBrand?: string | null;
	keywordCategory?: string | null;
	campaignSummary?: string | null;
	cmcReportName?: string | null;
	keywordSubCategories?: Array<string | null> | null;
	taskTitle: string | null;
	campaignPeriod: string | null;
	defaultTaskDate: string | null;
	KPIs: Array<string | null> | null;
	primaryObjective: string | null;
	secondaryObjective: string | null;
	cmcType: string | null;
	timezoneName: string | null;
	s3CoverImageUrl: string | null;
	cmcReportVersion: number | null;
	defaultPostContentType: string | null;
	typeformId: string | null;
	phaseIdea: string;
	currentPhase?: string;
	totalPhase?: string;
	currency?: ICampaignModelProperty['currency'];
	communicationChannel?: ICampaignModelProperty['communicationChannel'];
	keywordsExcluded?: string[];
	productPurchaseInfo: string | null;
	productPurchaseRequired: boolean | null;
	trainingLinkMessage: string | null;
}

export class CreateSelfMonetizationCampaignInput {
	campaignName: string;
	startDateAtUTC?: string | null;
	endDateAtUTC?: string | null;
	groupIds: Array<string | null> | null;
	brandKeywords: Array<string | null> | null;
	customKeywords: Array<string | null> | null;
	hashtags: Array<string | null> | null;
	campaignSummary: string;
}

export class UpdateSelfMonetizationCampaignInput {
	campaignId: string;
	campaignName: string;
	startDateAtUTC?: string | null;
	endDateAtUTC?: string | null;
	groupIds: Array<string | null> | null;
	brandKeywords: Array<string | null> | null;
	customKeywords: Array<string | null> | null;
	hashtags: Array<string | null> | null;
	campaignSummary: string;
}

export class CreateListeningCampaignInput {
	brandId: string;
	campaignName: string;
	startDateAtUTC: string;
	endDateAtUTC: string;
	details: string;
	objective: string;
	groupIds: Array<string | null>;
	brandName: string;
	keywordBrand: string;
	keywordCategory: string;
	status?: CampaignStatusEnum | null;
	keywordSubCategories: Array<string | null> | null;
}

export class UpdateCampaignInput {
	brandId: string;
	campaignId: string;
	campaignName: string;
	startDateAtUTC?: string | null;
	endDateAtUTC?: string | null;
	status?: CampaignStatusEnum | null;
	details?: string | null;
	objective?: string | null;
	keywords?: Array<string | null> | null;
	keywordsExcluded?: string[];
	proposalEmails?: Array<string | null> | null;
	brandName?: string | null;
	keywordBrand?: string | null;
	keywordCategory?: string | null;
	keywordSubCategories?: Array<string | null> | null;
	campaignSummary?: string | null;
	cmcReportName?: string | null;
	s3ReportUrl?: string | null;
	taskTitle: string | null;
	campaignPeriod: string | null;
	timezoneName: string | null;
	campaignBriefForCommunityAdmin: string | null;
	s3CoverImageUrl: string | null;
	cmcReportVersion: string | null;
	defaultPostContentType: string | null;
	typeformId: string | null;
	phaseIdea: string;
	currentPhase?: string;
	totalPhase?: string;
	currency?: ICampaignModelProperty['currency'];
	communicationChannel?: ICampaignModelProperty['communicationChannel'];
	keyFindings?: string;
	brandObjective?: string;
	phaseIdeaSupportingText?: string;
	keyFindingsSupportingText?: string;
	resultsSupportingText?: string;
	kpiSupportingText?: string;
	brandShareOfVoiceSupportingText?: string;
	brandSentimentSupportingText?: string;
	wordCloudSupportingText?: string;
	engagementInsightSupportingText?: string;
	topPerformingPostSupportingText?: string;
	productPurchaseInfo: string | null;
	productPurchaseRequired: boolean | null;
	trainingLinkMessage: string | null;
	assetsTextRequired?: boolean | null;
	assetsImagesRequired?: number | null;
	assetsVideoRequired?: boolean | null;
}

export class triggerNotificationsForWAorEmailUpdateInput {
	brandId: string;
	campaignId: string;
	campaignName: string;
	startDateAtUTC?: string | null;
	endDateAtUTC?: string | null;
	status?: CampaignStatusEnum | null;
	details?: string | null;
	objective?: string | null;
	keywords?: Array<string | null> | null;
	proposalEmails?: Array<string | null> | null;
	brandName?: string | null;
	keywordBrand?: string | null;
	keywordCategory?: string | null;
	keywordSubCategories?: Array<string | null> | null;
	campaignSummary?: string | null;
	cmcReportName?: string | null;
	s3ReportUrl?: string | null;
	taskTitle: string | null;
	campaignPeriod: string | null;
	timezoneName: string | null;
	campaignBriefForCommunityAdmin: string | null;
	s3CoverImageUrl: string | null;
	cmcReportVersion: string | null;
	defaultPostContentType: string | null;
}

export class subscribeToWhatsappInput {
	landbotCustomerId: string | null;
	phone: string | null;
	dialCode: string | null;
	countryCode: string | null;
	isEdited: boolean | null;
	defaultPostContentType: string | null;
}

export class UpdateListeningCampaignInput {
	brandId: string;
	campaignId: string;
	campaignName: string;
	startDateAtUTC: string;
	endDateAtUTC: string;
	details: string;
	objective: string;
	groupIds: Array<string | null>;
	brandName: string;
	keywordBrand: string;
	keywordCategory: string;
	status?: CampaignStatusEnum | null;
	keywordSubCategories: Array<string | null> | null;
}

export class CampaignTasksConnection {
	__typename: 'CampaignTaskConnection';
	items: Array<CampaignTask | null> | null;
	nextToken: string | null;
}

export class CampaignTask {
	__typename: 'CampaignTask';
	campaignId: string;
	taskId: string;
	userId: string;
	userName: string;
	groupId: string;
	status: TaskStatusEnum | null;
	groupName: string | null;
	title: string | null;
	toBePerformedByUTC: string;
	type: TaskTypeEnum;
	postType: PostContentTypeEnum | null;
	description: string | null;
	text: string | null;
	mediaAllowed: string | null;
	imageUrls: Array<string | null> | null;
	videoUrls: Array<string | null> | null;
	linkUrls: Array<string | null> | null;
	createdAtUTC: string;
	updatedAtUTC: string;
	period: string | null;
	reasonForFailure: string | null;
	fbPermlink: string | null;
	isPlaceholder: boolean | null;
	errorFromSource: string | null;
	timezoneName: string | null;
	communityManagerId: string | null;
	communityManagerName: string | null;
	pricing: number | null;
	currency: string | null;
	idDraft: boolean | null;
}

export class CampaignReportWithPosts {
	__typename: 'CampaignReportWithPosts';
	campaignReport: CampaignReport;
	campaignPosts: CampaignPostsConnection;
}

export class CampaignPostsConnection {
	__typename: 'CampaignPostConnection';
	items: Array<CampaignPost | null> | null;
	nextToken: string | null;
}

export class CampaignPost {
	id: string;
	campaignId: string;
	sourceId: string;
	fbPermlink: string | null;
	reactionCount: number | null;
	commentCount: number | null;
	createdAtUTC: string;
	updatedAtUTC: string;
	groupName: string;
	postCreatedAtUTC: string;
	postCreatedByName: string;
	postRawText: string;
	postPhotoUrl: string;
}

export class CampaignReport {
	campaignId: string;
	numGroups: number;
	numCampaignPosts: number;
	numOrganicPosts: number;
	numConversations: number;
	numBrandConversations: number;
	totalReactions: number;
	totalComments: number;
	campaignHighlights: Array<string | null> | null;
	groupEngagementDetais: string;
	participantGroupsDetais: string;
	beforeKeywordCount: string;
	afterKeywordCount: string;
	beforeBrandMentions: string;
	afterBrandMentions: string;
	beforeBrandConversations: number;
	afterBrandConversations: number;
	lastScreenshotTime: string | null;
}

export class CMCampaignGroups {
	__typename: 'CMCampaignGroups';
	campaignId: string;
	groupId: string;
	fbGroupId: string;
	id: string;
	createdAtUTC: string;
	updatedAtUTC: string;
	memberCount: string;
	engagementRate: string | null;
	activityRate: string | null;
	categoryConversationCount: number | null;
	topTenCities: string | null;
	categoryDensity: string | null;
	location: string | null;
	groupTaskStatus: string | null;
	campaignGroupTaskId: string | null;
}

export class UpcomingUserCampaign {
	campaignName: string;
	brandName: string | null;
	brandLogoURL: string | null;
	campaignId: string;
	startDateAtUTC: string | null;
	endDateAtUTC: string | null;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	status: UserAcceptanceEnum | null;
	acceptanceStatusByCommunityAdmin: UserAcceptanceEnum | null;
	details: string | null;
	campaignBriefForCommunityAdmin: string | null;
	objective: string | null;
	primaryObjective: string | null;
	campaignTasks: CampaignTask[];
	isDeleted: boolean;
}

export class Campaign {
	__typename: 'Campaign';
	brandid: string;
	campaignName: string;
	numConversationsListenedInLastThreeMonths: string | null;
	campaignId: string | null;
	startDateAtUTC: string | null;
	endDateAtUTC: string | null;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	status: CampaignStatusEnum | null;
	type: CampaignTypeEnum | null;
	details: string | null;
	brief: string | null;
	objective: string | null;
	keywords: Array<string | null> | null;
	proposalEmails: Array<string | null> | null;
	brandName: string | null;
	keywordBrand: string | null;
	keywordCategory: string | null;
	keywordSubCategories?: Array<string | null> | null;
	campaignSummary: string | null;
	cmcReportName: string | null;
	groupIds: Array<string | null> | null;
	s3ReportUrl?: string | null;
	campaignPeriod: string | null;
	taskTitle: string | null;
	defaultTaskDate: string | null;
	KPIs: Array<string | null> | null;
	primaryObjective: string | null;
	secondaryObjective: string | null;
	cmcType: Array<string | null> | null;
	timezoneName: string | null;
	s3CoverImageUrl: string | null;
	cmcReportVersion: string | null;
	defaultPostContentType: string | null;
	typeformId: string | null;
	productPurchaseInfo: string | null;
	productPurchaseRequired: boolean | null;
	trainingLinkMessage: string | null;
}

export class SelfMonetizationCampaignConnection {
	_typename: 'CampaignConnection';
	items: Array<SelfMonetizationCampaign | null> | null;
	nextToken: string | null;
}

export class SelfMonetizationCampaign {
	__typename: 'Campaign';
	campaignId: string | null;
	campaignName: string | null;
	startDateAtUTC: string | null;
	endDateAtUTC: string | null;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	brandKeywords: Array<string | null> | null;
	customKeywords: Array<string | null> | null;
	hashtags: Array<string | null> | null;
	campaignSummary: string | null;
	groupIds: Array<string | null> | null;
	isReportAvailable: boolean;
}

export class ListeningCampaign {
	__typename: 'Campaign';
	brandId: string;
	campaignId: string;
	campaignName: string;
	startDateAtUTC: string;
	endDateAtUTC: string;
	details: string;
	objective: string;
	groupIds: Array<string | null>;
	brandName: string;
	keywordBrand: string;
	keywordCategory: string;
	status?: CampaignStatusEnum | null;
	keywordSubCategories: Array<string | null> | null;
}

export class CreateInsightViewsInput {
	__typename: 'InsightViews';
	campaignId: string;
	brand: string;
	category: string;
	subCategory: Array<string | null> | null;
	keywords: string;
	adhocKeywords: string;
	keywordBrand: string;
	createdAtUTC: string | null;
}

export class ListeningCampaignInsightViewsQuery {
	__typename: 'InsightViewsConnection';
	items: Array<{
		campaignId: string;
		viewName: string;
	} | null> | null;
}

export class CampaignConnection {
	__typename: 'CampaignConnection';
	items: Array<Campaign | null> | null;
	nextToken: string | null;
}

export class CampaignAssetItem {
	assignedContentUserId: string | null;
	id: string;
	rejectReason: string | null;
	status: string;
	type?: 'image' | 'text' | 'video' | 'address';
	value: string;
	updatedAtInSeconds?: number;
	updatedByContentTeam?: boolean;
}

export class CampaignAsset {
	brandId: string;
	brandName: string;
	campaignId: string;
	campaignName: string;
	communityAdminName: string;
	groupId: string;
	groupName: string;
	items: CampaignAssetItem[];
	rating: number;
	status: string;
}

export class UpdateAssetInput {
	id: string;
	status: string;
	value: string;
	rejectReason?: string;
	assignedContentUserId?: string;
}

export class CreateAssetInput {
	type: string;
	status: string;
	value: string;
	rejectReason?: string;
	assignedContentUserId?: string;
}

export class CMCNotificationInput {
	userId: string;
	timestamp: number;
	count: number;
	campaignId?: string;
	type: 'asset' | 'support';
}

export class CMCNotification {
	assetItemId: string;
	brandId: string;
	campaignId: string;
	groupId: string;
	id: string;
	message: string;
	read: boolean;
	senderUserId: string;
	timestamp: number;
	userId: string;
}

export class CampaignGroupAssetKPIs {
	assetsApproved: number;
	assetsDeclined: number;
	assetsPending: number;
	campaignAccepted: number;
	campaignPending: number;
	campaignRejected: number;
	campaignProductRequired: number;
	campaignTaskCreated: number;
	groupAssetsApproved: number;
	campaignTotal: number;
	groupAssetsPartial: number;
	groupAssetsRequireDeclined: number;
	groupAssetsRequireInitial: number;
	groupAssetsRequireReview: number;
	campaignCMCRatingAvg: number;
}

export class PutGroupProfileReviewTypeInput {
	groupProfileId: string;
	isDisabled?: boolean;
	rating: number;
	reviewText: string;
	reviewUserId?: string;
}
export class PutGroupReviewTypeInput {
	groupId: string;
	isDisabled?: boolean;
	rating?: number;
	reviewText: string;
	reviewUserId?: string;
}

export class GroupProfileReview {
	fullname?: string;
	groupProfileId: string;
	isDeleted: boolean;
	isDisabled?: boolean;
	profilePictureUrl: string;
	rating: number;
	reviewText: string;
	timestamp: string;
	userId: string;
}

export class getGroupProfileReviewsResponse {
	averageRating: number | null;
	ratingCount: number | null;
	totalRating: number | null;
	reviews: GroupProfileReview[];
}

export class getGroupReviewsResponse {
	averageRating: number | null;
	ratingCount: number | null;
	totalRating: number | null;
	reviews: GroupProfileReview[];
}

export class ListInsightViewsQuery {
	__typename: 'InsightViewsConnection';
	items: Array<{
		__typename: 'InsightViews';
		campaignId: string;
		viewName: string;
		id: string | null;
		lastRunAtUTC: string | null;
		createdAtUTC: string | null;
		updatedAtUTC: string | null;
		keywords: string | null;
		adhocKeywords: string | null;
		startDateAtUTC: string | null;
		endDateAtUTC: string | null;
		level: string | null;
		keywordBrand: string | null;
		dateRangeSelectors: string | null;
	} | null> | null;
	nextToken: string | null;
}

export class ListGroupMetricsByGroupIdQuery {
	__typename: 'GroupMetricsConnection';
	items: Array<{
		__typename: 'GroupMetrics';
		id: string;
		createdAtUTC: string;
		updatedAtUTC: string;
		groupId: string;
		metricForHourUTC: string;
		metricForHourUTCStartTick: number;
		metricForHourUTCHour: number;
		metricForHourUTCDay: number;
		metricForHourUTCWeek: number;
		metricForHourUTCMonth: number;
		metricForHourUTCYear: number;
		numComments: number | null;
		numPosts: number | null;
		numCommentsPerPost: number | null;
		numReactions: number | null;
		numShares: number | null;
		numTextPosts: number | null;
		numVideoPosts: number | null;
		numPhotoPosts: number | null;
		numLinkPosts: number | null;
		numEventPosts: number | null;
		memberCount: number | null;
		memberRequestCount: number | null;
		numCommentsOnVideoPosts: number | null;
		numCommentsOnPhotoPosts: number | null;
		numCommentsOnLinkPosts: number | null;
		numCommentsOnEventPosts: number | null;
		numCommentsOnTextPosts: number | null;
		numReactionsOnTextPosts: number | null;
		numReactionsOnVideoPosts: number | null;
		numReactionsOnPhotoPosts: number | null;
		numReactionsOnLinkPosts: number | null;
		numReactionsOnEventPosts: number | null;
		numSharesOnTextPosts: number | null;
		numSharesOnVideoPosts: number | null;
		numSharesOnPhotoPosts: number | null;
		numSharesOnLinkPosts: number | null;
		numSharesOnEventPosts: number | null;
		numWeekOfMonth: number | null;
	} | null> | null;
	nextToken: string | null;
}

export class ListInsightViewMetricsByInsightViewIdQuery {
	__typename: 'InsightViewMetricsInternalConnection';
	items: Array<InsightViewMetricsInternal | null> | null;
	nextToken: string | null;
}

export class Users {
	__typename: 'Users';
	cognitoId: string;
	id: string;
	userType: string;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	email: string | null;
	givenname: string | null;
	familyname: string | null;
	middlename: string | null;
	fullname: string | null;
	nickname: string | null;
	username: string | null;
	birthdate: string | null;
	gender: string | null;
	locale: string | null;
	mobileNumber: string | null;
	mobileDialCode?: string | null;
	mobileCountryCode?: string | null;
	profilePictureUrl: string | null;
	timezoneOffsetInMins: number | null;
	timezoneInfo: string | null;
	timezoneName: string | null;
	fbUserAccessToken: string | null;
	fbUserId: string | null;
	expiresAt: string | null;
	loginMethod: string;
	notificationPrefs: string | null;
	personaSurvey: string | null;
	emailVerificationStatus: VerificationStatusEnum | null;
	typeformResponseId: string | null;
	csAdminTeam: string | null;
	fcmTokens: string[] | null;
	mobileNumberMasked?: string | null;
	modeOfCommunicationUpdatedBy?: string | null;
}

export class GroupsConnection {
	__typename: 'GroupsConnection';
	items: Array<Group | null> | null;
	nextToken: string | null;
}

export class GroupMetricsDaily {
	__typename: 'GroupMetricsDaily';
	memberCount: number;
	totalComments: number;
	totalPosts: number;
	totalReactions: number;
	changeInCommentsReactionsPercentageCount: number;
	changeInPostsPercentageCount: number;
	positiveCommentsReactionsChange: boolean;
	positivePostsChange: boolean;
}

export class Notifications {
	__typename: 'Notifications';
	createdAtUTC: string;
	forUserId: string;
	id: string | null;
	status: string | null;
	inAppTitle: string | null;
	type: string | null;
	viewedAtUTC: string | null;
	createdAtUTCTick: string | null;
	channelsToSkip: [string] | null;
}

export class UpdateNotificationsInput {
	createdAtUTCTick: string;
	forUserId: string;
	viewedAtUTC?: string | null;
}

export class GroupNotificationPreference {
	groupId: string;
	receiveWANotifications: boolean;
	receiveEmailNotifications: boolean;
}

export class GetNotificationsQuery {
	__typename: 'NotificationsConnection';
	items: Array<Notifications | null> | null;
	nextToken: string | null;
}

export class Group {
	__typename: 'Groups';
	id: string;
	createdAtUTC: string;
	updatedAtUTC: string;
	fbGroupId: string | null;
	name: string | null;
	description: string | null;
	coverImageUrl: string | null;
	coverImageOffsetX: number | null;
	coverImageOffsetY: number | null;
	iconUrl: string | null;
	email: string | null;
	groupType: string | null;
	groupCategories: string | null;
	groupSubCategories: string | null;
	languages: string | null;
	countries: string | null;
	cities: string | null;
	gender: string | null;
	privacy: string | null;
	memberCount: number | null;
	state: string | null;
	initiateInstallation: boolean | null;
	initiateUninstallation: boolean | null;
	groupCreatedAtUTC: string | null;
	businessCategory?: string | null;
	country?: string | null;
	countryFromUTM?: string | null;
	targetType: string | null;
	targetAudienceGender: string | null;
	metricsAvailableSinceUTC: string | null;
	metricsAvailableUntilUTC: string | null;
	dataAvailableSinceUTC: string | null;
	dataAvailableUntilUTC: string | null;
	role: string | null;
	areMetricsAvailable: boolean;
	groupTimezoneName?: string | null;
	groupTimezoneInfo?: string | null;
	isDead?: boolean | null;
	isOverviewDataAvailable?: boolean | null;
	receiveWANotifications?: boolean | null;
	receiveEmailNotifications?: boolean | null;
	percentageLast3DaysMetricsAvailable?: number | null;
	facebookInsightsFileDetails?: FacebookInsightsDetails | null;
	noOfProfilePagesCreated: string | null;
	isMonetized?: string | null;
	isAdminTokenAvailable?: string | null;
}

export class FacebookInsightsDetails {
	fileName: string;
	sheetUID: string;
	fileStatus: FacebookInsightsFileStatus;
	fileUploadedAtUTC: string;
}

export enum FacebookInsightsFileStatus {
	Valid = 'Valid',
	Expired = 'Expired',
	Invalid = 'Invalid',
	UploadPending = 'UploadPending',
	Processing = 'Processing'
}

export class ListKeywordTrackerMetricQuery {
	__typename: 'KeywordTrackerMetricConnection';
	items: Array<{
		__typename: 'KeywordTrackerMetric';
		metricForHourUTCStartTick: number;
		reportId: string;
		numOfOccurances: number | null;
		metricForHourUTCDay: number | null;
		metricForHourUTCMonth: number | null;
		metricForHourUTCYear: number | null;
		metricForHourUTCHour: number | null;
		metricForHourUTCWeek: number | null;
		numWeekOfMonth: number | null;
		createdAtUTC: string | null;
		updatedAtUTC: string | null;
		id: string | null;
	}> | null;
	nextToken: string | null;
}

export class KeywordTrackerReport {
	__typename: 'KeywordTrackerReport';
	name: string;
	displayName: string;
	ownerId: string;
	id: string | null;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	keywords: string | null;
	numOfOccurances: number | null;
	numOfRemovedComments: number | null;
	numOfActionRequired: number | null;
	numOfReported: number | null;
	numOfTurnedOffCommenting: number | null;
	numOfMutedMembers: number | null;
	numOfHiddenComments: number | null;
	numOfRemovedMembers: number | null;
	numOfRemovedPost: number | null;
	numOfBlockedUser: number | null;
	numOfIgnored: number | null;
	reportLevel: string | null;
}

export class UpdateKeywordTrackerReportInput {
	name: string;
	displayName: string;
	ownerId: string;
	id?: string | null;
	createdAtUTC?: string | null;
	updatedAtUTC?: string | null;
	keywords?: string | null;
	numOfOccurances?: number | null;
	numOfRemovedComments?: number | null;
	numOfActionRequired?: number | null;
	numOfReported?: number | null;
	numOfTurnedOffCommenting?: number | null;
	numOfMutedMembers?: number | null;
	numOfHiddenComments?: number | null;
	numOfRemovedMembers?: number | null;
	numOfRemovedPost?: number | null;
	numOfBlockedUser?: number | null;
	numOfIgnored?: number | null;
	reportLevel?: string | null;
}
export class cmcTaskFilters {
	type: [string | null];
	state: [string | null];
	search: string | null;
}

export class communityDiscoveryInput {
	searchTerm: string;
}

export class CommunityDiscoveryFiltersResponse {
	businessCategories: Array<string | null> | null;
	countries: Array<string | null> | null;
	maxMemberCount: number | null;
	maxPostsEngagementRateLastNinetyDays: number | null;
	maxCampaignPostEngagementRateLastNinetyDays: number | null;
}

export enum CampaignTypeEnum {
	Listening = 'Listening',
	CommunityMarketing = 'CommunityMarketing'
}

export enum CampaignStatusEnum {
	Draft = 'Draft',
	Saved = 'Saved',
	PendingApproval = 'PendingApproval',
	Approved = 'Approved',
	Active = 'Active',
	Suspended = 'Suspended',
	Completed = 'Completed',
	Scheduled = 'Scheduled',
	Reactivating = 'Reactivating'
}

export enum RecommendationSourceEnum {
	BDAdmin = 'BDAdmin',
	AutoGenerated = 'AutoGenerated'
}

export enum PostContentTypeEnum {
	Text = 'Text',
	Photo = 'Photo',
	Video = 'Video',
	Album = 'Album',
	Link = 'Link',
	LiveVideo = 'LiveVideo',
	MultiVideo = 'MultiVideo',
	VideoImage = 'VideoImage'
}

export enum TaskStatusEnum {
	Completed = 'Completed',
	Failed = 'Failed',
	PendingApproval = 'PendingApproval',
	Queued = 'Queued',
	Rejected = 'Rejected',
	Paused = 'Paused',
	Suspended = 'Suspended'
}

export class FbPostModel {
	__typename: 'FbPostModel';
	groupId: string;
	id: string | null;
	recomId: string | null;
	recomSrc: RecommendationSourceEnum | null;
	toBePostedAtUTCTicks: number;
	contentType: PostContentTypeEnum | null;
	text: string | null;
	imageUrls: Array<string | null> | null;
	videoUrls: Array<string | null> | null;
	status: PostStatusEnum | null;
	scheduleOption: string | null;
	fbPermlink: string | null;
	fbPostId: string | null;
	isDeleted: boolean | null;
	createdById: string | null;
	createdByName: string | null;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	createdByImgUrl: string | null;
	createdByRole: Role | null;
	isTimeSuggestionMet: boolean | null;
	totalSuggestionMet: null | number;
	totalSuggestions: null | number;
	recomObject: string | null;
	campaignTaskId: string | null;
	campaignId: string | null;
	scheduleType: scheduleTypeEnum | null;
}

export class UpdateFbPostInput {
	groupId: string;
	id?: string | null;
	recomId?: string | null;
	recomSrc?: RecommendationSourceEnum | null;
	toBePostedAtUTCTicks: number;
	text?: string | null;
	contentType?: PostContentTypeEnum | null;
	status?: PostStatusEnum | null;
	imageUrls?: Array<string | null> | null;
	videoUrls?: Array<string | null> | null;
	fbPermlink?: string | null;
	toBePostedFbPermlink?: string | null;
	scheduleOption?: string | null;
	fbPostId?: string | null;
	isDeleted?: boolean | null;
	createdById?: string | null;
	createdByName?: string | null;
	createdAtUTC?: string | null;
	modifiedByName?: string | null;
	updatedAtUTC?: string | null;
	createdByRole?: string | null;
	createdByImgUrl?: string | null;
	isTimeSuggestionMet?: boolean | null;
	totalSuggestionMet?: number | null;
	totalSuggestions?: number | null;
	recomObject?: string | null;
	campaignTaskId?: string | null;
	campaignId?: string | null;
	scheduleType?: scheduleTypeEnum | null;
}

export class ListFbPostModelsQuery {
	__typename: 'FbPostModelConnection';
	items: Array<FbPostModel | null> | null;
	nextToken: string | null;
}

export class CreateFbPostModelInput {
	groupId: string;
	id?: string | null;
	recomId?: string | null;
	recomSrc?: string | null;
	toBePostedAtUTCTicks: number;
	text?: string | null;
	imageUrls?: Array<string | null> | null;
	videoUrls?: Array<string | null> | null;
	fbPermlink?: string;
	fbPostId?: string | null;
	status?: PostStatusEnum | null;
	isDeleted?: boolean | null;
	scheduleOption?: string | null;
	createdById?: string | null;
	contentType?: PostContentTypeEnum | null;
	createdByName?: string | null;
	createdAtUTC?: string | null;
	updatedAtUTC?: string | null;
	createdByImgUrl?: string | null;
	createdByRole?: Role;
	isTimeSuggestionMet?: boolean | null;
	totalSuggestionMet?: null | number;
	totalSuggestions?: null | number;
	recomObject?: string | null;
	campaignTaskId?: string | null;
	scheduleType?: scheduleTypeEnum | null;
	campaignId?: string | null;
}

export class ListPostAnalyticsQuery {
	__typename: 'PostAnalytics';
	id: string;
	groupId: string;
	createdAtUTC: string;
	updatedAtUTC: string;
	fbGroupId: string;
	postCreatedAtUTC: string;
	postUpdatedAtUTC: string;
	postType: string | null;
	activityRate: number | null;
	reactions: number | null;
	comments: Array<string | null> | null;
	commentCount: number | null;
}

export class GroupMembers {
	__typename: 'GroupMembersConnection';
	items: Array<{
		__typename: 'GroupMembers';
		id: string;
		createdAtUTC: string | null;
		updatedAtUTC: string | null;
		userId: string | null;
		groupId: string | null;
		role: string | null;
	} | null> | null;
	nextToken: string | null;
}

export class CreateBrandAccessRequestInput {
	id?: string;
	name: string;
	companyName: string;
	email: string;
	phoneNumber: string;
}

export class GetGRecommendationByDayQuery {
	__typename: 'GRecommendationByDay';
	groupId: string;
	id: string | null;
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	optLength: string | null;
	emotions: string | null;
	timings: string | null;
	contentTypes: string | null;
	keywords: string | null;
	categories: string | null;
	topics: string | null;
	numOfMonth: string | null;
	numOfYear: string | null;
}

export class GroupMemberInvitation {
	__typename: 'GroupMemberInvitations';
	groupId: string;
	createdAtUTCTicks: number;
	id: string;
	email: string;
	name: string;
	mobilenumber: string;
	requestToSendInvitation: number;
	status: string;
	isDeleted: boolean;
	invitedByUserId: string;
	updatedAtUTC: string | null;
	createdAtUTC: string | null;
}

export class GroupMemberInvitationsConnection {
	__typename: 'GroupMemberInvitationsConnection';
	items: Array<GroupMemberInvitation | null> | null;
	nextToken: string | null;
}

export class Keyword {
	__typename: 'Keywords';
	keywordKey: string;
	category: string | null;
	keywordCategory: string | null;
	subCategory: string | null;
	uiFriendlyName: string | null;
	transformations?: string;
	keywordName: string | null;
}

export class KeywordsConnection {
	__typename: 'KeywordsConnection';
	items: Array<Keyword | null> | null;
	nextToken: string | null;
}

export class UpdateCampaignTaskInput {
	taskId: string;
	campaignId: string;
	userId: string;
	groupId: string;
	groupName?: string | null;
	title?: string | null;
	toBePerformedByUTC: string;
	postType?: PostContentTypeEnum | null;
	description?: string | null;
	text?: string | null;
	status: TaskStatusEnum | null;
	mediaAllowed?: string | null;
	imageUrls?: Array<string | null> | null;
	videoUrls?: Array<string | null> | null;
	linkUrls?: Array<string | null> | null;
	period?: string | null;
	isPlaceholder: boolean | null;
	fbPermlink: string | null;
	timezoneName: string | null;
}

export class GroupTotalMembers {
	groupId: string | null;
	dataDateUTC: string | null;
	metricForDayUTCStartTick: number | null;
	memberCount: number | null;
}

export class CmcReportMetrics {
	__typename: 'CmcReportMetrics';
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	campaignId: string;
	totalSubCatConv: number | null;
	totalBrandConv: number | null;
	beforeBrandConv: number | null;
	duringBrandConv: number | null;
	beforeKwCount: string | null;
	duringKwCount: string | null;
	afterKwCount: string | null;
	beforeBrandMntn: number | null;
	duringBrandMntn: number | null;
	numOfCampaignPost: number | null;
	numOfInfluencer: number | null;
	numDoneTask: number | null;
	totalEngagement: number | null;
	totalComments: number | null;
	totalReactions: number | null;
	groupEngagementScore: string | null;
	totalReach: number | null;
	phaseMetrics: string | null;
	totalGroups: number | null;
	subCatConvCounts: string | null;
	postSourceIds: string | null;
	phaseScreenShots: string | null;
}

export class GroupMemberAndEngagementStats {
	groupId: string | null;
	totalMembers: number | null;
	monthlyActiveUsers: number | null;
	dailyActiveUsers: number | null;
	impressions: number | null;
	engagement: number | null;
	conversations: number | null;
	posts: number | null;
}

export class GroupMemberChartData {
	startDate: string;
	barData: BarData;
}
export class BarData {
	totalMembersOnboarded: number;
	totalMembersCount: number;
	dailyActiveUsersRatio: number;
	monthlyActiveUsersCount: number;
	monthlyActiveUsersPercentage: number;
	dailyActiveUsersCount: number;
	dailyActiveUsersPercentage: number;
}

export class GroupActivityChartsData {
	startDate: string;
	barData: ActivityChartsBarData;
}
export class ActivityChartsBarData {
	posts: number;
	aggregatePosts: number;
	comments: number;
	aggregateComments: number;
	conversations: number;
	aggregateConversations: number;
	reactions: number;
	aggregateReactions: number;
	totalEngagement: number;
	aggregateTotalEngagement: number;
	averageEngagementPercentage: number;
	averageEngagementPerPost: number;
}

export class GroupInsightsChartsData {
	startDate: string;
	barData: InsightsChartsBarData;
}
export class InsightsChartsBarData {
	averageMemberToAdminPostRatio: number;
	surveys: number;
	impressions: number;
	aggregateImpressions: number;
	membershipRequestsAccepted: number;
	membershipRequestsDeclined: number;
}

export class BrandCommunityConnection {
	items: [BrandCommunity];
	nextToken: string;
}
export class BrandCommunity {
	groupId: string;
	brandId: string;
	groupName: string;
	totalMembers: any;
	lastUpdatedOn: string;
	targets: string;
	groupCreatedAtUTC: string;
	createdAtUTC: string;
	updatedAtUTC: string;
	brandCommunityReports3Key: string;
	DAUValues: string;
	impressions: string;
	MAUValues: string;
	coverImageUrl: string;
	privacy: string;
	supportingText: string;
}

export class UpdateBrandCommunityReport {
	groupId: string;
	brandId: string;
	groupName: string;
	totalMembers: number;
	lastUpdatedOn: string;
	targets: string;
	groupCreatedAtUTC: string;
	keywordCategories: [string];
	keywordBrand: string;
	lastUpdatedAt: string;
	MAUValues: string;
	DAUValues: string;
	impressions: string;
	surveys: string;
	MAUValuesPercentage: string;
	DAUValuesPercentage: string;
	privacy: string;
	supportingText: string;
}

export class CreateBrandCommunityReport {
	groupId: string;
	brandId: string;
	groupName: string;
	totalMembers: number;
	lastUpdatedOn: string;
	targets: string;
	groupCreatedAtUTC: string;
	keywordCategories: [string];
	keywordBrand: string;
	lastUpdatedAt: string;
	MAUValues: string;
	DAUValues: string;
	impressions: string;
	surveys: string;
	MAUValuesPercentage: string;
	DAUValuesPercentage: string;
	brandCommunityReports3Key: string;
	coverImageUrl: string;
	privacy: string;
}

export class CMCReportMetricsV2 {
	__typename: 'CmcReportMetrics';
	numGroups: number | null;
	numAudience: number | null;
	numDuringBrandMentions: number | null;
	numAfterBrandMentions: number | null;
	numBeforeBrandMentions: number | null;
	numLeadsGenerated: number | null;
	numDuringCatConversations: number | null;
	numDuringBrandConversations: number | null;
	numBeforeBrandConversations: number | null;
	numBeforeCatConversations: number | null;
	numAfterCatConversations: number | null;
	numAfterBrandConversations: number | null;
	campaignId: string | null;
	numPosts: number | null;
	numAdminPosts: number | null;
	numUGCPosts: number | null;
	numReactionAdminPost: number | null;
	numReactionUGCPost: number | null;
	numCommentAdminPost: number | null;
	numCommentUGCPost: number | null;
	totalCampaignPost: number | null;
	numCompletedCampaignPost: number | null;
	phaseMetrics: string | null;
	beforeSOV: string | null;
	afterSOV: string | null;
	duringSOV: string | null;
	duringSentimentMap: string | null;
	beforeSentimentMap: string | null;
	afterSentimentMap: string | null;
	campaignHighlights: Array<string | null> | null;
	engagementInsights?: string;
	duringSOVNonHashTag?: string;
}

export class CmcReportWc {
	__typename: 'CmcReportWC';
	createdAtUTC: string | null;
	updatedAtUTC: string | null;
	campaignId: string;
	beforeWC: string | null;
	duringWC: string | null;
}

export class ParticipatingGroupDetails {
	__typename: 'ParticipantGroupsDetails';
	members: string | null;
	memberEngagement: number | null;
	postEngagement: number | null;
	iconUrl: string | null;
	totalKeywordMentions: number | null;
	totalHashtagMentions: number | null;
	totalBrandMentions: number | null;
}

export class TopPosts {
	__typename: 'TopPosts';
	id: string;
	activityRate: number | null;
	postCreatedAtUTC: string | null;
	commentCount: number | null;
	reactions: number | null;
	postType: string | null;
	rawText: string | null;
	fbGroupId: string | null;
	photourl: string | null;
	videothumbnailurl: string | null;
}

export enum VerificationStatusEnum {
	NotVerified = 'NotVerified',
	VerificationSent = 'VerificationSent',
	Verified = 'Verified'
}

export class initiateActionOnConversation {
	__typename: 'initiateActionOnConversationResponseObject';
	updatedConversation: Conversation;
	updatedKeywordTrackerReport: KeywordTrackerReport;
}

export class DateRangeInput {
	startDate?: string | null;
	endDate?: string | null;
}

export class GraphAPIResponse {
	__typename: 'FacebookGraphAPIResponse';
	response: string | null | any;
}

export class ConversationsByUserId {
	__typename: 'GroupConversationsHourly';
	groupId: string | null;
	totalPosts: number | null;
	totalComments: number | null;
	totalReactions: number | null;
	totalShares: number | null;
	memberCount: number | null;
	error: string | null;
	postEngagementRate: number | null;
	memberEngagementRate: number | null;
}

export class InsightViewMetricsInternal {
	__typename: 'InsightViewMetricsInternal';
	insightViewId: string;
	metricForHourUTCStartTick: number;
	id: string | null;
	numPostFB: number | null;
	numPostWA: number | null;
	numCommentFB: number | null;
	numCommentWA: number | null;
	numPositiveFB: number | null;
	numPositiveWA: number | null;
	numNegativeFB: number | null;
	numNegativeWA: number | null;
	numNeutralFB: number | null;
	numNeutralWA: number | null;
	numAngerFB: number | null;
	numAngerWA: number | null;
	numAnticipationFB: number | null;
	numAnticipationWA: number | null;
	numJoyFB: number | null;
	numJoyWA: number | null;
	numSadnessFB: number | null;
	numSadnessWA: number | null;
	numDisgustFB: number | null;
	numDisgustWA: number | null;
	numSurpriseFB: number | null;
	numSurpriseWA: number | null;
	numTrustFB: number | null;
	numTrustWA: number | null;
	numFearFB: number | null;
	numFearWA: number | null;
	numKeywordsFB: string | null;
	numKeywordsWA: string | null;
	numTokensFB: string | null;
	numTokensWA: string | null;
	numWeekOfMonth: number | null;
	createdAtUTC: string | null;
	modifiedAtUTC: string | null;
	metricForHourUTC: string | null;
	metricForHourUTCYear: number | null;
	metricForHourUTCMonth: number | null;
	metricForHourUTCWeek: number | null;
	metricForHourUTCDay: number | null;
	metricForHourUTCHour: number | null;
	associationMetrics: string | null;
}

export class InsightViewMetricsByInsightViewId {
	__typename: 'GetInsightViewMetricsResponse';
	insightViewMetrics: Array<InsightViewMetricsInternal | null> | null;
	error: string | null;
	s3Type: boolean;
	location: string | null;
}

export class APIResponse {
	__typename: 'GenericAPIResponse';
	error: string | null;
	body: string | null;
}

export class GroupProfilePage {
	__typename: 'GroupProfilePage';
	id?: string;
	createdAtUTC?: string | null;
	updatedAtUTC?: string | null;
	profileUrl?: string | null;
	name?: string | null;
	groupId?: string;
	groupName?: string;
	coverImageUrl?: string | null;
	description?: string | null;
	category?: string | null;
	country?: string | null;
	fbGroupId?: string | null;
	groupPrivacyType?: string | null;
	keyStats?: KeyStatisticsForGroupProfile;
	audienceInsightsSheetUID?: string | null;
	popularTopics?: Array<PopularTopics | null> | null;
	mostTalkedAboutBrands?: Array<BrandDetailsForGroupProfile | null> | null;
	admins?: Array<UserDetailsForGroupProfile | null> | null;
	influencers?: Array<UserDetailsForGroupProfile | null> | null;
	showReviews?: boolean | null;
	showAdmins?: boolean | null;
	showInfluencers?: boolean | null;
	showMonthlyConversations?: boolean | null;
	showEngagementRate?: boolean | null;
	showActivityRate?: boolean | null;
	showPopularTopics?: boolean | null;
	showFeatureConversation?: boolean | null;
	featureConversations?: Array<FeatureConversationInput | null> | null;
	showMostTalkedAboutBrands?: boolean | null;
	showFiles?: boolean | null;
	filesDetails?: Array<FilesDetailsForGroupProfile> | null;
	publishedStatus?: ProfilePublishStatusEnum;
	isDefaultProfile?: boolean | null;
	createdByUserId?: string | null;
	isPublished?: boolean | null;
	showAudienceInsights?: boolean | null;
	showAgeAndGender?: boolean | null;
	showTopCountries?: boolean | null;
	showTopCities?: boolean | null;
	ageMetrics?: Array<AgeMetrics | null> | null;
	topCities?: Array<TopCities | null> | null;
	topCountries?: Array<TopCountries | null> | null;
	stage?: OnboardingStageEnum | null;
}

export class KeyStatisticsForGroupProfile {
	__typename: 'KeyStatisticsForGroupProfile';
	activityRate?: number | null;
	engagementRate?: number | null;
	monthlyConversations?: number | null;
	totalMembers?: number | null;
	totalMembersJoinedLastWeek?: number | null;
}

export class PopularTopics {
	__typename: 'PopularTopics';
	showTopic?: boolean | null;
	keyword?: string | null;
	count?: number | null;
}

export class BrandDetailsForGroupProfile {
	__typename: 'BrandDetailsForGroupProfile';
	brandName?: string | null;
	brandImageURL?: string | null;
	customBrandID?: string | null;
	isCustomBrand?: boolean | null;
	isSelected?: boolean | null;
}

export class UserDetailsForGroupProfile {
	showUser?: boolean | null;
	userId?: string | null;
	userDisplayName?: string | null;
	userProfileImageURL?: string | null;
	userCountry?: string | null;
	userProfileLink?: string | null;
}

export class UpdateGroupProfilePageInput {
	id: string;
	groupId: string;
	name?: string | null;
	coverImageUrl?: string | null;
	description?: string | null;
	country?: string | null;
	category?: string | null;
	showAdmins?: boolean | null;
	fbGroupId?: string | null;
	showInfluencers?: boolean | null;
	showMonthlyConversations?: boolean | null;
	showEngagementRate?: boolean | null;
	showActivityRate?: boolean | null;
	showPopularTopics?: boolean | null;
	showMostTalkedAboutBrands?: boolean | null;
	showFiles?: boolean | null;
	showFeatureConversation?: boolean | null;
	featureConversations?: Array<FeatureConversationInput | null> | null;
	popularTopics?: Array<PopularTopicsInput | null> | null;
	mostTalkedAboutBrands?: Array<BrandDetailsForGroupProfileInput | null> | null;
	admins?: Array<UserDetailsForGroupProfileInput | null> | null;
	influencers?: Array<UserDetailsForGroupProfileInput | null> | null;
	showReviews?: boolean | null;
	filesDetails?: Array<FilesDetailsForGroupProfile> | null;
	showAudienceInsights?: boolean | null;
	showAgeAndGender?: boolean | null;
	showTopCountries?: boolean | null;
	showTopCities?: boolean | null;
	isCustomCoverAdded?: boolean | null;
	contactEmail?: string | null;
	allowBrandsToContact?: boolean | null;
	publishedStatus?: ProfilePublishStatusEnum | null;
	isPublished?: boolean | null;
	ageMetrics?: Array<AgeMetrics> | null;
	topCities?: Array<TopCities> | null;
	topCountries?: Array<TopCountries> | null;
	audienceInsightsSheetUID?: string | null;
	stage?: OnboardingStageEnum | null;
}

export enum ProfilePublishStatusEnum {
	DRAFT = 'Draft',
	LIVE = 'Live',
	DEFAULT = 'Default'
}

export enum OnboardingStageEnum {
	OVERVIEW = 'Overview',
	POPULAR_TOPPICS = 'PopularToppics',
	CONVERSATIONS = 'Conversations',
	PREVIEW_AND_PUBLISH = 'PreviewAndPublish',
	COMPLETED = 'Completed'
}

export class GroupProfilePagesConnection {
	__typename: 'GroupProfilePagesConnection';
	items: Array<GroupProfilePage | null> | null;
	nextToken: string | null;
}

export class PopularTopicsInput {
	showTopic?: boolean | null;
	keyword?: string | null;
}

export class FeatureConversationInput {
	showConversation?: boolean | null;
	topicName?: string | null;
	screenShots?: Array<ScreenShotInput | null> | null;
}

export class ScreenShotInput {
	title?: string | null;
	screenShotUrl?: string | null | void;
}
export class BrandDetailsForGroupProfileInput {
	brandName?: string | null;
	brandImageURL?: string | null;
	isSelected?: boolean | null;
	isCustomBrand?: boolean | null;
	customBrandID?: string | null;
}

export class UserDetailsForGroupProfileInput {
	showUser?: boolean | null;
	userId?: string | null;
	userDisplayName?: string | null;
	userProfileImageURL?: string | null;
	userCountry?: string | null;
	userProfileLink?: string | null;
}

export class FilesDetailsForGroupProfile {
	fileType: string | null;
	fileSize: string | null;
	fileName: string | null;
	fileURL: string | null;
	fileUUID: string | null;
	fileThumbnailURL: string | null;
}

export class AgeMetrics {
	ageRange: string | null;
	percentageMen: number | null;
	percentageWomen: number | null;
	percentageCustomGender: number | null;
	male: number | null;
	female: number | null;
	others: number | null;
}

export class TopCities {
	name: string | null;
	value: number | null;
}

export class TopCountries {
	name: string | null;
	value: number | null;
}

export class AdminBioInput {
	bio: string;
	country?: string;
	profilePictureUrl?: string;
	pitchVideo?: AdminBioFileInput;
	keyAchievements?: [string];
	mediaCoverages?: [AdminBioMediaCoverageInput];
	files?: [AdminBioFileInput];
	socialProfiles?: [AdminSocialProfileInput];
	selectedAdministratedGroups?: [AdminBioGroupInput];
	selectedSupportedGroups?: [AdminBioGroupInput];
}

export class AdminBioFileInput {
	title?: string;
	url: string;
	size?: number;
	fileExtension?: string;
	fileTitle?: string;
	type?: string;
}

export class AdminBioMediaCoverageInput {
	url: string;
	title?: string;
	description?: string;
	imageUrl?: string;
}

export class AdminBioGroupInput {
	id: string;
	fbGroupId: string;
	name?: string;
	profilePictureUrl: string;
	memberCount?: number;
}

export class AdminSocialProfileInput {
	platform: string;
	profileLink: string;
}

export class ProfileBioDraftInput {
	bio?: string | null;
	published?: boolean | null;
	country?: string | null;
	profilePictureUrl?: string | null;
	pitchVideo?: AdminBioFileInput | null;
	keyAchievements?: Array<string | null> | null;
	mediaCoverages?: Array<AdminBioMediaCoverageInput | null> | null;
	files?: Array<AdminBioFileInput | null> | null;
	socialProfiles?: Array<AdminSocialProfileInput | null> | null;
	selectedAdministratedGroups?: Array<AdminBioGroupInput | null> | null;
	selectedSupportedGroups?: Array<AdminBioGroupInput | null> | null;
}

export class CustomConversationBucketInput {
	name?: string | null;
	mentions?: number | null;
	keywords?: string | null;
	visibility?: string | null;
}

export class UserRole {
	username: string;
	id: string;
	fullname: string;
	givenname: string;
	familyname: string;
	email: string;
}

export class UsersByRolesOutput {
	copywriter: UserRole[];
	designer: UserRole[];
}
