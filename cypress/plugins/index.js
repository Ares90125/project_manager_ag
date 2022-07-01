const {generateEmail, getOTPFromEmail} = require('../../playwright/utils/testUtilities');
const {ConvosightLoginWithGroups, ConvosightLoginNoGroups, GetAuthToken} = require('./../cookie-extractor/scripts');
const {
	deleteUser,
	getUserOtp,
	deleteTestCampaigns,
	deleteBrand,
	deleteCampaignByCampaignId
} = require('../../playwright/utils/database.adapter');
const {cypressBrowserPermissionsPlugin} = require('cypress-browser-permissions');
const xlsx = require('node-xlsx').default;
const fs = require('fs-extra');
const path = require('path');

module.exports = (on, config) => {
	// `on` is used to hook into various events Cypress emits
	// `config` is the resolved Cypress config
	const items = {};

	require('@cypress/code-coverage/task')(on, config);
	require('cypress-grep/src/plugin')(config);
	config = cypressBrowserPermissionsPlugin(on, config);
	on(`before:browser:launch`, (browser = {}, launchOptions) => {
		const downloadDirectory = path.join(__dirname, '..', 'excelDownloads');
		if (launchOptions.args) launchOptions.preferences.default['download'] = {default_directory: downloadDirectory};
		return launchOptions;
	});

	on('task', {
		ConvosightLoginWithGroups({user, pass}) {
			return (async () => {
				return await ConvosightLoginWithGroups(user, pass);
			})();
		},

		ConvosightLoginNoGroups({user, pass}) {
			return (async () => {
				return await ConvosightLoginNoGroups(user, pass);
			})();
		},

		getOTPFromEmail({email}) {
			return (async () => {
				return await getOTPFromEmail(email);
			})();
		},

		DeleteUserFromDatabase({userEmail}) {
			return async () => {
				await deleteUser(userEmail);
				return null;
			};
		},

		GetOtpFromDatabase({userEmail}) {
			return (async () => {
				return await getUserOtp(userEmail);
			})();
		},

		generateEmail() {
			return (async () => {
				return await generateEmail();
			})();
		},

		deleteTestCampaigns({value}) {
			return (async () => {
				await deleteTestCampaigns(value);
				return null;
			})();
		},

		deleteTestCampaignsByCampaignId({value}) {
			return (async () => {
				await deleteCampaignByCampaignId(value);
				return null;
			})();
		},

		deleteBrand(brandId) {
			return (async () => {
				await deleteBrand(brandId);
				return null;
			})();
		},

		GetAuthToken({username, password}) {
			return (async () => {
				return await GetAuthToken(username, password);
			})();
		},

		parseXlsx({filePath}) {
			return new Promise((resolve, reject) => {
				try {
					const jsonData = xlsx.parse(fs.readFileSync(filePath));
					resolve(jsonData);
				} catch (e) {
					reject(e);
				}
			});
		},

		setItem({name, value}) {
			console.log('setting %s', name);
			if (typeof value === 'undefined') {
				// since we cannot return undefined from the cy.task
				// let's not allow storing undefined
				throw new Error(`Cannot store undefined value for item '${name}'`);
			}
			items[name] = value;
			console.log('setting done %s', name);
			return null;
		},

		getItem({name}) {
			if (name in items) {
				console.log('returning item %s', name);
				return items[name];
			}
			const msg = `Missing item '${name}'`;
			console.error(msg);
			throw new Error(msg);
		}
	});

	return config;
};
