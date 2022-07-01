// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.production.ts`.
// The list of file replacements can be found in `angular.json`.
import 'zone.js/plugins/zone-error';

import Auth from '@aws-amplify/auth';

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
export const environment = {
	production: false,
	apiUrl: 'https://backend.convosight.com/dev',
	restApiUrl: 'https://rest-feature3.convosight.com/api',
	postScreenshotUrl: 'https://u8x2uicga6.execute-api.us-east-1.amazonaws.com/dev',
	selfMonetizeAnalyseUrl: 'https://3u8be6ojv3.execute-api.us-east-1.amazonaws.com/dev',
	storageUrl: 'https://bd-convosight-dev-facebook-cmc-screenshot.s3.amazonaws.com/',
	groupInsights: 'https://46cgutht7k.execute-api.us-east-1.amazonaws.com/dev',
	baseUrl: 'https://localhost:4200/',
	envName: 'local',
	cookieDomain: '',
	envNameForLog: 'Local',
	sentryIOUrl: '',
	releaseVersion: '%VERSION%',
	fbreAskPermissionRedirectUrl: 'https://localhost:4200/group-admin/manage',
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
			redirectSignIn: 'https://localhost:4200/login-response/',
			redirectSignOut: 'https://develop.convosight.com/logout/',
			responseType: 'code'
		},
		Storage: {
			AWSS3: {
				bucket: 'bd-cs-dev-media',
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
	landingPageUrl: 'https://develop.convosight.com/',
	apiURL: 'https://rwgz5sftb7.execute-api.us-east-1.amazonaws.com/dev/brandAccessRequest',
	logApiUrl: 'https://api.convosight.com/v1/bulk/logs',
	wordCloudAPIUrl: 'https://wordcloud.convosight.com/api',
	userflowToken: 'ct_s3cvz425wjbm5pb43ai4v7eqo4',
	s3BucketBaseURLForCompressedImages:
		'https://bd-convosight-dev-image-compressor-destination.s3.ap-south-1.amazonaws.com/public/imageCompressionSource/',
	typeformFormId: 'bVlQf00Q',
	bdAdmins: '',
	calendlyScheduleDemoLink: 'https://calendly.com/convosight/how-to-earn-from-and-grow-your-group-using-con-clone',
	calendlyMonetizationLink: 'https://calendly.com/convosight/monetisation-masterclass-series-clone',
	brandIdForMarketingInsights: ['ed4efcc1-b308-40d3-b1ee-8739fa04314c'],
	insightViewIdsForMilestones: new Map<string, {altHeading: string; altTooltipHeader: string}>([]),
	powerBIDashboardCampaignId: {
		'b8b651a3-7114-418a-9e6f-990730cbe97c':
			'https://app.powerbi.com/view?r=eyJrIjoiZTBlNzRhNGYtZTJkNy00MGY5LTlhZWQtZmE0ODI0NWUxOTRjIiwidCI6IjMzZWYyNWE1LTMwYzAtNGIxMy1iZjFkLWYzOWY3MTFlMTI0ZCJ9&pageName=ReportSection1',
		'2bbbb69b-6fdb-4c8e-857a-11f4b9c7614b':
			'https://app.powerbi.com/view?r=eyJrIjoiODQzOWNhYjctNzVjZC00OTJjLWE5NTYtNzVmZDkzZGU3ZWYwIiwidCI6IjMzZWYyNWE1LTMwYzAtNGIxMy1iZjFkLWYzOWY3MTFlMTI0ZCJ9'
	},
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
