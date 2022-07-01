import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {environment} from 'src/environments/environment';
import {KeywordTrackerService} from '@groupAdminModule/_services/keyword-tracker.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {ConversationActionEnum} from '@sharedModule/enums/conversation-action.enum';
import {ConversationReportModel} from '@sharedModule/models/conversation-reports/conversation-report.model';
import {ConversationModel} from '@sharedModule/models/conversation.model';
import {ColumnChartModel, PieChartModel} from '@sharedModule/models/group-reports/chart.model';
import {ConversationService} from '@sharedModule/services/conversation.service';
import {PushNotificationService} from '@sharedModule/services/push-notification.service';
import {KeywordTrackerReport, UpdateKeywordTrackerReportInput} from '@sharedModule/models/graph-ql.model';
import {OnPropertyChange} from '@sharedModule/decorator/property-changes.decorator';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {GroupsService} from '@sharedModule/services/groups.service';
import {MatRadioButton} from '@angular/material/radio';
import {MatCheckbox} from '@angular/material/checkbox';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {DateTime} from '@sharedModule/models/date-time';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GroupModel} from '@sharedModule/models/group.model';

declare var window: any;

@Component({
	selector: 'app-keyword-tracker',
	templateUrl: './keyword-tracker.component.html',
	styleUrls: ['./keyword-tracker.component.scss']
})
export class KeywordTrackerComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() user;
	@Input() @OnPropertyChange('onGroupChange') group: GroupModel;
	@Input() type: string;
	@ViewChild('appendKeywords')
	appendKeywords: MatRadioButton;
	@ViewChild('selectAllGroups')
	selectAllGroups: MatCheckbox;
	selectedGroups = {};
	initialGroupId;
	numOfGroupSelected;
	installedGroups;
	installedGroupsWithRoleAdmin;
	reports: ConversationReportModel[] | KeywordTrackerReport[];
	selectedReport: ConversationReportModel = null;
	isLoadingReports = true;
	isLoadingConversations;
	actionTakenFilter = [];
	contentTypes = [];
	limit = 1000;
	from = 0;
	conversations = {};
	conversationsChart: any;
	keywordForEditor = '';
	lineNumbersForEditor: any;
	currentMonthGraph;
	lastMonthGraph = null;
	lastTwoMonthsGraph = null;
	lastThreeMonthsGraph = null;
	reportType = 'currentMonth';
	lastActionTakenConversationId = '';
	conversationCountKeywords = new BehaviorSubject<any>(null);
	conversationFilters = [
		{
			name: 'Type',
			displayName: 'Type',
			isMultipleSelection: false,
			list: [
				{name: 'Posts', displayName: 'Posts', isSelected: false},
				{name: 'Comments', displayName: 'Comments', isSelected: false}
			]
		},
		{
			name: 'Actions Taken',
			displayName: 'Action',
			isMultipleSelection: true,
			list: [
				{name: 'ActionRequired', displayName: 'Action required', isSelected: true, isHide: false},
				{name: 'BlockedUser', displayName: 'Blocked user', isSelected: false, isHide: false},
				{name: 'CommentHidden', displayName: 'Comment hidden', isSelected: false, isHide: false},
				{name: 'CommentRemoved', displayName: 'Comment removed', isSelected: false, isHide: false},
				{name: 'MutedMember', displayName: 'Muted member', isSelected: false, isHide: false},
				{name: 'RemovedMember', displayName: 'Removed member', isSelected: false, isHide: false},
				{name: 'RemovedPost', displayName: 'Removed post', isSelected: false, isHide: false},
				{name: 'Reported', displayName: 'Reported', isSelected: false, isHide: false},
				{name: 'TurnedOffCommenting', displayName: 'Turned off commenting', isSelected: false, isHide: false},
				{name: 'Ignored', displayName: 'Marked as read', isSelected: false, isHide: false}
			]
		}
	];
	isKeywordListEdited = false;
	showNavTabDetails = true;
	showUpgradeModal = false;
	@Output() showNavTabDetailsEvent: EventEmitter<any> = new EventEmitter();
	headerText;
	public conversationActionEnum: ConversationActionEnum;
	conversationsInlast2Days = {};
	conversationsInLast14Days = {};
	totalConversationsIn2DaysForReport = {};
	reportNameForm: FormGroup;

	constructor(
		injector: Injector,
		private readonly convService: ConversationService,
		private readonly keywordTrackerService: KeywordTrackerService,
		private pushNotificationService: PushNotificationService,
		private router: Router,
		private route: ActivatedRoute,
		private groupService: GroupsService,
		private readonly formBuilder: FormBuilder
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.selectedReport = this.keywordTrackerService.selectedReport;
		if (this.type === 'brand') {
			this.logPageTitle(`GA - ${this.group.name} - Brand Track Landing`, 'GA - Brand Track Landing', {
				brandId: this.group.id,
				brandName: this.group.name
			});
		} else {
			this.logPageTitle(`GA - ${this.group.name} - Keywords Alerts Landing`, 'GA - Keywords Alerts Landing', {
				group_id: this.group.id,
				group_name: this.group.name,
				group_fb_id: this.group.fbGroupId
			});
		}

		this.isLoadingReports = true;
		this.group.loadReports(this.keywordTrackerService);
		this.subscribeToGroupReports();
		this.subscriptionsToDestroy.concat([
			this.groupService.groups.subscribe(async groups => {
				if (groups === null) {
					return;
				}
				this.installedGroups = groups.filter(group => group.state === GroupStateEnum.Installed);
				this.installedGroupsWithRoleAdmin = this.installedGroups?.filter(group => group.role !== 'Moderator');
				this.initialGroupId = this.group.id;
				this.selectedGroups[this.group.id] = this.group;
				this.numOfGroupSelected = 1;
			}),
			this.route.params.subscribe(params => {
				if (params['report'] && this.keywordTrackerService.selectedReport) {
					this.selectedReport = this.keywordTrackerService.selectedReport;
					this.navigateAsPerHash('report', this.reports);
				} else {
					this.selectedReport = null;
					this.keywordTrackerService.selectedReport = null;
					this.navigatedToUrgentAlerts('urgentAlerts');
				}
			})
		]);

		this.reports?.forEach(report => {
			this.totalConversationsIn2DaysForReport[report.displayName] =
				this.convService.totalConversationsIn2DaysForReport[report.displayName];

			if (!this.convService.conversations[report.displayName]) {
				this.fetchAllConversations(report);
			}
			if (this.convService.conversations[report.displayName]) {
				this.conversations[report.displayName] = this.convService.conversations[report.displayName];
				this.conversationsInlast2Days[report.displayName] =
					this.convService.conversationsInlast2Days[report.displayName];
				this.conversationsInLast14Days[report.displayName] =
					this.convService.conversationsInLast14Days[report.displayName];
			}
		});

		this.isLoadingReports = false;
	}

	async fetchAllConversations(report) {
		await this.fetchConversations(report, 'fetchAll');
	}

	subscribeToGroupReports() {
		this.subscriptionsToDestroy.push(
			this.group.reports.subscribe(reports => {
				this.reports = reports;
				if (!reports || reports?.length === 0) {
					return;
				}
				reports.forEach(report => {
					if (report.numOfActionRequired >= 0) {
						return;
					}

					const error = new Error('Report action required count is negative');
					this.logger.error(
						error,
						error.message,
						{reportId: report.id, numOfActionRequired: report.numOfActionRequired},
						'KeywordTrackerComponent',
						'subscribeToGroupReports'
					);
					report.numOfActionRequired = 0;
				});
			})
		);
	}

	async onGroupChange(group) {
		if (this.type === 'group') {
			this.logPageTitle(`GA - ${this.group.name} - Urgent Alerts Landing`, 'GA - Urgent Alerts Landing', {
				group_id: this.group.id,
				group_name: this.group.name,
				group_fb_id: this.group.fbGroupId
			});
		}
		this.reports = null;
		this.isLoadingReports = true;
		this.group.reports.next(null);
		if (this.selectAllGroups) {
			this.selectAllGroups.checked = false;
		}
		await this.group.loadReports(this.keywordTrackerService);
		this.subscribeToGroupReports();
		this.isLoadingReports = false;
		this.initialGroupId = this.group.id;
		this.selectedGroups = {};
		this.selectedGroups[this.group.id] = this.group;
		this.numOfGroupSelected = 1;
		this.conversations = {};
		this.totalConversationsIn2DaysForReport = {};
		this.convService.totalConversationsIn2DaysForReport = {};
		this.convService.conversations = {};
		this.reports?.forEach(report => {
			this.fetchAllConversations(report);
		});
		this.goBack();
	}

	getTimeZoneTime(date): string {
		return new DateTime().parseUTCString(date).format();
	}

	async navigateToReportDetails(report: ConversationReportModel) {
		const displayName = report.displayName.replace('/', '%2F');
		this.router.navigateByUrl(`/group-admin/group/${this.group.id}/urgentAlerts/${displayName}`);
		this.selectedReport = report;
		this.keywordTrackerService.selectedReport = report;
		if (report && report.displayName.toLowerCase().indexOf('competitor keywords') > -1) {
			this.showUpgradeModal = true;
		} else {
			if (this.type === 'brand') {
				this.loadColumnChart(report);
			}
			this.setPageAndLog(report);
			this.selectedReport.keywordList = this.selectedReport.keywords.split('|');
			await this.fetchConversations(report, 'navigate');
			this.showNavTabDetails = false;
			this.showNavTabDetailsEvent.emit(this.showNavTabDetails);
			if (this.type === 'group') {
				this.pushNotificationService.showNotificationPrompt('DailyPushNotificationForUrgentAlerts');
			}
			if (this.type === 'group') {
				this.refreshPieChart();
			}
		}
	}

	setPageAndLog(report) {
		if (report.displayName) {
			if (this.type === 'brand') {
				this.logPageTitle(`GA - ${this.group.name} - Brand Track - ${report.displayName}-Details`, 'GA - Brand Track', {
					brandId: this.group.id,
					brandName: this.group.name
				});
			} else {
				this.logPageTitle(
					`GA - ${this.group.name} - Keywords Alerts - ${report.displayName}-Details`,
					'GA - Keywords Alerts',
					{
						group_id: this.group.id,
						group_name: this.group.name,
						group_fb_id: this.group.fbGroupId
					}
				);
			}
		}
	}

	logPageTitle(title, name, data) {
		super.setPageTitle(title, name, data);
	}

	async navigateAsPerHash(hash, reports) {
		if (this.type === 'brand') {
			return;
		}

		reports = !reports ? this.group.reports.getValue() : reports;
		const report = await reports.filter(rep => {
			if (hash.includes(rep.name)) {
				return rep;
			}
		});
		if (report.length > 0) {
			this.selectedReport = report[0];
			this.navigateToReportDetails(hash);
		}
	}

	navigatedToUrgentAlerts(hash) {
		if (hash === 'urgentAlerts') {
			this.router.navigateByUrl(`/group-admin/group/${this.group.id}/urgentAlerts`);
		}
	}

	async loadColumnChart(report) {
		const dateTimeHelper = new DateTimeHelper(this.user.timezoneName);
		let metrics = await this.keywordTrackerService.getKeywordTrackerMetric(
			report.id,
			dateTimeHelper.currentMonthStart,
			dateTimeHelper.now
		);
		this.loadCurrentMonthGraph(metrics, dateTimeHelper.currentMonthStart, dateTimeHelper.now);

		metrics = await this.keywordTrackerService.getKeywordTrackerMetric(
			report.id,
			dateTimeHelper.lastMonthStart,
			dateTimeHelper.lastMonthEnd
		);
		this.loadMonthlyData(metrics, 1, dateTimeHelper.lastMonthStart, dateTimeHelper.lastMonthEnd);

		metrics = await this.keywordTrackerService.getKeywordTrackerMetric(
			report.id,
			dateTimeHelper.secondLastMonthStart,
			dateTimeHelper.lastMonthEnd
		);
		this.loadMonthlyData(metrics, 2, dateTimeHelper.secondLastMonthStart, dateTimeHelper.lastMonthEnd);

		metrics = await this.keywordTrackerService.getKeywordTrackerMetric(
			report.id,
			dateTimeHelper.thirdLastMonthStart,
			dateTimeHelper.lastMonthEnd
		);
		this.loadMonthlyData(metrics, 3, dateTimeHelper.thirdLastMonthStart, dateTimeHelper.lastMonthEnd);
	}

	async loadCurrentMonthGraph(metrics, startDate: DateTime, endDate: DateTime) {
		const currentMonth = new ColumnChartModel();
		currentMonth.chartOptions.series = [];
		const series = {name: 'Conversation Volume', data: [], color: '#08B99C', stack: 'Conversation Volume'};

		const currentMetrics = _.chain(metrics).groupBy('metricForHourUTCDay').value();

		let total = 0;
		const days = endDate.diff(startDate.dayJsObj, 'days');
		const dataPoints = [];
		const startMonthName = startDate.format('MMM');
		for (let i = 0; i < days; i++) {
			dataPoints.push({x: i + 1 + ' ' + startMonthName, y: 0});
		}

		_.each(currentMetrics, (metric, index) => {
			const xAxis = index + ' ' + new DateTime().month(metric[0].metricForHourUTCMonth - 1).format('MMM');

			let sumOfOccurrances = 0;
			_.forEach(metric, met => (sumOfOccurrances += met.numOfOccurances ? met.numOfOccurances : 0));
			total += sumOfOccurrances;
			dataPoints?.forEach(datapoint => {
				if (datapoint.x === xAxis) {
					datapoint.y = sumOfOccurrances;
				}
			});
		});

		dataPoints?.forEach(datapoint => {
			currentMonth.chartOptions.xAxis.categories.push(datapoint.x);
			series.data.push(datapoint.y);
		});

		currentMonth.chartOptions.series.push(series);
		currentMonth.chartOptions.yAxis.title.text = 'Conversation Volume';
		this.currentMonthGraph = {chartData: currentMonth, isEmpty: total === 0};
		window.Cypress && (window.brandTrackCurrentMonth = this.currentMonthGraph);
	}

	async loadMonthlyData(metrics, month: number, startDate: DateTime, endDate: DateTime) {
		const monthlyGraph = new ColumnChartModel();
		monthlyGraph.chartOptions.series = [];
		const series = {name: 'Conversation Volume', data: [], color: '#08B99C', stack: 'Conversation Volume'};
		const groupingClause = month === 1 ? 'numWeekOfMonth' : 'metricForHourUTCMonth';

		const monthlyMetrics = _.chain(metrics).groupBy(groupingClause).value();

		const days = endDate.diff(startDate.dayJsObj, 'day');
		const dataPoints = [];
		if (month === 1) {
			const weekNumberInMonth = Math.ceil(days / 7);
			for (let i = 0; i < weekNumberInMonth; i++) {
				dataPoints.push({x: this.getStartAndEndWeekLabels(i, days, startDate), y: 0});
			}
		} else {
			for (let i = 0; i < month; i++) {
				dataPoints.push({x: new DateTime(startDate.dayJsObj).add(i, 'M').format('MMM YYYY'), y: 0});
			}
		}

		let total = 0;
		_.each(monthlyMetrics, (metric, index) => {
			const xAxis =
				month === 1
					? this.getStartAndEndWeekLabels(Number(index) - 1, days, startDate)
					: new DateTime().parseUnix(metric[0].metricForHourUTCStartTick).format('MMM YYYY');

			let sumOfOccurrances = 0;
			_.forEach(metric, met => (sumOfOccurrances += met.numOfOccurances ? met.numOfOccurances : 0));
			total += sumOfOccurrances;
			dataPoints?.forEach(datapoint => {
				if (datapoint.x === xAxis) {
					datapoint.y = sumOfOccurrances;
				}
			});
		});

		dataPoints?.forEach(datapoint => {
			monthlyGraph.chartOptions.xAxis.categories.push(datapoint.x);
			series.data.push(datapoint.y);
		});

		monthlyGraph.chartOptions.yAxis.title.text = 'Conversation Volume';
		monthlyGraph.chartOptions.series.push(series);
		switch (month) {
			case 1:
				this.lastMonthGraph = {chartData: monthlyGraph, isEmpty: total === 0};
				//Needed for test automation. Please do not delete
				window.Cypress && (window.brandTrackLastMonth = this.lastMonthGraph);
				break;
			case 2:
				this.lastTwoMonthsGraph = {chartData: monthlyGraph, isEmpty: total === 0};
				//Needed for test automation. Please do not delete
				window.Cypress && (window.brandTrackTwoMonth = this.lastTwoMonthsGraph);
				break;
			case 3:
				this.lastThreeMonthsGraph = {chartData: monthlyGraph, isEmpty: total === 0};
				//Needed for test automation. Please do not delete
				window.Cypress && (window.brandTrackThreeMonth = this.lastThreeMonthsGraph);
				break;
		}
	}

	async saveReportName(form) {
		if (!form.valid) {
			this.reportNameForm.get('reportName').setErrors({incorrect: true});
			document.getElementById('editNameModalInput').focus();
			return;
		}
		const reportName = form.getRawValue().reportName;
		if (!reportName.trim()) {
			this.reportNameForm.get('reportName').setErrors({incorrect: true});
			document.getElementById('editNameModalInput').focus();
			return;
		}

		this.selectedReport.displayName = reportName;
		await this.keywordTrackerService.updateReport(this.reportInput(this.selectedReport));
		this.refreshConversations();
		($('#editNameModal') as any).modal('hide');
	}

	async showReportNameModal(element) {
		this.recordButtonClick(element);
		this.reportNameForm = this.formBuilder.group({
			reportName: [this.selectedReport.displayName, [Validators.required, Validators.pattern(`[a-zA-Z0-9-\/ ]*`)]]
		});
		this.recordDialogBoxShow('Rename report name');
		setTimeout(function () {
			document.getElementById('editNameModalInput').focus();
		}, 500);
	}

	async saveKeywords(element) {
		this.recordButtonClick(element);
		this.selectedReport.keywordList = this.keywordForEditor.split('\n');
		this.selectedReport.keywordList = this.selectedReport.keywordList.filter(el => !!el);
		this.selectedReport.keywordList = this.selectedReport.keywordList.map(el => el.trim());
		if (this.selectedReport.keywordList.length === 0) {
			return;
		}

		this.selectedReport.keywords = this.selectedReport.keywordList.join('|');

		await this.keywordTrackerService.updateReport(this.reportInput(this.selectedReport));

		this.refreshConversations();
	}

	async fetchConversations(report, type) {
		this.isLoadingConversations = true;
		this.lastActionTakenConversationId = '';
		const groupIdsFilter = this.type === 'group' ? [this.group.id] : this.getGroupIds();
		await this.convService.fetchConversationsForReport(
			report,
			type,
			this.actionTakenFilter,
			this.from,
			this.contentTypes,
			groupIdsFilter
		);
		this.conversationsInlast2Days[report.displayName] = this.convService.conversationsInlast2Days[report.displayName];
		this.conversationsInLast14Days[report.displayName] = this.convService.conversationsInLast14Days[report.displayName];
		this.totalConversationsIn2DaysForReport[report.displayName] =
			this.convService.totalConversationsIn2DaysForReport[report.displayName];

		if (this.selectedReport) {
			this.headerText = ``;
			this.container = '';
			super.highlightKeyword(this.selectedReport.keywords, 'ConversationsContainer');
		}
		this.isLoadingConversations = false;
		const numberKeywordsConversation = {reportDisplayName: this.totalConversationsIn2DaysForReport};
		this.conversationCountKeywords.next(numberKeywordsConversation);
		this.exposeCypressData();
	}

	async showKeywordEditor(element) {
		this.recordButtonClick(element);
		this.keywordForEditor = this.selectedReport.keywordList.join('\n');
		const keywordLength = this.selectedReport.keywordList.length;
		this.lineNumbersForEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = false;
	}

	increaseRowNumber(event) {
		if (event.keyCode === 13) {
			const keywordEditor = document.getElementById('KeywordEditor');
			const getNumberOfRows = keywordEditor.getAttribute('rows');
			keywordEditor.setAttribute('rows', (parseInt(getNumberOfRows) + 1).toString());
		}
	}

	async keywordListEdited() {
		const keywordLength = this.keywordForEditor.split('\n').length;
		this.lineNumbersForEditor = Array(keywordLength)
			.fill(0)
			.map((x, i) => i);
		this.isKeywordListEdited = true;
	}

	async updateActionTakeFilter(filters) {
		this.actionTakenFilter = [];
		this.contentTypes = [];
		const selectedItem = filters[0].list.filter(item => item.isSelected);
		if (selectedItem.length > 0 && selectedItem[0].name === 'Posts') {
			this.conversationFilters[1].list[8]['isHide'] = false;
			this.conversationFilters[1].list[7]['isHide'] = false;
			this.conversationFilters[1].list[6]['isHide'] = false;
			this.conversationFilters[1].list[1]['isHide'] = false;
			this.conversationFilters[1].list[2]['isHide'] = true;
			this.conversationFilters[1].list[3]['isHide'] = true;
		} else if (selectedItem.length > 0 && selectedItem[0].name === 'Comments') {
			this.conversationFilters[1].list[8]['isHide'] = true;
			this.conversationFilters[1].list[7]['isHide'] = true;
			this.conversationFilters[1].list[6]['isHide'] = true;
			this.conversationFilters[1].list[1]['isHide'] = true;
			this.conversationFilters[1].list[2]['isHide'] = false;
			this.conversationFilters[1].list[3]['isHide'] = false;
		}
		filters[1].list?.forEach(item => {
			if (item.isSelected && !item.isHide && item.name !== 'ActionRequired') {
				this.actionTakenFilter.push(item.displayName === 'Marked as read' ? 'Ignored' : item.displayName);
			}
		});

		if (selectedItem.length > 0 && selectedItem[0]) {
			if (selectedItem[0].name === 'Posts') {
				this.contentTypes.push('Post');
			} else if (selectedItem[0].name === 'Comments') {
				this.contentTypes.push('Comment');
			}
		}

		window.dispatchEvent(new CustomEvent('setFilters', {detail: this.conversationFilters}));
		await this.refreshConversations();
	}

	async goBack() {
		this.keywordTrackerService.selectedReport = null;
		this.selectedReport = null;
		this.from = 0;
		this.isLoadingConversations = false;
		this.actionTakenFilter = [];
		this.showNavTabDetails = true;
		this.showNavTabDetailsEvent.emit(this.showNavTabDetails);
		setTimeout(() => {
			$('.group-info-tabs #insights-tab').removeClass('active');
			$('.group-info-tabs #keywordTracking-tab').addClass('active');
		}, 10);
		if (this.type === 'group') {
			this.router.navigateByUrl(`group-admin/group/${this.group.id}/urgentAlerts`);
			this.logPageTitle(`GA - ${this.group.name} - Keywords Alerts Landing`, 'GA - Keywords Alerts Landing', {
				group_id: this.group.id,
				group_name: this.group.name,
				group_fb_id: this.group.fbGroupId
			});
		}
	}

	async refreshConversations() {
		this.conversations[this.selectedReport.displayName] = [];
		this.conversationsInlast2Days = {};
		this.conversationsInLast14Days = {};
		this.from = 0;
		this.isLoadingConversations = false;
		this.fetchConversations(this.selectedReport, 'refresh');
	}

	openPermaLink(conv) {
		window.open(ConversationModel.getPermaLink(conv), '_blank');
	}

	getConversationCountForFourteenDays(): number {
		return (this.conversationsInLast14Days[this.selectedReport?.displayName] as []).filter(
			(conversation: any) => !conversation.hide
		).length;
	}

	getConversationCountForTwoDays(): number {
		return (this.conversationsInlast2Days[this.selectedReport?.displayName] as []).filter(
			(conversation: any) => !conversation.hide
		).length;
	}

	trackByConvId(index: number, conv: any) {
		return conv.id;
	}

	async takeAction(conv: ConversationModel, actionToTake: string, reverse = false, element) {
		this.recordButtonClick(element, this.group);
		if (actionToTake !== ConversationActionEnum.Ignored) {
			this.openPermaLink(conv);
		}

		const actionTaken = conv.actionTaken;

		conv.actionTaken = reverse ? ConversationActionEnum.ActionRequired : (actionToTake as ConversationActionEnum);
		if (
			this.actionTakenFilter.length > 0 ||
			(this.actionTakenFilter.length === 0 && this.conversationFilters[1].list[0]['isSelected'])
		) {
			conv.hide = !this.actionTakenFilter.includes(conv.actionTaken);
		}

		let delta = 0;
		if (!actionTaken || actionTaken === ConversationActionEnum.ActionRequired) {
			delta = -1;
		} else if (conv.actionTaken === ConversationActionEnum.ActionRequired) {
			delta = 1;
		}
		this.selectedReport.numOfActionRequired += delta;

		if (this.selectedReport.numOfActionRequired < 0) {
			const error = new Error('Action required count is negative');

			this.logger.error(
				error,
				error.message,
				{
					reportId: this.selectedReport.id,
					conversationId: conv.id,
					previousAction: actionTaken,
					actionToTake: actionToTake,
					numOfActionRequired: this.selectedReport.numOfActionRequired
				},
				'KeywordTrackerComponent',
				'takeAction'
			);
			this.selectedReport.numOfActionRequired = 0;
		}

		switch (actionToTake) {
			case ConversationActionEnum.CommentHidden:
				this.selectedReport.numOfHiddenComments += -1 * delta;
				break;
			case ConversationActionEnum.CommentRemoved:
				this.selectedReport.numOfRemovedComments += -1 * delta;
				break;
			case ConversationActionEnum.Reported:
				this.selectedReport.numOfReported += -1 * delta;
				break;
			case ConversationActionEnum.TurnedOffCommenting:
				this.selectedReport.numOfTurnedOffCommenting += -1 * delta;
				break;
			case ConversationActionEnum.MutedMembers:
				this.selectedReport.numOfMutedMembers += -1 * delta;
				break;
			case ConversationActionEnum.RemovedMembers:
				this.selectedReport.numOfRemovedMembers += -1 * delta;
				break;
			case ConversationActionEnum.RemovedPost:
				this.selectedReport.numOfRemovedPost += -1 * delta;
				break;
			case ConversationActionEnum.BlockedUser:
				this.selectedReport.numOfBlockedUser += -1 * delta;
				break;
			case ConversationActionEnum.Ignored:
				this.selectedReport.numOfIgnored += -1 * delta;
				break;
			default:
				break;
		}

		try {
			await this.convService.initiateActionOnConversation(
				conv.actionTaken,
				conv.id,
				this.reportInput(this.selectedReport)
			);
		} catch (e) {
			const error = new Error('Updating conversation failed');

			this.logger.error(
				error,
				'Updating conversation failed',
				{conversationId: conv.id, conversationActionTaken: conv.actionTaken},
				'KeywordTrackerComponent',
				'takeAction'
			);
		}
		this.lastActionTakenConversationId = conv.id;
		if (this.type === 'group') {
			this.refreshPieChart();
		}
		if (this.type === 'group') {
			this.pushNotificationService.showNotificationPrompt('EventTriggeredPushNotificationForUrgentAlerts');
		}
	}

	toggleGroupSelection(group) {
		if (this.selectedGroups[group.id]) {
			if (group.id !== this.initialGroupId) {
				if (this.numOfGroupSelected !== 1) {
					delete this.selectedGroups[group.id];
					this.numOfGroupSelected -= 1;
				}
			}
		} else {
			this.selectedGroups[group.id] = group;
			this.numOfGroupSelected += 1;
		}
	}

	toggleAllGroupSelection() {
		this.selectedGroups = {};
		if (this.selectAllGroups.checked) {
			this.selectedGroups[this.initialGroupId] = this.installedGroupsWithRoleAdmin.filter(
				group => group.id === this.initialGroupId
			)[0];
			this.numOfGroupSelected = 1;
		} else {
			this.installedGroupsWithRoleAdmin?.forEach(group => {
				this.selectedGroups[group.id] = group;
			});
			this.numOfGroupSelected = this.installedGroupsWithRoleAdmin?.length;
		}
	}

	reportInput(report) {
		const input = new UpdateKeywordTrackerReportInput();
		input.ownerId = report.ownerId;
		input.name = report.name;
		input.keywords = report.keywords;
		input.displayName = report.displayName;
		input.numOfActionRequired = report.numOfActionRequired;
		input.numOfHiddenComments = report.numOfHiddenComments;
		input.numOfRemovedComments = report.numOfRemovedComments;
		input.numOfReported = report.numOfReported;
		input.numOfTurnedOffCommenting = report.numOfTurnedOffCommenting;
		input.numOfMutedMembers = report.numOfMutedMembers;
		input.numOfRemovedMembers = report.numOfRemovedMembers;
		input.numOfRemovedPost = report.numOfRemovedPost;
		input.numOfBlockedUser = report.numOfBlockedUser;
		input.numOfIgnored = report.numOfIgnored;
		input.numOfOccurances = report.numOfOccurances;
		input.id = report.id;
		input.reportLevel = report.reportLevel;
		return input;
	}

	async refreshPieChart() {
		this.conversationsChart = new PieChartModel();
		const data = [];
		data.push({
			name: ConversationActionEnum.ActionRequired,
			y: this.selectedReport.numOfActionRequired,
			color: '#1872A4'
		});
		data.push({name: ConversationActionEnum.BlockedUser, y: this.selectedReport.numOfBlockedUser, color: '#983A3B'});
		data.push({
			name: ConversationActionEnum.CommentHidden,
			y: this.selectedReport.numOfHiddenComments,
			color: '#2BC4CB'
		});
		data.push({
			name: ConversationActionEnum.CommentRemoved,
			y: this.selectedReport.numOfRemovedComments,
			color: '#2EAADF'
		});
		data.push({name: ConversationActionEnum.MutedMembers, y: this.selectedReport.numOfMutedMembers, color: '#00A388'});
		data.push({
			name: ConversationActionEnum.RemovedMembers,
			y: this.selectedReport.numOfRemovedMembers,
			color: '#36585E'
		});
		data.push({name: ConversationActionEnum.RemovedPost, y: this.selectedReport.numOfRemovedPost, color: '#5F818A'});
		data.push({name: ConversationActionEnum.Reported, y: this.selectedReport.numOfReported, color: '#FD9433'});
		data.push({
			name: ConversationActionEnum.TurnedOffCommenting,
			y: this.selectedReport.numOfTurnedOffCommenting,
			color: '#E4007C'
		});
		data.push({name: ConversationActionEnum.Ignored, y: this.selectedReport.numOfIgnored, color: '#CA5FA6'});
		this.conversationsChart.chartOptions.series[0].data = data;
		this.conversationsChart.chartOptions.plotOptions.pie.dataLabels.style = {
			color: 'contrast',
			fontSize: '15px',
			fontFamily: 'Roboto',
			fontWeight: 'normal',
			textOutline: 'none'
		};
		this.conversationsChart.chartOptions.plotOptions.pie.innerSize = 75;
		this.conversationsChart.chartOptions.plotOptions.pie.showInLegend = true;
		this.conversationsChart.chartOptions.legend = {
			align: 'right',
			verticalAlign: 'top',
			layout: 'vertical',
			x: 0,
			y: 20,
			itemMarginBottom: 5,
			itemMarginTop: 5
		};

		this.conversationsChart.chartOptions.legend.enabled = false;
	}

	async updateKeywordTrackerReportForSelectedGroups() {
		let groupIds = [];
		for (const id in this.selectedGroups) {
			groupIds.push(id);
		}
		try {
			await this.keywordTrackerService.updateReportForSelectedGroups(
				groupIds,
				this.selectedReport.keywords,
				this.selectedReport.displayName,
				this.appendKeywords.checked
			);
			const groupsLength = groupIds.length - 1;
			this.alert.success(
				'Keywords have successfully been updated for ' + groupsLength + ' group(s)',
				'Keywords updated successfully',
				5000,
				true
			);
		} catch (e) {
			this.alert.error('Some error occurred while updating keywords', 'Keywords updation failed', 5000, true);
		}
	}

	isEmpty(obj) {
		return Object.keys(obj).some(function (key) {
			return obj[key] == undefined || obj[key] == null;
		});
	}

	sizeOfReportObject(obj) {
		return Object.keys(obj).length;
	}

	async exposeCypressData() {
		let numberKeywordsReport = [];
		let data = [];
		this.conversationCountKeywords.subscribe(value => {
			if (!value) {
				return;
			}
			numberKeywordsReport.push(value);
		});

		this.reports?.forEach(report => {
			data.push(report.keywords.split(`|`).length);
		});
		const conversationsCount2Days = this.conversationsInlast2Days['Admin']?.length;
		const conversationsCount14Days = this.conversationsInLast14Days['Admin']?.length;
		const conversations2Days = this.conversationsInlast2Days['Admin'];
		const conversations14Days = this.conversationsInLast14Days[`Admin`];
		return (
			window.Cypress &&
			(window.data = [
				data,
				numberKeywordsReport[0],
				{
					twoDays: conversationsCount2Days,
					fourteenDays: conversationsCount14Days
				},
				conversations2Days,
				conversations14Days
			])
		);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	private getStartAndEndWeekLabels(index: number, daysLeft: number, startDate: DateTime) {
		const start = index === 0 ? 7 * index : 7 * index;
		const end = start + 6 >= daysLeft ? daysLeft : start + 6;
		const startOfWeek = new DateTime(startDate.dayJsObj).add(start, 'day').format("D MMM 'YY");
		const endOfWeek = new DateTime(startDate.dayJsObj).add(end, 'day').format("D MMM 'YY");
		return startOfWeek + ' - ' + endOfWeek;
	}

	private getGroupIds() {
		if (environment.envName === 'production') {
			return [
				'00fa0300-a395-4c35-aaad-f2371e7dba44',
				'02ea240f-1632-4a56-afb8-b6fc4e7984e7',
				'03dc1288-17bb-4ebc-876e-2f9c2b34b66d',
				'0455fb8f-379f-49c4-a200-95d858c12f4d',
				'04b05ae8-de1f-4a0e-be79-aabcc1175fdd',
				'05040525-71fd-409e-9515-6697fe256787',
				'061e9e9c-be1d-4285-b6fa-d8635cfd8c32',
				'07355c1a-a4e2-4be8-adfe-ab0939b2d564',
				'087e5ffc-5c0e-4bb6-a40b-9c2faf025f6f',
				'08c8f254-2fa5-40e2-9188-0745e68bd1e6',
				'0e722cae-a1a2-4b24-afe8-19e04612911d',
				'101baf9f-808c-4f82-8270-df6f99960bc6',
				'105055e4-f980-42f9-ae4a-2d906f716add',
				'1163cc38-79ad-434c-bc62-ba9c7cd3aa07',
				'119f4531-8504-42f7-91a1-2fb6640a33c2',
				'11d473ea-a000-4b04-a39e-c08453097942',
				'13c52e28-4bad-4b1b-887f-4a3653d8ad2b',
				'160a5aea-797c-4940-b7d8-61cb8df1fb09',
				'173377b0-c30f-40e6-9dda-0c3d71530fc2',
				'19043160-a41f-4031-8250-28a435ea4ff5',
				'19651641-ba53-4e39-a325-1a9719bef52f',
				'1afa914a-adc5-458c-b077-39b1d517a715',
				'1cdf12a6-973a-4f71-b83f-ae15a98cfdc7',
				'1f99c444-fe41-496a-81dc-0b3b9bed79f2',
				'211b66c0-f15a-400f-bf94-249af67f13f5',
				'21339373-7500-4dee-ac45-c008080360f2',
				'217b0094-b7d6-4fb1-913c-7482b0b66851',
				'22be6ddc-c150-4b9a-861b-96ee396852a0',
				'23696f06-fe6c-4b64-88ab-3ebcb93a9c28',
				'2376dbb0-be8c-404a-9ef6-e04668f64066',
				'25c17bc4-4616-4022-8350-4aacfba3824f',
				'25ff804b-4cab-4738-b142-1ce9a10c954a',
				'2657805f-84c7-4284-959f-da40519af51c',
				'26847bfc-f861-49bc-8c11-4deb14119e70',
				'296192c7-01c0-40a3-b2b9-98207e1615e4',
				'29e5e871-220f-4e8e-97cb-02ec4be3471f',
				'29e89d40-7332-4f46-9587-0b0b0a2c9ae2',
				'2a1843cb-d44c-47db-b240-5432bab4bd87',
				'2ac19530-b0fc-43e7-9a76-97a59e630f2f',
				'2bcc60d2-54d8-467a-ab7c-1cc9e7da5188',
				'2d68a085-6e2e-405a-976a-85fa3c505ae3',
				'2d8ffd7e-bc63-4100-a696-20ded264d0bb',
				'2ef83442-6c61-412d-bc97-25ca3a7ee813',
				'2f5fa37b-3228-4a28-9283-238cb9b4f988',
				'2fee18a3-5d69-452b-9d08-947f099675fd',
				'30d9f58b-b8d3-4d47-a857-48ee2d78c90d',
				'32bbc426-1919-4e6a-8489-1569fec0d8b2',
				'334daa3d-60fc-41b5-986f-2a80d98bf06f',
				'341543cf-056e-4213-b623-2da1a550a8c5',
				'34e7ba7e-9102-4a28-a1bd-f120d004918e',
				'350e3754-5159-43ba-a8f5-21fbb400ae5f',
				'35b10ed7-7ed2-4a7f-a13a-e27b60c9ff6a',
				'35cc7a02-52ef-4e85-9c11-8fdf3220346d',
				'38549d3b-84d9-4ee4-8836-242f997c21d4',
				'3a333865-2df2-4952-b9b0-b2c5ddf443dc',
				'3b0f4333-7de3-40b3-a2af-972824a49a55',
				'3c4a3eac-8698-41f0-a2d9-1493847f410e',
				'3c9e8e45-1d4f-4dfe-9d3e-a1e0a8d61bfe',
				'3ded9ab9-df0f-4384-8995-22221c9016cd',
				'3e2e8d81-7901-409e-b4ba-c85833cba578',
				'3fd3cbd9-295e-4223-9149-4d6d541ba635',
				'3ff94b0c-db90-446a-8829-11f183583848',
				'44a833ff-50aa-4db4-b96d-24277c19a96b',
				'47a05072-3150-49f5-ace9-f4f67a54e2fc',
				'48f007f5-8071-4f52-9c0d-d839e82319d6',
				'4c7cc4b1-f569-4468-add1-5163719e5179',
				'4d3134d8-5ca9-4163-a078-4f3b6bda43de',
				'4d5cdae0-3867-464c-8295-192dc466eeff',
				'4ddef522-1997-4ef9-ae81-09a6db0f2263',
				'4ec45b20-e46e-4c87-9ef4-6bfa83569818',
				'501c5c95-f7ab-4d1b-8e19-87b4cfd4c18f',
				'505a13d9-ef92-44f3-b2ff-2243f89a9567',
				'5211de85-eef3-4fbe-b3e3-0521171648f2',
				'52fc5ac1-9db6-4f17-9b0b-25f65dd60059',
				'5335921a-dfab-47bd-9f91-d6949e66214f',
				'54bb260a-c76a-43c2-837d-e02aae1d1dc1',
				'5507ade9-4777-47a9-8dbf-864079d827fc',
				'5638d878-0acf-41bd-a45b-cec75e326f73',
				'5647e6f3-8204-486d-baf4-e84741beb528',
				'565fd9ad-9475-48d3-a10e-f5027295f356',
				'56e36ba9-d3a6-4cc3-a3d4-f3ebd78ba79d',
				'5798f053-41a7-45b9-96d1-eb2c49472b89',
				'59855d0c-236a-48eb-9c17-46e779c2d092',
				'5b64a8b5-8bb8-4162-b2e5-9adbdd86ac19',
				'5b877a92-2a22-4be7-9482-4a4988fe6645',
				'5d04cd26-c9e3-4277-9613-9a612ad8edee',
				'5d53592a-8cb5-42b0-bfad-1028cbf68e22',
				'5d92c2c1-cf3f-40b9-ae2f-1f8ccc7d5cba',
				'6051893b-b357-42a5-bf43-8fe0e8b37174',
				'60feb5e9-11eb-4c9f-b44f-146373e0e5c6',
				'616fd505-c4d6-48d6-a032-2635a80a3fca',
				'6327e2a9-fe34-40e0-a939-438b8887c62b',
				'64477b17-82ea-40de-a7c2-3a1fdda103d4',
				'66224395-5989-470f-bb9d-4c31bcf01828',
				'6b9ba883-dcb5-43bb-ba8e-c9479b4e56a5',
				'6ce93cf1-ca93-47db-88f3-ab95674fd720',
				'6d09b8f4-8650-4e1f-b223-d1831eb39911',
				'6f321065-de11-48d2-b531-bbe6175cb155',
				'6fb8c726-9cf9-4d1b-be9a-86672a4139b6',
				'7067abb6-124d-48b8-9a1d-51b570fc0b87',
				'715904d7-291c-4c35-b612-c84458855837',
				'7159cfca-2290-499f-9dd3-fdf5c0a22e7d',
				'719187b2-2a96-4251-b8d6-62b038475c44',
				'71abb230-31b6-4828-af7e-1ffd150384f6',
				'71ea4f65-4d8d-48ba-bab8-2018e55814f9',
				'723f78cf-8998-40e3-af9b-7110699a6ae6',
				'74155857-6251-4a7c-a5dd-c24c5a30e939',
				'7483d698-f309-4e7c-b145-cf2a90730a05',
				'749e34be-178c-4316-a392-77d937b28769',
				'754b7c32-d7b8-4dca-8b22-efef9fd3d9fd',
				'7721ecbc-d6d5-4366-9c85-4453f130632d',
				'7810bd14-f522-437f-bd90-aafb7694bfeb',
				'78a8131e-e996-41c7-9deb-eaa82713f5c6',
				'78adfcec-39d4-43eb-b278-1bafed93bcc9',
				'78ebe5cc-8f20-4499-8303-1714eb2bd845',
				'7ad6c446-db32-4f42-a044-6ba22a9eb90e',
				'7d41b4ae-dd18-4080-9fb0-be1bf0688966',
				'7df5e263-ea20-4c8e-866b-05b6e2c2991e',
				'7e253742-efb4-4468-89c3-311b484bf2bf',
				'7e339fe0-eb37-4fcd-ae1c-4add5d3e3e33',
				'7ebbb553-0f5a-4660-9191-81772a563125',
				'82b047bf-a390-47de-9723-40b2ad6d9876',
				'83964f5d-d48a-4c96-be37-d5ed1064f3ed',
				'84b31f53-210e-49b4-ac85-222fa68d9a64',
				'84ba97b8-1924-4b6d-9d5d-3fcafcbee13e',
				'850faacd-57a6-48a0-ae4b-5fe7a74bdd95',
				'85c517b6-645f-4192-8963-71e9810fb3e8',
				'86b75caa-0a16-410d-87af-9b8e922846a4',
				'89d9698b-cd60-4f10-a081-20992462524c',
				'8a43a327-5e71-4786-b8b9-98dcf5b808a9',
				'8a7dccfd-5726-4a45-9ba3-1dbf2cbcfdbe',
				'8b349706-91e3-4063-9300-6aa541013c94',
				'8e8219b8-1581-49f5-87ec-0957bff98e83',
				'8fb60702-5475-45f7-a287-7d0cb4944f98',
				'900a027e-1223-4bbf-9063-b7c5b3177479',
				'90ffe6d0-654d-436b-b7ac-780de010af7f',
				'9180be19-1412-4122-abde-6c19705805d0',
				'92cfce38-4f62-43b0-b45d-310df0a0aff9',
				'93deaa16-3946-4f3f-83a2-72d5017755a1',
				'95924cc5-fa50-457f-a205-ea9d4e27621a',
				'96533bb0-d796-4333-b60c-d7cabc3f7623',
				'96bc3947-01ce-4fc4-95c2-991967b316a1',
				'97308a67-63d0-4550-b748-04087cd6176d',
				'97a8375a-2e46-41bc-be52-1499b341c320',
				'97d05149-2bd8-4dc5-81a8-087888344f86',
				'9a18658e-e55f-41e1-887c-1f9ec33aa604',
				'9ae30854-d7cd-4f76-8c84-7faa9b565d8e',
				'9caf9512-5f2c-4882-8e58-3e61f45a78ff',
				'9f21afdd-21bd-4974-bb2c-4329ec68e1a7',
				'a04e1924-00cf-4d23-8c89-95a3312a5d6f',
				'a21f96be-904d-40d9-932a-d75570dacf56',
				'a3363854-fbdb-4f65-8776-cd49d9589156',
				'a3587b9d-1471-498a-94af-d07b24656309',
				'a4991947-3a1a-4e0a-8f54-870ff9c6d666',
				'a6133ebf-8019-496a-bf45-00d93a09e557',
				'a66f3f48-6dc1-4cfb-a4c3-410a252a5799',
				'a6f5716f-d589-4b49-9095-64b58ba03901',
				'a71d4631-94b3-4a0f-93ec-fa61d9a5fe79',
				'a8274217-7f89-4441-bd05-bfd6d749355d',
				'a9079a24-056b-47da-aa37-436689394235',
				'acbd088a-221d-4bc3-9c9f-3e672bfff480',
				'ae1eff61-f4ab-49bf-95d5-b8b683f2762b',
				'ae6f1907-0d59-45fb-bbd4-ee681283868c',
				'ae90555f-bdca-4982-ac55-3e769dfff99f',
				'af2cc3c6-7723-4b31-81e9-48370299702d',
				'b237cad3-eea1-4a9c-8916-d7f5c8f99d84',
				'b2ac7a3e-d4d2-41d7-81e8-e0227a0e57ae',
				'b3298332-b2b5-440b-8820-d0753092cdd3',
				'b4375ce2-2a8a-4343-b658-493f52b30d7d',
				'b4893189-a636-4857-9003-51f60716f25c',
				'b559904f-4f03-40f4-b9c6-0d3b6fd23790',
				'b5ef76dd-369e-4043-b16a-daadab41d81f',
				'b63a2105-af2f-4e1a-8d0a-26be2a707c5f',
				'b9f5f343-3cac-4258-b571-b2be310ddc55',
				'bb4e193a-9270-4af6-ae68-181541033b43',
				'bc2ed272-29e7-4c7b-853c-23301ea15b67',
				'bc476165-ff63-4f0a-ab1d-c3dd8d5e8d11',
				'bcd69c67-5cb7-4c50-be3c-4a9b2e41bb43',
				'bcf93318-96bf-49a5-bfb9-f2a38dc59169',
				'bd2b4f30-62cc-4c7b-bd73-6d2cbb672ac1',
				'bd682a10-bb16-4895-93cd-93e947a4c868',
				'bd9604d9-3c82-449b-8173-935af36462de',
				'bd9f31d0-f0b6-4fc4-a22e-2d9a246e2bfe',
				'bf44d9ae-af99-429a-8e33-c5f212f57a08',
				'bfa13d8e-b7cf-4f22-b087-865503e23f9c',
				'c2cb131d-2b5d-4cb6-bc71-f2525838af71',
				'c4e9d64f-7d67-4c4a-91cd-b0c642a3f9dc',
				'c57caca2-91ed-4541-9c4c-13b3c30590d9',
				'c6b2e84f-486b-43bd-baa7-a06d0f4138a8',
				'c7c80b06-66e2-41c4-825b-7af0421416c0',
				'c8fb50a0-1f7f-4a53-b391-532410817e52',
				'c9d2b33e-d1d9-4c80-8b94-d465de4cf7ce',
				'ca46680b-e0fc-4730-853c-0687f02325ff',
				'cb19c89a-ca3b-4e4c-9a79-583228f4d31e',
				'cbe8dd9a-227a-4ca6-9d1f-f22fe14df04a',
				'cca0040c-515d-494f-a33f-fd1ac7d6a94d',
				'd23c2acc-3500-4ba4-9590-2a9485e2699d',
				'd4cc28f1-2be2-441b-a8c0-61ff87abb1fb',
				'd5feb38e-add8-4315-9867-3d46739f1597',
				'd64e27ac-275b-42de-b4eb-f562088ff332',
				'd75580f1-c872-46ae-8e7e-140a7862f630',
				'da0c6d43-1fcb-40a5-8d46-386530c53b11',
				'da0e9205-f252-4914-9970-1876d0f15707',
				'daa0b084-4f71-4eb9-9800-097768e151e6',
				'dac49221-da06-47fd-aa7f-78c3a6da1024',
				'dad676f5-aefa-461b-a8fa-c338c0025912',
				'daf50212-3876-4b9b-b29a-a5a6e4467d58',
				'dd5d1a27-262b-4ae1-9663-b0f05eda0054',
				'df426329-4093-435b-a341-0baf78d351f3',
				'e12eff32-6e50-4f15-9080-470784a571ea',
				'e17b2d9e-5942-41fd-88d5-5191e2aa2e00',
				'e3a1158f-4dae-4c5b-97ef-0acd9ef81ab0',
				'e67d6094-45c8-4301-9088-7aba5f4a9dc0',
				'e6b5aa21-da29-4f81-a743-0eb2bb284d78',
				'e6cf168a-7851-4b62-a654-f7680a7ca867',
				'e96466a9-881d-4975-b07f-5fe0f500d489',
				'ea96e2ad-d8fa-470c-b80c-5d1e6b751b4c',
				'eacda33e-65af-4d0a-99a3-be803bea6138',
				'ec9ab9ec-690b-4d81-9e89-c9507e3451ee',
				'efbe0242-3044-48d2-9394-f6eb865feb35',
				'f015272a-b5bc-4519-8e75-f2b7efc19c67',
				'f157f890-a603-43e1-bf3a-a4965358a75c',
				'f388a88b-44ad-4dba-a041-d77fc8e6a0cd',
				'f400c25d-f3e7-4ad6-ab1e-535084bdd5e4',
				'f46e4f1c-d189-4ef5-8cd1-a69324cd3c7a',
				'f479adb9-3ecb-41fe-aa1d-062ecb945ada',
				'f4c49d96-5621-41a2-a54b-18694ee2cdb1',
				'f5aeb677-2c47-4aa8-9d40-ca5beb10ac01',
				'f63c297a-8870-4f21-8be4-2a5e0b35b054',
				'f64c60f8-b72a-45ff-9dc3-f922822face8',
				'f6d65772-7ffb-4622-b59b-18bed0366437',
				'f73a138c-fc1b-41ae-a424-c8223d8a3e13',
				'f8cb3ff3-0d4f-46ed-94f8-e4a9d1d1a7de',
				'f9315b8d-9b3d-41e4-9d5c-ae07888b5930',
				'fa40beed-1419-4ec7-aa5d-f3937a8a6dc1',
				'facc308f-f097-463b-8b6c-df06c3e38fd0',
				'fc4b0b6b-1977-498b-b4e1-b6c8cee1aeb5',
				'fddd343c-754d-4706-bcb8-66c7afde1d1a',
				'fe981bc8-cf5c-491d-b712-adfd418a2bf9',
				'ffd2cf8f-1608-419a-b334-4042b00d3e09'
			];
		} else {
			return [
				'087076d4-ee82-45f6-b5e1-2f40b1259ea3',
				'09a15bbb-0d8e-4ee3-89e7-71159228c7a4',
				'0b94a3e7-3511-45f4-817f-544ad0611f63',
				'0e42818b-8d2a-49eb-a5fb-3d6f54a9ee6e',
				'12604daf-ca0f-41d9-b790-a9b770ab0d5b',
				'172ee641-935d-41ae-8c89-154fc0d24faf',
				'1770216b-19bd-4f2a-8dc8-262b6f719bd6',
				'1998a167-36cf-432a-b9a5-4cdbaae1e143',
				'1cb03ba6-8e75-46d7-a7b9-ffa42cc73b31',
				'280f191e-c815-4aef-bb31-65e0be725c27',
				'2c5e6bc2-f177-4c20-826a-42f6477787c9',
				'2f03f7d2-2db5-4507-86ef-16ee83a1f57e',
				'33093949-fd72-41d9-ba15-570793cfb82f',
				'3411268e-80b0-43a1-9183-41594ed36883',
				'36259991-a5ec-4a23-8e32-6392ddb6a127',
				'3bbd8763-ce6c-4dd6-88ae-f14e42660be2',
				'429ce414-70cf-4f30-910f-711b9125eb18',
				'4c28b65c-268a-4fc1-bad1-52313fe24bd5',
				'55b88599-5d77-4fd2-8be2-7f839b42f85c',
				'5ae5dbd3-d850-4385-91c4-b386a13150e1',
				'5b109295-a59a-4ec7-9fd8-0dd4802f3f25',
				'5feec8f2-6300-4fdd-96ea-04c880627275',
				'623f1b2b-43e7-48f6-8be0-9f4db1e236d8',
				'689757c0-adb1-418d-a539-6da00e4b1ada',
				'6d79db72-3e8d-42cc-a23a-b0f235da6722',
				'725d6f54-4de2-493b-be92-3b8b8ee4b998',
				'72767d9f-7354-43d6-8b71-8ba0478a2e54',
				'76f240a2-cd5f-4d35-a98e-bbfccdd3f14a',
				'7f1571b5-89df-49c1-938f-729e9553662c',
				'7f78e0a4-d3dd-4a0a-b5c3-3d098d7f8e94',
				'805f718f-8816-48a5-81fc-a232937fdd48',
				'84aadcdc-67df-404e-a60c-7bda0fac2c45',
				'9404795d-d3c8-497e-8ee8-8a43280462e9',
				'96104d0f-68c2-424d-ad78-6af4dea36fae',
				'965e850e-9ee8-448a-81ce-1c91b86c922b',
				'9c7e571a-3865-4851-b8b0-e0b67adbea07',
				'a092a849-2d9f-49ed-88ee-370d1f7ee5ee',
				'a2738f2f-d222-4624-a006-08f606d52e53',
				'ac258260-c25b-4381-89fb-37c341bf3271',
				'b0b3ccb2-ede9-4fb9-a170-bee03d0f7cf0',
				'b265afc9-6606-4963-8f91-baeaf8a9a505',
				'ba6a4daf-efd7-4b6b-94bb-28d0d32b9f56',
				'bafee971-a4be-4ff5-841f-fc7a161dbd8f',
				'c0cc00c6-cf13-4df6-8386-6f6e473025b0',
				'd6504bd3-d567-4bb2-bc56-e8f95cd9608f',
				'd94116f4-39f9-4bcc-b302-65cc1f945e7d',
				'db9272ab-c494-4ceb-8500-5910213edfbb',
				'e00ee28b-3791-4423-bcb7-69fffa393dce',
				'e023869b-664f-4d87-89f3-99e4d7aa1d31',
				'e2486943-b1af-4b3f-88b6-f03b7809eef6',
				'eb1a6167-abb4-4228-ba20-b0460f1893c1',
				'ec146ee4-3eda-4000-8c1f-755a1c34962a',
				'f54bd2c0-b755-45a8-bd61-1f77b8ff26be',
				'fff3d4c9-d1a5-474d-85cc-ac5e05125c5b'
			];
		}
	}
}
