import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BrandService} from 'src/app/brand/services/brand.service';
import {UserService} from '@sharedModule/services/user.service';
import {ContentManagerService} from '../../services/content-manager.service';
import {Router} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {BrandModel} from 'src/app/shared/models/brand.model';
import {BehaviorSubject, interval, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {CampaignAsset, CampaignGroupAssetKPIs, CMCNotification, UserRole} from 'src/app/shared/models/graph-ql.model';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CampaignModel} from '@sharedModule/models/campaign.model';
import dayjs from 'dayjs';
import {environment} from 'src/environments/environment';

@Component({
	selector: 'app-content-manager',
	templateUrl: './content-manager.component.html',
	styleUrls: ['./content-manager.component.scss']
})
export class ContentManagerComponent extends BaseComponent implements OnInit, OnDestroy {
	subscription: Subscription;
	campaignAssets: CampaignAsset[] = [];
	filteredCampaignAssets: CampaignAsset[] = [];
	currentFilter: string = 'All';
	brands: BrandModel[] = [];
	selectedBrand: BrandModel;
	campaigns: CampaignModel[] = [];
	selectedCampaign: CampaignModel;
	notifications: CMCNotification[] = [];
	notificationTypeFilter: 'asset' | 'support' = 'asset';
	notificationCampaignFilter: string = '';
	selectedNotification: CMCNotification = {
		assetItemId: '',
		brandId: '',
		campaignId: '',
		groupId: '',
		id: '',
		message: '',
		read: false,
		senderUserId: '',
		timestamp: 0,
		userId: ''
	};
	user;
	designers: UserRole[];
	copywriters: UserRole[];
	campaignGroupAssetKpis: CampaignGroupAssetKPIs = {
		assetsApproved: 0,
		assetsDeclined: 0,
		assetsPending: 0,
		campaignAccepted: 0,
		campaignPending: 0,
		campaignRejected: 0,
		campaignProductRequired: 0,
		campaignTaskCreated: 0,
		groupAssetsApproved: 0,
		campaignTotal: 0,
		groupAssetsPartial: 0,
		groupAssetsRequireDeclined: 0,
		groupAssetsRequireInitial: 0,
		groupAssetsRequireReview: 0,
		campaignCMCRatingAvg: 0
	};
	currentUrl: string[];

	selectedNotificationPeriod = {value: 300000, name: 'Every 5 min'};
	notificationsPeriod = [
		{value: 15000, name: 'Every 15 sec'},
		{value: 30000, name: 'Every 30 sec'},
		{value: 60000, name: 'Every 1 min'},
		{value: 300000, name: 'Every 5 min'},
		{value: 900000, name: 'Every 15 min'},
		{value: 3600000, name: 'Every 60 min'},
		{value: 86400000, name: 'Manual Refresh'}
	];
	notificationPeriod$ = new BehaviorSubject(300000);

	editedByContentTeamFilters = [
		// {name: 'All', isSelected: false},
		{name: 'Edit', isSelected: false},
		{name: 'Not edit', isSelected: false}
	];

	constructor(
		injector: Injector,
		private readonly contentManagerService: ContentManagerService,
		private readonly brandService: BrandService,
		private readonly campaignService: CampaignService,
		private userService: UserService,
		private readonly router: Router
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(async user => {
				if (user === null) {
					return;
				}
				this.user = user;
			})
		);

		this.currentUrl = this.appService.currentPageUrl.getValue().split('/');
		this.getBrands();
		this.getCMCNotifications();
		this.getUsersByRoles();

		this.subscription = this.notificationPeriod$
			.pipe(switchMap((val: number) => interval(val)))
			.subscribe(val => this.getCMCNotifications());
	}

	handleChangeNotificationPeriod(period) {
		this.selectedNotificationPeriod = period;
		this.notificationPeriod$.next(period.value);
	}

	updateCampaignAssets(campaignAsset: CampaignAsset) {
		const index = this.campaignAssets.findIndex(
			asset => asset.groupId === campaignAsset.groupId && asset.campaignId === campaignAsset.campaignId
		);

		if (index !== -1) {
			this.campaignAssets[index] = campaignAsset;
		}
	}

	async handleGetCampaignAssets(campaignAssets: CampaignAsset[]) {
		this.campaignAssets = campaignAssets;
		this.filterCampaignAssets(this.currentFilter);
	}

	async getBrands() {
		this.brands = await this.brandService.getBrands(await this.userService.getUser());

		if (this.currentUrl.length === 7) {
			const brandById = this.brands.find(brand => brand.id === this.currentUrl[4]);
			this.selectedBrand = brandById;
		} else {
			this.selectedBrand = this.brands[0];
		}

		this.campaigns = await this.campaignService.getCampaignsByBrandId(this.selectedBrand.id);
		if (this.currentUrl.length === 7) {
			const campaignById = this.campaigns.find(campaign => campaign.campaignId === this.currentUrl[6]);
			this.handleCampaignSelect(campaignById);
		} else {
			this.handleCampaignSelect(this.campaigns[0]);
		}
	}

	async handleBrandSelect(brand: BrandModel) {
		this.selectedBrand = brand;
		this.campaigns = await this.campaignService.getCampaignsByBrandId(brand.id);
		this.handleCampaignSelect(this.campaigns[0]);
	}

	async handleCampaignSelect(campaign: CampaignModel) {
		this.selectedCampaign = campaign;
		this.wipeSelectedNotification();

		const campaignAssets = await this.contentManagerService.getCampaignAssets(campaign.campaignId);
		if (campaignAssets.length) {
			this.campaignAssets = campaignAssets;
			this.filterCampaignAssets('All');
		} else {
			this.campaignAssets = [];
			this.filterCampaignAssets('All');
		}

		this.getCampaignGroupAssetKpis(campaign.campaignId);
	}

	async getCampaignAsset(campaignId: string) {
		const campaignAssets = await this.contentManagerService.getCampaignAssets(campaignId);
		if (campaignAssets.length) {
			this.campaignAssets = campaignAssets;
			this.filterCampaignAssets(this.currentFilter);
		} else {
			this.campaignAssets = [];
			this.filterCampaignAssets(this.currentFilter);
		}
	}

	async getCMCNotifications() {
		const notificationsByUserId = await this.contentManagerService.getCMCNotifications({
			userId: this.user.id,
			count: 10,
			campaignId: this.notificationCampaignFilter,
			type: this.notificationTypeFilter
		});
		if (notificationsByUserId.length) {
			this.notifications = notificationsByUserId;
		} else {
			const notificationsForCSAdmin = await this.contentManagerService.getCMCNotifications({
				userId: 'csadmin',
				count: 10,
				campaignId: this.notificationCampaignFilter,
				type: this.notificationTypeFilter
			});
			if (notificationsForCSAdmin.length) {
				this.notifications = notificationsForCSAdmin;
			} else {
				this.notifications = [];
			}
		}
	}

	async handleNotificationClick({notification}) {
		this.selectedNotification = notification;
		// const campaigns = await this.campaignService.getCampaignsByBrandId(notification.brandId);
		// const tempCampaign = campaigns.find((campaign: CampaignModel) => campaign.campaignId === notification.campaignId);
		// if (tempCampaign) {
		// 	this.selectedCampaign = tempCampaign;
		// }
		const campaignAssetsByGroupId = await this.contentManagerService.getCampaignGroupAssets(
			notification.campaignId,
			notification.groupId
		);
		this.campaignAssets = [campaignAssetsByGroupId];
		this.filterCampaignAssets('All');
	}

	wipeSelectedNotification() {
		this.selectedNotification = {
			assetItemId: '',
			brandId: '',
			campaignId: '',
			groupId: '',
			id: '',
			message: '',
			read: false,
			senderUserId: '',
			timestamp: 0,
			userId: ''
		};
	}

	async markNotificationAsRead({notificationId}) {
		await this.contentManagerService.markCMCNotificationAsRead({id: notificationId});
		this.getCMCNotifications();
	}

	async getUsersByRoles() {
		const response = await this.contentManagerService.getUsersByRoles();
		this.copywriters = response.copywriter;
		this.designers = response.designer;
	}

	filterCampaignAssets(filter: string) {
		this.currentFilter = filter;
		let result;

		switch (filter) {
			case 'Approved':
				result = this.campaignAssets.filter(campaignAsset => {
					if (campaignAsset.items) {
						const filteredItems = campaignAsset.items.filter(item => item.status === filter);
						if (filteredItems.length === campaignAsset.items.length) {
							return {...campaignAsset, subElements: campaignAsset.items.filter(item => item.status === filter)};
						}
					}
				});

				this.filteredCampaignAssets = result;
				break;
			case 'PendingApproval':
				result = this.campaignAssets.filter(campaignAsset => {
					if (campaignAsset.items) {
						const filteredItems = campaignAsset.items.filter(item => item.status === filter);
						if (filteredItems.length) {
							return {...campaignAsset, subElements: campaignAsset.items.filter(item => item.status === filter)};
						}
					}
				});

				this.filteredCampaignAssets = result;
				break;
			case 'Declined':
				result = this.campaignAssets.filter(campaignAsset => {
					if (campaignAsset.items) {
						const filteredItems = campaignAsset.items.filter(item => item.status === filter);
						if (filteredItems.length) {
							return {...campaignAsset, subElements: campaignAsset.items.filter(item => item.status === filter)};
						}
					}
				});

				this.filteredCampaignAssets = result;
				break;
			case 'NotSubmitted':
				result = this.campaignAssets.filter(campaignAsset => {
					if (!campaignAsset.items) {
						return campaignAsset;
					}
				});

				this.filteredCampaignAssets = result;
				break;
			case 'Edit':
				result = this.campaignAssets.filter(campaignAsset => {
					if (campaignAsset.items) {
						const filteredItems = campaignAsset.items.filter(item => item.updatedByContentTeam);
						if (filteredItems.length) {
							return {...campaignAsset, subElements: campaignAsset.items.filter(item => item.updatedByContentTeam)};
						}
					}
				});

				this.filteredCampaignAssets = result;
				break;
			case 'Not edit':
				result = this.campaignAssets.filter(campaignAsset => {
					if (campaignAsset.items) {
						const filteredItems = campaignAsset.items.filter(item => !item.updatedByContentTeam);
						if (filteredItems.length) {
							return {...campaignAsset, subElements: campaignAsset.items.filter(item => !item.updatedByContentTeam)};
						}
					}
				});

				this.filteredCampaignAssets = result;
				break;

			default:
				this.filteredCampaignAssets = this.campaignAssets;
		}
	}

	async getCampaignGroupAssetKpis(campaignId: string) {
		try {
			const response = await this.contentManagerService.getCampaignGroupAssetKpis(campaignId);
			if (response instanceof Error) {
				throw new Error();
			}
			this.campaignGroupAssetKpis = response;
		} catch (error) {
			this.campaignGroupAssetKpis = {
				assetsApproved: 0,
				assetsDeclined: 0,
				assetsPending: 0,
				campaignAccepted: 0,
				campaignPending: 0,
				campaignRejected: 0,
				campaignProductRequired: 0,
				campaignTaskCreated: 0,
				groupAssetsApproved: 0,
				campaignTotal: 0,
				groupAssetsPartial: 0,
				groupAssetsRequireDeclined: 0,
				groupAssetsRequireInitial: 0,
				groupAssetsRequireReview: 0,
				campaignCMCRatingAvg: 0
			};
		}
	}

	async downloadCampaignGroupAssetsExcel() {
		const response = await this.contentManagerService.downloadCampaignGroupAssetsExcel({
			campaignId: this.selectedNotification.id ? this.selectedNotification.campaignId : this.selectedCampaign.campaignId
		});
		window.open(response.url);
	}

	async setNotificationTypeFilter(value: 'asset' | 'support') {
		this.notificationTypeFilter = value;
		await this.getCMCNotifications();
	}

	async setNotificationCampaignFilter(value: string) {
		this.notificationCampaignFilter = value;
		await this.getCMCNotifications();
	}

	getNotificationTime(timestamp: number) {
		return dayjs(timestamp).fromNow();
	}

	openCampaignDashboardLink() {
		window.open(
			`${environment.baseUrl}cs-admin/brands/${this.selectedBrand.id}/edit-campaign/${this.selectedCampaign.campaignId}#communities`
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
		this.subscription && this.subscription.unsubscribe();
	}
}

