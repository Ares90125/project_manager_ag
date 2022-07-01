import {ConditionalExpr, ThrowStmt} from '@angular/compiler';
import {
	Component,
	EventEmitter,
	Injector,
	Input,
	OnInit,
	Output,
	OnDestroy,
	AfterViewInit,
	ViewChildren,
	QueryList
} from '@angular/core';
import {GroupProfilePageModel} from '@groupAdminModule/campaigns/_models/group-profile-page.model';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FileSizeEnum} from '@sharedModule/enums/file-size.enum';
import {FacebookInsightsDetails, FacebookInsightsFileStatus} from '@sharedModule/models/graph-ql.model';
import {ColumnChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ReportDataOutputModel} from '@sharedModule/models/group-reports/report-data.model';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {BackendService} from '@sharedModule/services/backend.service';
import {FileService} from '@sharedModule/services/file.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import _ from 'lodash';
import {AnimationOptions} from 'ngx-lottie';
import {takeUntil} from 'rxjs/operators';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
	selector: 'app-group-profile-audience',
	templateUrl: './group-profile-audience.component.html',
	styleUrls: ['./group-profile-audience.component.scss']
})
export class GroupProfileAudienceComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() resetHook: EventEmitter<boolean>;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Output() saveFilesSection = new EventEmitter();
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

	isSaveInProgress: boolean = false;
	insightsExcelsFolderRoot = 'insightsExcels/';
	fileName: string = '';
	insightFile: any;
	fileExist: boolean = false;
	fileUploading: boolean = false;
	fileProcessing: boolean = false;
	fileStatus: string = '';
	sheetUid: string = '';
	fileKey: string = '';
	uploadCancelled: boolean = false;
	processedFileDetails: object = {};
	facebookInsightsDetails: FacebookInsightsDetails = new FacebookInsightsDetails();
	videoLink: string;
	showVideo = false;
	showAudienceInsights = false;
	showAgeAndGender = false;
	showTopCountries = false;
	showTopCities = false;
	groupInsights;
	reportData: ReportDataOutputModel = new ReportDataOutputModel();
	isEmpty;
	isReportLoaded = false;
	chartLegends = {male: 0, female: 0, others: 0};
	isMoreCountries = false;
	isMoreCities = false;
	showContactMeForm = false;
	isPreviewPage = false;
	isInsightsAlreadyLoaded = false;
	groupInsightsForCountries = [];
	groupInsightForCities = [];
	groupInsightsForAge = [];
	contactMeSuccess = false;
	successAnimationOption: AnimationOptions = {
		path: './assets/json/success-animation.json'
	};
	isSaveEnabled = false;
	isGroupInsightsLoading = false;
	isExpanded: boolean = false;
	showAudienceInsightPopup: boolean = false;
	showNoFilledBorder: boolean = false;
	showAudienceInsightsVideo: boolean = false;
	firstDataFromInsightsAPI: boolean = false;

	constructor(
		injector: Injector,
		private groupsService: GroupsService,
		private readonly appSync: AmplifyAppSyncService,
		readonly fileService: FileService,
		public readonly groupProfilePageService: GroupProfilePagesService,
		public readonly backendService: BackendService
	) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.groupProfilePageService.openAudienceInsightPopup$.subscribe(openAudienceModal => {
				if (openAudienceModal) this.showAudienceInsightPopup = true;
			})
		);
		this.getGroupInsights();
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => (this.isSaveInProgress = false));
	}

	async getGroupInsights() {
		this.isGroupInsightsLoading = true;
		if (!this.isEditable) {
			this.calculateGroupInsightsAtNonEditableLevel();
			this.getHighChartsModel({groupsAgeGenderInsights: this.groupProfilePage?.ageMetrics});
			this.isGroupInsightsLoading = false;
			return;
		}
		const url = window.location.href;
		if (url.indexOf('/preview') > -1) {
			this.isPreviewPage = true;
		}

		const groupInsights = await this.groupProfilePageService.getGroupInsights(this.groupProfilePage.groupId);
		this.calculateGroupInsightsForCountriesAndCities(groupInsights);
		this.getHighChartsModel(groupInsights);
		const groupDetails = await this.groupsService.getGroupDetails(this.groupProfilePage.groupId);
		this.insightFile = groupDetails?.facebookInsightsFileDetails;
		this.isGroupInsightsLoading = false;
		return;
	}

	calculateGroupInsightsAtNonEditableLevel() {
		this.groupInsightsForCountries = [];
		let groupInsightsForCountries = [];
		this.groupProfilePage.topCountries?.forEach(country => {
			groupInsightsForCountries.push({countryName: country.name, country: country.value});
		});
		groupInsightsForCountries = groupInsightsForCountries.filter(country => country.countryName && country.country);
		this.groupInsightsForCountries = groupInsightsForCountries;
		this.isMoreCountries = this.groupInsightsForCountries?.length >= 10;
		this.groupInsightForCities = [];
		this.groupProfilePage.topCities = this.groupProfilePage.topCities?.filter(city => city.name && city.value);
		this.groupProfilePage.topCities?.forEach(city => {
			this.groupInsightForCities.push({cityName: city.name, city: city.value});
		});
		this.groupInsightForCities = this.groupInsightForCities.filter(city => city.cityName && city.city);
		this.isMoreCities = this.groupInsightForCities?.length >= 10;
		this.groupProfilePage.topCities?.forEach((city, ind) => {
			const selectedGroupInsight = groupInsightsForCountries.findIndex((insight, index) => index === ind);
			if (selectedGroupInsight > -1) {
				groupInsightsForCountries[selectedGroupInsight]['city'] = city.value;
				groupInsightsForCountries[selectedGroupInsight]['cityName'] = city.name;
			} else {
				groupInsightsForCountries.push({
					city: city.value,
					cityName: city.name
				});
			}
		});
		this.groupInsights = groupInsightsForCountries;
	}

	calculateGroupInsightsForCountriesAndCities(groupInsights) {
		if (!groupInsights?.groupsCityCountryInsights) {
			return;
		}
		this.groupInsights = [];
		const groupInsightByCountry = _.chain(groupInsights?.groupsCityCountryInsights).groupBy('topCountries').value();
		let groupInsightsForCountries = [];
		for (let country of Object.keys(groupInsightByCountry)) {
			groupInsightByCountry[country]['members'] = groupInsightByCountry[country].reduce(
				(sum, groupCity) => sum + groupCity.members,
				0
			);
			groupInsightsForCountries.push({
				country: groupInsightByCountry[country]['members'],
				countryName: country
			});
		}
		groupInsightsForCountries = _.orderBy(groupInsightsForCountries, ['country'], ['desc']);
		groupInsightsForCountries = groupInsightsForCountries?.filter(country => country.country && country.countryName);
		this.groupInsightsForCountries = [];
		groupInsightsForCountries.forEach(country => {
			this.groupInsightsForCountries.push({name: country.countryName, value: country.country});
		});
		this.isMoreCountries = this.groupInsightsForCountries?.length > 10;
		const groupInsightByCities = _.chain(groupInsights?.groupsCityCountryInsights).groupBy('topCities').value();
		const groupInsightKeys = Object.keys(groupInsightByCities);
		let groupInsightForCities = [];
		for (let i = 0; i < groupInsightKeys.length; i++) {
			groupInsightByCities[groupInsightKeys[i]]['members'] = groupInsightByCities[groupInsightKeys[i]].reduce(
				(sum, groupCity) => sum + groupCity.members,
				0
			);
			groupInsightForCities.push({
				city: groupInsightByCities[groupInsightKeys[i]]['members'],
				cityName: groupInsightKeys[i]
			});
		}
		groupInsightForCities = _.orderBy(groupInsightForCities, ['city'], ['desc']);
		groupInsightForCities = groupInsightForCities?.filter(city => city.city && city.cityName);
		this.groupInsightForCities = [];
		groupInsightForCities.forEach(city => {
			this.groupInsightForCities.push({name: city.cityName, value: city.city});
		});
		this.isMoreCities = this.groupInsightForCities?.length > 10;
		groupInsightForCities.forEach((city, ind) => {
			const selectedGroupInsight = groupInsightsForCountries.findIndex((insight, index) => index === ind);
			if (selectedGroupInsight > -1) {
				groupInsightsForCountries[selectedGroupInsight]['city'] = city.city;
				groupInsightsForCountries[selectedGroupInsight]['cityName'] = city.cityName;
			} else {
				groupInsightsForCountries.push({
					city: city.city,
					cityName: city.cityName
				});
			}
		});
		this.groupInsights = groupInsightsForCountries;
	}

	getHighChartsModel(groupInsights) {
		this.reportData.chartOptions = new ColumnChartModel().chartOptions;
		const categories = [];
		const editGenderVariant = {
			male: 'men',
			female: 'women',
			others: 'customgender'
		};
		const series = [
			{
				name: 'male',
				stack: 'Male',
				color: '#0B74EC',
				data: []
			},
			{
				name: 'female',
				stack: 'Female',
				color: '#14BAA9',
				data: []
			},
			{
				name: 'others',
				stack: 'Others',
				color: '#A041C8',
				data: []
			}
		];
		this.groupInsightsForAge = groupInsights?.groupsAgeGenderInsights;

		this.reportData.chartOptions.plotOptions.column.dataLabels.enabled = false;
		const male = groupInsights?.groupsAgeGenderInsights?.reduce(
			(sum, groupInsight) =>
				Number(this.isEditable ? groupInsight.men : groupInsight.male ? groupInsight.male : 0) + sum,
			0
		);
		const female = groupInsights?.groupsAgeGenderInsights?.reduce(
			(sum, groupInsight) =>
				Number(this.isEditable ? groupInsight.women : groupInsight.female ? groupInsight.female : 0) + sum,
			0
		);
		const others = groupInsights?.groupsAgeGenderInsights?.reduce(
			(sum, groupInsight) =>
				Number(this.isEditable ? groupInsight.customgender : groupInsight.others ? groupInsight.others : 0) + sum,
			0
		);

		const total = male + female + others;

		if (groupInsights?.groupsAgeGenderInsights) {
			groupInsights?.groupsAgeGenderInsights?.forEach(groupInsight => {
				categories.push(groupInsight.ageRange);
				series.forEach(s => {
					if (this.isEditable) {
						return s.data.push(
							groupInsight[editGenderVariant[s.name]]
								? +Number((100 / total) * groupInsight[editGenderVariant[s.name]]).toFixed(1)
								: 0
						);
					}
					s.data.push(groupInsight[s.name] ? +Number((100 / total) * groupInsight[s.name]).toFixed(1) : 0);
				});
			});
		} else if (this.isEditable) {
			const groupInsights = [
				{ageRange: '13-17', men: 10, women: 5, customgender: 0},
				{ageRange: '18-24', men: 50, women: 20, customgender: 2},
				{ageRange: '25-34', men: 60, women: 15, customgender: 5},
				{ageRange: '35-44', men: 40, women: 30, customgender: 1},
				{ageRange: '45-54', men: 70, women: 40, customgender: 6},
				{ageRange: '55-64', men: 55, women: 20, customgender: 4},
				{ageRange: '65+', men: 30, women: 10, customgender: 7}
			];
			groupInsights.forEach(groupInsight => {
				categories.push(groupInsight.ageRange);
				series.forEach(s => {
					s.data.push(+Number((100 / total) * groupInsight[s.name]).toFixed(1));
				});
			});
		}

		this.reportData.chartOptions.xAxis.categories = categories;
		this.reportData.chartOptions.series = series;
		this.reportData.chartOptions.tooltip = {
			valueDecimals: 1,
			valueSuffix: '%'
		};
		this.reportData.chartOptions.yAxis = [
			{
				allowDecimals: false,
				title: {
					text: ''
				},
				min: 0,
				labels: {
					format: '{text}%'
				},
				opposite: true
			}
		];

		this.chartLegends.male = total !== 0 ? Number(((male * 100) / total).toFixed(2)) : 0;
		this.chartLegends.female = total !== 0 ? Number(((female * 100) / total).toFixed(2)) : 0;
		this.chartLegends.others = total !== 0 ? Number(((others * 100) / total).toFixed(2)) : 0;
		this.isReportLoaded = true;
	}

	closeEditAudience() {
		this.groupProfilePageService.setAudienceInsightsPopups(false);
	}

	seeMore() {
		if (!this.isEditable && !this.isPreviewPage) {
			this.disableScrolling();
			this.showContactMeForm = true;
		}
	}

	showContactSuccessForm(event) {
		this.contactMeSuccess = true;
		this.showContactMeForm = false;
	}

	closeContactForm() {
		this.enableScrolling();
		this.showContactMeForm = false;
		this.contactMeSuccess = false;
	}

	async getGroupInsightsByForce() {
		const groupInsight = await this.groupProfilePageService.getGroupInsights(this.groupProfilePage.groupId);

		if (!groupInsight.groupsCityCountryInsights && !groupInsight.groupsAgeGenderInsights) {
			return this.getGroupInsightsByForce();
		}
		if(!this.firstDataFromInsightsAPI) {
			this.firstDataFromInsightsAPI = true;
			setTimeout(()=>{
				return this.getGroupInsightsByForce();
			},1000)
		}
		await this.getGroupInsights();
		setTimeout(() => {
			return groupInsight;
		}, 100);
	}

	async updateFiles(closeButtonForAudienceFiles) {
		this.isSaveInProgress = true;
		this.groupProfilePageService.setAudienceInsightsPopups(false);
		const groupInsightsForAge = [];
		this.groupInsightsForAge?.forEach(groupInsight => {
			groupInsightsForAge.push({
				ageRange: groupInsight.ageRange,
				percentageMen: groupInsight.percentageMen,
				percentageWomen: groupInsight.percentageWomen,
				percentageCustomGender: groupInsight.percentageCustomGender,
				male: groupInsight.men,
				female: groupInsight.women,
				others: groupInsight.customgender
			});
		});
		this.groupProfilePage.isAudienceInsightsSectionChanged = true;
		this.groupProfilePage.showAudienceInsights = this.showAudienceInsights;
		this.groupProfilePage.showAgeAndGender = this.showAgeAndGender;
		this.groupProfilePage.showTopCities = this.showTopCities;
		this.groupProfilePage.showTopCountries = this.showTopCountries;
		this.groupProfilePage.topCountries = this.groupInsightsForCountries.slice(0, 10);
		this.groupProfilePage.topCities = this.groupInsightForCities.slice(0, 10);
		this.groupProfilePage.ageMetrics = groupInsightsForAge;
		this.groupProfilePage.audienceInsightsSheetUID = this.sheetUid;
		this.getGroupInsights();
		this.saveFilesSection.emit(null);
	}

	async setEditProfileAudience() {
		this.showAudienceInsights = this.groupProfilePage.showAudienceInsights;
		this.showAgeAndGender = this.groupProfilePage.showAgeAndGender;
		this.showTopCities = this.groupProfilePage.showTopCities;
		this.showTopCountries = this.groupProfilePage.showTopCountries;
		await this.setInsightFileDetails();
		this.isInsightsAlreadyLoaded = this.showAudienceInsights || this.insightFile;
		this.isSaveEnabled = false;
	}

	async setInsightFileDetails() {
		const groupDetails = await this.groupsService.getGroupDetails(this.groupProfilePage.groupId);
		this.insightFile = groupDetails?.facebookInsightsFileDetails;
		this.fileExist = true;
		this.fileName = this.insightFile?.fileName;
		this.fileStatus = this.insightFile?.fileStatus;
	}

	onChangeAudienceInsights(closeButtonForAudienceFiles) {
		this.showAudienceInsights = !this.showAudienceInsights;
		if (!this.showAudienceInsights || (this.fileStatus !== 'Valid' && this.showAudienceInsights)) {
			this.showAgeAndGender = false;
			this.showTopCountries = false;
			this.showTopCities = false;
			this.showAudienceInsights = false;
		} else if (this.fileStatus === 'Valid') {
			this.showAgeAndGender = true;
			this.showTopCities = true;
			this.showTopCountries = true;
		}
		this.isSaveEnabled = true;
		this.updateFiles(closeButtonForAudienceFiles);
	}

	onChangeSubInsights(closeButtonForAudienceFiles) {
		if (!this.showAgeAndGender && !this.showTopCities && !this.showTopCountries) {
			this.showAudienceInsights = false;
		} else {
			this.showAudienceInsights = true;
		}
		this.isSaveEnabled = true;
		this.updateFiles(closeButtonForAudienceFiles);
	}

	async fileChange(event: any) {
		if (event.target.files.length < 1) {
			return;
		}
		if (event.target.files[0].name.substring(event.target.files[0].name.lastIndexOf('.') + 1) !== 'xlsx') {
			this.alert.error('Invalid File Format', 'Upload insights data in a .xlsx file format.');
			return;
		}

		this.fileExist = true;
		this.fileUploading = true;
		this.fileStatus = '';
		this.insightFile = event.target.files[0];
		this.fileName = this.insightFile.name;
		const processedFileURLs = this.insightFile ? await this.uploadInsightsFileAndFetchURL(this.insightFile) : null;

		if (!processedFileURLs || this.uploadCancelled) {
			if (!this.uploadCancelled) {
				this.alert.error('File could not be uploaded', '');
			}
			this.uploadCancelled = false;
			return;
		}
		this.alert.success('File upload successful', '');
		this.sheetUid = processedFileURLs.substring(processedFileURLs.lastIndexOf('/') + 1);
		this.fileKey = this.insightsExcelsFolderRoot + this.sheetUid;
		this.fileUploading = false;
		this.fileProcessing = true;
		const result = await this.triggerInsightsParsing();

		if (result) {
			const groupInsight = await this.getGroupInsightsByForce();
			this.fileProcessing = false;
			this.fileStatus = 'Valid';
		} else {
			this.fileProcessing = false;
			this.fileStatus = 'Invalid';
		}
		this.processedFileDetails['fileName'] = this.fileName;
		this.processedFileDetails['fileStatus'] = this.fileStatus;
		setTimeout(() => {
			this.frameInsightsDetails();
		}, 2000);
	}

	cancelUploading() {
		this.uploadCancelled = true;
		if (Object.keys(this.processedFileDetails).length) {
			this.fileExist = true;
			this.fileUploading = false;
			this.fileName = this.processedFileDetails['fileName'];
			this.fileStatus = this.processedFileDetails['fileStatus'];
		} else {
			this.fileExist = false;
			this.fileUploading = false;
			this.fileName = '';
			this.fileStatus = '';
		}
		this.insightFile = null;
	}

	async frameInsightsDetails() {
		this.facebookInsightsDetails.fileName = this.fileName;
		this.facebookInsightsDetails.sheetUID = this.sheetUid;
		if (this.fileStatus === 'Valid') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Valid;
			this.showAudienceInsights = true;
			this.showAgeAndGender = true;
			this.showTopCountries = true;
			this.showTopCities = true;
			if (this.processedFileDetails['fileName']) {
				await this.updateGroupOnInsights();
			}
			this.updateFiles(null);
			this.isSaveEnabled = true;
		} else if (this.fileStatus === 'Invalid') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Invalid;
		} else if (this.fileStatus === 'Expired') {
			this.facebookInsightsDetails.fileStatus = FacebookInsightsFileStatus.Expired;
		}
		this.facebookInsightsDetails.fileUploadedAtUTC = new Date().toISOString();
	}

	private async updateGroupOnInsights() {
		return await this.groupsService.updateFacebookInsightFileDetailsOnGroup(
			this.groupProfilePage.groupId,
			this.facebookInsightsDetails
		);
	}

	public async triggerInsightsParsing(): Promise<boolean> {
		try {
			const sheetNameWithoutExtension = this.sheetUid.substring(0, this.sheetUid.lastIndexOf('.'));
			await this.appSync.facebookInsightsParser(this.groupProfilePage.groupId, sheetNameWithoutExtension);
			return true;
		} catch (error) {
			return false;
		}
	}

	private async uploadInsightsFileAndFetchURL(file: any) {
		return await this.fileService.uploadToS3(file, 'excel', this.randomUuid());
	}

	getFileType(fileName: string): string {
		const tokens = fileName.split('.');
		return tokens[tokens.length - 1].toUpperCase();
	}

	async downloadFile(fileDetails, element) {
		this.recordButtonClick(element);
		fileDetails.isFileBeingDownloaded = true;
		const response = await this.backendService.httpGetBlob(fileDetails.fileURL);
		if (response) {
			await this.fileService.downloadBlob(response, fileDetails.fileName);
			fileDetails.isFileBeingDownloaded = false;
		} else {
			this.alert.error('Something went wrong', 'Please try again');
		}
	}

	playVideo() {
		this.videoLink = 'assets/videos/download-group-insights-from-facebook.mp4';
		this.showVideo = true;
	}

	openAudienceInsightsVideo() {
		this.showAudienceInsightsVideo = true;
	}

	closeVideoPlayer() {
		this.showAudienceInsightsVideo = false;
	}

	checkToShowNotFilledSection() {
		return (
			(!this.groupProfilePage.ageMetrics || this.groupProfilePage.ageMetrics?.length === 0) &&
			(!this.groupProfilePage.topCities || this.groupProfilePage.topCities?.length === 0) &&
			(!this.groupProfilePage.topCountries || this.groupProfilePage.topCountries?.length === 0)
		);
	}

	ngAfterViewInit() {
		this.pannels.forEach((x, index) => {
			if (
				this.checkToShowNotFilledSection() ||
				this.groupProfilePageService.checkIfAllSectionNeedToBeExpanded(this.groupProfilePage)
			) {
				this.isExpanded = true;
				x.hideToggle = true;
				x.expanded = true;
			}

			if (this.checkToShowNotFilledSection()) {
				this.showNoFilledBorder = true;
			}
			x.expandedChange.subscribe(data => {
				if (data) {
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			});
		});
	}
}
