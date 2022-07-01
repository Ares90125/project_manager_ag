import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {CampaignReportService} from '@sharedModule/services/campaign-report.service';
import {UserService} from '@sharedModule/services/user.service';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-report-generator',
	templateUrl: './report-generator.component.html',
	styleUrls: ['./report-generator.component.scss']
})
export class ReportGeneratorComponent extends BaseComponent implements OnInit, OnDestroy {
	user;
	campaignReports;
	isCampaignReportsLoading = false;

	constructor(
		injector: Injector,
		private router: Router,
		private userService: UserService,
		private campaignReportService: CampaignReportService
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('GA - Campaign Report', 'GA - Campaign Report');
		this.getUserSelfMonetizationCampaigns();
	}

	async getUserSelfMonetizationCampaigns() {
		this.isCampaignReportsLoading = true;
		this.campaignReports = await this.campaignReportService.getUserSelfMonetizationCampaigns();
		const dateNow = new DateTime();
		this.campaignReports.forEach(campaignReport => {
			campaignReport['isCompleted'] =
				dateNow.diff(new DateTime().parseUTCString(campaignReport.endDateAtUTC).dayJsObj, 'days') > 7;
		});
		this.isCampaignReportsLoading = false;
	}

	navigateToCreateReport(campaignReport) {
		this.router.navigateByUrl(
			`group-admin/campaigns/campaign-report/campaign-report-view/` + campaignReport.campaignId
		);
	}

	onCloseCampaignReports() {
		this.router.navigateByUrl(`group-admin/campaigns`);
	}

	navigateToCreateCampaignReport() {
		this.router.navigateByUrl(`group-admin/campaigns/campaign-report/create-report`);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
