import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommunityMarketingCampaignPaymentsComponent} from './community-marketing-campaign-payments.component';

describe('CommunityMarketingCampaignPaymentsComponent', () => {
	let component: CommunityMarketingCampaignPaymentsComponent;
	let fixture: ComponentFixture<CommunityMarketingCampaignPaymentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CommunityMarketingCampaignPaymentsComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CommunityMarketingCampaignPaymentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
