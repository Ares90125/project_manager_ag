import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	OnChanges,
	Output,
	ViewChild
} from '@angular/core';
import {BaseComponent} from 'src/app/shared/components/base.component';
import Highcharts from 'highcharts';
import {BrandCommunityReportService} from '@sharedModule/services/brand-community-report.service';
import {DateTimeHelper} from '@sharedModule/models/date-time-helper.model';
import {
	ColumnAndGroupedLineChart,
	ColumnStackedChart,
	ColumnWIthTargetChart,
	SelectedTimePeriod
} from '@sharedModule/components/brand-community-report/brand-community-report.model';
import {GroupModel} from '@sharedModule/models/group.model';
import {DateTime} from '@sharedModule/models/date-time';
import {PieChartModel} from '@sharedModule/models/group-reports/chart.model';
import {HTMLInputElement} from 'happy-dom';

@Component({
	selector: ' app-custom-conversation',
	templateUrl: './custom-conversation.component.html',
	styleUrls: ['./custom-conversation.component.scss']
})
export class CustomConversationComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
	conversations;
	@Input() public set _conversations(value: string) {
		this.conversations = value;
		setTimeout(async () => {
			await this.createCustomConversationCharts();
		}, 3000);
	}
	@Input() group;
	@Input() groupId;
	@Input() brandId: string;
	customConversationChartOptions;
	maxMention = 0;
	toggleGraph = true;
	@Output() openEdit = new EventEmitter();
	@Output() showGraph = new EventEmitter();
	private dateTimeHelper: DateTimeHelper;
	customConversationsDataJson = [];
	@Output() customConversationsJson = new EventEmitter();
	@Output() reloadData = new EventEmitter();
	visibility = {};
	isDeleteDialogOpen = false;
	conversationToBeDeleted;
	isDeleting = false;
	editingSupportingText = false;
	supportingText;
	@Input() set supportingTextInput(value) {
		this.supportingText = value;
	}

	constructor(injector: Injector, private brandCommunityReportService: BrandCommunityReportService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.customConversationChartOptions = new ColumnWIthTargetChart();
		this.customConversationsDataJson = this.conversations;
		this.customConversationsDataJson?.forEach((conversation, index) => {
			this.customConversationsDataJson[index]['isConversationVisible'] = true;
			conversation['buckets']?.forEach((bucket, i) => {
				this.customConversationsDataJson[index]['buckets'][i]['isBucketVisible'] = true;
			});
		});
		setTimeout(async () => {
			await this.createCustomConversationCharts();
		}, 3000);
	}

	openSupportingTextArea(event) {
		event.currentTarget.nextElementSibling.classList.add('show');
		event.currentTarget.classList.remove('show');
	}

	editSupportingText(event) {
		event.currentTarget.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.classList.remove('show');
	}

	hideSupportingTextArea(event) {
		event.currentTarget.parentElement.parentElement.classList.remove('show');
		event.currentTarget.parentElement.parentElement.previousElementSibling.classList.add('show');
		event.currentTarget.parentElement.parentElement.nextElementSibling.classList.add('show');
	}

	async saveSupportingText(event, type) {
		this.editingSupportingText = true;
		const text = (event.currentTarget.parentElement.previousSibling as HTMLInputElement).value;
		if (text.trim().length === 0) {
			if (this.supportingText[type]) {
				delete this.supportingText[type];
			}
		} else {
			this.supportingText[type] = text;
		}
		await this.brandCommunityReportService.updateBrandCommunityReport({
			brandId: this.brandId,
			groupId: this.groupId,
			supportingText: JSON.stringify(this.supportingText)
		});
		this.editingSupportingText = false;
		event.target.parentElement.parentElement.classList.remove('show');
		setTimeout(() => {
			event.target.parentElement.parentElement.previousElementSibling.classList.add('show');
			event.target.parentElement.parentElement.nextElementSibling.classList.add('show');
		}, 1000);
	}

	ngOnChanges(changes): void {
		if (changes.customConversation) {
		}
	}

	async createCustomConversationCharts() {
		this.conversations?.forEach((conversation, index) => {
			const mentions = conversation.buckets.map(item => Number(item.mentions));
			for (const mention of mentions) {
				if (this.maxMention < mention) {
					this.maxMention = mention;
				}
			}
			const data = conversation.buckets.map(item => (item.visibility ? item.mentions : 0));
			const names = conversation.buckets.map(item => '');
			this.customConversationChartOptions.chartOptions.series[0].data = data;
			this.customConversationChartOptions.chartOptions.series[0].pointWidth = 24;
			this.customConversationChartOptions.chartOptions.colors = ['#C5B0D5', '#1F77B4', '#F7B6D2'];
			this.customConversationChartOptions.chartOptions.colorCount = 3;
			this.customConversationChartOptions.chartOptions.chart.type = 'bar';
			this.customConversationChartOptions.chartOptions.chart.backgroundColor = '#fff';
			this.customConversationChartOptions.chartOptions.xAxis.categories = names;
			this.customConversationChartOptions.chartOptions.xAxis.title.text = '';
			this.customConversationChartOptions.chartOptions.yAxis.title.text = '';
			this.customConversationChartOptions.chartOptions.chart['height'] = 100 + conversation.buckets.length * 25;
			this.createChart('custom-conversation-chat-' + index, this.customConversationChartOptions.chartOptions);
		});
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
	}

	onChangeVisible() {
		this.createCustomConversationCharts();
	}

	async getCustomConversationsJSON() {
		this.customConversationsJson.emit(this.customConversationsDataJson);
	}

	getLabelTextPos(mentions) {
		if (this.maxMention > 0) {
			let percent = (Number(mentions) / this.maxMention) * 100;
			if (percent >= 50) {
				return percent / 2 - 3 + '%';
			} else if (percent <= 10) {
				return percent / 2 + '%';
			}
		}
		return '10%';
	}

	editVisibility(name, event, type, index) {
		if (type === 'conversation') {
			this.customConversationsDataJson[index]['isConversationVisible'] = event.checked;
		}
		if (type === 'bucket') {
			this.customConversationsDataJson[index]['buckets']?.forEach((bucket, i) => {
				if (bucket.name === name) {
					this.customConversationsDataJson[index]['buckets'][i]['isBucketVisible'] = event.checked;
				}
			});
		}
	}

	async deleteCustomConversations(sectionTitle) {
		try {
			this.isDeleting = true;
			await this.brandCommunityReportService.deleteCBRCustomConversation(this.group.groupId, sectionTitle);
			this.isDeleteDialogOpen = false;
			this.isDeleting = false;
			this.reloadData.emit();
		} catch (e) {}
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
