import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BrandModel} from 'src/app/shared/models/brand.model';
import {UserModel} from 'src/app/shared/models/user.model';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {UserService} from 'src/app/shared/services/user.service';
import {WordCloudService} from 'src/app/shared/services/word-cloud.service';
import {GroupsService} from '../../shared/services/groups.service';
import {LoggerService} from '../../shared/services/logger.service';
import {BrandInsightsService} from './brand-insights/brand-insights.service';
import {CampaignService} from './campaign.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {UserTypeEnum} from '@sharedModule/enums/user-type.enum';

@Injectable()
export class BrandService {
	public brands = new BehaviorSubject<BrandModel[]>(null);
	public selectedBrand = new BehaviorSubject<BrandModel>(null);
	private _isInitialized = false;
	public jsonDataStringForCBR;

	constructor(
		private userService: UserService,
		private insightsService: BrandInsightsService,
		private campaignService: CampaignService,
		private groupService: GroupsService,
		private wordCloudService: WordCloudService,
		private loggerService: LoggerService,
		private readonly appSync: AmplifyAppSyncService
	) {
		this.init();
	}

	public init() {
		if (this._isInitialized) {
			return;
		}

		this._isInitialized = true;

		this.userService.isLoggedIn.subscribe(async loggedInStatus => {
			if (loggedInStatus === null) {
				this.brands.next(null);
				this.selectedBrand.next(null);
				return;
			}

			if (loggedInStatus) {
				await this.getBrands(await this.userService.getUser());
			}
		});
	}

	async getBrands(user: UserModel, nextToken: string = null) {
		try {
			const response = await this.appSync.GetBrandsByUserId(user.id, nextToken);
			let fetchedBrands = response.items as undefined as BrandModel[];

			if (response.nextToken) {
				const itemsFromNextToken = await this.getBrands(user, response.nextToken);
				fetchedBrands = fetchedBrands.concat(itemsFromNextToken);
			}

			fetchedBrands = fetchedBrands
				.filter(brand => !!brand)
				.map(
					brand =>
						new BrandModel(brand, this.campaignService, this.insightsService, this.groupService, this.wordCloudService)
				);
			this.brands.next(fetchedBrands);
			if (user.userType !== UserTypeEnum.CSAdmin) {
				this.selectedBrand.next(fetchedBrands[0]);
			}
			return fetchedBrands;
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while fetching brands',
				{userId: user.id},
				'BrandService',
				'getBrands',
				LoggerCategory.AppLogs
			);
		}
	}

	async createBrand(name, communicationEmailForCredentials, iconUrl) {
		try {
			return await this.appSync.CreateBrandCredentials(
				name,
				iconUrl ? iconUrl[0] : '',
				communicationEmailForCredentials,
				true
			);
		} catch (e) {
			this.loggerService.error(
				e,
				'Error while creating brand',
				{brandName: name, iconUrl: iconUrl},
				'BrandService',
				'createBrand',
				LoggerCategory.AppLogs
			);
			return e;
		}
	}
}
