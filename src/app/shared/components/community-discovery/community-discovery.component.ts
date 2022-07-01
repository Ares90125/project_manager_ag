import {SelectionModel} from '@angular/cdk/collections';
import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
	ViewChildren
} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Router} from '@angular/router';
import {CampaignService} from '@brandModule/services/campaign.service';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {GeographyService} from '@groupAdminModule/_services/geography.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {CommunityDiscoveryFiltersModel} from '@sharedModule/components/community-discovery/community-discovery-filters.model';
import {CampaignStatusEnum} from '@sharedModule/models/graph-ql.model';
import {AlertService} from '@sharedModule/services/alert.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {UserService} from '@sharedModule/services/user.service';
import * as _ from 'lodash';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
	selector: 'app-community-discovery',
	templateUrl: './community-discovery.component.html',
	styleUrls: ['./community-discovery.component.scss']
})
export class CommunityDiscoveryComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() showCommunityListPopup = false;
	@Input() campaign;
	@Input() brand;
	@Input() selectedCommunities;
	@Input() selectedCommunitiesFromApi;
	@Output() groupsSelectedForCampaignCreation = new EventEmitter();
	@Output() areGroupsLoaded = new EventEmitter();
	@Output() hideCommunityListPopup = new EventEmitter();
	@Output() hideCommunityOverlay = new EventEmitter();
	@Output() saveCommunities = new EventEmitter();
	@Output() updateDeletedCommunities = new EventEmitter();
	@Input() metadata;
	businessCategory = [
		'Parenting',
		'Lifestyle, Beauty & Makeup',
		'Fitness & Health',
		'Cooking & Recipes',
		'Food & Drink',
		'Medical & Mental Health',
		'Learning & Education',
		'Neighborhood/Local Groups',
		'Business-Brand',
		'Hobbies & Interests',
		'Jobs & Careers',
		'Travel',
		'Sports & Gaming',
		'Humor',
		'Arts',
		'Vehicles & Commutes',
		'Animals',
		'Entertainment',
		'Others',
		'Buy & Sell',
		'Relationships & Identity',
		'Faith & Spirituality',
		'Politics'
	];
	displayedColumns: string[] = [
		'select',
		'fbGroupLink',
		'name',
		'memberCount',
		'queryConversationCount',
		'categoryConversationCount',
		'campaignCount',
		'campaignPostEngagementRateLastNinetyDays',
		'postsEngagementRateLastNinetyDays',
		'averageActiveMember',
		'averageTopPostsReach',
		'averageReachPercentage',
		'audienceMatch',
		'categoryDensity',
		'state',
		'country',
		'topTenCities',
		'groupInstallationStartedAtUTC',
		'businessCategory',
		'cmcTrained',
		'performanceTrained',
		'groupProfileId',
		'cmcRatingTotal',
		'cmcRatingCount',
		'cmcRatingAvg'
	];
	dataSource;
	selection = new SelectionModel(true, []);
	initialFilters;
	sortOptions = [
		'Member count',
		'Campaign Engagement',
		'Post Engagement',
		'Category density',
		'Query Conversation Count',
		'Category Conversation Count'
	];
	listKeywords = new BehaviorSubject(null);
	keywords;
	categories;
	subcategories = [];
	sortBy = 'Campaign Engagement';
	groups;
	groupId;
	group;
	user;
	isGroupSelected = [];
	selectedGroups = [];
	isLoading = false;
	@Output() disableActionOnConversationTrends = new EventEmitter<boolean>();
	showErrorMessage = false;
	minMembersMatchingCriteria = null;
	maxMembersMatchingCriteria = null;
	memberMatchingCriteria = null;
	multipleId = null;

	isCMCTrained: boolean = false;
	isPerformanceTrained: boolean = false;
	groupProfileRequired: boolean = false;

	minRating: number = 0;
	maxRating: number = 5;

	@ViewChild('selectAllGroups')
	selectAllGroups: MatCheckbox;
	sort = new FormGroup({
		sortValue: new FormControl()
	});
	sortByOptionForBackend = 'campaignPostEngagementRateLastNinetyDays';
	selectedFilters = {
		Category: {
			keyForBackend: 'category',
			value: []
		},
		'Gender Criteria': {
			keyForBackend: 'gender',
			value: [],
			isTargetAudience: true
		},
		'Age Criteria': {
			keyForBackend: 'ageRange',
			value: [],
			isTargetAudience: true
		},
		'Members Matching Criteria': {
			keyForBackend: 'memberMatchingCriteria',
			value: [],
			isRadioButton: true,
			isTargetAudience: true
		},
		'Business Category': {
			keyForBackend: 'businessCategory',
			value: []
		},
		'Group location (country)': {
			keyForBackend: 'country',
			value: []
		},
		Region: {
			keyForBackend: 'region',
			value: []
		},
		'Top 10 Cities': {
			keyForBackend: 'city',
			value: []
		},
		'Group state': {
			keyForBackend: 'state',
			value: []
		},
		'Group type': {
			keyForBackend: 'privacy',
			value: []
		},
		'Monetizable vs Non-monetizable': {
			keyForBackend: 'monetizationState',
			value: []
		},
		'BD or Non-BD': {
			keyForBackend: 'owner',
			value: []
		}
	};
	showMoreFilters = false;
	inputObjForBackend = {};
	searchTerm = '';
	totalFiltersAdded = 0;
	searchKey;
	typeOfSearch = 'Group Meta Data';
	showSearchFilter = false;
	addOnBlur = true;
	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	itemsInAndList = [[]];
	doesNotContainList = [];
	showAudienceMatchError = true;
	searchQuery;

	@ViewChild(MatPaginator) paginator: MatPaginator;
	private updatedFilterSearchValue: Subject<string> = new Subject();
	searchTextForFilter;
	followersCountMin = 0;
	followersCountMax;
	engagementMin = 0;
	engagementMax: any;
	activityMin = 0;
	activityMax: any;
	fbGroupId: any;
	communities: CommunityDiscoveryFiltersModel[];
	campaignId;
	totalCommunityCount;
	showMoreFilterValue;
	campaignNameFromUrl;
	selectedMonetizedGroups;
	selectedMonetizableGroups;
	selectedNonMonetizableGroups;
	filtersFromApi;
	selectedCategories = [];
	groupQualification = 'FrequentlyMonetized';
	minCampaigns = 0;
	maxCampaigns = 11;

	isSortValueToBeChanged = false;
	overrideSort = false;
	monetizableGroupsHavingCampaignTaskToPerformThisMonth = 0;
	nonMonetizableGroupsHavingCampaignTaskToPerformThisMonth = 0;
	totalMonetizableGroups = 0;
	totalAverageTopPostReach = 0;
	totalAverageTopPostReachPercentage = 0;
	isErrorTooltipEnabled = false;
	selectedReachGroups = [];
	isMemberCriteriaEnabled = false;
	@ViewChildren('ngSearchInput') ngSearchInput: [ElementRef];
	showCampaignList = false;
	campaignList;
	selectedCommunityName;

	constructor(
		injector: Injector,
		private readonly createCampaignService: CreateCampaignService,
		private readonly campaignService: CampaignService,
		private readonly alertService: AlertService,
		private readonly groupService: GroupsService,
		private readonly userService: UserService,
		private route: ActivatedRoute,
		private router: Router,
		private geographyService: GeographyService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		Object.keys(this.selectedFilters).forEach(key => {
			this.selectedFilters[key].value = [];
		});
		this.campaignId = this.route.snapshot.params['campaignId'];
		this.campaignNameFromUrl = this.route.snapshot.queryParams['name'];
		this.userService.currentUser$.subscribe(user => (this.user = user));
		this.updatedFilterSearchValue.next('');
		this.subscribeToSearchTextChanges();
		this.getCategories();
		this.inputObjForBackend['sortBy'] = this.sortByOptionForBackend;
		this.inputObjForBackend['state'] = ['Installed'];
		this.inputObjForBackend['monetizationState'] = ['Monetizable'];
		this.inputObjForBackend['descendingOrder'] = true;
		this.selectedFilters['Group state'].value.push('Installed');
		this.selectedFilters['Monetizable vs Non-monetizable'].value.push('Monetizable');
		await this.getDiscoverCommunities();
		this.applyAllFilters();
		this.setSelectedCommunities();
		this.filtersFromApi = await this.campaignService.communityDiscoveryFilters();
		this.initialFilters = {
			Category: null,
			'Gender Criteria': [
				{name: 'Men', isSelected: false},
				{name: 'Women', isSelected: false},
				{name: 'Others', isSelected: false}
			],
			'Age Criteria': [
				{name: '13-17', isSelected: false},
				{name: '18-24', isSelected: false},
				{name: '25-34', isSelected: false},
				{name: '35-44', isSelected: false},
				{name: '45-54', isSelected: false},
				{name: '55-64', isSelected: false},
				{name: '65+', isSelected: false}
			],
			'Members Matching Criteria': [
				{name: 'Percentage', displayName: 'Percentage', isSelected: false},
				{name: 'AbsoluteValue', displayName: 'Absolute Value', isSelected: false}
			],
			'Business Category': this.businessCategory,
			'Group location (country)': [
				'IN',
				'US',
				'SG',
				'IA',
				'PH',
				'GB',
				...this.filtersFromApi.countries.filter(
					country =>
						country !== 'IN' &&
						country !== 'US' &&
						country !== 'SG' &&
						country !== 'IA' &&
						country !== 'PH' &&
						country !== 'GB'
				)
			],
			'Monetizable vs Non-monetizable': ['Monetizable', 'NonMonetizable'],
			'Group state': ['Installed', 'NotInstalled', 'Uninstalled'],
			// Contactable: ['by WhatsApp', 'by App', 'by Community Team', 'by Email', 'Not contactable'],
			'Group type': ['CLOSED', 'OPEN', 'SECRET'],
			'BD or Non-BD': ['BD', 'NonBD'],
			Region: ['Central', 'East', 'North', 'South', 'West']
		};
		this.user = await this.userService.getUser();
		if (this.user.csAdminTeam === 'Brand Partnership' || this.user.csAdminTeam === 'Community Partnership') {
			delete this.initialFilters['Category'];
			this.sortOptions = this.sortOptions.filter(option => option !== 'Category density');
			this.displayedColumns = this.displayedColumns.filter(column => column !== 'categoryDensity');
		}
		this.followersCountMax = this.filtersFromApi.maxMemberCount;
		this.activityMax = this.filtersFromApi.maxPostsEngagementRateLastNinetyDays;
		this.setAverageCalculations();
	}

	removeCommunity(community) {
		if (community['isAlreadySelectedCommunity']) {
			this.deleteCommunities(community.groupId);
			this.updateDeletedCommunities.emit(community);
		}
		this.isGroupSelected = this.isGroupSelected.filter(group => group !== community.groupId);
		this.selectedGroups = this.selectedGroups.filter(group => group.groupId !== community.groupId);
		this.groupsSelectedForCampaignCreation.emit(this.selectedGroups);
	}

	async deleteCommunities(groupId) {
		try {
			await this.campaignService.deleteCMCampaignGroup(this.campaign.campaignId, groupId);
			this.selectedCommunities = this.selectedCommunities.filter(group => group.groupId !== groupId);
		} catch (e) {
			this.alertService.error(
				'Some error occurred',
				'We are unable to delete this community at this moment. Please try again later.'
			);
		}
	}

	closeCommunityListPopup() {
		this.showCommunityListPopup = false;
	}

	toggleAllGroups() {
		this.selectedGroups = [...this.selectedCommunitiesFromApi];
		this.isGroupSelected = this.selectedGroups.map(group => group.groupId);
		this.selectedMonetizedGroups = [];
		this.selectedMonetizableGroups = [];
		this.selectedNonMonetizableGroups = [];
		if (!this.selectAllGroups.checked) {
			this.communities?.forEach(group => {
				if (this.isGroupSelected.includes(group.groupId)) {
					return;
				}
				this.selectedGroups.push(group);
				this.isGroupSelected.push(group.groupId);
				if (group.isMonetized) {
					this.selectedMonetizedGroups.push(group);
				} else if (group.isMonetizable) {
					this.selectedMonetizableGroups.push(group);
				} else {
					this.selectedNonMonetizableGroups.push(group);
				}
			});
		} else {
			this.selectedGroups = [...this.selectedCommunitiesFromApi];
			this.isGroupSelected = this.selectedGroups.map(group => group.groupId);
		}
		this.groupsSelectedForCampaignCreation.emit(this.selectedGroups);
		if (this.selectAllGroups.checked) {
			this.setSelectedCommunities();
		}

		this.setAverageCalculations();
	}

	setAverageCalculations() {
		this.isErrorTooltipEnabled = false;
		this.selectedReachGroups = this.selectedGroups.filter(group => group.averageTopPostsReach && group.memberCount);
		const totalAverageMembers = this.selectedReachGroups.reduce(
			(sum, group) => sum + (group.averageTopPostsReach && group.memberCount ? Number(group.memberCount) : 0),
			0
		);
		const totalAverageTopPostReach = this.selectedReachGroups.reduce(
			(sum, group) => sum + (group.averageTopPostsReach ? Number(group.averageTopPostsReach) : 0),
			0
		);
		this.totalAverageTopPostReach =
			this.selectedReachGroups.length > 0
				? Number((totalAverageTopPostReach / this.selectedReachGroups.length).toFixed(2))
				: null;

		this.isErrorTooltipEnabled = this.selectedGroups?.length > this.selectedReachGroups?.length;
		if (totalAverageMembers !== 0) {
			this.totalAverageTopPostReachPercentage = Number(
				((totalAverageTopPostReach / totalAverageMembers) * 100).toFixed(2)
			);
		} else {
			this.totalAverageTopPostReachPercentage = 0;
		}
	}

	setSelectedCommunities() {
		this.selectedCommunitiesFromApi?.forEach(community => {
			community['isAlreadySelectedCommunity'] = true;
		});
		this.selectedGroups = this.selectedCommunitiesFromApi;
		this.selectedGroups?.forEach(group => {
			this.isGroupSelected.push(group.groupId);
		});
		this.groupsSelectedForCampaignCreation.emit(this.selectedGroups);
	}

	setMinAndMaxRating(range, isFromInput = null, type = null) {
		if (isFromInput) {
			if (type === 'min') {
				this.minRating = parseInt(range);
			} else {
				this.maxRating = parseInt(range);
			}
			this.getDiscoverCommunities();
		} else {
			this.minRating = parseInt(range.min);
			this.maxRating = parseInt(range.max);
			this.getDiscoverCommunities();
		}
	}

	async getDiscoverCommunities(multipleIdObjForBackend = null) {
		try {
			this.inputObjForBackend['cmcTrained'] = this.isCMCTrained ? this.isCMCTrained : undefined;
			this.inputObjForBackend['performanceTrained'] = this.isPerformanceTrained ? this.isPerformanceTrained : undefined;
			this.inputObjForBackend['groupProfile'] = this.groupProfileRequired ? this.groupProfileRequired : undefined;
			this.inputObjForBackend['minRating'] = this.minRating != 0 ? this.minRating : undefined;
			this.inputObjForBackend['maxRating'] = this.maxRating != 5 ? this.maxRating : undefined;
			this.inputObjForBackend['minParticipationFrequency'] = this.minCampaigns ? this.minCampaigns : undefined;
			this.inputObjForBackend['maxParticipationFrequency'] = this.maxCampaigns
				? this.maxCampaigns > 10
					? 9999
					: this.maxCampaigns
				: undefined;
			this.inputObjForBackend = !this.multipleId ? this.inputObjForBackend : multipleIdObjForBackend;
		} catch (e) {
			this.isLoading = false;
			this.showErrorMessage = true;
		}
		this.totalFiltersAdded = 0;
		Object.keys(this.selectedFilters).forEach(key => {
			if (
				!this.selectedFilters[key].isTargetAudience ||
				(this.selectedFilters[key].isTargetAudience && this.memberMatchingCriteria?.length > 0)
			) {
				if (this.selectedFilters[key].value.length > 0) {
					this.totalFiltersAdded += this.selectedFilters[key].value.length;
				}
			}
		});
	}

	async applyAllFilters() {
		this.isLoading = true;
		const communityResponse = await this.campaignService.discoverCommunities(this.inputObjForBackend);
		const groups = communityResponse.selectedCommunities;
		this.totalCommunityCount = communityResponse.eligibleCommunitiesCount;
		this.isLoading = false;
		groups?.forEach(community => {
			community['averageReachPercentage'] = community['memberCount']
				? ((community['averageTopPostsReach'] / community['memberCount']) * 100).toFixed(2)
				: null;
		});
		this.communities = groups;
		this.nonMonetizableGroupsHavingCampaignTaskToPerformThisMonth =
			communityResponse.nonMonetizableGroupsHavingCampaignTaskToPerformThisMonth;
		this.monetizableGroupsHavingCampaignTaskToPerformThisMonth =
			communityResponse.monetizableGroupsHavingCampaignTaskToPerformThisMonth;
		this.totalMonetizableGroups = communityResponse.totalMonetizableGroups;
		this.dataSource = new MatTableDataSource<CommunityDiscoveryFiltersModel>(this.communities);
		this.groups = groups;
		this.showErrorMessage = false;
		this.isLoading = false;
	}

	closeCommunityOverlay() {
		this.hideCommunityOverlay.emit(false);
	}

	async saveCommunitiesForCampaignCreation() {
		if (!this.campaign?.campaignId) {
			await this.createCampaign();
		}
		await this.addMoreCommunities();
		this.saveCommunities.emit(this.selectedGroups);
		this.closeCommunityOverlay();
	}

	async createCampaign() {
		const campaignCreateInput = {};
		campaignCreateInput['brandId'] = this.brand.id;
		campaignCreateInput['brandName'] = this.brand.name;
		campaignCreateInput['campaignName'] = this.campaignNameFromUrl;
		campaignCreateInput['status'] = CampaignStatusEnum.Draft;
		campaignCreateInput['cmcReportVersion'] = 2;
		let campaignDetails;
		try {
			campaignCreateInput['engagementInsights'] = [
				'intent|Purchase Intent:_get_,_Buy_,Bought,Price,Cost,_pp_,discount,sale,amazon,_shop_,purchase,khareed,kharid,will%try,want%try,will%use,want%use',
				'intent|Recommendations:_try_,Reco,Recco,suggest,go for it,must%buy,should%buy',
				'intent|Usage:using,used,tried,_got_,apply,applied,istemal,_laga_,_lagaa_',
				'emotions|Positive Emotion:_Great_,awesome,love,fantastic,excellent,excelent,good,_gud_,_super_,superb,accha,amazing,badhiya,badiya,favorite,favourite,favorit,favourit,favrit,_best_'
			];
			campaignDetails = await this.createCampaignService.createCampaign(campaignCreateInput);
			this.campaignId = campaignDetails.campaignId;
			this.brand.resetDetails();
			this.alert.success('Check campaign list for selected brand', 'Campaign created successfully', 5000, true);
			this.router.navigateByUrl(
				'/cs-admin/brands/' + this.brand.id + '/edit-campaign/' + campaignDetails.campaignId + '#communities'
			);
		} catch (e) {
			this.alert.error(
				'Campaign creation unsuccessful',
				'We are unable to create campaign at this moment. Please try again later.'
			);
		}
	}

	async addMoreCommunities() {
		const createCMCampaignGroupInput = [];
		let groupsSelectedForCampaignCreation = [];
		let groupsNeedToBeRemoved = [];
		this.selectedCommunitiesFromApi.forEach(communityFromApi => {
			const selectedCommunity = this.selectedGroups.filter(group => group.groupId === communityFromApi.groupId);
			if (selectedCommunity.length === 0) {
				groupsNeedToBeRemoved.push(communityFromApi);
			}
		});

		this.selectedGroups.forEach(group => {
			const selectedCommunity = this.selectedCommunitiesFromApi.filter(
				communityFromApi => group.groupId === communityFromApi.groupId
			);
			if (selectedCommunity.length === 0) {
				groupsSelectedForCampaignCreation.push(group);
			}
		});

		groupsNeedToBeRemoved.forEach(group => {
			this.deleteCommunities(group.groupId);
			this.updateDeletedCommunities.emit(group);
		});

		groupsSelectedForCampaignCreation?.forEach(community => {
			const communityInfo = {};
			communityInfo['campaignId'] = this.campaignId;
			communityInfo['groupId'] = community['groupId'];
			communityInfo['fbGroupId'] = community['fbGroupId'];
			communityInfo['memberCount'] = community['memberCount'];
			communityInfo['campaignPostEngagementRateLastNinetyDays'] = community['campaignPostEngagementRateLastNinetyDays'];
			communityInfo['postsEngagementRateLastNinetyDays'] = community['postsEngagementRateLastNinetyDays'];
			communityInfo['groupName'] = community['name'];
			communityInfo['state'] = community['state'];
			communityInfo['groupInstallationStartedAtUTC'] = community['groupInstallationStartedAtUTC'];
			communityInfo['businessCategory'] = community['businessCategory'];
			communityInfo['topTenCities'] = community['topTenCities'];
			communityInfo['categoryDensity'] = community['categoryDensity'];
			communityInfo['location'] = community['country'];
			communityInfo['communityAdminId'] = community['defaultCommunityAdmin'];
			communityInfo['averageTopPostsReach'] = community['averageTopPostsReach'];
			communityInfo['metadata'] = {};
			this.metadata.forEach(metadataValue => {
				if (community[metadataValue]) {
					communityInfo['metadata'][metadataValue] = community[metadataValue];
				}
			});
			communityInfo['metadata'] = JSON.stringify(communityInfo['metadata']);
			if (!community['defaultTaskDate']) {
				communityInfo['defaultTaskDate'] = this.campaign?.['defaultTaskDate'];
			} else {
				communityInfo['defaultTaskDate'] = community['defaultTaskDate'];
			}
			if (!community['defaultTaskDate']) {
				communityInfo['timezone'] = this.campaign?.['timezoneName'];
			} else {
				communityInfo['timezone'] = community['timezoneName'];
			}

			createCMCampaignGroupInput.push(communityInfo);
		});

		if (createCMCampaignGroupInput) {
			const perChunk = 25;
			const communitiesSubSections = createCMCampaignGroupInput.reduce((resultArray, item, index) => {
				const chunkIndex = Math.floor(index / perChunk);

				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = [];
				}
				resultArray[chunkIndex].push(item);
				return resultArray;
			}, []);
			try {
				let calls = [];
				calls.push(
					communitiesSubSections.forEach(communities => {
						this.campaignService.createCMCampaignGroups(communities);
					})
				);
				await Promise.all(calls);
			} catch (e) {}
		}
	}

	async changeFilterSelection(filterName, filterValue) {
		const selectedKeyForBackend = this.selectedFilters[filterName]?.keyForBackend;
		if (!this.selectedFilters[filterName].value.includes(filterValue)) {
			this.selectedFilters[filterName].value.push(filterValue);
			if (!this.inputObjForBackend[selectedKeyForBackend]) {
				Object.assign(this.inputObjForBackend, {[selectedKeyForBackend]: [filterValue]});
			} else {
				this.inputObjForBackend[selectedKeyForBackend].push(filterValue);
			}
		} else {
			this.selectedFilters[filterName].value = this.selectedFilters[filterName].value.filter(
				filter => filter !== filterValue
			);
			this.inputObjForBackend[selectedKeyForBackend] = this.inputObjForBackend[selectedKeyForBackend].filter(
				filter => filter !== filterValue
			);
			if (this.inputObjForBackend[selectedKeyForBackend]?.length === 0) {
				delete this.inputObjForBackend[selectedKeyForBackend];
			}
		}
		if (filterName === 'Category') {
			if (!this.overrideSort) {
				this.isSortValueToBeChanged = true;
				if (this.selectedFilters['Category'].value?.length > 0) {
					this.sortBy = 'Category density';
					this.sortOptionsForBackend('Category density');
				} else {
					if (this.groupQualification === 'FrequentlyMonetized') {
						this.sortOptions = ['Member count', 'Campaign Engagement', 'Post Engagement', 'Category density'];
						this.sortBy = 'Campaign Engagement';
						this.sortOptionsForBackend('Campaign Engagement');
					} else {
						this.sortOptions = ['Member count', 'Post Engagement', 'Category density'];
						this.sortBy = 'Post Engagement';
						this.sortOptionsForBackend('Post Engagement');
					}
				}
				this.sort.get('sortValue').setValue(this.sortBy);
				this.isSortValueToBeChanged = false;
			}
		}
		this.updateTargetAudience(null);
		await this.getDiscoverCommunities();
		if (
			(selectedKeyForBackend === 'country' || selectedKeyForBackend === 'region') &&
			(this.inputObjForBackend['country'] || this.inputObjForBackend['region'])
		) {
			const cities = await this.campaignService.communityCitiesByCountriesOrRegions(
				this.inputObjForBackend['country'],
				this.inputObjForBackend['region']
			);
			this.initialFilters['Top 10 Cities'] = cities;
		}
	}

	async updateCommunitiesByGroupQualification(range, isFromInput = null, type = null) {
		if (isFromInput) {
			if (type === 'min') {
				this.minCampaigns = parseInt(range);
			} else {
				this.maxCampaigns = parseInt(range);
			}
		} else {
			this.minCampaigns = parseInt(range.min);
			this.maxCampaigns = parseInt(range.max);
		}
		this.groupQualification = this.minCampaigns + '-' + this.maxCampaigns;
		this.getDiscoverCommunities();
	}

	async updateCommunityFilters(filterName) {
		this.followersCountMax = this.followersCountMax ? this.followersCountMax : this.filtersFromApi.maxMemberCount;
		this.activityMax = this.activityMax ? this.activityMax : this.filtersFromApi.maxPostsEngagementRateLastNinetyDays;
		let filterValue;
		switch (filterName) {
			case 'memberCount':
				filterValue = (this.followersCountMin ? this.followersCountMin : '0') + '-' + this.followersCountMax;
				break;
			case 'postsEngagementRateLastNinetyDays':
				filterValue = (this.activityMin ? this.activityMin : '0') + '-' + this.activityMax;
				break;
			case 'searchTerm':
				this.itemsInAndList = [[]];
				this.doesNotContainList = [];
				this.searchQuery = '';
				delete this.inputObjForBackend['searchQuery'];
				filterValue = this.searchTerm;
				break;
			case 'searchQuery':
				this.searchTerm = '';
				this.inputObjForBackend['sortBy'] = 'queryConversationCount';
				this.sortBy = 'Query Conversation Count';
				delete this.inputObjForBackend['searchTerm'];
				filterValue = this.searchQuery;
				break;
			case 'sortBy':
				filterValue = this.sortByOptionForBackend;
				break;
			case 'fbGroupId':
				filterValue = this.fbGroupId;
				break;
		}
		this.inputObjForBackend[filterName] = filterValue;
		this.updateTargetAudience(null);
		await this.getDiscoverCommunities();
		if (filterName === 'sortBy' || filterName === 'searchTerm' || filterName === 'searchQuery') {
			this.applyAllFilters();
		}
	}

	updateCommunityFiltersForMultipleId(event) {
		if ((event.key === 'v' && event.ctrlKey) || event.key === 'Enter') {
			if (event.target.value && event.target.value !== '\n') {
				this.multipleId = event.target.value.replace(/\n/g, ',').replace(/ /g, ',').replace(/,+/g, ',');
				let multipleId = this.multipleId.split(',');
				multipleId = multipleId.filter(id => !!id);
				const inputObject = {};
				inputObject['communityIds'] = multipleId;
				this.getDiscoverCommunities(inputObject);
			} else {
				this.multipleId = null;
				this.getDiscoverCommunities();
			}
		} else if (!event.target.value) {
			this.multipleId = null;
			this.getDiscoverCommunities();
		}
	}

	removeAudienceFilter(filterKey, selectedFilter, isFromFilter = false) {
		if (filterKey === 'Members Matching Criteria') {
			this.memberMatchingCriteria = '';
			this.minMembersMatchingCriteria = null;
			this.maxMembersMatchingCriteria = null;
			this.updateTargetAudience(null, isFromFilter);
		} else {
			this.initialFilters[filterKey].forEach(filter => {
				if (filter.name === selectedFilter) {
					filter.isSelected = !filter.isSelected;
				}
			});
			this.updateTargetAudience(null, isFromFilter);
		}
	}

	onUpdateMemberMatchingCriteria() {
		this.minMembersMatchingCriteria = null;
		this.maxMembersMatchingCriteria = null;
		this.updateTargetAudience(null, true);
	}

	async updateTargetAudience(selectedFilter, isFromFilter = false) {
		if (selectedFilter) {
			selectedFilter.isSelected = !selectedFilter.isSelected;
		}
		let isInputChanged = false;
		let isMinandMaxCriteriaMatched = false;
		this.isMemberCriteriaEnabled = false;
		if (
			this.minMembersMatchingCriteria > -1 &&
			this.maxMembersMatchingCriteria > -1 &&
			this.memberMatchingCriteria !== 'Percentage' &&
			this.minMembersMatchingCriteria &&
			this.maxMembersMatchingCriteria
		) {
			isMinandMaxCriteriaMatched = true;
		} else if (
			this.memberMatchingCriteria === 'Percentage' &&
			this.minMembersMatchingCriteria > -1 &&
			this.minMembersMatchingCriteria <= 100 &&
			this.maxMembersMatchingCriteria > -1 &&
			this.maxMembersMatchingCriteria <= 100 &&
			this.minMembersMatchingCriteria &&
			this.maxMembersMatchingCriteria
		) {
			isMinandMaxCriteriaMatched = true;
		}
		const targetAudienceFilters = ['Gender Criteria', 'Age Criteria', 'Members Matching Criteria'];
		targetAudienceFilters.forEach(targetKey => {
			const selectedFilters =
				targetKey !== 'Members Matching Criteria'
					? this.initialFilters[targetKey].filter(value => value.isSelected === true)
					: this.initialFilters[targetKey].filter(value => value.name === this.memberMatchingCriteria);
			if (targetKey !== 'Members Matching Criteria') {
				this.isMemberCriteriaEnabled = this.isMemberCriteriaEnabled
					? this.isMemberCriteriaEnabled
					: selectedFilters.length > 0;
			}
		});
		targetAudienceFilters.forEach(targetKey => {
			const selectedFilters =
				targetKey !== 'Members Matching Criteria'
					? this.initialFilters[targetKey].filter(value => value.isSelected === true)
					: this.initialFilters[targetKey].filter(value => value.name === this.memberMatchingCriteria);
			const selectedKeyForBackend = this.selectedFilters[targetKey]?.keyForBackend;
			if (targetKey === 'Gender Criteria') {
				if (
					selectedFilters?.length > 0 &&
					(!this.maxMembersMatchingCriteria ||
						this.maxMembersMatchingCriteria === '' ||
						!this.minMembersMatchingCriteria ||
						this.minMembersMatchingCriteria === '')
				) {
					this.showAudienceMatchError = true;
				} else {
					this.showAudienceMatchError = false;
				}
			}
			if (
				this.maxMembersMatchingCriteria &&
				this.maxMembersMatchingCriteria !== '' &&
				this.minMembersMatchingCriteria &&
				this.minMembersMatchingCriteria !== ''
			) {
				this.showAudienceMatchError = false;
			}

			if (targetKey === 'Members Matching Criteria') {
				this.inputObjForBackend[selectedKeyForBackend] = '';
				this.selectedFilters[targetKey].value = [];
			} else {
				this.inputObjForBackend[selectedKeyForBackend] = [];
				this.selectedFilters[targetKey].value = [];
			}
			if (isMinandMaxCriteriaMatched && this.isMemberCriteriaEnabled) {
				selectedFilters.forEach(selectedFilter => {
					this.selectedFilters[targetKey].value.push(selectedFilter.name);
					if (!this.inputObjForBackend[selectedKeyForBackend]) {
						Object.assign(this.inputObjForBackend, {
							[selectedKeyForBackend]:
								targetKey === 'Members Matching Criteria' ? selectedFilter.name : [selectedFilter.name]
						});
					} else {
						if (targetKey === 'Members Matching Criteria') {
							delete this.inputObjForBackend[selectedKeyForBackend];
							this.inputObjForBackend[selectedKeyForBackend] = selectedFilter.name;
						} else {
							this.inputObjForBackend[selectedKeyForBackend].push(selectedFilter.name);
						}
					}
				});
			}
			if (this.inputObjForBackend[selectedKeyForBackend]?.length === 0) {
				delete this.inputObjForBackend[selectedKeyForBackend];
			}
		});
		if (isMinandMaxCriteriaMatched && this.isMemberCriteriaEnabled) {
			this.inputObjForBackend['memberMatchingRange'] =
				this.minMembersMatchingCriteria + '-' + this.maxMembersMatchingCriteria;
			isInputChanged = true;
		} else if (this.inputObjForBackend['memberMatchingRange']) {
			delete this.inputObjForBackend['memberMatchingRange'];
			isInputChanged = true;
		}

		if (!this.isMemberCriteriaEnabled) {
			this.memberMatchingCriteria = null;
			this.minMembersMatchingCriteria = null;
			this.maxMembersMatchingCriteria = null;
		}

		if (isFromFilter && isInputChanged) {
			await this.getDiscoverCommunities();
		}
	}

	sortOptionsForBackend(event) {
		switch (event) {
			case 'Member count':
				this.sortByOptionForBackend = 'memberCount';
				break;
			case 'Campaign Engagement':
				this.sortByOptionForBackend = 'campaignPostEngagementRateLastNinetyDays';
				break;
			case 'Post Engagement':
				this.sortByOptionForBackend = 'postsEngagementRateLastNinetyDays';
				break;
			case 'Category density':
				this.sortByOptionForBackend = 'categoryDensity';
				break;
			case 'Query Conversation Count':
				this.sortByOptionForBackend = 'queryConversationCount';
				break;
			case 'Category Conversation Count':
				this.sortByOptionForBackend = 'categoryConversationCount';
				break;
			case 'Campaign Count':
				this.sortByOptionForBackend = 'campaign_count';
				break;
		}
	}

	sortColumn(sortBy) {
		this.isSortValueToBeChanged = true;
		this.sortOptionsForBackend(sortBy);
		if (this.sortBy === sortBy) {
			this.inputObjForBackend['descendingOrder']
				? (this.inputObjForBackend['descendingOrder'] = false)
				: (this.inputObjForBackend['descendingOrder'] = true);
		} else {
			this.inputObjForBackend['descendingOrder'] = true;
		}
		this.updateCommunityFilters('sortBy');
		this.overrideSort = true;
		this.sortBy = sortBy;
		this.isSortValueToBeChanged = false;
	}

	onFilterSearchChange(searchValue) {
		this.updatedFilterSearchValue.next(searchValue.value);
	}

	subscribeToSearchTextChanges() {
		const debouncedSearchText = this.updatedFilterSearchValue.pipe(debounceTime(1000));
		this.subscriptionsToDestroy.push(
			debouncedSearchText.subscribe(searchValue => {
				this.searchTextForFilter = searchValue;
			})
		);
	}

	defaultComparator(): any {
		return 0;
	}

	enterSearch(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			this.updateCommunityFilters('searchTerm');
		}
	}

	removeAllFilters() {
		Object.keys(this.selectedFilters).forEach(key => {
			this.selectedFilters[key].value = [];
		});
		this.inputObjForBackend = {};
		this.inputObjForBackend['sortBy'] = this.sortByOptionForBackend;
		this.searchTerm = '';
		this.searchQuery = '';
		this.itemsInAndList = [[]];
		this.doesNotContainList = [];
		this.followersCountMax = this.filtersFromApi.maxMemberCount;
		this.activityMax = this.filtersFromApi.maxPostsEngagementRateLastNinetyDays;
		this.followersCountMin = 0;
		this.engagementMin = 0;
		this.activityMin = 0;
		this.selectedCategories = [];
		this.groupQualification = 'FrequentlyMonetized';
		this.searchTextForFilter = '';
		this.totalFiltersAdded = 0;
		this.maxRating = 5;
		this.minRating = 0;
		this.minCampaigns = 0;
		this.maxCampaigns = 11;
		this.ngSearchInput.forEach(child => {
			child.nativeElement.value = '';
		});

		const targetAudienceFilters = ['Gender Criteria', 'Age Criteria', 'Members Matching Criteria'];
		targetAudienceFilters.forEach(targetKey => {
			this.initialFilters[targetKey].forEach(filter => {
				filter.isSelected = false;
			});
		});
		this.minMembersMatchingCriteria = null;
		this.maxMembersMatchingCriteria = null;
		this.memberMatchingCriteria = '';

		this.applyAllFilters();
	}

	openMoreFiltersDialog(filter) {
		this.showMoreFilters = true;
		this.showMoreFilterValue = filter;
	}

	get totalMembersInSelectedCommunities() {
		let memberCount = 0;
		this.selectedGroups.forEach(community => {
			memberCount += community.memberCount;
		});
		return memberCount;
	}

	get totalPEInSelectedCommunities() {
		let postEngagement = 0;
		this.selectedGroups.forEach(community => {
			postEngagement += community.postsEngagementRateLastNinetyDays;
		});
		return postEngagement;
	}

	get fillRate() {
		let num =
			this.monetizableGroupsHavingCampaignTaskToPerformThisMonth +
			this.nonMonetizableGroupsHavingCampaignTaskToPerformThisMonth;
		let den = this.totalMonetizableGroups + this.nonMonetizableGroupsHavingCampaignTaskToPerformThisMonth;
		let fillRate;
		this.selectedGroups?.forEach(community => {
			if (!community.isAnyCampaignTaskToBePerformedThisMonth) {
				num += 1;
				if (!community.isMonetizable) {
					den += 1;
				}
			}
		});
		fillRate = num / den;
		return fillRate;
	}

	onRangeChanged(range) {
		let selectedGroups = [];
		range.forEach(row => {
			if (row.cell.classList.value.includes('fbGroupLink') || row.cell.classList.value.includes('campaignCount')) {
				return;
			}
			const groupId = row.rowId;
			const selectedGroup = this.communities.find(group => group.groupId === groupId);
			if (range.length > 1) {
				selectedGroups = selectedGroups.concat(selectedGroup);
			} else if (range.length === 1) {
				if (this.selectedGroups.includes(selectedGroup)) {
					this.selectedGroups = this.selectedGroups.filter(group => group.groupId !== groupId);
				} else {
					selectedGroups = selectedGroups.concat(selectedGroup);
				}
			}
		});
		const event = [...this.selectedGroups];
		selectedGroups.forEach(group => {
			event.unshift(group);
		});
		this.selectedGroups = event;
		this.selectedGroups = _.uniqBy(this.selectedGroups, 'groupId');
		this.isGroupSelected = [];
		this.selectedMonetizedGroups = [];
		this.selectedMonetizableGroups = [];
		this.selectedNonMonetizableGroups = [];
		this.selectedGroups.forEach(group => {
			this.isGroupSelected.push(group.groupId);
			if (group.isMonetized) {
				this.selectedMonetizedGroups.push(group);
			} else if (group.isMonetizable) {
				this.selectedMonetizableGroups.push(group);
			} else {
				this.selectedNonMonetizableGroups.push(group);
			}
		});

		this.setAverageCalculations();
	}

	async getCategories() {
		this.listKeywords.next(await this.createCampaignService.listKeywords());
		this.listKeywords.subscribe(keywords => {
			if (!keywords) {
				return;
			}
			this.keywords = keywords;
			this.categories = _.uniq(keywords.map(keyword => keyword.category));
			if (this.user.csAdminTeam !== 'Brand Partnership' && this.user.csAdminTeam !== 'Community Partnership') {
				this.initialFilters.Category = this.categories;
			}
		});
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async toggleCMCTrained() {
		this.isCMCTrained = !this.isCMCTrained;
		console.log(`CMC Trained ${this.isCMCTrained}`);
		await this.getDiscoverCommunities();
	}

	async togglePerformanceTrained() {
		this.isPerformanceTrained = !this.isPerformanceTrained;
		console.log(`Performance Trained ${this.isPerformanceTrained}`);

		await this.getDiscoverCommunities();
	}

	async toggleGroupProfileRequired() {
		this.groupProfileRequired = !this.groupProfileRequired;
		console.log(`groupProfileRequired  ${this.groupProfileRequired}`);
		await this.getDiscoverCommunities();
	}

	async updateMinRating() {
		console.log(`Min Rating: ${this.minRating}`);
		await this.getDiscoverCommunities();
	}

	async updateMaxRating() {
		console.log(`Max Rating: ${this.maxRating}`);
		await this.getDiscoverCommunities();
	}

	addFilter(event: MatChipInputEvent, i): void {
		const value = (event.value || '').trim();

		if (value) {
			if (value.indexOf(' ') > -1) {
				let newValue = '\\"' + value + '\\"';
				this.itemsInAndList[i].push(newValue);
			} else {
				this.itemsInAndList[i].push(value);
			}
		}

		event.chipInput!.clear();
	}

	removeFilter(filter, i): void {
		const index = this.itemsInAndList[i].indexOf(filter);

		if (index >= 0) {
			this.itemsInAndList[i].splice(index, 1);
		}
	}
	addDoesNotContainFilter(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();
		if (value) {
			this.doesNotContainList.push(value);
		}
		event.chipInput!.clear();
	}

	removeDoesNotContainFilter(filter): void {
		const index = this.doesNotContainList.indexOf(filter);

		if (index >= 0) {
			this.doesNotContainList.splice(index, 1);
		}
	}

	addNewAndList() {
		this.itemsInAndList.push([]);
	}

	removeFromAndList(i) {
		this.itemsInAndList.splice(i, 1);
	}

	get searchQueryString() {
		let searchString = '';
		this.itemsInAndList.forEach((itemsWithAnd, index) => {
			if (itemsWithAnd?.length !== 0) {
				if (searchString === '') {
					searchString =
						itemsWithAnd?.length === 1
							? searchString + itemsWithAnd.join(' OR ')
							: searchString + '(' + itemsWithAnd.join(' OR ') + ')';
				} else {
					searchString =
						itemsWithAnd?.length === 1
							? searchString + ' AND ' + itemsWithAnd.join(' OR ')
							: searchString + ' AND (' + itemsWithAnd.join(' OR ') + ')';
				}
			}
		});
		if (this.doesNotContainList?.length > 0) {
			searchString =
				this.doesNotContainList?.length === 1
					? searchString + ' NOT ' + this.doesNotContainList.join(' OR ')
					: searchString + ' NOT (' + this.doesNotContainList.join(' OR ') + ' )';
		}
		return searchString;
	}

	openCampaignListDialog(campaignList, communityName) {
		this.campaignList = JSON.parse(campaignList);
		this.selectedCommunityName = communityName;
	}
}
