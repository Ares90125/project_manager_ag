import Auth from '@aws-amplify/auth';

export const environment = {
	production: true,
	groupInsights: 'https://backend.convosight.com/staging',
	apiUrl: 'https://backend.convosight.com/staging',
	restApiUrl: 'https://rest-staging.convosight.com/api',
	postScreenshotUrl: 'https://u8x2uicga6.execute-api.us-east-1.amazonaws.com/dev',
	baseUrl: 'https://staging.convosight.com/app/',
	storageUrl: 'https://bd-convosight-staging-facebook-cmc-screenshot.s3.amazonaws.com/',
	envName: 'staging',
	cookieDomain: '.convosight.com',
	envNameForLog: 'Staging',
	sentryIOUrl: 'https://36a19ad7a9ac4e09b78ac86f0b24d755@sentry.io/2292724',
	releaseVersion: '%VERSION%',
	webenagageLicenseKey: 'in~76aa40d',
	fbreAskPermissionRedirectUrl: 'https://staging.convosight.com/app/group-admin/manage',
	fbClientId: '336167437102103',
	fanVideoRecorderUrl: 'https://app.fanvideo.co/recorder/32ad8917-3ffa-4023-a3e5-4016df895cc9',
	amplifyConfiguration: {
		aws_project_region: 'us-east-1',
		aws_cognito_identity_pool_id: 'us-east-1:456e1b9e-abbf-4297-8cda-f32d6fc61cd4',
		aws_cognito_region: 'us-east-1',
		aws_user_pools_id: 'us-east-1_sJUKzJDSZ',
		aws_user_pools_web_client_id: '7j1h56mkgn374r27ph7oindlvn',
		oauth: {
			domain: 'auth.develop.convosight.com',
			scope: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
			redirectSignIn: 'https://staging.convosight.com/app/login-response/',
			redirectSignOut: 'https://staging.convosight.com/logout/',
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
		aws_appsync_graphqlEndpoint: 'https://7ryqxmpaa5go7oggwedayhmv6m.appsync-api.us-east-1.amazonaws.com/graphql',
		aws_appsync_region: 'us-east-1',
		aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
		API: {
			graphql_endpoint: 'https://graph.staging.convosight.com/graphql',
			graphql_headers: async () => ({
				authorization: (await Auth.currentSession()).getIdToken().getJwtToken()
			})
		}
	},
	landingPageUrl: 'https://staging.convosight.com/',
	apiURL: 'https://backend.convosight.com/staging/brandAccessRequest',
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
	userIdsForGroupProfile: [
		'f8867d2b-e0a6-491b-bf63-12a73dbedb75',
		'bafcd4d2-7dcc-4fbd-b4dd-547e6d487520',
		'7892d6b5-08fc-4568-996e-d39c9ddb02ef',
		'63b83c17-df72-4bf0-a9d8-62d2165e724b',
		'dca732cc-b70e-48f1-b32a-102235ac1eaa',
		'f68ff4b0-65f7-42ad-8ad2-23fd53a82411'
	],
	profileConvosightUrl: 'https://staging.convosight.com/profile/'
};
