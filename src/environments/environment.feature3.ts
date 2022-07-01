import Auth from '@aws-amplify/auth';

export const environment = {
	groupInsights: 'https://backend.convosight.com/feature3/',
	production: true,
	apiUrl: 'https://backend.convosight.com/feature3',
	restApiUrl: 'https://rest-feature3.convosight.com/api',
	postScreenshotUrl: 'https://u8x2uicga6.execute-api.us-east-1.amazonaws.com/dev',
	baseUrl: 'https://feature3.convosight.com/app/',
	storageUrl: 'https://bd-convosight-dev-facebook-cmc-screenshot.s3.amazonaws.com/',
	envName: 'feature3',
	cookieDomain: 'feature3.convosight.com',
	envNameForLog: 'Feature3',
	sentryIOUrl: 'https://36a19ad7a9ac4e09b78ac86f0b24d755@sentry.io/2292724',
	releaseVersion: '%VERSION%',
	fbreAskPermissionRedirectUrl: 'https://feature3.convosight.com/app/group-admin/manage',
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
			redirectSignIn: 'https://feature3.convosight.com/app/login-response/',
			redirectSignOut: 'https://feature3.convosight.com/logout/',
			responseType: 'code'
		},
		Storage: {
			AWSS3: {
				bucket: 'bd-cs-dev-media', // update to feature3 if requried
				region: 'us-east-1'
			}
		},
		Analytics: {
			disabled: true
		},
		federationTarget: 'COGNITO_USER_POOLS',
		aws_appsync_graphqlEndpoint: 'https://72ke2fhlpjh6zeqilx22jcspyi.appsync-api.us-east-1.amazonaws.com/graphql',
		aws_appsync_region: 'us-east-1',
		aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
		API: {
			graphql_endpoint: 'https://graph.feature3.convosight.com/graphql',
			graphql_headers: async () => ({
				authorization: (await Auth.currentSession()).getIdToken().getJwtToken()
			})
		}
	},
	landingPageUrl: 'https://feature3.convosight.com/',
	apiURL: 'https://backend.convosight.com/feature3/brandAccessRequest',
	logApiUrl: 'https://api.convosight.com/v1/bulk/logs',
	wordCloudAPIUrl: 'https://wordcloud.convosight.com/api',
	userflowToken: 'ct_s3cvz425wjbm5pb43ai4v7eqo4',
	s3BucketBaseURLForCompressedImages:
		'https://bd-convosight-dev-image-compressor-destination.s3.ap-south-1.amazonaws.com/public/imageCompressionSource/',
	typeformFormId: 'bVlQf00Q',
	brandIdForMarketingInsights: ['ed4efcc1-b308-40d3-b1ee-8739fa04314c'],
	bdAdmins: '',
	calendlyScheduleDemoLink: 'https://calendly.com/convosight/how-to-earn-from-and-grow-your-group-using-con-clone',
	calendlyMonetizationLink: 'https://calendly.com/convosight/monetisation-masterclass-series-clone',
	insightViewIdsForMilestones: new Map<string, {altHeading: string; altTooltipHeader: string}>([]),
	userIdsForGroupProfile: [
		'f8867d2b-e0a6-491b-bf63-12a73dbedb75',
		'bafcd4d2-7dcc-4fbd-b4dd-547e6d487520',
		'7892d6b5-08fc-4568-996e-d39c9ddb02ef',
		'63b83c17-df72-4bf0-a9d8-62d2165e724b',
		'dca732cc-b70e-48f1-b32a-102235ac1eaa',
		'f68ff4b0-65f7-42ad-8ad2-23fd53a82411'
	],
	profileConvosightUrl: 'https://develop.convosight.com/profile/'
};
