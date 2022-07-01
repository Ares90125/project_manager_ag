import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommunityMarketingCampaignReportDataComponent} from './community-marketing-campaign-report-data.component';

describe('CommunityMarketingCampaignReportDataComponent', () => {
	let component: CommunityMarketingCampaignReportDataComponent;
	let fixture: ComponentFixture<CommunityMarketingCampaignReportDataComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CommunityMarketingCampaignReportDataComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CommunityMarketingCampaignReportDataComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
