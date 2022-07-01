import Auth from '@aws-amplify/auth';

export const environment = {
	production: true,
	groupInsights: 'https://r0ww4myvfi.execute-api.us-east-1.amazonaws.com/prod',
	apiUrl: 'https://backend.convosight.com/prod',
	restApiUrl: 'https://rest.convosight.com/api',
	convosightV2Url: 'https://backend.convosight.com/csv2',
	postScreenshotUrl: 'https://u8x2uicga6.execute-api.us-east-1.amazonaws.com/dev',
	selfMonetizeAnalyseUrl: 'https://wutcyngj6e.execute-api.us-east-1.amazonaws.com/prod',
	baseUrl: 'https://www.convosight.com/app/',
	storageUrl: 'https://bd-convosight-production-facebook-cmc-screenshot.s3.amazonaws.com/',
	envName: 'production',
	cookieDomain: '.convosight.com',
	envNameForLog: 'Production',
	sentryIOUrl: 'https://36a19ad7a9ac4e09b78ac86f0b24d755@sentry.io/2292724',
	releaseVersion: '%VERSION%',
	webenagageLicenseKey: 'in~76aa40d',
	fbreAskPermissionRedirectUrl: 'https://convosight.com/app/group-admin/manage',
	fbClientId: '336167437102103',
	fanVideoRecorderUrl: 'https://app.fanvideo.co/recorder/1a106e8e-301c-4b71-a7e0-801c8fdbaf5e',
	amplifyConfiguration: {
		aws_project_region: 'us-east-1',
		aws_cognito_identity_pool_id: 'us-east-1:b7f68be8-1c28-40ea-a816-8be30c2569e3',
		aws_cognito_region: 'us-east-1',
		aws_user_pools_id: 'us-east-1_MbtEdfNLC',
		aws_user_pools_web_client_id: '39h1fuima6g8gb8u1d4op905sg',
		oauth: {
			domain: 'auth.convosight.com',
			scope: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
			redirectSignIn: 'https://convosight.com/app/login-response/',
			redirectSignOut: 'https://www.convosight.com/logout/',
			responseType: 'code'
		},
		Storage: {
			AWSS3: {
				bucket: 'bd-cs-prod-media',
				region: 'us-east-1'
			}
		},
		Analytics: {
			disabled: true
		},
		federationTarget: 'COGNITO_USER_POOLS',
		aws_appsync_graphqlEndpoint: 'https://g4ssce6a6fgavlusas4lct4w6e.appsync-api.us-east-1.amazonaws.com/graphql',
		aws_appsync_region: 'us-east-1',
		aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
		API: {
			graphql_endpoint: 'https://graph.convosight.com/graphql',
			graphql_headers: async () => ({
				authorization: (await Auth.currentSession()).getIdToken().getJwtToken()
			})
		}
	},
	landingPageUrl: 'https://www.convosight.com/',
	apiURL: 'https://gm0hlkh29g.execute-api.us-east-1.amazonaws.com/prod/brandaccessrequest',
	logApiUrl: 'https://api.convosight.com/v1/bulk/logs',
	wordCloudAPIUrl: 'https://wordcloud.convosight.com/api',
	userflowToken: 'ct_bsgpaapyknhhplvc7faits6nse',
	s3BucketBaseURLForCompressedImages:
		'https://bd-convosight-image-compressor-destination.s3.ap-south-1.amazonaws.com/public/imageCompressionSource/',
	typeformFormId: 'AFCBTsCY',
	bdAdmins: '88e799b9-0413-473d-8b44-397a885028c5',
	calendlyScheduleDemoLink: 'https://calendly.com/convosight/how-to-earn-from-fb-group',
	calendlyMonetizationLink: 'https://calendly.com/convosight/monetisation-masterclass?month=2020-11',
	brandIdForMarketingInsights: ['a60b5777-1557-45f1-97da-4be46880fb46'],
	insightViewIdsForMilestones: new Map<string, {altHeading: string; altTooltipHeader: string}>([
		['04dcbf95-2f4d-4d5a-a929-6c8e3ea67fa0', {altHeading: 'Milestones', altTooltipHeader: 'Products + Milestones'}],
		['ff5dacb9-bacf-4934-b933-1076c80582b0', {altHeading: 'Milestones', altTooltipHeader: 'Milestones'}],
		['a9f7d915-60e8-4a64-b686-f26b7f96eaa0', {altHeading: 'Milestones', altTooltipHeader: 'Milestones'}],
		['f24ad040-61b0-4a13-8e83-11dcbfd514a1', {altHeading: 'Milestones', altTooltipHeader: 'Milestones'}],
		['0e02078a-7455-42ba-a84f-952fc82dddb3', {altHeading: 'Milestones', altTooltipHeader: 'Milestones'}],
		['15431f8c-0c3d-499d-b296-995cde3d7bce', {altHeading: 'Allergens', altTooltipHeader: 'Allergens'}]
	]),
	userIdsForGroupProfile: [''],
	profileConvosightUrl: 'https://convosight.com/profile/'
};
