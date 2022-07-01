import {Injectable} from '@angular/core';

import API, {graphqlOperation} from '@aws-amplify/api';
import {GraphQLResult} from '@aws-amplify/api-graphql';
import {UserAcceptanceEnum} from '@groupAdminModule/_enums/user-acceptance.enum';
import {UserCampaign, UserCampaignConnection} from '@groupAdminModule/models/user-campaign.model';
import {INewScreenshotAdded} from '@sharedModule/components/cmcReport-v3/upload-screenshot/upload-screenshot.component';
import {Role} from '@sharedModule/enums/role.enum';
import {
	AdminBioContactInput,
	AdminBioModel,
	GetAdminBioAnalyticsModel,
	GetAdminBioModel
} from '@sharedModule/models/admin-bio.model';
import {ConversationReportModel} from '@sharedModule/models/conversation-reports/conversation-report.model';
import {UserModel} from '@sharedModule/models/user.model';
import {LoggerService} from '@sharedModule/services/logger.service';
import {merge, Observable, of, Subject, Subscriber} from 'rxjs';
import {catchError, timeout} from 'rxjs/operators';
import {v4 as uuid} from 'uuid';
import * as zenObservable from 'zen-observable';

import {
	AdminBioInput,
	APIResponse,
	Campaign,
	CampaignAsset,
	CampaignConnection,
	CampaignGroupAndTaskDetails,
	CampaignGroupAssetKPIs,
	CampaignPost,
	CampaignPostsConnection,
	CampaignReportWithPosts,
	CampaignStatusEnum,
	CampaignTask,
	CampaignTasksConnection,
	CMCampaignGroups,
	CMCNotification,
	CMCNotificationInput,
	CmcReportMetrics,
	CMCReportMetricsV2,
	CmcReportWc,
	cmcTaskFilters,
	CommunityDiscoveryFiltersResponse,
	communityDiscoveryInput,
	Conversation,
	ConversationsByUserId,
	CreateAssetInput,
	CreateCampaignInput,
	CreateCampaignPostInput,
	CreateCampaignTaskInput,
	CreateCMCCampaignGroupsInput as CreateCMCampaignGroupsInput,
	CreateFbPostModelInput,
	CreateInsightViewsInput,
	CreateListeningCampaignInput,
	CreateSelfMonetizationCampaignInput,
	CreateUsersInput,
	DateRangeInput,
	FbPostModel,
	GetBrandsByUserIdQuery,
	GetGRecommendationByDayQuery,
	getGroupProfileReviewsResponse,
	getGroupReviewsResponse,
	GetNotificationsQuery,
	GraphAPIResponse,
	Group,
	GroupMemberInvitation,
	GroupMemberInvitationsConnection,
	GroupMembers,
	GroupMetricsDaily,
	GroupNotificationPreference,
	GroupProfilePage,
	GroupProfilePagesConnection,
	GroupProfileReview,
	GroupsConnection,
	initiateActionOnConversation,
	InsightViewMetricsByInsightViewId,
	KeywordsConnection,
	KeywordTrackerReport,
	ListCampaignGroupsQuery,
	ListeningCampaign,
	ListeningCampaignInsightViewsQuery,
	ListFbPostModelsQuery,
	ListGroupKeywordMetricsByGroupIdQuery,
	ListGroupMetricsByGroupIdQuery,
	ListInsightViewMetricsByInsightViewIdQuery,
	ListInsightViewsQuery,
	ListKeywordTrackerMetricQuery,
	ListPostAnalyticsQuery,
	Notifications,
	ProfileBioDraftInput,
	PutGroupProfileReviewTypeInput,
	PutGroupReviewTypeInput,
	ResponseObject,
	SaveAcqusitionQuery,
	SelfMonetizationCampaign,
	SelfMonetizationCampaignConnection,
	TopPosts,
	triggerNotificationsForWAorEmailUpdateInput,
	UpcomingUserCampaign,
	UpdateAssetInput,
	UpdateBrandInput,
	UpdateCampaignGroupInput,
	UpdateCampaignGroupModeOfCommunicationInput,
	UpdateCampaignGroupSubscriptionsInputInternal,
	UpdateCampaignInput,
	UpdateCampaignPostInput,
	UpdateCampaignTaskInput,
	UpdateFbPostInput,
	UpdateGroupInput,
	UpdateGroupProfilePageInput,
	UpdateKeywordTrackerReportInput,
	UpdateListeningCampaignInput,
	UpdateNotificationsInput,
	UpdateSelfMonetizationCampaignInput,
	UpdateUserInput,
	UserCampaignGroup,
	Users,
	GroupMemberAndEngagementStats,
	UsersByRolesOutput,
	GroupMemberChartData,
	GroupActivityChartsData,
	BrandCommunityConnection,
	BrandCommunity,
	UpdateBrandCommunityReport,
	CreateBrandCommunityReport,
	GroupTotalMembers
} from '../models/graph-ql.model';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';

@Injectable({providedIn: 'root'})
export class AmplifyAppSyncService {
	private keywordsReturnAttributes = `__typename
            keywordKey
            category
            keywordCategory
            subCategory
            uiFriendlyName
						transformations
						keywordName`;

	private campaignTaskReturnAttributes = `__typename
          campaignId
          taskId
          userId
          groupId
          status
          groupName
          title
          postType
          toBePerformedByUTC
          type
          text
          description
          mediaAllowed
          imageUrls
          videoUrls
          linkUrls
          createdAtUTC
		  updatedAtUTC
		  period
		  reasonForFailure
		  userName
		  fbPermlink
		  isPlaceholder
		  errorFromSource
		  timezoneName
		  isDraft`;

	private campaignGroupsAndTaskDetailsReturnAttributes = `campaignId
			groupId
			id
			groupName
			memberCount
			memberEngagementRateUTC
			postEngagementRateUTC
			businessCategory
			state
			groupInstallationStartedAtUTC
			totalKeywordMentions
			totalHashtagMentions
			totalBrandMentions
			iconUrl
			campaignPostEngagementRateLastNinetyDays
			postsEngagementRateLastNinetyDays
			categoryDensity
			fbGroupId
			topTenCities
			location
			averageTopPostsReach
			communityAdminId
			communityAdminName
			communityAdminContact
			communityManagerId
			pricing
			currency
			timezone
			defaultTaskDate
			modeOfCommunication
			modeOfCommunicationVerificationStatus
			paymentStatus
			paymentRemarks
			paymentDate
			paymentAmountPaid
			isPaymentInfoAvailable
			groupTaskStatus
			postType
			campaignGroupTaskId
			isAcceptedByCommunityAdmin
			cohort
			metadata
			taskId
			userId
			userName
			status
			title
			toBePerformedByUTC
			type
			text
			imageUrls
			videoUrls
			linkUrls
			period
			reasonForFailure
			fbPermlink
			isPlaceholder
			errorFromSource
			timezoneName
			campaignAssetProposalSent
			owner
			postType
			assetsKpis {
				campaignAssetsApproved
				campaignAssetsApprovedAll
				campaignAssetsDeclined
				campaignAssetsHasDeclined
				campaignAssetsHasPending
				campaignAssetsInitial
				campaignAssetsPending
				campaignAssetsStatus
			}`;

	private createCMCampaignGroupsReturnAttributes = `__typename
		  campaignId
		  groupId
		  groupName
		  id
		  createdAtUTC
		  updatedAtUTC
		  memberCount
		  memberEngagementRateUTC
		  postEngagementRateUTC
		  campaignPostEngagementRateLastNinetyDays
		  postsEngagementRateLastNinetyDays
		  weeklyConversationalVolume
		  topTenCities
		  categoryDensity
		  location
		  groupTaskStatus
		  postType
		  communityAdminId	
			communityAdminName	
			communityManagerId	
		  isPaymentInfoAvailable`;

	private campaignPostReturnAttributes = `__typename
		  id
		  campaignId
		  sourceId
		  fbPermlink
		  reactionCount
		  commentCount
		  createdAtUTC
		  updatedAtUTC
		  groupName
		  postCreatedAtUTC
		  postCreatedByName
		  postRawText
		  postPhotoUrl
		  isAdminPost
		  groupId
			isSystemGenerated
			`;

	private campaignReportReturnAttributes = `
		  campaignId
		  numGroups
		  numCampaignPosts
		  numOrganicPosts
		  numConversations
		  numBrandConversations
		  totalReactions
		  totalComments
		  campaignHighlights
		  groupEngagementDetais
		  participantGroupsDetais
		  beforeKeywordCount
		  afterKeywordCount
		  beforeBrandMentions
		  afterBrandMentions
		  beforeBrandConversations
		  afterBrandConversations
		  lastScreenshotTime
		  lastUpdatedOnDate`;

	private postAnalyticsReturnAttributes = `__typename
          id
          groupId
          createdAtUTC
          updatedAtUTC
          fbGroupId
          postType
          activityRate
          postCreatedAtUTC
          postUpdatedAtUTC
          reactions
          comments
          commentCount`;

	private groupMembersReturnAttributes = `__typename
            id
            createdAtUTC
            updatedAtUTC
            userId
            groupId
            role`;

	private gRecommendationByDayReturnAttributes = `__typename
          groupId
          id
          createdAtUTC
          updatedAtUTC
          optLength
          emotions
          timings
          contentTypes
          keywords
          categories
          topics
          numOfMonth
          numOfYear`;

	private fbPostReturnAttributes = `__typename
          groupId
          id
          recomId
          recomSrc
          toBePostedAtUTCTicks
          contentType
          text
          imageUrls
          videoUrls
          status
          scheduleOption
          fbPermlink
          toBePostedFbPermlink
          fbPostId
          isDeleted
          createdById
          createdByName
          createdByRole
          createdAtUTC
          updatedAtUTC
          createdByImgUrl
          isTimeSuggestionMet
          totalSuggestionMet
          totalSuggestions
          recomObject
		  campaignTaskId
		  campaignId
          scheduleType`;

	private insightViewsReturnAttributes = `__typename
            campaignId
            viewName
            id
            lastRunAtUTC
            createdAtUTC
            updatedAtUTC
            keywords
            adhocKeywords
            startDateAtUTC
            endDateAtUTC
            level
            keywordBrand
            dateRangeSelectors`;

	private notificationsReturnAttributes = `__typename
            createdAtUTC
            createdAtUTCTick
            forUserId
            id
            status
            inAppTitle
            type
            viewedAtUTC
            channelsToSkip
            payload`;

	private insightViewMetricsReturnAttributes = `__typename
            insightViewId
            metricForHourUTCStartTick
            id
            numPostFB
            numPostWA
            numCommentFB
            numCommentWA
            numPositiveFB
            numPositiveWA
            numNegativeFB
            numNegativeWA
            numNeutralFB
            numNeutralWA
            numAngerFB
            numAngerWA
            numAnticipationFB
            numAnticipationWA
            numJoyFB
            numJoyWA
            numSadnessFB
            numSadnessWA
            numDisgustFB
            numDisgustWA
            numSurpriseFB
            numSurpriseWA
            numTrustFB
            numTrustWA
            numFearFB
            numFearWA
            numKeywordsFB
            numKeywordsWA
            numTokensFB
            numTokensWA
            numWeekOfMonth
            createdAtUTC
            modifiedAtUTC
            metricForHourUTC
            metricForHourUTCYear
            metricForHourUTCMonth
            metricForHourUTCWeek
            metricForHourUTCDay
            metricForHourUTCHour
            associationMetrics`;

	private associationInsightViewMetricsReturnAttributes = `__typename
            insightViewId
            metricForHourUTCStartTick
            id
            numPostFB
            numPostWA
            numCommentFB
            numCommentWA
            numPositiveFB
            numPositiveWA
            numNegativeFB
            numNegativeWA
            numNeutralFB
            numNeutralWA
            numAngerFB
            numAngerWA
            numAnticipationFB
            numAnticipationWA
            numJoyFB
            numJoyWA
            numSadnessFB
            numSadnessWA
            numDisgustFB
            numDisgustWA
            numSurpriseFB
            numSurpriseWA
            numTrustFB
            numTrustWA
            numFearFB
            numFearWA
            numKeywordsFB
            numKeywordsWA
            numTokensFB
            numTokensWA
            numWeekOfMonth
            createdAtUTC
            modifiedAtUTC
            metricForHourUTCYear
            metricForHourUTCMonth
            metricForHourUTCWeek
            metricForHourUTCDay
			metricForHourUTCHour
			associationMetrics`;

	private brandsReturnAttributes = `__typename
            id
            createdAtUTC
            updatedAtUTC
            name
            description
            iconUrl
            status`;

	private campaignsReturnAttributes = `
            brandId
            campaignName
            campaignId
            numConversationsListenedInLastThreeMonths
            startDateAtUTC
            endDateAtUTC
            createdAtUTC
            updatedAtUTC
            status
            type
            details
            objective
            keywords
            proposalEmails
            brandName
            keywordBrand
            keywordCategory
			keywordSubCategories
			groupIds
            campaignSummary
            cmcReportName
			s3ReportUrl
			campaignPeriod
			taskTitle
			defaultTaskDate
			KPIs
			primaryObjective
			secondaryObjective
			cmcType
			timezoneName
			powerBIDashboardUrl
			s3CoverImageUrl
			cmcReportVersion
			defaultPostContentType
			typeformId
			useWAForContentAutomation
						phaseIdea currentPhase totalPhase currency communicationChannel keywordsExcluded keyFindings brandObjective phaseIdeaSupportingText keyFindingsSupportingText resultsSupportingText kpiSupportingText brandShareOfVoiceSupportingText brandSentimentSupportingText wordCloudSupportingText engagementInsightSupportingText topPerformingPostSupportingText
			engagementInsights
			productPurchaseInfo
			productPurchaseRequired
			trainingLinkMessage
			assetsTextRequired
			assetsImagesRequired
			assetsVideoRequired`;

	private selfMonetizationCampaignsReturnAttributes = `__typename
			campaignId
			createdAtUTC
			updatedAtUTC
			campaignName
			startDateAtUTC
			endDateAtUTC
			groupIds
			brandKeywords
			customKeywords
			hashtags
			campaignSummary
			isReportAvailable`;

	private listeningCampaignReturnAttributes = `__typename
		brandId
		campaignId
		campaignName
		startDateAtUTC
		endDateAtUTC
		details
		objective
		groupIds
		brandName
		keywordBrand
		keywordCategory
		status
		keywordSubCategories
		powerBIDashboardUrl`;

	private groupsQueryReturnAttributes = `__typename
          id
          createdAtUTC
          updatedAtUTC
          fbGroupId
          name
          description
          coverImageUrl
          coverImageOffsetX
          coverImageOffsetY
          iconUrl
          email
          groupType
          groupCategories
          groupSubCategories
          targetType
          languages
          countries
          cities
          gender
          targetAudienceGender
          privacy
          memberCount
          state
          initiateInstallation
          initiateUninstallation
          groupCreatedAtUTC
          role
          businessCategory
          country
          countryFromUTM
          metricsAvailableSinceUTC
          metricsAvailableUntilUTC
          dataAvailableSinceUTC
          dataAvailableUntilUTC
          areMetricsAvailable
          groupTimezoneName
          addedByUserId
          isDead
          isOverviewDataAvailable
          groupInstallationStartedAtUTC
          groupReInstallationStartedAtUTC
          receiveWANotifications
          receiveEmailNotifications
          percentageLast3DaysMetricsAvailable
          percentageLast28DaysMetricsAvailable
          groupTimezoneInfo
          groupTimezoneOffsetInMins
          isRecommendationJobTriggered
          receiveWANotifications
          historyJobsStartedAtUTC
          percentageLast7DaysMetricsAvailable
          percentageLastMonthMetricsAvailable
          percentagesSecondLastMonthMetricsAvailable
          percentagesThirdLastMonthMetricsAvailable
          percentageLast14DaysMetricsAvailable
          isConversationTrendAvailable
          areRecommendationsAvailable
          isHistoricalPullComplete
          doesQueueMessageExists
          doesHistoryQueueMessageExists
          isCSFbGroupAppInstalled
          lastMoreThan50PendingRequestNotificationSentAtUTC
          groupUnInstalledAtUTC
          groupInstallationCompletedAtUTC
          groupReInstallationCompletedAtUTC
          isAdminTokenAvailable
          memberEngagementRateUTC
          postEngagementRateUTC
          facebookInsightsFileDetails {
            __typename
            fileName
            sheetUID
            fileStatus
            fileUploadedAtUTC
          }
          noOfProfilePagesCreated
          isMonetized`;

	private demographicsReturnAttributes = `
	    groupsAgeGenderInsights {
      groupId
      ageRange
      startingAge
      endingAge
      women
      percentageWomen
      men
      percentageMen
      customgender
      percentageCustomGender
      createdATUTC
      updatedAtUTC
      startDate
      endDate
    }
    groupsCityCountryInsights {
      groupId
      sheetCountryStateCity
      topCities
      cityName
      cityState
      cityCountry
      topCountries
      countryName
      members
      createdAtUTC
      updatedAtUTC
      startDate
      endDate
    }	
    top10Cities
    top5Countries`;

	private groupMetricsQueryReturnAttributes = `__typename
          id
          createdAtUTC
          updatedAtUTC
          groupId
          metricForHourUTC
          metricForHourUTCStartTick
          metricForHourUTCHour
          metricForHourUTCDay
          metricForHourUTCWeek
          metricForHourUTCMonth
          metricForHourUTCYear
          numComments
          numPosts
          numCommentsPerPost
          numReactions
          numShares
          numTextPosts
          numVideoPosts
          numPhotoPosts
          numLinkPosts
          numEventPosts
          memberCount
          memberRequestCount
          numCommentsOnVideoPosts
          numCommentsOnPhotoPosts
          numCommentsOnLinkPosts
          numCommentsOnEventPosts
          numCommentsOnTextPosts
          numReactionsOnTextPosts
          numReactionsOnVideoPosts
          numReactionsOnPhotoPosts
          numReactionsOnLinkPosts
          numReactionsOnEventPosts
          numSharesOnTextPosts
          numSharesOnVideoPosts
          numSharesOnPhotoPosts
          numSharesOnLinkPosts
          numSharesOnEventPosts
          numWeekOfMonth`;

	private keywordTrackerReportReturnAttributes = `__typename
          name
          displayName
          ownerId
          id
          createdAtUTC
          updatedAtUTC
          keywords
          numOfOccurances
          numOfRemovedComments
          numOfActionRequired
          numOfReported
          numOfTurnedOffCommenting
          numOfMutedMembers
          numOfHiddenComments
          numOfRemovedMembers
          numOfRemovedPost
          numOfBlockedUser
          numOfIgnored
          reportLevel`;

	private keywordTrackerMetricReturnAttributes = `__typename
          reportId
          metricForHourUTCStartTick
          numOfOccurances
          metricForHourUTCYear
          metricForHourUTCMonth
          metricForHourUTCDay
          metricForHourUTCHour
          metricForHourUTCWeek
          numWeekOfMonth
          createdAtUTC
          updatedAtUTC
          id`;

	private conversationsReturnAttributes = `__typename
          id
          recordid
          fbgroupid
          groupid
          sourceId
          parentSourceId
          groupname
          contenType
          nrcsentimentpositive
          nrcsentimentnegative
          sentimentrscore
          nrcsentimentneutral
          sentimentrvalue
          nrcanger
          nrcanticipation
          nrcjoy
          nrcsadness
          nrcdisgust
          nrcsurprise
          nrctrust
          nrcfear
          purchaseintent
          recomendationtype
          rawText
          createdatutc
          updatedatutc
          createdatutcmonth
          createdatutcweek
          createdatutcday
          createdatutchour
          recordedatutc
          groupType
          tokens
          createdatutcyear
          actionTaken
          photourl
		  videothumbnailurl
		  postedbyname
		  createdbyuser`;

	private postsInformationReturnAttributes = `__typename
		  id
		  fbgroupid
		  groupid
		  sourceId
		  parentSourceId
		  groupname
		  contenType
		  rawText
		  createdatutc
		  updatedatutc
		  photourl
		  videothumbnailurl`;

	private usersQueryReturnAttributes = `__typename
          cognitoId
          id
          userType
          createdAtUTC
          updatedAtUTC
          email
          givenname
          familyname
          middlename
          fullname
          nickname
          username
          birthdate
          gender
          landbotInteractionCustomerId
          locale
          mobileNumberMasked
          mobileDialCode
          mobileCountryCode
          profilePictureUrl
          timezoneOffsetInMins
          timezoneInfo
          timezoneName
          fbUserAccessToken
          fbUserId
		      csAdminTeam
          expiresAt
          loginMethod
          notificationPrefs
          personaSurvey
          emailVerificationStatus
          whatsappSubscriptionStatus
          productDemoedAtDate
          joinedCSGroupAtDate
          monetizationWorkshopAttendedAtDate
          receiveNotifications
          receiveWANotifications
          receiveEmailNotifications
          hasAccessToReportGenerationFeature
          totalWhatsappConfirmationRequest
          accessTokenReActivatedAtUTC
          fcmTokens
          modeOfCommunication
          modeOfCommunicationVerificationStatus
  		    landbotCustomerId
  		    modeOfCommunicationUpdatedBy
		      isEligibleForConvosightEarningPlatform
          CEPOnboardingState
          campaignUpdatesSubscribed
          isAdminBioCompleted
          isBetaUser
		  adminBioContactEmail
		  adminBioContactPhoneNumber
		  sendAdminBioNotificationCampaign
		  userRole
		  ownsGroupProfile`;

	private groupMemberInvitationReturnAttribute = `__typename
          groupId
          createdAtUTCTicks
          id
          email
          name
          mobilenumber
          requestToSendInvitation
          status
          isDeleted
          invitedByUserId
          updatedAtUTC
          createdAtUTC`;

	private userCampaignReturnAttributes = `__typename
          campaignName
          brandName
          brandLogoURL
          campaignId
          startDateAtUTC
          endDateAtUTC
          createdAtUTC
          updatedAtUTC
          status
          details
		  objective
		  primaryObjective
		  campaignBriefForCommunityAdmin
		  isDeleted`;

	private upcomingCampaignReturnAttributes = `__typename
          campaignName
          brandName
          brandLogoURL
          campaignId
          startDateAtUTC
          endDateAtUTC
          createdAtUTC
          updatedAtUTC
          status
          details
		  objective
		  primaryObjective
		  campaignBriefForCommunityAdmin
		  groupId
		  isDeleted`;

	private communityDiscoveryAPIAttributes = `
		  groupId
    	  name
      	  categoryDensity
    	  campaignPostEngagementRateLastNinetyDays
    	  postsEngagementRateLastNinetyDays
    	  country
    	  state
    	  businessCategory
    	  memberCount
    	  isMonetized
    	  isMonetizable
    	  privacy
    	  fbGroupId
	  cmcTrained
	  performanceTrained
	  groupProfileId
	  cmcRatingAvg
	  cmcRatingTotal
	  cmcRatingCount
    	  groupInstallationStartedAtUTC
    	  topTenCities
    	  isAnyCampaignTaskToBePerformedThisMonth
    	  defaultCommunityAdmin
		  audienceMatch
		  averageActiveMember
		  averageTopPostsReach
		  queryConversationCount
		  categoryConversationCount
		  campaignCount
		  campaignList`;

	private communityDiscoveryFiltersResponse = `
	 	  	 __typename
		 		 businessCategories
         countries
         maxMemberCount
         maxPostsEngagementRateLastNinetyDays`;

	private groupProfilePageReturnAttributes = `
      id
      createdAtUTC
      updatedAtUTC
      profileUrl
			stage
      name
      groupId
      groupName
	  coverImageUrl
	  groupPrivacyType
      isDefaultProfile
      isCustomCoverAdded
      createdByUserId
      publishedStatus
      isPublished
      `;

	private groupProfileDataReturnAttributes = `allowBrandsToContact
    audienceInsightsSheetUID
    category
    contactEmail
    groupId
    groupName
    groupPrivacyType
    id
    isDefaultProfile
    isPublished
    name
		stage
    profileUrl
    publishedStatus
    showFeatureConversation
    adminUserDetails {
      isEnabled
      userEmail
    }
    admins {
      email
      emailNotificationEnabled
      showUser
      userCountry
      userDisplayName
      userId
      userProfileImageURL
      userProfileLink
    }
    ageMetrics {
      ageRange
      female
      male
      others
      percentageCustomGender
      percentageMen
      percentageWomen
    }
    country
    countryFullName
    coverImageUrl
    createdAtUTC
    createdByUserId
    description
    fbGroupId
    featureConversations {
      screenShots {
        screenShotUrl
        title
      }
      showConversation
      topicName
    }
    filesDetails {
      fileName
      fileSize
      fileThumbnailURL
      fileType
      fileURL
      fileUUID
    }
    influencers {
      email
      emailNotificationEnabled
      showUser
      userCountry
      userDisplayName
      userId
      userProfileImageURL
      userProfileLink
    }
    isCustomCoverAdded
    keyStats {
      activityRate
      engagementRate
      monthlyConversations
      totalMembers
      totalMembersJoinedLastWeek
    }
    mostTalkedAboutBrands {
      brandImageURL
      brandName
      isSelected
			isCustomBrand
			customBrandID
    }
	popularTopics {
        showTopic
        keyword
    }
    selfMadeCampaigns {
      brandName
      campaignDescription
      campaignName
      campaignResult
      campaignScreenshots
      endDate
      groupProfileId
      id
      isDisabled
      screenshotsDescription
      startDate
      timestamp
    }
    showActivityRate
    showAdmins
    showAgeAndGender
    showAudienceInsights
    showContactEmailNotifications
    showEngagementRate
    showTopCountries
    showTopCities
    showSelfMadeCampaigns
    showReviews
    showPopularTopics
    showMsgButton
    showMostTalkedAboutBrands
    showMonthlyConversations
    showInfluencers
    showFiles
    topCities {
      name
      value
    }
    topCountries {
      name
      value
    }
    updatedAtUTC
	banners {
		title
		message
		bannerColor
		buttonColor
		buttonText
		bannerType
	}
  }`;

	private groupProfilePagesReturnAttributes = `
     id
     createdAtUTC
     updatedAtUTC
     profileUrl
     name
     groupId
     groupName
      groupPrivacyType
      coverImageUrl
      description
      category
			stage
      country
      keyStats {
        activityRate
        engagementRate
        monthlyConversations
        totalMembers
        totalMembersJoinedLastWeek
      }
      audienceInsightsSheetUID
      popularTopics {
        showTopic
        keyword
      }
      mostTalkedAboutBrands {
        brandName
        brandImageURL
        isSelected
				isCustomBrand
				customBrandID
      }
      admins {
        showUser
        userId
        userDisplayName
        userProfileImageURL
        userCountry
        userProfileLink
      }
      filesDetails {
        fileType
        fileName
        fileURL
        fileUUID
        fileSize
        fileThumbnailURL
      }
      influencers {
        showUser
        userId
        userDisplayName
        userProfileImageURL
        userCountry
        userProfileLink
      }
	  featureConversations {
		showConversation
		topicName
		screenShots {
			title
			screenShotUrl
		}
	  }
      showReviews
      showAdmins
      showInfluencers
      showMonthlyConversations
      showEngagementRate
      showActivityRate
      showPopularTopics
	  showFeatureConversation
      showMostTalkedAboutBrands
      showFiles
	    allowBrandsToContact
	    contactEmail
     isDefaultProfile
	  showAudienceInsights
	  showAgeAndGender
	  showTopCountries
	  showTopCities
     isCustomCoverAdded
     createdByUserId
     publishedStatus
     isPublished
	  topCities {
        name
        value
      }
	  topCountries {
        name
        value
      }
	  ageMetrics {
        ageRange
        percentageMen
		percentageWomen
		percentageCustomGender
	male
		female
	others
      }
	  banners {
		title
		message
		bannerColor
		buttonColor
		buttonText
		bannerType
	} `;

	private maunuallyUploadedScreenshotAttributes = `
			key
			order
			id
			type
			fbPermLink
			s3Key
			uploadedOn
			sectionName
			groupName
			createdAtUTC
			updatedAtUTC
	`;
	private adminBioReturnAttributes = `
          userId
		  allowBrandsToContact
          bio
          country
		  countryFullName
		  contactEmail
          profileUrl
	  profileUrlSlug
	  oldProfileUrlSlug
	  oldSlugExpiredDate
          profilePictureUrl
          pitchVideo {
            title
            url
            type
            size
          }
          keyAchievements
          mediaCoverages {
            url
            title
            description
            imageUrl
          }
          files {
            title
            url
            type
            size
            fileExtension
            fileTitle
            fileThumbnailURL
          }
          socialProfiles {
            platform
            profileLink
          }
          selectedAdministratedGroups {
            id
            fbGroupId
            name
            profilePictureUrl
            memberCount
          }
          selectedSupportedGroups {
            id
            fbGroupId
            name
            profilePictureUrl
            memberCount
          }
          isBioCompleted
          kudos
		  firstName
		  lastName
          `;

	private adminBioDraftReturnAttributes = `
          userId
		  allowBrandsToContact
          bio
          country
		  countryFullName
		  contactEmail
          profilePictureUrl
	  profileUrl
	  profileUrlSlug
          pitchVideo {
            title
            url
            type
            size
          }
          keyAchievements
          mediaCoverages {
            url
            title
            description
            imageUrl
          }
          files {
            title
            url
            type
            size
            fileExtension
            fileTitle
            fileThumbnailURL
          }
          socialProfiles {
            platform
            profileLink
          }
          selectedAdministratedGroups {
            id
            fbGroupId
            name
            profilePictureUrl
            memberCount
          }
          selectedSupportedGroups {
            id
            fbGroupId
            name
            profilePictureUrl
            memberCount
          }
		  publishedStatus
          `;

	private adminBioAnalyticsReturnAttributes = `
	error
    kudosList {
      createdAtUTC
      createdAtUTCTick
      error
      fullName
      id
      profilePictureUrl
      srcUserId
      updatedAtUTC
	  isBioAvailable
	  profileUrl
	  profileError
    }
    userId
    totalKudos
    totalContactRequests`;

	private adminBioContactLeadReturnAttributes = `
	items {
		fullName
		emailAddress
		companyName
		phoneNumber
		message
		targets
		createdAtUTCTick
		createdAtUTC
	}
	nextToken
	`;

	private wsRealtimeSubscriptions: Map<string, Subscriber<any>> = new Map();
	private _webSocketTimer = 4 * 60 * 1000;
	private _websocketClosed = new Subject();
	public websocketClosed = this._websocketClosed.asObservable();

	constructor(private readonly loggerService: LoggerService) {
		this.subscriptionsMonitor();
	}

	public OnUpdateGroupsListener(id: string): Observable<Group> {
		const statement = `subscription OnUpdateGroups($id: ID) {
        onUpdateGroups(id: $id) {
          __typename
          id
          state
          updatedAtUTC
          name
          memberCount
          isDead
          areMetricsAvailable
          percentageLast3DaysMetricsAvailable
          percentageLast28DaysMetricsAvailable
          percentageLast7DaysMetricsAvailable
          percentageLastMonthMetricsAvailable
          percentagesSecondLastMonthMetricsAvailable
          percentagesThirdLastMonthMetricsAvailable
          percentageLast14DaysMetricsAvailable
          isConversationTrendAvailable
          areRecommendationsAvailable
        }
      }`;
		return this.executeGraphQLSubscriptionStatement(statement, {id}) as Observable<Group>;
	}

	public OnUpdateUser(id: string): Observable<Users> {
		const statement = `subscription OnUpdateUser($id: ID) {
		onUpdateUser(id: $id) {
          __typename
          id
		  whatsappSubscriptionStatus
		  productDemoedAtDate
		  joinedCSGroupAtDate
		  monetizationWorkshopAttendedAtDate
        }
      }`;
		const gqlAPIServiceArguments: any = {id};
		return this.executeGraphQLSubscriptionStatement(statement, gqlAPIServiceArguments) as Observable<Users>;
	}

	public OnUpdateCampaignGroupsOnCampaignId(campaignId: String): Observable<any> {
		const statement = `subscription OnUpdateCampaignGroupsOnCampaignId($campaignId: String) {
			onUpdateCampaignGroupsOnCampaignId(campaignId: $campaignId) {
				campaignId	
				groupId	
				groupTaskStatus
        	}
      	}`;

		const gqlAPIServiceArguments: any = {campaignId};
		return this.executeGraphQLSubscriptionStatement(statement, gqlAPIServiceArguments) as Observable<any>;
	}

	public onUpdateBrandCampaign(campaignId: String): Observable<any> {
		const statement =
			`subscription OnUpdateBrandCampaign($campaignId: String) {
			onUpdateBrandCampaign(campaignId: $campaignId) {
				` +
			this.campaignsReturnAttributes +
			`
        	}
      	}`;

		const gqlAPIServiceArguments: any = {campaignId};
		return this.executeGraphQLSubscriptionStatement(statement, gqlAPIServiceArguments) as Observable<any>;
	}

	async GetNotifications(forUserId: string, limit?: number, nextToken?: string): Promise<GetNotificationsQuery> {
		const statement =
			`query GetNotifications($forUserId: String!, $limit: Int, $nextToken: String) {
        getNotifications(forUserId: $forUserId, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.notificationsReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments = this.getArgumentsForListQuery(null, limit, nextToken);
		gqlAPIServiceArguments.forUserId = forUserId;
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GetNotificationsQuery>response.data.getNotifications;
	}

	async UpdateNotifications(input: UpdateNotificationsInput): Promise<Notifications> {
		const statement =
			`mutation UpdateNotifications($input: UpdateNotificationsInput!) {
        updateNotifications(input: $input) {
          ` +
			this.notificationsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Notifications>response.data.updateNotifications;
	}

	public OnCreateNotificationsListener(forUserId: string): Observable<Notifications> {
		const statement =
			`subscription OnCreateNotifications($forUserId: String) {
        onCreateNotifications(forUserId: $forUserId) {
          ` +
			this.notificationsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {forUserId};

		return this.executeGraphQLSubscriptionStatement(statement, gqlAPIServiceArguments) as Observable<Notifications>;
	}

	async CreateUsers(input: CreateUsersInput): Promise<Users> {
		const statement =
			`mutation CreateUsers($input: CreateUsersInput!) {
        createUsers(input: $input) {
          ` +
			this.usersQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);

		return <Users>response.data.createUsers;
	}

	async updateUser(input: UpdateUserInput): Promise<UserModel> {
		const statement =
			`mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
        ` +
			this.usersQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {
			input
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);

		return <UserModel>response.data.updateUser;
	}

	async fetchConversations(
		terms: Array<string>,
		groupIds: Array<string>,
		actionsTaken?: Array<string>,
		sentiments?: Array<string>,
		contentTypes?: Array<string>,
		from?: number,
		size?: number,
		fromDateAtUTC?: string | null,
		toDateAtUTC?: string | null
	): Promise<Conversation> {
		const statement =
			`query FetchConversations($terms: [String!]!, $groupIds: [String!]!, $actionsTaken: [String!], $sentiments: [String!], $contentTypes: [String!], $from: Int, $size: Int` +
			(fromDateAtUTC ? `, $fromDateAtUTC: AWSDateTime!` : ``) +
			(toDateAtUTC ? `, $toDateAtUTC: AWSDateTime!` : ``) +
			`) {
        fetchConversations(terms: $terms, groupIds: $groupIds, actionsTaken: $actionsTaken, sentiments: $sentiments, contentTypes: $contentTypes, from: $from, size: $size` +
			(fromDateAtUTC ? `, fromDateAtUTC: $fromDateAtUTC` : ``) +
			(toDateAtUTC ? `, toDateAtUTC: $toDateAtUTC` : ``) +
			`) {
        ` +
			this.conversationsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {
			terms,
			groupIds
		};
		if (actionsTaken) {
			gqlAPIServiceArguments.actionsTaken = actionsTaken;
		}
		if (sentiments) {
			gqlAPIServiceArguments.sentiments = sentiments;
		}
		if (contentTypes) {
			gqlAPIServiceArguments.contentTypes = contentTypes;
		}
		gqlAPIServiceArguments.from = from ? from : 0;
		if (size) {
			gqlAPIServiceArguments.size = size;
		}
		if (fromDateAtUTC) {
			gqlAPIServiceArguments.fromDateAtUTC = fromDateAtUTC;
		}
		if (toDateAtUTC) {
			gqlAPIServiceArguments.toDateAtUTC = toDateAtUTC;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Conversation>response.data.fetchConversations;
	}

	async fetchConversationBySourceIds(groupId: string, sourceIds: Array<string>): Promise<Conversation[]> {
		const statement =
			`query FetchConversationBySourceIds($groupId: String!, $sourceIds: [String!]!) {
        fetchConversationBySourceIds(groupId: $groupId, sourceIds: $sourceIds) {
        ` +
			this.postsInformationReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, sourceIds};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Conversation[]>response.data.fetchConversationBySourceIds;
	}

	async removeGroupModerator(email: string, groupId: string): Promise<ResponseObject> {
		const statement = `mutation RemoveGroupModerator($email: String, $groupId: String) {
        removeGroupModerator(email: $email, groupId: $groupId) {
          __typename
          status
        }
      }`;
		const gqlAPIServiceArguments: any = {};
		gqlAPIServiceArguments.email = email;
		gqlAPIServiceArguments.groupId = groupId;
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ResponseObject>response.data.removeGroupModerator;
	}

	async addModeratorForGroup(
		groupDetails: string,
		inviterName: string,
		inviterUserId: string,
		email: string,
		mobilenumber: string,
		name: string
	): Promise<any> {
		const statement =
			`mutation AddModeratorForGroup($email: String!, $groupDetails: AWSJSON!, $inviterName: String!, $inviterUserId: String!, $name: String!, $mobilenumber: String!) {
        addModeratorForGroup(email: $email, groupDetails: $groupDetails, inviterName: $inviterName, inviterUserId: $inviterUserId, name: $name, mobilenumber: $mobilenumber) {
      ` +
			this.notificationsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {email, groupDetails, inviterName, inviterUserId};
		if (name) {
			gqlAPIServiceArguments.name = name;
		}
		if (mobilenumber) {
			gqlAPIServiceArguments.mobilenumber = mobilenumber;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response;
	}

	async getGroupMembersByGroupId(groupId: string): Promise<GroupMembers> {
		const statement =
			`query GetGroupMembersByGroupId($groupId: String!) {
        getGroupMembersByGroupId(groupId: $groupId) {
          __typename
          items {
          ` +
			this.groupMembersReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMembers>response.data.getGroupMembersByGroupId;
	}

	async getGroupModeratorsByGroupId(groupId: string): Promise<GroupMembers> {
		const statement =
			`query GetGroupModeratorsByGroupId($groupId: String!) {
        getGroupModeratorsByGroupId(groupId: $groupId) {
          __typename
          items {
          ` +
			this.groupMembersReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMembers>response.data.getGroupModeratorsByGroupId;
	}

	async updateGroup(input: UpdateGroupInput): Promise<Group> {
		const statement =
			`mutation UpdateGroup($input: UpdateGroupInput!) {
        updateGroup(input: $input) {
        ` +
			this.groupsQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);

		return <Group>response.data.updateGroup;
	}

	async updateGroups(input: [UpdateGroupInput]): Promise<Group> {
		const statement =
			`mutation updateGroups($input: [UpdateGroupInput!]!) {
        updateGroups(input: $input) {
        ` +
			this.groupsQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);

		return <Group>response.data.updateGroups;
	}

	async getGroupsByUserId(userId: string, filterByRole?: Role, nextToken?: string): Promise<GroupsConnection> {
		const gqlAPIServiceArguments: any = {userId};
		const statement =
			`query GetGroupsByUserId($userId: String!, $filterByRole: RoleEnum, $nextToken: String) {
        getGroupsByUserId(userId: $userId, filterByRole: $filterByRole, nextToken: $nextToken) {
          items {
          ` +
			this.groupsQueryReturnAttributes +
			`
          }
          nextToken
        }
      }`;

		if (filterByRole) {
			gqlAPIServiceArguments.filterByRole = filterByRole;
		}

		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupsConnection>response.data.getGroupsByUserId;
	}

	async ListGroupMetricsByGroupId(
		groupId: string,
		tickOfStartHour: number,
		tickOfEndHour: number,
		limit?: number,
		nextToken?: string
	): Promise<ListGroupMetricsByGroupIdQuery> {
		const statement =
			`query ListGroupMetricsByGroupId($groupId: String!, $tickOfStartHour: Int!, $tickOfEndHour: Int!, $limit: Int, $nextToken: String) {
        listGroupMetricsByGroupId(groupId: $groupId, tickOfStartHour: $tickOfStartHour, tickOfEndHour: $tickOfEndHour, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.groupMetricsQueryReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {
			groupId,
			tickOfStartHour,
			tickOfEndHour
		};
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListGroupMetricsByGroupIdQuery>response.data.listGroupMetricsByGroupId;
	}

	async ListAssociationInsightViewMetricsByInsightViewId(
		insightViewId: string,
		brandId,
		tickOfStartHour: number,
		tickOfEndHour: number,
		limit?: number,
		nextToken?: string
	): Promise<ListInsightViewMetricsByInsightViewIdQuery> {
		const statement =
			`query ListInsightViewMetricsByInsightViewId($insightViewId: String!, $brandId: String!, $tickOfStartHour: Int!, $tickOfEndHour: Int!, $limit: Int, $nextToken: String) {
        listInsightViewMetricsByInsightViewId(insightViewId: $insightViewId, brandId: $brandId, tickOfStartHour: $tickOfStartHour, tickOfEndHour: $tickOfEndHour, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.associationInsightViewMetricsReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {insightViewId, tickOfStartHour, tickOfEndHour};
		gqlAPIServiceArguments.brandId = !!brandId ? brandId : null;
		gqlAPIServiceArguments.limit = !!limit ? limit : 10000;
		gqlAPIServiceArguments.nextToken = !!nextToken ? nextToken : null;
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListInsightViewMetricsByInsightViewIdQuery>response.data.listInsightViewMetricsByInsightViewId;
	}

	async getUserDetails(): Promise<Users> {
		const statement =
			`query GetUserDetails {
        getUserDetails {
          ` +
			this.usersQueryReturnAttributes +
			`
        }
      }`;
		const response = await this.executeGraphQlStatement(statement);

		return <Users>response.data.getUserDetails;
	}

	async getUserById(id: string, memberOfGroupId?: string): Promise<Users> {
		const statement =
			`query GetUserById($id: String!, $memberOfGroupId: String) {
        getUserById(id: $id, memberOfGroupId: $memberOfGroupId) {
          ` +
			this.usersQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {id};
		if (memberOfGroupId) {
			gqlAPIServiceArguments.memberOfGroupId = memberOfGroupId;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Users>response.data.getUserById;
	}

	async GetGroup(id: string): Promise<Group> {
		const statement =
			`query GetGroupById($id: ID!) {
        getGroupById(id: $id) {
        ` +
			this.groupsQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {
			id
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);

		return <Group>response.data.getGroupById;
	}

	async getCampaignsByBrandId(brandId: string, nextToken?: string): Promise<CampaignConnection> {
		const statement =
			`query GetCampaignsByBrandId($brandId: String!, $nextToken: String) {
        getCampaignsByBrandId(brandId: $brandId, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.campaignsReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {brandId};
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignConnection>response.data.getCampaignsByBrandId;
	}

	async getCampaignAssetsByCampaignId(campaignId: string): Promise<CampaignAsset[]> {
		const statement = `query getCampaignAssets($campaignId: String!) {
			getCampaignAssets(campaignId: $campaignId) {
				brandId
				brandName
				campaignId
				campaignName
				communityAdminName
				groupId
				groupName
				items {
					assignedContentUserId
					id
					rejectReason
					status
					type
					value
					updatedAtInSeconds
					updatedByContentTeam
				}
				rating
				status
			}
		}`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignAsset[]>response.data.getCampaignAssets;
	}

	async getCampaignGroupAssetsByIds(campaignId: string, groupId: string): Promise<CampaignAsset[]> {
		const statement = `query getCampaignGroupAsset($campaignId: String!, $groupId: String!) {
			getCampaignGroupAsset(campaignId: $campaignId, groupId: $groupId) {
				brandId
				brandName
				campaignId
				campaignName
				communityAdminName
				groupId
				groupName
				items {
					assignedContentUserId
					id
					rejectReason
					status
					type
					value
					updatedAtInSeconds
					updatedByContentTeam
				}
				rating
				status
			}
		}`;
		const gqlAPIServiceArguments: any = {campaignId, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignAsset[]>response.data.getCampaignGroupAsset;
	}

	async deleteCampaignGroupAsset({campaignId, groupId, itemId}) {
		const statement = `mutation DeleteCampaignGroupAsset($campaignId: String!, $groupId: String!, $itemId: String!) {
			deleteCampaignGroupAsset(campaignId: $campaignId, groupId: $groupId, itemId: $itemId) {
				status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId, itemId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return response.data.deleteCampaignGroupAsset;
	}

	async updateCampaignGroupAssetsByIds(
		campaignId: string,
		groupId: string,
		input: UpdateAssetInput
	): Promise<CampaignAsset> {
		const statement = `mutation updateCampaignGroupAsset($campaignId: String!, $groupId: String!, $input: UpdateAssetInput!) {
			updateCampaignGroupAsset(campaignId: $campaignId, groupId: $groupId, input: $input) {
				brandId
				brandName
				campaignId
				campaignName
				communityAdminName
				groupId
				groupName
				items {
					assignedContentUserId
					id
					rejectReason
					status
					type
					updatedAtInSeconds
					updatedByContentTeam
					value
				}
				rating
				status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId, input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignAsset>response.data.updateCampaignGroupAsset;
	}

	async createCampaignGroupAsset({
		campaignId,
		groupId,
		input
	}: {
		campaignId: string;
		groupId: string;
		input: CreateAssetInput;
	}): Promise<CampaignAsset> {
		const statement = `mutation CreateCampaignGroupAsset($campaignId: String!, $groupId: String!, $input: CreateAssetInput!) {
			createCampaignGroupAsset(campaignId: $campaignId, groupId: $groupId, input: $input) {
				brandId
				brandName
				campaignId
				campaignName
				communityAdminName
				groupId
				groupName
				items {
					assignedContentUserId
					id
					rejectReason
					status
					type
					updatedAtInSeconds
					updatedByContentTeam
					value
				}
				rating
				status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId, input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignAsset>response.data.createCampaignGroupAsset;
	}

	async cmcSendRating({
		campaignId,
		groupId,
		rating
	}: {
		campaignId: string;
		groupId: string;
		rating: number;
	}): Promise<{status: string}> {
		const statement = `mutation CmcSendRating($campaignId: String!, $groupId: String!, $rating: Int!) {
			cmcSendRating(campaignId: $campaignId, groupId: $groupId, rating: $rating) {
			  	status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId, rating};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.cmcSendRating;
	}

	async sendProposalToCommunityAdmin({campaignId, communityAdminId, groupId}): Promise<{status: string}> {
		const statement = `mutation SendProposalToCommunityAdmin($campaignId: String!, $communityAdminId: String!, $groupId: String!) {
			sendProposalToCommunityAdmin(campaignId: $campaignId, communityAdminId: $communityAdminId, groupId: $groupId) {
				status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, communityAdminId, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.sendProposalToCommunityAdmin;
	}

	async downloadCampaignGroupAssetsExcel({campaignId}): Promise<{url: string}> {
		const statement = `query DownloadCampaignGroupAssetsExcel($campaignId: String!) {
			downloadCampaignGroupAssetsExcel(campaignId: $campaignId) {
			  	url
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{url: string}>response.data.downloadCampaignGroupAssetsExcel;
	}

	async getCMCNotifications({
		userId,
		timestamp,
		count,
		campaignId,
		type
	}: CMCNotificationInput): Promise<CMCNotification[]> {
		const statement = `query FetchCMCNotifications($userId: String!, $timestamp: Long!, $count: Int!, $campaignId: String, $type: CMCNotificationType) {
			fetchCMCNotifications(userId: $userId, timestamp: $timestamp, count: $count, campaignId: $campaignId, type: $type) {
				assetItemId
				brandId
				campaignId
				groupId
				id
				message
				read
				senderUserId
				timestamp
				userId
			}
		}`;

		const gqlAPIServiceArguments: any = {userId, timestamp, count, campaignId, type};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CMCNotification[]>response.data.fetchCMCNotifications;
	}

	async markCMCNotificationAsRead({id}): Promise<{status: string}> {
		const statement = `mutation MarkCmcNotificationAsRead($id: String!) {
			markCmcNotificationAsRead(id: $id) {
				status
			}
		}`;

		const gqlAPIServiceArguments: any = {id};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.markCmcNotificationAsRead;
	}

	async createTaskForCampaignGroupAsset({campaignId, groupId}): Promise<{status: string}> {
		const statement = `mutation CreateTaskForCampaignGroupAsset($campaignId: String!, $groupId: String!) {
			createTaskForCampaignGroupAsset(campaignId: $campaignId, groupId: $groupId) {
				status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.createTaskForCampaignGroupAsset;
	}

	async requireAssetReminder({
		campaignId,
		groupId,
		message
	}: {
		campaignId: string;
		groupId: string;
		message?: string;
	}): Promise<{status: string}> {
		const statement = `mutation RequireAssetReminder($campaignId: String!, $groupId: String!, $message: String) {
			requireAssetReminder(campaignId: $campaignId, groupId: $groupId, message: $message) {
				status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId, message};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.requireAssetReminder;
	}

	async getUsersByRoles(): Promise<UsersByRolesOutput> {
		const statement = `query GetUsersByRoles {
			getUsersByRoles {
				copywriter {
					username
					id
					fullname
					givenname
					familyname
					email
				}
				designer {
					username
					id
					fullname
					givenname
					familyname
					email
				}
			}
		}`;

		const gqlAPIServiceArguments: any = {};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <UsersByRolesOutput>response.data.getUsersByRoles;
	}

	async getCampaignGroupAssetKpis(campaignId: string): Promise<CampaignGroupAssetKPIs> {
		const statement = `query GetCampaignGroupAssetKpis($campaignId: String!) {
			getCampaignGroupAssetKpis(campaignId: $campaignId) {
				assetsApproved
				assetsDeclined
				assetsPending
				campaignAccepted
				campaignPending
				campaignRejected
				campaignProductRequired
				campaignTaskCreated
				groupAssetsApproved
				campaignTotal
				groupAssetsPartial
				groupAssetsRequireDeclined
				groupAssetsRequireInitial
				groupAssetsRequireReview
				campaignCMCRatingTotal
				campaignCMCRatingCount
				campaignCMCRatingAvg
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignGroupAssetKPIs>response.data.getCampaignGroupAssetKpis;
	}

	async brandApproveCampaign(campaignId: string, groupId?: string): Promise<{status: string}> {
		const statement = `mutation BrandApproveCampaign($campaignId: String!, $groupId: String) {
			brandApproveCampaign(campaignId: $campaignId, groupId: $groupId) {
			  	status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.brandApproveCampaign;
	}

	async markDeleteCampaignTask(campaignId: string, groupId: string): Promise<{status: string}> {
		const statement = `mutation MarkDeleteCampaignTask($campaignId: String!, $groupId: String!) {
			markDeleteCampaignTask(campaignId: $campaignId, groupId: $groupId) {
			  	status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.markDeleteCampaignTask;
	}

	async markCampaignTaskDone(campaignId: string, groupId: string): Promise<{status: string}> {
		const statement = `mutation MarkCampaignTaskDone($campaignId: String!, $groupId: String!) {
			markCampaignTaskDone(campaignId: $campaignId, groupId: $groupId) {
			  	status
			}
		}`;

		const gqlAPIServiceArguments: any = {campaignId, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.markCampaignTaskDone;
	}

	async putGroupProfileReview(input: PutGroupProfileReviewTypeInput): Promise<GroupProfileReview> {
		const statement = `mutation PutGroupProfileReview($input: PutGroupProfileReviewTypeInput!) {
			putGroupProfileReview(input: $input) {
				fullname
				groupProfileId
				isDeleted
				isDisabled
				profilePictureUrl
				rating
				reviewText
				timestamp
				userId
			}
		}`;

		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfileReview>response.data.putGroupProfileReview;
	}

	async putGroupReview(input: PutGroupReviewTypeInput): Promise<GroupProfileReview> {
		const statement = `mutation PutGroupReview($input: PutGroupReviewTypeInput!) {
			putGroupReview(input: $input) {
				fullname
				groupId
				rating
				isDisabled
				profilePictureUrl
				reviewText
				timestamp
				userId
			}
		}`;

		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfileReview>response.data.putGroupReview;
	}

	async deleteGroupProfileReview({groupProfileId}): Promise<{error: any; success: boolean}> {
		const statement = `mutation DeleteGroupProfileReview($groupProfileId: String!) {
			deleteGroupProfileReview(groupProfileId: $groupProfileId) {
				error
				success
			}
		}`;

		const gqlAPIServiceArguments: any = {groupProfileId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{error: any; success: boolean}>response.data.deleteGroupProfileReview;
	}

	async deleteGroupReview({groupId}): Promise<{error: any; success: boolean}> {
		const statement = `mutation DeleteGroupReview($groupId: String!) {
			deleteGroupReview(groupId: $groupId) {
				error
				success
			}
		}`;

		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{error: any; success: boolean}>response.data.deleteGroupReview;
	}

	async communityDiscoveryFilters(): Promise<CommunityDiscoveryFiltersResponse> {
		const statement =
			`query communityDiscoveryFilters {
        communityDiscoveryFilters{
       ` +
			this.communityDiscoveryFiltersResponse +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CommunityDiscoveryFiltersResponse>response.data.communityDiscoveryFilters;
	}

	async getCommunityManagers(): Promise<[Users]> {
		const statement = `query getCommunityManagers {	
        getCommunityManagers{	
       		id	
			fullname	
        }	
      }`;
		const gqlAPIServiceArguments: any = {};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <[Users]>response.data.getCommunityManagers;
	}
	async getCommunityAdmins(groupId): Promise<any> {
		const statement = `query getCommunityAdmins($groupId: String!) {	
        getCommunityAdmins(groupId: $groupId){	
       		id	
					fullname	
					modeOfCommunication	
					modeOfCommunicationVerificationStatus		
					mobileNumber
					email
					mobileCountryCode
					mobileDialCode
					cmcTrained
					performanceTrained
        }	
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getCommunityAdmins;
	}

	async communityCitiesByCountriesOrRegions(countries, regions): Promise<any> {
		const statement = `query communityCitiesByCountriesOrRegions($countries: [String], $regions: [String]) {
        communityCitiesByCountriesOrRegions(countries: $countries, regions: $regions)
      }`;
		const gqlAPIServiceArguments: any = {countries, regions};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.communityCitiesByCountriesOrRegions;
	}

	async ListGroupKeywordMetricsByGroupId(
		groupId: string,
		tickOfStartHour: number,
		tickOfEndHour: number,
		limit?: number,
		nextToken?: string
	): Promise<ListGroupKeywordMetricsByGroupIdQuery> {
		const statement = `query ListGroupKeywordMetricsByGroupId($groupId: String!, $tickOfStartHour: Int!, $tickOfEndHour: Int!, $limit: Int, $nextToken: String) {
        listGroupKeywordMetricsByGroupId(groupId: $groupId, tickOfStartHour: $tickOfStartHour, tickOfEndHour: $tickOfEndHour, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
            __typename
            groupId
            metricForDayUTCStartTick
            viewName
            createdAtUTC
            updatedAtUTC
            top10Tokens
            top10Keywords
            categories
            numWeekOfMonth
            metricForDayUTCYear
            metricForDayUTCMonth
            metricForDayUTCDay
            metricForHourUTCHour
            top10Bigrams
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {
			groupId,
			tickOfStartHour,
			tickOfEndHour
		};
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListGroupKeywordMetricsByGroupIdQuery>response.data.listGroupKeywordMetricsByGroupId;
	}

	async listBCRConversationData(
		groupId: string,
		tickOfStartHour: number,
		tickOfEndHour: number,
		limit?: number,
		nextToken?: string
	): Promise<ListGroupKeywordMetricsByGroupIdQuery> {
		const statement = `query listBCRConversationData($groupId: String!, $tickOfStartHour: Int!, $tickOfEndHour: Int!, $limit: Int, $nextToken: String) {
        listBCRConversationData(groupId: $groupId, tickOfStartHour: $tickOfStartHour, tickOfEndHour: $tickOfEndHour, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
            __typename
            groupId
            metricForDayUTCStartTick
            createdAtUTC
            updatedAtUTC
            top10Tokens
            top10Keywords
            categories
            numWeekOfMonth
            metricForDayUTCYear
            metricForDayUTCMonth
            metricForDayUTCDay
            top10Bigrams
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {
			groupId,
			tickOfStartHour,
			tickOfEndHour
		};
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListGroupKeywordMetricsByGroupIdQuery>response.data.listBCRConversationData;
	}

	async ListCampaignGroups(
		campaignId: string,
		brandId: string,
		limit?: number,
		nextToken?: string
	): Promise<ListCampaignGroupsQuery> {
		const statement = `query ListCampaignGroups($campaignId: String, $brandId: String) {	
        listCampaignGroups(campaignId: $campaignId, brandId: $brandId) {	
			__typename	
			campaignId	
			groupId	
			id	
			groupName	
			createdAtUTC	
			updatedAtUTC	
			memberCount	
			memberEngagementRateUTC	
			postEngagementRateUTC	
			groupTaskStatus	
			businessCategory	
			state	
			groupInstallationStartedAtUTC	
			totalKeywordMentions	
			totalHashtagMentions	
			totalBrandMentions	
			iconUrl	
			campaignPostEngagementRateLastNinetyDays	
			campaignAssetProposalSent
			postsEngagementRateLastNinetyDays	
			fbGroupId	
			topTenCities	
			categoryDensity	
			location	
			communityAdminId	
			communityAdminName	
			pricing	
			currency	
			communityManagerId	
			defaultTaskDate	
			timezone	
			modeOfCommunication	
			modeOfCommunicationVerificationStatus	
			paymentStatus
			paymentRemarks
			paymentDate
			isPaymentInfoAvailable	
			communityAdminContact
			postType
			campaignGroupTaskId
			isAcceptedByCommunityAdmin
			averageTopPostsReach
			cohort
			metadata
			assetsKpis {
				campaignAssetsApproved
				campaignAssetsApprovedAll
				campaignAssetsDeclined
				campaignAssetsHasDeclined
				campaignAssetsHasPending
				campaignAssetsInitial
				campaignAssetsPending
				campaignAssetsStatus
			}
        }	
      }`;
		const gqlAPIServiceArguments: any = this.getArgumentsForListQuery(null);
		gqlAPIServiceArguments.campaignId = campaignId;
		gqlAPIServiceArguments.brandId = brandId;
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListCampaignGroupsQuery>response.data.listCampaignGroups;
	}

	async listCampaignGroupsAndTasksDetails(
		campaignId: string,
		brandId: string,
		nextToken?: string
	): Promise<CampaignGroupAndTaskDetails> {
		const statement =
			`query listCampaignGroupsAndTasksDetails($campaignId: String!, $brandId: String!) {	
        listCampaignGroupsAndTasksDetails(campaignId: $campaignId, brandId: $brandId) {	
			 __typename
          items {
         ` +
			this.campaignGroupsAndTaskDetailsReturnAttributes +
			`
          }
          nextToken
        }	
      }`;
		const gqlAPIServiceArguments: any = this.getArgumentsForListQuery(null);
		gqlAPIServiceArguments.campaignId = campaignId;
		gqlAPIServiceArguments.brandId = brandId;
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignGroupAndTaskDetails>response.data.listCampaignGroupsAndTasksDetails;
	}

	async getCampaignGroupsForUser(): Promise<UserCampaignGroup[]> {
		const statement = `query getCampaignGroupsForUser {	
        getCampaignGroupsForUser {	
			__typename	
  		campaignId
  		groupId
  		groupName
			brandName
  		pricing
  		currency
  		groupTaskStatus
  		campaignName
  		status
  		startDateAtUTC
  		endDateAtUTC
  		primaryObjective
  		campaignBriefForCommunityAdmin
  		toBePerformedAtUTC
  		isAcceptedByCommunityAdmin
  		details
		typeformId
		cohort
        }	
      }`;
		const response = await this.executeGraphQlStatement(statement);
		return <UserCampaignGroup[]>response.data.getCampaignGroupsForUser;
	}

	//
	// async getCampaignGroupsForUser(): Promise<ListCampaignGroupsQuery> {
	// 	const statement =
	// 		`query getCampaignGroupsForUser() {
	//       getCampaignGroupsForUser() {
	//       __typename
	//         items {
	//         ` +
	// 		this.listCampaignGroupsReturnAttributes +
	// 		`
	//         }
	//         nextToken
	//       }
	//     }`;
	// 	const gqlAPIServiceArguments: any = this.getArgumentsForListQuery(null);
	// 	const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
	// 	return <ListCampaignGroupsQuery>response.data;
	// }

	async listInsightViews(
		campaignId?: string,
		brandId?: string,
		limit?: number,
		nextToken?: string
	): Promise<ListInsightViewsQuery> {
		const statement =
			`query ListInsightViews($campaignId: String, $brandId: String, $limit: Int, $nextToken: String) {
        listInsightViews(campaignId: $campaignId, brandId: $brandId, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.insightViewsReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {};
		if (campaignId) {
			gqlAPIServiceArguments.campaignId = campaignId;
		}
		if (brandId) {
			gqlAPIServiceArguments.brandId = brandId;
		}
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListInsightViewsQuery>response.data.listInsightViews;
	}

	async GetBrandsByUserId(userId: string, nextToken?: string): Promise<GetBrandsByUserIdQuery> {
		const statement =
			`query GetBrandsByUserId($userId: String!, $nextToken: String) {
        getBrandsByUserId(userId: $userId, nextToken: $nextToken) {
			items {
				` +
			this.brandsReturnAttributes +
			`
				}
			nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {
			userId,
			nextToken
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GetBrandsByUserIdQuery>response.data.getBrandsByUserId;
	}

	async CreateBrandCredentials(
		brandName: string,
		iconUrl: string,
		communicationEmailForCredentials: string,
		doNotProcessError?: boolean
	): Promise<String> {
		const statement = `mutation createBrandCredentials($brandName: String!, $iconUrl: String!, $communicationEmailForCredentials: String!) {
			createBrandCredentials(brandName: $brandName, iconUrl: $iconUrl, communicationEmailForCredentials: $communicationEmailForCredentials) {
				message
				brandId
			}
		}`;
		const gqlAPIServiceArguments: any = {
			brandName,
			iconUrl,
			communicationEmailForCredentials
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments, doNotProcessError);
		return <String>response.data.createBrandCredentials;
	}

	async updateBrand(input: UpdateBrandInput): Promise<any> {
		const statement = `mutation updateBrand($input: UpdateBrandInput!) {
        updateBrand(input: $input){
         		id
				status
			}
		}`;
		const response = await this.executeGraphQlStatement(statement, {input});
		return <any>response.data;
	}

	async UpdateKeywordTrackerReport(input: UpdateKeywordTrackerReportInput): Promise<KeywordTrackerReport> {
		const statement =
			`mutation UpdateKeywordTrackerReport($input: UpdateKeywordTrackerReportInput!) {
        updateKeywordTrackerReport(input: $input) {
        ` +
			this.keywordTrackerReportReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {
			input
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <KeywordTrackerReport>response.data.updateKeywordTrackerReport;
	}

	async getKeywordTrackerReport(ownerId: string): Promise<KeywordTrackerReport[]> {
		const statement =
			`query GetKeywordTrackerReport($ownerId: String!) {
        getKeywordTrackerReport(ownerId: $ownerId) {
        ` +
			this.keywordTrackerReportReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {ownerId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <KeywordTrackerReport[]>response.data.getKeywordTrackerReport;
	}

	async listKeywordTrackerMetricByReportId(
		reportId: string,
		tickOfStartHour: number,
		tickOfEndHour: number,
		limit: number,
		nextToken?: String
	): Promise<ListKeywordTrackerMetricQuery> {
		const statement =
			`query ListKeywordTrackerMetricByReportId($reportId: String!, $tickOfStartHour: Int!, $tickOfEndHour: Int!, $limit: Int, $nextToken: String) {
      listKeywordTrackerMetricByReportId(reportId: $reportId, tickOfStartHour: $tickOfStartHour, tickOfEndHour: $tickOfEndHour, limit: $limit, nextToken: $nextToken) {
        __typename
        items {
        ` +
			this.keywordTrackerMetricReturnAttributes +
			`
        }
        nextToken
      }
    }`;
		const gqlAPIServiceArguments: any = {
			reportId,
			tickOfStartHour,
			tickOfEndHour,
			limit,
			nextToken
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListKeywordTrackerMetricQuery>response.data.listKeywordTrackerMetricByReportId;
	}

	async CreateFbPostModel(input: CreateFbPostModelInput): Promise<FbPostModel> {
		const statement =
			`mutation CreateFbPostModel($input: CreateFbPostModelInput!) {
        createFbPostModel(input: $input) {
        ` +
			this.fbPostReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {
			input
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <FbPostModel>response.data.createFbPostModel;
	}

	async updateFbModel(input: UpdateFbPostInput): Promise<FbPostModel> {
		const statement =
			`mutation UpdateFbPost($input: UpdateFbPostInput!) {
        updateFbPost(input: $input) {
        ` +
			this.fbPostReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <FbPostModel>response.data.updateFbPost;
	}

	async listPostAnalytics(fbPostIds: Array<string | null>, groupId: string): Promise<ListPostAnalyticsQuery> {
		const statement =
			`query ListPostAnalytics($fbPostIds: [String]!, $groupId: String!) {
        listPostAnalytics(fbPostIds: $fbPostIds, groupId: $groupId) {
          ` +
			this.postAnalyticsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {fbPostIds, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListPostAnalyticsQuery>response.data.listPostAnalytics;
	}

	async listFbPostModels(
		groupId: string,
		tickOfStartHour: number,
		tickOfEndHour?: number,
		limit?: number,
		nextToken?: string
	): Promise<ListFbPostModelsQuery> {
		// Empty 'tickOfEndHour' will fetch all the posts in the future
		const statement =
			`query ListFbPostModels($groupId: String!, $tickOfStartHour: Int!, $tickOfEndHour: Int, $limit: Int, $nextToken: String) {
        listFbPostModels(groupId: $groupId, tickOfStartHour: $tickOfStartHour, tickOfEndHour: $tickOfEndHour, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.fbPostReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, tickOfStartHour};
		if (tickOfEndHour) {
			gqlAPIServiceArguments.tickOfEndHour = tickOfEndHour;
		}
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListFbPostModelsQuery>response.data.listFbPostModels;
	}

	async GetGRecommendationByDay(groupId: string): Promise<GetGRecommendationByDayQuery> {
		const statement =
			`query GetGRecommendationByDay($groupId: String!) {
        getGRecommendationByDay(groupId: $groupId) {
        ` +
			this.gRecommendationByDayReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {
			groupId
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GetGRecommendationByDayQuery>response.data.getGRecommendationByDay;
	}

	async resendInvitation(groupId: string, createdAtUTCTicks: number): Promise<GroupMemberInvitation> {
		const statement =
			`mutation ResendInvitation($groupId: String!, $createdAtUTCTicks: Int!) {
        resendInvitation(groupId: $groupId, createdAtUTCTicks: $createdAtUTCTicks) {
        ` +
			this.groupMemberInvitationReturnAttribute +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, createdAtUTCTicks};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMemberInvitation>response.data.resendInvitation;
	}

	async removeInvitation(groupId: string, createdAtUTCTicks: number): Promise<GroupMemberInvitation> {
		const statement =
			`mutation RemoveInvitation($groupId: String!, $createdAtUTCTicks: Int!) {
        removeInvitation(groupId: $groupId, createdAtUTCTicks: $createdAtUTCTicks) {
        ` +
			this.groupMemberInvitationReturnAttribute +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, createdAtUTCTicks};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMemberInvitation>response.data.removeInvitation;
	}

	async acceptInvitation(groupId: string, createdAtUTCTicks: number): Promise<GroupMemberInvitation> {
		const statement =
			`mutation AcceptInvitation($groupId: String!, $createdAtUTCTicks: Int!) {
        acceptInvitation(groupId: $groupId, createdAtUTCTicks: $createdAtUTCTicks) {
        ` +
			this.groupMemberInvitationReturnAttribute +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, createdAtUTCTicks};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMemberInvitation>response.data.acceptInvitation;
	}

	async processUserInvitations(
		usernameKey: string,
		usernameValue: string,
		userId: string
	): Promise<GroupMemberInvitationsConnection> {
		const statement =
			`mutation ProcessUserInvitations($usernameKey: String!, $usernameValue: String!, $userId: String!) {
        processUserInvitations(usernameKey: $usernameKey, usernameValue: $usernameValue, userId: $userId) {
          __typename
          items {
          ` +
			this.groupMemberInvitationReturnAttribute +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {usernameKey, usernameValue, userId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMemberInvitationsConnection>response.data.processUserInvitations;
	}

	async getInvitations(groupId: string): Promise<GroupMemberInvitationsConnection> {
		const statement =
			`query GetInvitations($groupId: String!) {
        getInvitations(groupId: $groupId) {
          __typename
          items {
          ` +
			this.groupMemberInvitationReturnAttribute +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMemberInvitationsConnection>response.data.getInvitations;
	}

	async createCampaignTask(campaignTasks: Array<CreateCampaignTaskInput>, brandId: string): Promise<CampaignTask[]> {
		const statement =
			`mutation CreateCampaignTask($brandId: String!, $campaignTasks: [CreateCampaignTaskInput]!) {
				createCampaignTask(brandId: $brandId, campaignTasks: $campaignTasks) {
			` +
			this.campaignTaskReturnAttributes +
			`
				}
		}`;
		const gqlAPIServiceArguments: any = {campaignTasks};
		gqlAPIServiceArguments.brandId = brandId;
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignTask[]>response.data.createCampaignTask;
	}

	async getCampaignMedia(campaignId): Promise<any> {
		const statement = `query getCampaignMedia($campaignId: String!) {
				getCampaignMedia(campaignId: $campaignId) {
			body
			isBase64Encoded
				}
		}`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getCampaignMedia;
	}

	async downloadCommunitiesExcel(campaignId): Promise<any> {
		const statement = `query downloadCommunitiesExcel($campaignId: String!) {
				downloadCommunitiesExcel(campaignId: $campaignId) {
			body
				}
		}`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.downloadCommunitiesExcel;
	}

	async downloadCMCExecutionExcel(campaignId): Promise<any> {
		const statement = `query downloadCMCExecutionExcel($campaignId: String!) {
				downloadCMCExecutionExcel(campaignId: $campaignId) {
			body
				}
		}`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.downloadCMCExecutionExcel;
	}

	async createCMCampaignGroups(input: Array<CreateCMCampaignGroupsInput>): Promise<CMCampaignGroups[]> {
		const statement =
			`mutation createCMCampaignGroups($input: [CreateCampaignGroupInput!]!) {
				createCMCampaignGroups(input: $input) {
			` +
			this.createCMCampaignGroupsReturnAttributes +
			`
				}
		}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CMCampaignGroups[]>response.data.createCMCampaignGroups;
	}

	async deleteCMCampaignGroup(campaignId, groupId): Promise<any> {
		const statement = `mutation deleteCMCampaignGroup($campaignId: String!, $groupId: String!) {
				deleteCMCampaignGroup(campaignId: $campaignId, groupId: $groupId)
		}`;
		const gqlAPIServiceArguments: any = {campaignId, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data;
	}

	async deleteCMCampaignGroups(campaignId, groupIds, taskIds = []): Promise<any> {
		const statement = `mutation deleteCMCampaignGroups($campaignId: String!, $groupIds: [String!]!, $taskIds: [String!]) {	
				deleteCMCampaignGroups(campaignId: $campaignId, groupIds: $groupIds, taskIds: $taskIds)	
		}`;
		const gqlAPIServiceArguments: any = {campaignId, groupIds, taskIds};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data;
	}

	async updateCMCampaignGroup(input: CreateCMCampaignGroupsInput): Promise<CMCampaignGroups> {
		const statement =
			`mutation updateCMCampaignGroup($input: UpdateCampaignGroupInput!) {
				updateCMCampaignGroup(input: $input) {
			` +
			this.createCMCampaignGroupsReturnAttributes +
			`
				}
		}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CMCampaignGroups>response.data;
	}

	async updateCampaignGroupStatus(input: UpdateCampaignGroupSubscriptionsInputInternal): Promise<any> {
		const statement = `mutation updateCampaignGroupStatus($input: UpdateCampaignGroupSubscriptionsInputInternal!) {
				updateCampaignGroupStatus(input: $input) {
				campaignId
				groupId
				groupTaskStatus
				}
		}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data;
	}

	async updateCMCampaignGroups(input: [UpdateCampaignGroupInput]): Promise<CMCampaignGroups> {
		const statement = `mutation updateCMCampaignGroups($input: [UpdateCampaignGroupInput!]!) {	
				updateCMCampaignGroups(input: $input) {	
				campaignId	
    		groupId	
				}	
		}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CMCampaignGroups>response.data;
	}

	async updateCMCampaignGroupsModeOfCommunication(input: [UpdateCampaignGroupModeOfCommunicationInput]): Promise<any> {
		const statement = `mutation updateCMCampaignGroupsModeOfCommunication($input: [UpdateCampaignGroupModeOfCommunicationInput]!) {	
			updateCMCampaignGroupsModeOfCommunication(input: $input)	{
			campaignId	
    		groupId	
    		modeOfCommunicationVerificationStatus
    		communityAdminContact
			}
		}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.updateCMCampaignGroupsModeOfCommunication;
	}

	async createCampaignPosts(input: Array<CreateCampaignPostInput>): Promise<CampaignPost[]> {
		const statement =
			`mutation createCampaignPosts($input: [CreateCampaignPostInput]!) {
			createCampaignPosts(input: $input) {
		` +
			this.campaignPostReturnAttributes +
			`
			}
	}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignPost[]>response.data.createCampaignPosts;
	}

	async createCampaign(input: CreateCampaignInput): Promise<any> {
		const statement =
			`mutation CreateCMCampaign($input: CreateCMCampaignInput!) {
        createCMCampaign(input: $input) {
        ` +
			this.campaignsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Campaign>response.data.createCMCampaign;
	}

	async createSelfMonetizationCampaign(input: CreateSelfMonetizationCampaignInput): Promise<SelfMonetizationCampaign> {
		const statement =
			`mutation createSelfMonetizationCampaign($input: CreateSelfMonetizationCampaignInput!) {
				createSelfMonetizationCampaign(input: $input) {
        ` +
			this.selfMonetizationCampaignsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <SelfMonetizationCampaign>response.data.createSelfMonetizationCampaign;
	}

	async createListeningCampaign(input: CreateListeningCampaignInput): Promise<ListeningCampaign> {
		const statement =
			`mutation createListeningCampaign($input: CreateListeningCampaignInput!) {
				createListeningCampaign(input: $input) {
        ` +
			this.listeningCampaignReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListeningCampaign>response.data.createListeningCampaign;
	}

	async createInsightViews(input: CreateInsightViewsInput): Promise<ListeningCampaignInsightViewsQuery> {
		const statement = `mutation createInsightViews($input: CreateInsightViewsInput!) {
				createInsightViews(input: $input) {
					__typename
					items {
					campaignId
					viewName
					}
			}
		}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListeningCampaignInsightViewsQuery>response.data.createInsightsView;
	}

	async updateInsightViews(input: CreateInsightViewsInput): Promise<ListeningCampaignInsightViewsQuery> {
		const statement = `mutation updateInsightViews($input: UpdateInsightViewsInput!) {
				updateInsightViews(input: $input) {
					__typename
					items {
					campaignId
					viewName
					}
			}
		}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListeningCampaignInsightViewsQuery>response.data.createInsightsView;
	}

	async updateSelfMonetizationCampaignDetails(
		input: UpdateSelfMonetizationCampaignInput
	): Promise<SelfMonetizationCampaign> {
		const statement =
			`mutation updateSelfMonetizationCampaignDetails($input: UpdateSelfMonetizationCampaignInput!) {
				updateSelfMonetizationCampaignDetails(input: $input) {
        ` +
			this.selfMonetizationCampaignsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <SelfMonetizationCampaign>response.data.updateSelfMonetizationCampaignDetails;
	}

	async GetUserCampaigns(limit?: number, nextToken?: string): Promise<UserCampaignConnection> {
		const statement =
			`query GetUserCampaigns($limit: Int, $nextToken: String) {
        getUserCampaigns(limit: $limit, nextToken: $nextToken) {
			__typename
			items{
        ` +
			this.userCampaignReturnAttributes +
			` pricing
			}
			nextToken
        }
      }`;

		const gqlAPIServiceArguments: any = {};

		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}

		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <UserCampaignConnection>response.data.getUserCampaigns;
	}

	async getUpcomingCampaignsForUsers(): Promise<UpcomingUserCampaign[]> {
		const statement =
			`query getUpcomingCampaignsForUsers {
        getUpcomingCampaignsForUsers  {
		` +
			this.upcomingCampaignReturnAttributes +
			`
			}
      }`;

		const gqlAPIServiceArguments: any = {};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <UpcomingUserCampaign[]>response.data.getUpcomingCampaignsForUsers;
	}

	async markUserCampaignStatus(campaignId: string, status: UserAcceptanceEnum): Promise<UserCampaign> {
		const statement =
			`mutation MarkUserCampaignStatus($campaignId: String!, $status: UserAcceptanceEnum) {
        markUserCampaignStatus(campaignId: $campaignId, status: $status) {
        ` +
			this.userCampaignReturnAttributes +
			`
        }
      }`;

		const response = await this.executeGraphQlStatement(statement, {campaignId, status});
		return <UserCampaign>response.data.markUserCampaignStatus;
	}

	async markCampaignStatus(brandId: string, campaignId: string, status: CampaignStatusEnum): Promise<Campaign> {
		const statement =
			`mutation MarkCampaignStatus($brandId: String!,  $campaignId: String!, $status: CampaignStatusEnum) {
        markCampaignStatus(brandId: $brandId, campaignId: $campaignId, status: $status) {
        ` +
			this.campaignsReturnAttributes +
			`
        }
      }`;

		const response = await this.executeGraphQlStatement(statement, {brandId, campaignId, status});
		return <Campaign>response.data.markCampaignStatus;
	}

	async getUserCampaignTasks(campaignId: string, limit?: number, nextToken?: string): Promise<CampaignTasksConnection> {
		const statement =
			`query GetUserCampaignTasks($campaignId: String!, $limit: Int, $nextToken: String) {
        getUserCampaignTasks(campaignId: $campaignId, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.campaignTaskReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {campaignId};
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignTasksConnection>response.data.getUserCampaignTasks;
	}

	async getCampaignTasks(
		brandId: string,
		campaignId: string,
		limit?: number,
		nextToken?: string
	): Promise<CampaignTasksConnection> {
		const statement =
			`query GetCampaignTasks($brandId: String!, $campaignId: String!, $limit: Int, $nextToken: String) {
        getCampaignTasks(brandId: $brandId, campaignId: $campaignId, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
          ` +
			this.campaignTaskReturnAttributes +
			`
          }
          nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {brandId, campaignId};
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignTasksConnection>response.data.getCampaignTasks;
	}

	async getUserSelfMonetizationCampaigns(
		limit?: number,
		nextToken?: string
	): Promise<SelfMonetizationCampaignConnection> {
		const statement =
			`query getUserSelfMonetizationCampaigns($limit: Int, $nextToken: String) {
			getUserSelfMonetizationCampaigns(limit: $limit, nextToken: $nextToken) {
				__typename
				items {				` +
			this.selfMonetizationCampaignsReturnAttributes +
			`
			}
			nextToken
			}
		}`;

		const gqlAPIServiceArguments: any = {};

		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}

		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <SelfMonetizationCampaignConnection>response.data.getUserSelfMonetizationCampaigns;
	}

	async getCampaignReportWithPosts(campaignId, nextToken): Promise<CampaignReportWithPosts> {
		const statement =
			`query getCampaignReportWithPosts($campaignId: String!, $nextToken: String) {
			getCampaignReportWithPosts(campaignId: $campaignId, nextToken: $nextToken) {
				campaignReport {
					` +
			this.campaignReportReturnAttributes +
			`
				}
				campaignPosts {
					items {
					` +
			this.campaignPostReturnAttributes +
			`
					}
					nextToken
				}
			}
		}`;
		const gqlAPIServiceArguments: any = {campaignId};
		if (campaignId) {
			gqlAPIServiceArguments.campaignId = campaignId;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return response.data.getCampaignReportWithPosts;
	}

	async getCampaignPosts(campaignId, limit, nextToken): Promise<CampaignPostsConnection> {
		const statement =
			`query getCampaignPosts($campaignId: String!, $limit: Int,, $nextToken: String) {
				getCampaignPosts(campaignId: $campaignId, limit: $limit, nextToken: $nextToken) {
					items {
					` +
			this.campaignPostReturnAttributes +
			`
					}
					nextToken
				}
		}`;
		const gqlAPIServiceArguments: any = {campaignId, limit};
		if (campaignId) {
			gqlAPIServiceArguments.campaignId = campaignId;
		}
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return response.data.getCampaignPosts;
	}

	async shortenUrl(url): Promise<string> {
		const statement = `mutation shortenUrl($url: String) {
				shortenUrl(url: $url) }`;
		const gqlAPIServiceArguments: any = {url};
		if (url) {
			gqlAPIServiceArguments.url = url;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <string>response.data.shortenUrl;
	}

	async listKeywords(limit?: number, nextToken?: string): Promise<KeywordsConnection> {
		const statement =
			`query ListKeywords($limit: Int, $nextToken: String) {
		listKeywords(limit: $limit, nextToken: $nextToken) {
		__typename
		items {
		` +
			this.keywordsReturnAttributes +
			`
		}
		nextToken
		}
	}`;
		const gqlAPIServiceArguments: any = {};
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <KeywordsConnection>response.data.listKeywords;
	}

	async listCommunityKeywords(limit?: number, nextToken?: string): Promise<KeywordsConnection> {
		const statement =
			`query listCommunityKeywords($limit: Int, $nextToken: String) {
		listCommunityKeywords(limit: $limit, nextToken: $nextToken) {
		__typename
		items {
		` +
			this.keywordsReturnAttributes +
			`
		}
		nextToken
		}
	}`;
		const gqlAPIServiceArguments: any = {};
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <KeywordsConnection>response.data.listCommunityKeywords;
	}

	async updateCampaignDetails(input: UpdateCampaignInput): Promise<Campaign> {
		const statement =
			`mutation UpdateCMCampaignDetails($input: UpdateCMCampaignInput!) {
		updateCMCampaignDetails(input: $input) {
		` +
			this.campaignsReturnAttributes +
			`
		}
	}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Campaign>response.data.updateCMCampaignDetails;
	}

	async triggerWANotifications(
		notificationType,
		groupIds,
		campaignName,
		campaignId,
		campaignStatus,
		typeformId
	): Promise<any> {
		const statement = `mutation TriggerWANotifications($notificationType: CMCWhatsAppNotificationType!, $groupIds: [String!]!, $campaignName: String!, $campaignId: String, $campaignStatus: String, $typeformId: String) {	
		triggerWANotifications(notificationType: $notificationType, groupIds: $groupIds, campaignName: $campaignName, campaignId: $campaignId, campaignStatus: $campaignStatus, typeformId: $typeformId)	
	}`;
		const gqlAPIServiceArguments: any = {
			notificationType,
			groupIds,
			campaignName,
			campaignId,
			campaignStatus,
			typeformId
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data;
	}

	async triggerNotificationsForWAorEmailUpdate(input: triggerNotificationsForWAorEmailUpdateInput): Promise<any> {
		const statement = `mutation triggerNotificationsForWAorEmailUpdate($input: triggerNotificationsForWAorEmailUpdateInput!) {	
		triggerNotificationsForWAorEmailUpdate(input: $input)	
	}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data;
	}

	async subscribeToWhatsApp(landbotCustomerId, phone, dialCode, countryCode, isEdited): Promise<any> {
		const statement =
			`mutation subscribeToWhatsApp($landbotCustomerId: Int!, $phone: String!, $dialCode: String, $countryCode: String, $isEdited: Boolean) {	
		subscribeToWhatsApp(landbotCustomerId: $landbotCustomerId, phone: $phone, dialCode: $dialCode, countryCode: $countryCode, isEdited: $isEdited) {	
	` +
			this.usersQueryReturnAttributes +
			`}
	}`;
		const gqlAPIServiceArguments: any = {landbotCustomerId, phone, dialCode, countryCode, isEdited};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data;
	}

	async updateListeningCampaignInput(input: UpdateListeningCampaignInput): Promise<ListeningCampaign> {
		const statement =
			`mutation updateListeningCampaignDetails($input: UpdateListeningCampaignInput!) {
		updateListeningCampaignDetails(input: $input) {
		` +
			this.listeningCampaignReturnAttributes +
			`
		}
	}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListeningCampaign>response.data.updateListeningCampaignDetails;
	}

	async updateCampaignTaskDetails(input: UpdateCampaignTaskInput): Promise<CampaignTask> {
		const statement =
			`mutation UpdateCampaignTaskDetails($input: UpdateCampaignTaskInput!) {
		updateCampaignTaskDetails(input: $input) {
		` +
			this.campaignTaskReturnAttributes +
			`
		}
	}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignTask>response.data.updateCampaignTaskDetails;
	}

	async updateCampaignPosts(input: Array<UpdateCampaignPostInput>): Promise<CampaignPost[]> {
		const statement =
			`mutation updateCampaignPosts($input: [UpdateCampaignPostInput]!) {
				updateCampaignPosts(input: $input) {
		` +
			this.campaignPostReturnAttributes +
			`
			}
	}`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignPost[]>response.data.updateCampaignPosts;
	}

	async createScreenshotUploadData(input: INewScreenshotAdded): Promise<INewScreenshotAdded> {
		const statement =
			`mutation createScreenshotUploadData($input: ScreenshotUploadDataInput!) {
        createScreenshotUploadData(input: $input) {
      ` +
			this.maunuallyUploadedScreenshotAttributes +
			` }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <INewScreenshotAdded>response.data.createScreenshotUploadData;
	}

	async getManuallyUploadedScreenshots(
		key: String,
		limit: number,
		nextToken?: String
	): Promise<{items: INewScreenshotAdded[]; nextToken?: string}> {
		const statement =
			`query getScreenshotUploadData($key: String!, $limit: Int, $nextToken: String) {
        getScreenshotUploadData(key: $key, limit: $limit, nextToken: $nextToken) {
					items {
      ` +
			this.maunuallyUploadedScreenshotAttributes +
			` }
			nextToken
		 }
      }`;
		const gqlAPIServiceArguments: any = {key, limit, nextToken};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getScreenshotUploadData;
	}

	async deleteCampaignTask(campaignId: string, taskId: string): Promise<CampaignTask> {
		const statement =
			`mutation DeleteCampaignTask($campaignId: String!, $taskId: String!) {
		deleteCampaignTask(campaignId: $campaignId, taskId: $taskId) {
		` +
			this.campaignTaskReturnAttributes +
			`
		}
	}`;
		const gqlAPIServiceArguments: any = {campaignId, taskId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CampaignTask>response.data.deleteCampaignTask;
	}

	async getCmcReportMetrics(campaignId: string): Promise<CmcReportMetrics> {
		const statement = `query GetCmcReportMetrics($campaignId: String!) {
        getCmcReportMetrics(campaignId: $campaignId) {
          __typename
          createdAtUTC
          updatedAtUTC
          campaignId
          totalSubCatConv
          totalBrandConv
          beforeBrandConv
          duringBrandConv
          beforeKwCount
          duringKwCount
          afterKwCount
          beforeBrandMntn
          duringBrandMntn
          numOfCampaignPost
          numOfInfluencer
          numDoneTask
          totalEngagement
          totalComments
		  totalReactions
		  postSourceIds
		  phaseScreenShots
          groupEngagementScore
		      totalReach
		      phaseMetrics
			  totalGroups
			  subCatConvCounts
        }
      }`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CmcReportMetrics>response.data.getCmcReportMetrics;
	}

	async getGroupOverviewStats(groupId, startDate, endDate): Promise<any> {
		const statement = `query getGroupOverviewStats($groupId: String!, $startDate: String!, $endDate: String!) {
        getGroupOverviewStats(groupId: $groupId, startDate: $startDate, endDate: $endDate) {
          __typename
         groupId
  totalMembers
  totalConversations
  totalEngagement
  engagementPercentage
  monthlyActiveUsersPercentage
  dailyActiveUsersPercentage
  memberToAdminPostRatio
  DAUMAURatio
      dailyViewsAverage
    monthlyViewsAverage
    totalViews
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, startDate, endDate};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getGroupOverviewStats;
	}

	async getGroupInsights(groupId): Promise<any> {
		const statement =
			`query getGroupInsights($groupId: String!) {
        getGroupInsights(groupId: $groupId) {
					` +
			this.demographicsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getGroupInsights;
	}

	async getScreenshotData(groupId, from = 0, size = 6): Promise<any> {
		const statement = `query getScreenshotData($groupId: String!, $from: Int!, $size: Int!) {
        getScreenshotData(groupId: $groupId, from: $from, size: $size) {
					sourceId
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, from, size};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getScreenshotData;
	}

	async editGroupTotalMembers(input: [GroupTotalMembers]): Promise<any> {
		const statement = `mutation editGroupTotalMembers($input: [GroupTotalMembers!]!) {
        editGroupTotalMembers(input: $input) {
        dataDateUTC
    groupId
    memberCount
    metricForDayUTCStartTick
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.editGroupTotalMembers;
	}

	async getCBREditMembersData(groupId: string): Promise<any> {
		const statement = `query getCBREditMembersData($groupId: String!) {
        getCBREditMembersData(groupId: $groupId)
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getCBREditMembersData;
	}

	async getGroupMembersChartsData(groupId, startDate, endDate, lifetime = null): Promise<[GroupMemberChartData]> {
		const statement = `query getGroupMembersChartsData($groupId: String!, $startDate: String!, $endDate: String!, $lifetime: Boolean) {
        getGroupMembersChartsData(groupId: $groupId, startDate: $startDate, endDate: $endDate, lifetime: $lifetime) {
        startDate
        barData {
         		totalMembersOnboarded
						totalMembersCount
						dailyActiveUsersRatio
						monthlyActiveUsersCount
						monthlyActiveUsersPercentage
						dailyActiveUsersCount
						dailyActiveUsersPercentage
						monthlyViews
						dailyViews
						totalViews
						aggregateViews
						}
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, startDate, endDate, lifetime};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <[GroupMemberChartData]>response.data.getGroupMembersChartsData;
	}

	async getGroupActivityChartsData(groupId, startDate, endDate, lifetime = null): Promise<[GroupActivityChartsData]> {
		const statement = `query getGroupActivityChartsData($groupId: String!, $startDate: String!, $endDate: String!, $lifetime: Boolean) {
        getGroupActivityChartsData(groupId: $groupId, startDate: $startDate, endDate: $endDate, lifetime: $lifetime) {
        startDate
        barData {
        	  posts
  					aggregatePosts
  					comments
  					aggregateComments
  					conversations
  					aggregateConversations
  					reactions
  					aggregateReactions
  					totalEngagement
  					aggregateTotalEngagement
 						averageEngagementPercentage
  					averageEngagementPerPost
        }
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, startDate, endDate, lifetime};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <[GroupActivityChartsData]>response.data.getGroupActivityChartsData;
	}

	async getGroupInsightsChartsData(groupId, startDate, endDate, lifetime = null): Promise<[GroupActivityChartsData]> {
		const statement = `query getGroupInsightsChartsData($groupId: String!, $startDate: String!, $endDate: String!, $lifetime: Boolean) {
        getGroupInsightsChartsData(groupId: $groupId, startDate: $startDate, endDate: $endDate, lifetime: $lifetime) {
        startDate
        barData {
        	  averageMemberToAdminPostRatio
  					surveys
  					impressions
  					aggregateImpressions
  					membershipRequestsAccepted
  					membershipRequestsDeclined
        }
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, startDate, endDate, lifetime};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <[GroupActivityChartsData]>response.data.getGroupInsightsChartsData;
	}

	async getGroupMemberAndEngagementStats(groupId, startDate, endDate): Promise<GroupMemberAndEngagementStats> {
		const statement = `query getGroupMemberAndEngagementStats($groupId: String!, $startDate: String!, $endDate: String!) {
        getGroupMemberAndEngagementStats(groupId: $groupId, startDate: $startDate, endDate: $endDate) {
  groupId
  totalMembers
  monthlyActiveUsers
  dailyActiveUsers
  impressions
  engagement
  conversations
  posts
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, startDate, endDate};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMemberAndEngagementStats>response.data.getGroupMemberAndEngagementStats;
	}

	async getCBRWordCloudData(groupId, startDate, endDate): Promise<any> {
		const statement = `query getCBRWordCloudData($groupId: String!, $startDate: String!, $endDate: String!) {
        getCBRWordCloudData( groupId: $groupId, startDate: $startDate, endDate: $endDate)
      }`;
		const gqlAPIServiceArguments: any = {groupId, startDate, endDate};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getCBRWordCloudData;
	}

	async listBrandCommunities(brandId, limit, nextToken): Promise<BrandCommunityConnection> {
		const statement = `query listBrandCommunityReports($brandId: String!) {
        listBrandCommunityReports(brandId: $brandId) {
 items {
   groupId
  brandId
  groupName
  totalMembers
  lastUpdatedOn
  targets
  groupCreatedAtUTC
  createdAtUTC
  updatedAtUTC
  brandCommunityReports3Key
  DAUValues
  impressions
  MAUValues
  coverImageUrl
  privacy
  supportingText
 },
 nextToken
        }
      }`;
		const gqlAPIServiceArguments: any = {brandId, limit, nextToken};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <BrandCommunityConnection>response.data.listBrandCommunityReports;
	}

	async updateBrandCommunityReport(input: UpdateBrandCommunityReport): Promise<BrandCommunity> {
		const statement = `mutation updateBrandCommunityReport($input: UpdateBrandCommunityReport!) {
        updateBrandCommunityReport(input: $input) {

   groupId
  brandId
  groupName
  totalMembers
  lastUpdatedOn
  targets
  groupCreatedAtUTC
  createdAtUTC
  updatedAtUTC
 
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <BrandCommunity>response.data;
	}

	async createBrandCommunityReport(input: CreateBrandCommunityReport): Promise<BrandCommunity> {
		const statement = `mutation createBrandCommunityReport($input: CreateBrandCommunityReport!) {
        createBrandCommunityReport(input: $input) {

   groupId
  brandId
  groupName
  brandCommunityReports3Key
  coverImageUrl
  totalMembers
  lastUpdatedOn
  groupCreatedAtUTC
  privacy
		}
	  }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <BrandCommunity>response.data.createBrandCommunityReport;
	}

	async getCMCReportMetricsV2(campaignId: string): Promise<CMCReportMetricsV2> {
		const statement = `query GetCMCReportMetricsV2($campaignId: String!) {
			getCMCReportMetricsV2(campaignId: $campaignId) {
			__typename
			numGroups
			numAudience
			numDuringBrandMentions
			numAfterBrandMentions
			numBeforeBrandMentions
			numLeadsGenerated
			numDuringCatConversations
			numDuringBrandConversations
			numBeforeBrandConversations
			numBeforeCatConversations
			numAfterCatConversations
			numAfterBrandConversations
			campaignId
			numPosts
			numAdminPosts
			numUGCPosts
			numReactionAdminPost
			numReactionUGCPost
			numCommentAdminPost
			numCommentUGCPost
			totalCampaignPost
			numCompletedCampaignPost
			phaseMetrics
			beforeSOV
			afterSOV
			duringSOV
			duringSentimentMap
			beforeSentimentMap
			afterSentimentMap
			campaignHighlights
			engagementInsights
			duringSOVNonHashTag
        }
      }`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CMCReportMetricsV2>response.data.getCMCReportMetricsV2;
	}

	async getCmcReportWc(campaignId: string): Promise<CmcReportWc> {
		const statement = `query GetCmcReportWc($campaignId: String!) {
        getCmcReportWC(campaignId: $campaignId) {
          __typename
          createdAtUTC
          updatedAtUTC
          campaignId
          beforeWC
          duringWC
        }
      }`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <CmcReportWc>response.data.getCmcReportWC;
	}

	async getParticipantGroupsDetails(campaignId: string): Promise<string> {
		const statement = `query GetParticipantGroupsDetails($campaignId: String!) {
			getParticipantGroupsDetails(campaignId: $campaignId) {
				participantGroupsDetails
        }
      }`;
		const gqlAPIServiceArguments: any = {campaignId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <string>response.data.getParticipantGroupsDetails;
	}

	async getTopPostsAllTypeByGroupId(
		groupId: string,
		limit: number,
		startMonth: number,
		endMonth: number,
		startYear: number,
		endYear: number
	): Promise<TopPosts> {
		const statement = `query GetTopPostsAllTypeByGroupId($groupId: String!, $limit: Int, $startMonth: Int, $endMonth: Int, $startYear: Int, $endYear: Int) {
        getTopPostsAllTypeByGroupId(groupId: $groupId, limit: $limit, startMonth: $startMonth, endMonth: $endMonth, startYear: $startYear, endYear: $endYear) {
          __typename
          id
          activityRate
          postCreatedAtUTC
          commentCount
          reactions
          postType
		  rawText
		  fbGroupId
		  photourl
		  videothumbnailurl
        }
      }`;
		const gqlAPIServiceArguments = {
			groupId,
			limit,
			startMonth,
			endMonth,
			startYear,
			endYear
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <TopPosts>response.data.getTopPostsAllTypeByGroupId;
	}

	async getZeroCommentPostsByGroupId(
		groupId: string,
		postType: string,
		startMonth: number,
		startYear: number,
		endMonth: number,
		endYear: number,
		limit: number
	): Promise<TopPosts> {
		const statement = `query getZeroCommentPostsByGroupId($groupId: String!, $postType: String, $startMonth: Int, $startYear: Int, $endMonth: Int, $endYear: Int, $limit: Int) {
        getZeroCommentPostsByGroupId(groupId: $groupId, postType: $postType, startMonth: $startMonth, startYear: $startYear, endMonth: $endMonth, endYear: $endYear, limit: $limit) {
          __typename
    id
    rawText
    reactions
    activityRate
    commentCount
    postCreatedAtUTC
	fbGroupId
	photourl
	videothumbnailurl
	postType
        }
      }`;
		const gqlAPIServiceArguments = {
			groupId,
			postType,
			startMonth,
			startYear,
			endMonth,
			endYear,
			limit
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <TopPosts>response.data.getZeroCommentPostsByGroupId;
	}

	async getGroupsDetailsByName(name: string): Promise<Group[]> {
		const statement =
			`query GetGroupsDetailsByName($name: String!) {
        getGroupsDetailsByName(name: $name) {
			` +
			this.groupsQueryReturnAttributes +
			`
		  }
		}`;
		const gqlAPIServiceArguments: any = {name};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Group[]>response.data.getGroupsDetailsByName;
	}

	async initiateActionOnConversation(
		actionTaken: string,
		convId: string,
		input: UpdateKeywordTrackerReportInput
	): Promise<initiateActionOnConversation> {
		const statement =
			`mutation InitiateActionOnConversation($actionTaken: String!, $convId: String!, $input: UpdateKeywordTrackerReportInput!) {
        initiateActionOnConversation(actionTaken: $actionTaken, convId: $convId, input: $input) {
          __typename
          updatedConversation {
          ` +
			this.conversationsReturnAttributes +
			`
          }
          updatedKeywordTrackerReport {
          ` +
			this.keywordTrackerReportReturnAttributes +
			`
          }
        }
      }`;
		const gqlAPIServiceArguments: any = {actionTaken, convId, input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <initiateActionOnConversation>response.data.initiateActionOnConversation;
	}

	async triggerEmailVerification(email: string, resend?: boolean, doNotProcessError?: boolean): Promise<Users> {
		const statement =
			`mutation TriggerEmailVerification($email: String!, $resend: Boolean) {
        triggerEmailVerification(email: $email, resend: $resend) {
      ` +
			this.usersQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {email};
		if (resend) {
			gqlAPIServiceArguments.resend = resend;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments, doNotProcessError);
		return <Users>response.data.triggerEmailVerification;
	}

	async verifyEmail(verificationCode?: string, doNotProcessError?: boolean): Promise<Users> {
		const statement =
			`mutation VerifyEmail($verificationCode: String) {
        verifyEmail(verificationCode: $verificationCode) {
      ` +
			this.usersQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {};
		if (verificationCode) {
			gqlAPIServiceArguments.verificationCode = verificationCode;
		}
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments, doNotProcessError);
		return <Users>response.data.verifyEmail;
	}

	async updateTypeform(formId: string, responseId: string): Promise<Users> {
		const statement = `mutation UpdateSQSTypeform($formId: String!, $responseId: String!) {
				updateSQSTypeform(formId: $formId, responseId: $responseId)
	  }`;
		const gqlAPIServiceArguments: any = {formId, responseId};

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Users>response.data.updateTypeFormDetailsGraph;
	}

	async copyKeywordsToGroups(
		groupIds: Array<string>,
		keywords: string,
		reportName: string,
		append: boolean
	): Promise<ConversationReportModel[]> {
		const statement =
			`mutation CopyKeywordsToGroups($groupIds: [String!]!, $keywords: String!, $reportName: String!, $append: Boolean!) {
        copyKeywordsToGroups(groupIds: $groupIds, keywords: $keywords, reportName: $reportName, append: $append) {
          ` +
			this.keywordTrackerReportReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {groupIds, keywords, reportName, append};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ConversationReportModel[]>response.data.copyKeywordsToGroups;
	}

	async addDateRangeSelectorToBrandInsights(
		campaignId: string,
		viewName: string,
		dateRange: DateRangeInput
	): Promise<ListInsightViewsQuery> {
		const statement =
			`mutation AddDateRangeSelectorToBrandInsights($campaignId: String!, $viewName: String!, $dateRange: DateRangeInput!) {
        addDateRangeSelectorToBrandInsights(campaignId: $campaignId, viewName: $viewName, dateRange: $dateRange) {
        ` +
			this.insightViewsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {campaignId, viewName, dateRange};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListInsightViewsQuery>response.data;
	}

	async getLastdayGroupMetricsByGroupId(groupId: string): Promise<GroupMetricsDaily> {
		const statement = `query GetLastdayGroupMetricsByGroupId($groupId: String!) {
        getLastdayGroupMetricsByGroupId(groupId: $groupId) {
       __typename
	         totalPosts
	         memberCount
	         totalComments
	         totalReactions
	         positiveCommentsReactionsChange
	         positivePostsChange
	         changeInCommentsReactionsPercentageCount
	         changeInPostsPercentageCount
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupMetricsDaily>response.data.getLastdayGroupMetricsByGroupId;
	}

	async executeFacebookGraphApi(
		httpRequestMethod: string,
		path?: string,
		nextToken?: string
	): Promise<GraphAPIResponse> {
		const statement = `query ExecuteFacebookGraphApi($httpRequestMethod: String!, $path: String, $nextToken: String) {
	       executeFacebookGraphApi(httpRequestMethod: $httpRequestMethod, path: $path, nextToken: $nextToken) {
	         __typename
	         response
	       }
	     }`;
		const gqlAPIServiceArguments: any = {httpRequestMethod};
		if (path) {
			gqlAPIServiceArguments.path = path;
		}

		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GraphAPIResponse>response.data.executeFacebookGraphApi;
	}

	async triggerWhatsAppOptIn(phone: string, doNotProcessError?: boolean): Promise<Users> {
		const statement =
			`mutation TriggerWhatsAppOptIn($phone: String!) {
				triggerWhatsAppOptIn(phone: $phone) {
          ` +
			this.usersQueryReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {phone};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments, doNotProcessError);
		return <Users>response.data.triggerWhatsAppOptIn;
	}

	async triggerWhatsAppOptOut(): Promise<Users> {
		const statement =
			`mutation TriggerWhatsAppOptOut {
			triggerWhatsAppOptOut {
	  ` +
			this.usersQueryReturnAttributes +
			`
	}
  }`;
		const gqlAPIServiceArguments: any = {};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Users>response.data.triggerWhatsAppOptOut;
	}

	async interactionLandbotOptIn(phone: string, doNotProcessError?: boolean): Promise<{status: string}> {
		const statement = `mutation interactionLandbotOptIn($phone: String!) {
			interactionLandbotOptIn(phone: $phone) {
				status
			}
		}`;
		const gqlAPIServiceArguments: any = {phone};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments, doNotProcessError);
		return <{status: string}>response.data.interactionLandbotOptIn;
	}

	async interactionLandbotOptOut(): Promise<{status: string}> {
		const statement = `mutation interactionLandbotOptOut {
			interactionLandbotOptOut {
				status
			}
		}`;
		const gqlAPIServiceArguments: any = {};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <{status: string}>response.data.interactionLandbotOptOut;
	}

	async updateGroupNotificationPreferences(input: [GroupNotificationPreference]): Promise<[GroupMembers]> {
		const statement =
			`mutation GroupNotificationPreference($input: [GroupNotificationPreference!]!) {
        updateGroupNotificationPreferences(input: $input) {
        ` +
			this.groupMembersReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {
			input
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);

		return <[GroupMembers]>response.data;
	}

	async CommunityDiscoveryAPI(input: communityDiscoveryInput): Promise<any> {
		const statement =
			`query CommunityDiscoveryAPI($input: communityDiscoveryInput!) {
				communityDiscoveryAPI(input: $input) {
				__typename
        		eligibleCommunitiesCount
        		monetizableGroupsHavingCampaignTaskToPerformThisMonth
        		nonMonetizableGroupsHavingCampaignTaskToPerformThisMonth
        		totalMonetizableGroups
        		selectedCommunities {
         			 ` +
			this.communityDiscoveryAPIAttributes +
			`}
        		}
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.communityDiscoveryAPI;
	}

	async ValidateFBAccessToken(): Promise<boolean> {
		const statement = `query{
			validateFbAccessToken
		}`;

		const response = await this.executeGraphQlStatement(statement);
		return <boolean>response.data.validateFbAccessToken;
	}

	async markUnansweredPostAsRead(id: string, groupId: string): Promise<ListPostAnalyticsQuery> {
		const statement =
			`mutation MarkUnansweredPostAsRead($id: String, $groupId: String) {
        markUnansweredPostAsRead(id: $id, groupId: $groupId) {
        ` +
			this.postAnalyticsReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {id, groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <ListPostAnalyticsQuery>response.data.markUnansweredPostAsRead;
	}

	async queryFacebookGroups(countryBasedOnIPAddress?: String): Promise<GroupsConnection> {
		const statement =
			`query QueryFacebookGroups($countryBasedOnIPAddress: String) {
        queryFacebookGroups(countryBasedOnIPAddress: $countryBasedOnIPAddress) {
          __typename
		  newGroupsCount
          groups {
          ` +
			this.groupsQueryReturnAttributes +
			`
          }
        }
      }`;

		const gqlAPIServiceArguments = {countryBasedOnIPAddress};

		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupsConnection>response.data.queryFacebookGroups;
	}

	async getSuggestionMet(input: string): Promise<any> {
		const statement = `query GetSuggestionMet($input: AWSJSON!) {
				getSuggestionMet(input: $input) 
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getSuggestionMet;
	}

	async getConversationsHourlyByUserId(startTick: number, endTick: number): Promise<Array<ConversationsByUserId>> {
		const statement = `query GetConversationsHourlyByUserId($startTick: Int!, $endTick: Int!) {
        getConversationsHourlyByUserId(startTick: $startTick, endTick: $endTick) {
          __typename
          groupId
          totalPosts
          totalComments
          totalReactions
          totalShares
          memberCount
          error
          postEngagementRate
          memberEngagementRate
        }
      }`;
		const gqlAPIServiceArguments: any = {startTick, endTick};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <Array<ConversationsByUserId>>response.data.getConversationsHourlyByUserId;
	}

	async CheckPublishPermissionForGroup(fbGroupId: String): Promise<boolean> {
		const statement = `query CheckPublishPermissionForGroup($fbGroupId: String) {
			checkPublishPermissionForGroup(fbGroupId: $fbGroupId)
		}`;

		const gqlAPIServiceArguments: any = {fbGroupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <boolean>response.data.checkPublishPermissionForGroup;
	}

	async getInsightViewMetricsByInsightViewId(
		brandId: string,
		insightViewId: string,
		tickOfStartHour: number,
		tickOfEndHour: number,
		uploadToS3: boolean = false
	): Promise<InsightViewMetricsByInsightViewId> {
		const statement =
			`query getInsightViewMetricsByInsightViewId($brandId: String!, $insightViewId: String!, $tickOfStartHour: Int!, $tickOfEndHour: Int!, $uploadToS3: Boolean) {
        getInsightViewMetricsByInsightViewId(brandId: $brandId, insightViewId: $insightViewId, tickOfStartHour: $tickOfStartHour, tickOfEndHour: $tickOfEndHour, uploadToS3: $uploadToS3) {
          __typename
          insightViewMetrics {
          ` +
			this.insightViewMetricsReturnAttributes +
			`
          }
          error
          s3Type
          location
        }
      }`;
		const gqlAPIServiceArguments: any = {
			brandId,
			insightViewId,
			tickOfStartHour,
			tickOfEndHour,
			uploadToS3
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <InsightViewMetricsByInsightViewId>response.data.getInsightViewMetricsByInsightViewId;
	}

	async SaveAcqusitionSourceAndCampaign(
		acquisitionCampaign: string,
		acquisitionSource: string
	): Promise<SaveAcqusitionQuery> {
		const statement = `mutation saveAcqusitionSourceAndCampaign($acquisitionCampaign: String!, $acquisitionSource: String!) {
				saveAcqusitionSourceAndCampaign(acquisitionCampaign: $acquisitionCampaign, acquisitionSource: $acquisitionSource) {
					error
					message
        }
      }`;
		const gqlAPIServiceArguments: any = {
			acquisitionSource,
			acquisitionCampaign
		};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <SaveAcqusitionQuery>response.data.saveAcqusitionSourceAndCampaign;
	}

	private getArgumentsForListQuery(filter?: any, limit: number = 1000, nextToken?: string): any {
		const gqlAPIServiceArguments: any = {};

		if (filter) {
			gqlAPIServiceArguments.filter = filter;
		}
		if (limit) {
			gqlAPIServiceArguments.limit = limit;
		}
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		return gqlAPIServiceArguments;
	}

	async getIfPostComposerUsed(): Promise<boolean> {
		const statement = `query GetIfPostComposerUsed  {
        getIfPostComposerUsed 
      }`;
		const response = await this.executeGraphQlStatement(statement);
		return <boolean>response.data.getIfPostComposerUsed;
	}

	async decryptUserData(): Promise<APIResponse> {
		const statement = `mutation DecryptUserData {
        decryptUserData{
          body
          error
        } 
      }`;
		const response = await this.executeGraphQlStatement(statement);
		return <any>response.data.decryptUserData;
	}

	async encryptUserData(stringToEncrypt: string): Promise<APIResponse> {
		const statement = `mutation EncryptUserData($stringToEncrypt: String!) {
        encryptUserData(stringToEncrypt: $stringToEncrypt){
          body
          error
        } 
      }`;

		const gqlAPIServiceArguments: any = {stringToEncrypt};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <APIResponse>response.data.encryptUserData;
	}

	async facebookInsightsParser(groupId: string, sheetUID: string): Promise<APIResponse> {
		const statement = `mutation FacebookInsightsParser($groupId: String!, $sheetUID: String!) {
        facebookInsightsParser(groupId: $groupId, sheetUID: $sheetUID){
          body
          error
		    } 
      }`;

		const gqlAPIServiceArguments: any = {groupId, sheetUID};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);

		if (response.data.facebookInsightsParser?.error) {
			throw new Error(response.error);
		} else {
			return <APIResponse>response.data.facebookInsightsParser;
		}
	}

	async getAdminBio(): Promise<GetAdminBioModel> {
		const statement =
			`query Bio{
	     getAdminBio{
			 draftBio {
	     ` +
			this.adminBioDraftReturnAttributes +
			`
			 }
			mainBio {
	     ` +
			this.adminBioReturnAttributes +
			`
			}
	     }
	   }`;
		const gqlAPIServiceArguments: any = {};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GetAdminBioModel>response.data.getAdminBio;
	}

	async getAdminBioAnalytics(): Promise<GetAdminBioAnalyticsModel> {
		const statement =
			`query MyQuery {
  				getAdminBioAnalytics {
   				` +
			this.adminBioAnalyticsReturnAttributes +
			`
  				}
			}`;
		const gqlAPIServiceArguments: any = {};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GetAdminBioAnalyticsModel>response.data.getAdminBioAnalytics;
	}

	async listProfileBioContactMe(nextToken?: string): Promise<AdminBioContactInput> {
		const statement =
			`query MyQuery($nextToken: String) {
  				listProfileBioContactMe(nextToken: $nextToken) {
   				` +
			this.adminBioContactLeadReturnAttributes +
			`
  				}
			}`;
		const gqlAPIServiceArguments: any = {};
		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <AdminBioContactInput>response.data.listProfileBioContactMe;
	}

	async updateAdminBio(input: AdminBioInput): Promise<AdminBioModel> {
		const statement =
			`mutation UpdateAdminBio($input: AdminBioInput!){
        updateAdminBio(input: $input){
        ` +
			this.adminBioReturnAttributes +
			`
         }
       }`;
		const gqlAPIServiceArguments: any = {input};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <AdminBioModel>response.data.updateAdminBio;
	}

	async getCountries(): Promise<any> {
		const statement = `query Countries{
        getCountries{
            name,
            isoCode         }
      }`;
		const gqlAPIServiceArguments: any = {};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <AdminBioModel>response.data.getCountries;
	}

	async toggleAdminBioKudos(tarUserId: string, doNotProcessError?: boolean) {
		const statement = `mutation ToggleAdminBioKudos($tarUserId: String!){
        toggleAdminBioKudos(tarUserId: $tarUserId){
            kudos,added       }
      }`;
		const gqlAPIServiceArguments: any = {tarUserId};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments, doNotProcessError);
		return <any>response.data.toggleAdminBioKudos;
	}

	public unSubscribeToUpdateCampaignGroups(campaignId) {
		this.wsRealtimeSubscriptions.forEach(sub => {
			sub.unsubscribe();
		});
	}

	async createDefaultGroupProfilePage(
		groupId: string,
		name: string,
		isDefaultProfile: boolean
	): Promise<GroupProfilePage> {
		const statement =
			`mutation createDefaultGroupProfile($groupId: String!, $name: String!, $isDefaultProfile: Boolean) {
        createDefaultGroupProfile(groupId: $groupId, name: $name, isDefaultProfile: $isDefaultProfile) {
      ` +
			this.groupProfilePageReturnAttributes +
			` }
      }`;
		const gqlAPIServiceArguments: any = {groupId, name, isDefaultProfile};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfilePage>response.data.createDefaultGroupProfile;
	}

	async listGroupProfilePages(groupId: string, nextToken?: string): Promise<GroupProfilePagesConnection> {
		const statement =
			`query listGroupProfilePages($groupId: String!) {
        listGroupProfilePages(groupId: $groupId) {
          items {
          ` +
			this.groupProfilePageReturnAttributes +
			`
          }
         nextToken
			  }
      }`;

		const gqlAPIServiceArguments: any = {groupId};

		if (nextToken) {
			gqlAPIServiceArguments.nextToken = nextToken;
		}

		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfilePagesConnection>response.data.listGroupProfilePages;
	}

	async getGroupProfileByProfileId(groupProfileId: string): Promise<GroupProfilePageModel> {
		const statement =
			`query getGroupProfileById($groupProfileId: String!) {
        getGroupProfileById(groupProfileId: $groupProfileId) {
          ` +
			this.groupProfileDataReturnAttributes +
			`
		}`;
		const gqlAPIServiceArguments: any = {groupProfileId};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfilePageModel>response.data.getGroupProfileById;
	}

	async getGroupProfileReviews(groupProfileId: string): Promise<getGroupProfileReviewsResponse> {
		const statement = `query GetGroupProfileReviews($groupProfileId: String!) {
			getGroupProfileReviews(groupProfileId: $groupProfileId) {
				ratingCount
				totalRating
				averageRating
				reviews {
					fullname
					groupProfileId
					isDeleted
					isDisabled
					profilePictureUrl
					rating
					reviewText
					timestamp
					userId
				}
			}
		}`;

		const gqlAPIServiceArguments: any = {groupProfileId};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <getGroupProfileReviewsResponse>response.data.getGroupProfileReviews;
	}

	async getGroupReviews(groupId: string): Promise<getGroupReviewsResponse> {
		const statement = `query GetGroupReviews($groupId: String!) {
			getGroupReviews(groupId: $groupId) {
				ratingCount
				totalRating
				averageRating
				reviews {
					fullname
					groupProfileId
					isDisabled
					profilePictureUrl
					rating
					reviewText
					timestamp
					userId
				}
			}
		}`;

		const gqlAPIServiceArguments: any = {groupId};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <getGroupReviewsResponse>response.data.getGroupReviews;
	}

	async duplicateGroupProfilePage(
		groupId: string,
		profilePageId: string,
		nameOfNewProfilePage: string
	): Promise<GroupProfilePage> {
		const statement =
			`mutation duplicateGroupProfilePage($groupId: String!, $profilePageId: String!, $nameOfNewProfilePage: String!) {
        duplicateGroupProfilePage(groupId: $groupId, profilePageId: $profilePageId, nameOfNewProfilePage: $nameOfNewProfilePage) {
          ` +
			this.groupProfilePageReturnAttributes +
			`
			  }
      }`;
		const gqlAPIServiceArguments: any = {groupId, profilePageId, nameOfNewProfilePage};
		const response: any = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfilePage>response.data.duplicateGroupProfilePage;
	}

	async updateProfileBioDraft(input: ProfileBioDraftInput): Promise<APIResponse> {
		const statement =
			`mutation UpdateProfileBioDraft($input: ProfileBioDraftInput!) {
        updateProfileBioDraft(input: $input) {
         ` +
			this.adminBioDraftReturnAttributes +
			`
        }
      }`;

		const response = (await API.graphql(graphqlOperation(statement, {input}))) as any;
		return <APIResponse>response.data.updateProfileBioDraft;
	}

	async getProfileBioDraft(): Promise<AdminBioModel> {
		const statement =
			`query GetProfileBioDraft {
        getProfileBioDraft {
         ` +
			this.adminBioDraftReturnAttributes +
			`
        }
      }`;
		const response = (await API.graphql(graphqlOperation(statement))) as any;
		return <AdminBioModel>response.data.getProfileBioDraft;
	}

	async getLinkPreview(link: string): Promise<APIResponse> {
		const statement = `query GetLinkPreview($link: String!) {
        getLinkPreview(link: $link) {
          error
          body
        }
      }`;
		const response = await this.executeGraphQlStatement(statement, {link});
		return <APIResponse>response.data.getLinkPreview;
	}

	async updateGroupProfileDraft(input: UpdateGroupProfilePageInput): Promise<GroupProfilePage> {
		const statement =
			`mutation UpdateGroupProfileDraft($input: UpdateGroupProfilePageDraftInput!) {
        updateGroupProfileDraft(input: $input) {
        ` +
			this.groupProfilePagesReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {input};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfilePage>response.data.updateGroupProfileDraft;
	}

	async publishGroupProfilePage(groupId: string, profileId: string): Promise<GroupProfilePage> {
		const statement =
			`mutation PublishGroupProfilePage($groupId: String!, $profileId: String!) {
        publishGroupProfilePage(groupId: $groupId, profileId: $profileId) {
        ` +
			this.groupProfilePagesReturnAttributes +
			`
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, profileId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <GroupProfilePage>response.data.publishGroupProfilePage;
	}

	private executeGraphQLSubscriptionStatement(statement: string, gqlAPIServiceArguments): Observable<any> {
		return new Observable(observer => {
			this.wsRealtimeSubscriptions.set(uuid(), observer);
			(API.graphql(graphqlOperation(statement, gqlAPIServiceArguments)) as zenObservable<any>).subscribe({
				next: (data: any) => observer.next(data),
				error: e => observer.error(e)
			});
		});
	}

	private closeAndReconnectWebSocket() {
		this.wsRealtimeSubscriptions.forEach(sub => sub.unsubscribe());
		this.wsRealtimeSubscriptions.clear();
		setTimeout(() => {
			this._websocketClosed.next(true);
			this.subscriptionsMonitor();
		}, 500);
	}

	private subscriptionsMonitor() {
		setTimeout(() => {
			const monitor = merge(...this.wsRealtimeSubscriptions)
				.pipe(
					timeout(this._webSocketTimer),
					catchError(() => {
						this.closeAndReconnectWebSocket();
						monitor.unsubscribe();
						return of('websocket closed');
					})
				)
				.subscribe();
		}, this._webSocketTimer);
	}

	private async executeGraphQlStatement(
		statement: string,
		gqlAPIServiceArguments?: any,
		doNotProcessError: boolean = false
	): Promise<GraphQLResult | zenObservable<object>> {
		try {
			return await API.graphql(graphqlOperation(statement, gqlAPIServiceArguments));
		} catch (e) {
			if (doNotProcessError) {
				throw e;
			}
			const graphQLStatement = statement.split(new RegExp('[\\({]', 'gm'), 1);
			const statementDetails: string = 'Error in GraphQL ' + graphQLStatement;

			const errorMessage = e?.errors?.reduce((accErrorMessage: string, curErrorObj: any) => {
				const isNetworkError =
					curErrorObj.message.includes('Network Error') || curErrorObj.message.includes('Request aborted');
				return isNetworkError ? accErrorMessage : accErrorMessage + curErrorObj.message + ' \n ';
			}, statementDetails);

			const errorObject = new Error(errorMessage);

			this.loggerService.error(
				errorObject,
				errorMessage,
				{gqlAPIServiceArguments, errors: e.errors},
				'AmplifyAppSyncService',
				'executeGraphQlStatement'
			);
			throw errorObject;
		}
	}

	async CreateCampaigns(campaigns: string): Promise<boolean> {
		const statement = `mutation CreateCampaign($data: [UserTemplateDataInput]) {
			manualWhatsAppCampaign(data: $data) {
		  status
		}
	  }`;

		const parseData: any = JSON.parse(campaigns);
		const response = await this.executeGraphQlStatement(statement, {data: parseData.data});

		return response.data.manualWhatsAppCampaign.status;
	}

	async getCBRCustomConversationByGroupId(groupId): Promise<any> {
		const statement = `query getCBRCustomConversationByGroupId($groupId: String!) {
        getCBRCustomConversationByGroupId( groupId: $groupId) {
          items {
            groupId
            sectionTitle
            sectionSubtitle
            createdAtUTC
            updatedAtUTC
            buckets {
              name
              mentions
              keywords
              visibility
            }
          }
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getCBRCustomConversationByGroupId;
	}

	async createCBRCustomConversation(groupId, sectionTitle, sectionSubtitle, buckets): Promise<any> {
		const statement = `mutation createCBRCustomConversation($groupId: String!, $sectionTitle: String!, $sectionSubtitle: String!, $buckets: [CreateBucketInput]!) {
     createCBRCustomConversation(input: {groupId: $groupId, sectionTitle: $sectionTitle, sectionSubtitle: $sectionSubtitle, buckets: $buckets}) {
            groupId
            sectionTitle
            sectionSubtitle
            createdAtUTC
            updatedAtUTC
            buckets {
              name
              mentions
              keywords
              visibility
            }
          }
      }
      `;
		const gqlAPIServiceArguments: any = {groupId, sectionTitle, sectionSubtitle, buckets};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.createCBRCustomConversation;
	}

	async updateCBRCustomConversation(groupId, sectionTitle, sectionSubtitle, buckets): Promise<any> {
		const statement = `mutation updateCBRCustomConversation($groupId: String!, $sectionTitle: String!, $sectionSubtitle: String!, $buckets: [UpdateBucketInput]!) {
     updateCBRCustomConversation(input: {groupId: $groupId, sectionTitle: $sectionTitle, sectionSubtitle: $sectionSubtitle, buckets: $buckets}) {
            groupId
            sectionTitle
            sectionSubtitle
            createdAtUTC
            updatedAtUTC
            buckets {
              name
              mentions
              keywords
              visibility
            }
          }
      }`;
		const gqlAPIServiceArguments: any = {groupId, sectionTitle, sectionSubtitle, buckets};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.updateCBRCustomConversation;
	}

	async deleteCBRCustomConversation(groupId, sectionTitle): Promise<any> {
		const statement = `mutation deleteCBRCustomConversation($groupId: String!, $sectionTitle: String!) {
     deleteCBRCustomConversation(groupId: $groupId, sectionTitle: $sectionTitle) {
           groupId
    			 sectionTitle
          }
      }`;
		const gqlAPIServiceArguments: any = {groupId, sectionTitle};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.deleteCBRCustomConversation;
	}

	async getCBRConversationData(groupId, startDate, endDate, lifetime = false): Promise<any> {
		const statement = `query getCBRConversationData($groupId: String!, $startDate: String!, $endDate: String!, $lifetime: Boolean) {
        getCBRConversationData(groupId: $groupId, startDate: $startDate, endDate: $endDate, lifetime: $lifetime) {
          brandSOV {
            startDate
            brandSOV
          }
          brandSentiment
          topics
          keywords
          products
        }
      }`;
		const gqlAPIServiceArguments: any = {groupId, startDate, endDate, lifetime};
		const response = await this.executeGraphQlStatement(statement, gqlAPIServiceArguments);
		return <any>response.data.getCBRConversationData;
	}
}
