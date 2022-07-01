import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommunityMarketingCampaignTasksDashboardComponent} from './community-marketing-campaign-tasks-dashboard.component';

describe('CommunityMarketingCampaignTasksDashboardComponent', () => {
	let component: CommunityMarketingCampaignTasksDashboardComponent;
	let fixture: ComponentFixture<CommunityMarketingCampaignTasksDashboardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CommunityMarketingCampaignTasksDashboardComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CommunityMarketingCampaignTasksDashboardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
