import {Injectable} from '@angular/core';

declare var window: any;

@Injectable({
	providedIn: 'root'
})
export class UserOnBoardingService {
	private _isInitialized = false;

	constructor() {
		this.init();
	}

	init(): void {
		if (this._isInitialized) {
			return;
		}

		this._isInitialized = true;
	}
}
