import {Injectable} from '@angular/core';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {UserService} from '@sharedModule/services/user.service';
import {DateTime} from '@sharedModule/models/date-time';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';

@Injectable({
	providedIn: 'root'
})
export class UtilityService {
	timeZoneList = [];

	constructor(
		private facebookService: FacebookService,
		private userService: UserService,
		private securedStorage: SecuredStorageProviderService
	) {}

	async insertMomentTimeZoneScript() {
		let momentScriptLoad;
		const momentTimeZoneWithDataScriptTag = document.createElement('script');
		const momentTimeZoneScriptTag = document.createElement('script');
		const momentScriptTag = document.createElement('script');
		momentScriptTag.src = 'https://momentjs.com/downloads/moment.min.js';
		momentTimeZoneScriptTag.src = 'https://momentjs.com/downloads/moment-timezone.min.js';
		momentTimeZoneWithDataScriptTag.src = 'https://momentjs.com/downloads/moment-timezone-with-data.js';
		document.head.append(momentScriptTag);

		momentScriptLoad = await Promise.all([
			new Promise(
				resolve =>
					(momentScriptTag.onload = () => {
						document.head.append(momentTimeZoneScriptTag);
						document.head.append(momentTimeZoneWithDataScriptTag);
						resolve(true);
					})
			),
			new Promise(resolve => (momentTimeZoneScriptTag.onload = () => resolve(true))),
			new Promise(resolve => (momentTimeZoneWithDataScriptTag.onload = () => resolve(true)))
		]);

		return momentScriptLoad;
	}

	async getUpdatedImageFromFacebook(event, postId) {
		if (!postId) {
			event.target.src = 'assets/images/default_group_image.jpg';
			return;
		}
		const user = await this.userService.getUser();
		const updatedPicture = await this.facebookService.getUpdatedThumbnail(user.fbUserAccessToken, postId);
		if (updatedPicture) {
			event.target.src = updatedPicture;
		} else {
			event.target.src = 'assets/images/default_group_image.jpg';
		}
	}

	getParameterByName(name) {
		const url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) {
			return null;
		}
		if (!results[2]) {
			return '';
		}
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

	pushTimezoneNames() {
		if (this.timeZoneList?.length > 0) {
			return this.timeZoneList;
		}

		this.timeZoneList = [];
		//@ts-ignore
		moment.tz.names().forEach(timezone => {
			try {
				//@ts-ignore
				this.timeZoneList.push('(UTC ' + moment.tz(timezone).format('Z') + ') ' + timezone);
			} catch {}
		});

		return this.timeZoneList;
	}

	setDefaultDate(timezoneName, defaultTaskDate, userTimezoneOffsetInMins) {
		const timezoneOffsetInMins = new DateTime().utc().getUtcOffset(timezoneName);
		let defaultDate = null;
		if (defaultTaskDate) {
			defaultDate = new DateTime(defaultTaskDate).add(timezoneOffsetInMins - userTimezoneOffsetInMins, 'minutes');
		}

		const publishTime = defaultDate ? defaultDate.format('hh:mm a').toString().toUpperCase() : null;

		const date = defaultDate ? new DateTime(defaultDate.format('MMMM D YYYY')).toDate() : null;

		return {publishTime: publishTime, date: date};
	}

	async optionSelected(event: string) {
		let timezoneName = event.substr(13);
		const timezoneOffsetInMins = new DateTime().utc().getUtcOffset(timezoneName);
		return {timezoneName: timezoneName, timezoneOffsetInMins: timezoneOffsetInMins};
	}

	isLoggedOnMobileApplication(): boolean {
		let platform;
		const queryString = this.securedStorage.getSessionStorage('queryString');
		if (!queryString) {
			platform = '';
		}

		try {
			const queryStringJSON = JSON.parse(queryString);
			platform = queryStringJSON['qs_platform'];
		} catch {
			return;
		}

		return platform === 'android' || platform === 'ios';
	}

	public copyQuerystringParametersIntoSessionStorage(queryParamsSnapshot: any) {
		let queryStringObj = {};
		if (
			Object.keys(queryParamsSnapshot).length > 0 &&
			!queryParamsSnapshot.code &&
			!queryParamsSnapshot.logout &&
			!queryParamsSnapshot.state
		) {
			for (let key in queryParamsSnapshot) {
				queryStringObj[`qs_${key}`] = queryParamsSnapshot[key];
			}
			this.securedStorage.setSessionStorage('queryString', JSON.stringify(queryStringObj));
		}
	}

	getBatchesOfArray(arr, chunkSize) {
		let result = [];
		for (let i = 0, len = arr.length; i < len; i += chunkSize) {
			result.push(arr.slice(i, i + chunkSize));
		}
		return result;
	}

	splitArray(arr, numOfParts) {
		const result = Array(numOfParts);
		for (let i = 0; i < numOfParts; i++) {
			result[i].push(arr[i]);
		}
		return result;
	}

	currencyToShow(currency) {
		switch (currency) {
			case 'INR':
				return '₹';
				break;
			case 'USD':
				return '$';
				break;
			case 'SGD':
				return 'S$';
				break;
		}
	}

	getLastOneYearInQuartersStartDate() {
		const currentMonth = new DateTime().month();
		if (currentMonth === 0 || currentMonth === 1 || currentMonth === 2) {
			const lastyear = new DateTime().subtract(1, 'year').format('YYYY');
			return new DateTime('04-01-' + lastyear);
		}
		if (currentMonth === 3 || currentMonth === 4 || currentMonth === 5) {
			const lastyear = new DateTime().subtract(1, 'year').format('YYYY');
			return new DateTime('07-01-' + lastyear);
		}
		if (currentMonth === 6 || currentMonth === 7 || currentMonth === 8) {
			const lastyear = new DateTime().subtract(1, 'year').format('YYYY');
			return new DateTime('10-01-' + lastyear);
		}
		if (currentMonth === 9 || currentMonth === 10 || currentMonth === 11) {
			const currentyear = new DateTime().format('YYYY');
			return new DateTime('01-01-' + currentyear);
		}
	}
}
