import {
	getCampaignPosts,
	getCMCReportMetric,
	getCmcReportWc,
	listCampaignGroups
} from '../../fixtures/mock-responses/cs-admin-report.spec/report-helper';

describe.skip(`Create brand spec`, () => {
	const brandId = '2bad5887-6191-4797-acc3-ddeefc2673be';
	const campaignName = 'ReportGeneratorCampaign';
	before(() => {
		cy.LoginAsCSAdmin()
			.CreateCampaignWithApi(campaignName, brandId)
			.its(`body.data.createCMCampaign.campaignId`)
			.then(campaignId => {
				cy.MockQueryUsingObject(`GetCMCReportMetricsV2`, getCMCReportMetric(campaignId))
					.MockQueryUsingObject(`GetCmcReportWc`, getCmcReportWc(campaignId))
					.MockQueryUsingObject(`getCampaignPosts`, getCampaignPosts(campaignId))
					.MockQueryUsingObject(`ListCampaignGroups`, listCampaignGroups(campaignId));
				cy.visit(`cs-admin/brands/${brandId}/edit-campaign/${campaignId}`);
				cy.wait(8000).get(`#daily-report-reports-tab`).click();
			});
	});

	context(`verify the report data`, () => {
		it(`should display the campaign details`, () => {
			cy.getDataTestId(`report-campaign-type`)
				.as(`campaignTypes`)
				.eq(0)
				.invoke(`text`)
				.should(`eq`, ` User Generated Content (UGC) `)
				.get(`@campaignTypes`)
				.eq(1)
				.invoke(`text`)
				.should(`eq`, ` Lead Generation `);
			cy.getDataTestId(`report-primary-objective`).should(`have.text`, `Objective`);
			cy.getDataTestId(`report-sub-category`)
				.find(`span`)
				.as(`subCategory`)
				.eq(0)
				.should(`have.text`, ` Hair,  `)
				.get(`@subCategory`)
				.eq(1)
				.should(`have.text`, ` Salon Hair Colour `);
			cy.get(`.kpi-list`)
				.find(`li`)
				.as(`kpi-list`)
				.eq(0)
				.should(`have.text`, `CRM Leads`)
				.get(`@kpi-list`)
				.eq(1)
				.should(`have.text`, `Brand Mentions`);
			cy.get(`.tags-wrap`).find(`span`).should(`have.text`, `Dettol`);

			cy.getDataTestId(`report-summary`).find(`p`).should(`have.text`, `campaign brief`);
		});

		it(`should display the key metrics`, () => {
			cy.getDataTestId(`report-value-Total Groups`).should(`have.text`, ` 209`);
			cy.getDataTestId(`report-value-Total Audience`).should(`have.text`, ` 11.7M`);
			cy.getDataTestId(`report-value-Brand Mentions`).should(`have.text`, ` 25.2K`);
			cy.getDataTestId(`report-value-Leads Generated`).should(`have.text`, ` 0`);
			cy.getDataTestId(`report-value-Category Conversations`).should(`have.text`, ` 244.5K`);
			cy.getDataTestId(`report-value-Brand Conversations`).should(`have.text`, ` 60.1K`);
			cy.getDataTestId(`report-value-Share of Voice`).should(`have.text`, ` 0%`);
		});

		it(`should display the post distribution graphs`, () => {
			cy.getDataTestId(`report-admin-posts`).should(`have.text`, ` Admin Posts - 1713`);
			cy.getDataTestId(`report-organic-posts`).should(`have.text`, `Organic Posts (UGC) - 7730 `);
			cy.getDataTestId(`report-engagement-distribution`).should(`have.text`, `162227`);
			cy.getDataTestId(`report-admin-post-engage`).should(`have.text`, ` Admin Posts Engagement - 45% `);
			cy.getDataTestId(`report-admin-post-dist`).should(`have.text`, `UGC Posts Engagement - 55% `);
		});

		it(`should display the post progress`, () => {
			cy.get(`div.post-progress-wrap`).within(() => {
				cy.get(`h6`).should(`have.text`, `Posts`);
				cy.get(`strong`).should(`have.text`, `187 / 225`);
			});
			cy.getDataTestId(`report-campaign-stats-reaction`).within(() => {
				cy.get(`h6`).should(`have.text`, `Reactions`);
				cy.get(`strong`).should(`have.text`, `55%`);
			});
			cy.getDataTestId(`report-campaign-stats-comment`).within(() => {
				cy.get(`h6`).should(`have.text`, `Comments`);
				cy.get(`strong`).should(`have.text`, `45%`);
			});

			cy.getDataTestId(`report-campaign-period-name`).should(`have.text`, `Phase 1`);
			cy.getDataTestId(`report-stats-post-progress`).should(`have.text`, ` 187 out of 225 posts done `);
			cy.get(`.progress-complete`).each($ele => {
				cy.wrap($ele).should(`have.attr`, `style`, `width: 83%;`);
			});
		});

		it(`should the before campaign share of voice`, () => {
			const sov = [
				`. -  % `,
				`Baby Destination - 0 % `,
				`Dettol - 91 % `,
				`Savlon - 5 % `,
				`Lizol - 4 % `,
				`Others - 0 % `
			];
			cy.getDataTestId(`report-before-share-of-voice-brand`).each(($ele, i) => {
				cy.wrap($ele).should(`have.text`, sov[i]);
			});
		});

		it(`should the before campaign share of voice`, () => {
			const sov = [
				`. -  % `,
				`Baby Destination - 0 % `,
				`Dettol - 100 % `,
				`Pril - 0 % `,
				`Savlon - 0 % `,
				`Others - 0 % `
			];

			cy.getDataTestId(`report-during-share-of-voice-brand`).each(($ele, i) => {
				cy.wrap($ele).should(`have.text`, sov[i]);
			});
		});

		it(`should show the sentiment map`, () => {
			//Before Campaign
			cy.getDataTestId(`report-before-sentiment-like-graph`).should(`have.attr`, `style`, `height: 37%;`);
			cy.getDataTestId(`report-before-sentiment-neutral-graph`).should(`have.attr`, `style`, `height: 57%;`);
			cy.getDataTestId(`report-before-sentiment-dislike-graph`).should(`have.attr`, `style`, `height: 6%;`);
			cy.getDataTestId(`report-before-sentiment-like`).should(`contain.text`, `Like - 37%`);
			cy.getDataTestId(`report-before-sentiment-neutral`).should(`contain.text`, `Neutral - 57%`);
			cy.getDataTestId(`report-before-sentiment-dislike`).should(`contain.text`, `Dislike - 6%`);

			//During Campaign
			cy.getDataTestId(`report-during-sentiment-like-graph`).should(`have.attr`, `style`, `height: 40%;`);
			cy.getDataTestId(`report-during-sentiment-neutral-graph`).should(`have.attr`, `style`, `height: 57%;`);
			cy.getDataTestId(`report-during-sentiment-dislike-graph`).should(`have.attr`, `style`, `height: 3%;`);
			cy.getDataTestId(`report-during-sentiment-like`).should(`contain.text`, `Like - 40%`);
			cy.getDataTestId(`report-during-sentiment-neutral`).should(`contain.text`, `Neutral - 57%`);
			cy.getDataTestId(`report-during-sentiment-dislike`).should(`contain.text`, `Dislike - 3%`);
		});
	});

	it.only(`should display the brand conversation stats`, () => {
		//BRAND CONVERSATIONS
		cy.getDataTestId(`report-Brand Conversations`).should(`exist`);
		cy.getDataTestId(`report-Brand Conversations-before-brand-conversations`)
			.find(`strong`)
			.should(`have.text`, `1878`);
		cy.getDataTestId(`report-Brand Conversations-before-brand-conversations-percent`).should(
			`have.attr`,
			`style`,
			`height: 3%;`
		);
		cy.getDataTestId(`report-Brand Conversations-during-brand-conversations`).within(() => {
			cy.get(`strong`).should(`have.text`, `60129`);
			const val = [`↑`, `3102%`];
			cy.get(`.changes.up`)
				.find(`span`)
				.each((ele, i) => {
					cy.wrap(ele).should(`have.text`, val[i]);
				});
		});
		cy.getDataTestId(`report-Brand Conversations-during-brand-conversations-percent`).should(
			`have.attr`,
			`style`,
			`height: 97%;`
		);
		cy.getDataTestId(`report-Brand Conversations-after-brand-conversations`).within(() => {
			cy.get(`strong`).should(`have.text`, `0`);
			const val = [`↓`, `-100%`];
			cy.get(`.changes.down`)
				.find(`span`)
				.each((ele, i) => {
					cy.wrap(ele).should(`have.text`, val[i]);
				});
		});
		cy.getDataTestId(`report-Brand Conversations-after-brand-conversations-percent`).should(
			`have.attr`,
			`style`,
			`height: 0%;`
		);

		//BRAND MENTIONS
		cy.getDataTestId(`report-Brand Mentions`).should(`exist`);
		cy.getDataTestId(`report-Brand Mentions-before-brand-conversations`).find(`strong`).should(`have.text`, `354`);
		cy.getDataTestId(`report-Brand Mentions-before-brand-conversations-percent`).should(
			`have.attr`,
			`style`,
			`height: 1%;`
		);
	});
	// after(() => {
	// 	cy.task(`deleteTestCampaigns`, {value: campaignName});
	// });
});
