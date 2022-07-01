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
import {ColumnWIthTargetChart} from '@sharedModule/components/brand-community-report/brand-community-report.model';

@Component({
	selector: ' app-brand-CBR-custom-conversation',
	templateUrl: './brand-cbr-custom-conversation.component.html',
	styleUrls: ['./brand-cbr-custom-conversation.component.scss']
})
export class BrandCbrCustomConversationComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
	@Input() conversation: any;
	@Input() conversationId: any;
	@Input() supportingText;
	customConversationChartOptions;
	maxMention = 0;
	private dateTimeHelper: DateTimeHelper;

	constructor(injector: Injector, private brandCommunityReportService: BrandCommunityReportService) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.customConversationChartOptions = new ColumnWIthTargetChart();
		setTimeout(async () => {
			await this.createGenderDistributionCharts();
		}, 3000);
	}

	ngOnChanges(changes): void {
		if (changes.customConversation) {
		}
	}

	async createGenderDistributionCharts() {
		const conversation = this.conversation.buckets.filter(bucket => bucket.isBucketVisible);
		const mentions = this.conversation.buckets.map(item => Number(item.mentions));
		for (const mention of mentions) {
			if (this.maxMention < mention) {
				this.maxMention = mention;
			}
		}
		const data = conversation.map(item => (item.visibility ? item.mentions : 0));
		const names = conversation.map(item => '');
		this.customConversationChartOptions.chartOptions.series[0].data = data;
		this.customConversationChartOptions.chartOptions.series[0].pointWidth = 24;
		this.customConversationChartOptions.chartOptions.colors = ['#C5B0D5', '#1F77B4', '#F7B6D2'];
		this.customConversationChartOptions.chartOptions.colorCount = 3;
		this.customConversationChartOptions.chartOptions.chart.type = 'bar';
		this.customConversationChartOptions.chartOptions.chart.backgroundColor = '#fff';
		this.customConversationChartOptions.chartOptions.xAxis.categories = names;
		this.customConversationChartOptions.chartOptions.xAxis.title.text = '';
		this.customConversationChartOptions.chartOptions.yAxis.title.text = '';
		this.customConversationChartOptions.chartOptions.chart['height'] = 100 + conversation.length * 25;
		this.createChart(
			'custom-conversation-preview-chat-' + this.conversationId,
			this.customConversationChartOptions.chartOptions
		);
	}

	createChart(el, cfg) {
		Highcharts.chart(el, cfg);
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

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}
}
