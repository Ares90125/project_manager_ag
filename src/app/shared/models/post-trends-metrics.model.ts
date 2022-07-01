import * as _ from 'lodash';
import {PublishService} from '@groupAdminModule/_services/publish.service';

export class PostTrendsMetricsModel {
	private _publishService;
	private _groupId;
	private _memberCount;

	constructor(publishService: PublishService, groupId) {
		this._publishService = publishService;
		this._groupId = groupId;
	}

	async getPostAnalyticsData(startMonth, endMonth, startYear, endYear) {
		const calls = [];
		const requests = [];
		let postAnalyticsData = await this._publishService.getTopPostsAllTypeByGroupId(
			this._groupId,
			10,
			startMonth,
			endMonth,
			startYear,
			endYear
		);

		await this.setActivityRate(postAnalyticsData);

		requests.push(this.getPostsByPostType(postAnalyticsData, 'Video'));
		requests.push(this.getPostsByPostType(postAnalyticsData, 'Photo'));
		requests.push(this.getPostsByPostType(postAnalyticsData, 'Text'));

		const postData = await Promise.all(requests);

		return {video: postData[0], image: postData[1], link: [], text: postData[2]};
	}

	async setActivityRate(postAnalyticsData) {
		postAnalyticsData.forEach(post => {
			if (post && !post.activityRate) {
				post.activityRate = Number(post.reactions) + Number(post.commentCount);
			}
		});
	}

	async getPostsByPostType(data, postType) {
		const postAnalyticsData = _.orderBy(
			data.filter(x => x.postType === postType),
			[item => item.activityRate],
			['desc']
		);

		if (postAnalyticsData.length === 0) {
			return postAnalyticsData;
		}
		postAnalyticsData.forEach(post => {
			post.fbPermlink =
				'https://www.facebook.com/groups/' +
				post?.fbGroupId +
				'/permalink/' +
				post?.id.replace(post?.fbGroupId + '_', '') +
				'/';
		});

		return postAnalyticsData;
	}
}
