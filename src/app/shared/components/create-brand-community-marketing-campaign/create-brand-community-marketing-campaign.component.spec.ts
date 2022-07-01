import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateBrandCommunityMarketingCampaignComponent} from './create-brand-community-marketing-campaign.component';

describe('CreateBrandCommunityMarketingCampaignComponent', () => {
	let component: CreateBrandCommunityMarketingCampaignComponent;
	let fixture: ComponentFixture<CreateBrandCommunityMarketingCampaignComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CreateBrandCommunityMarketingCampaignComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateBrandCommunityMarketingCampaignComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
