export class SummaryReportModel {
	totalPosts = 0;
	totalConversations = 0;
	totalComments = 0;

	totalVideoPosts = 0;
	totalPhotoPosts = 0;
	totalTextPosts = 0;

	private _totalActivityOnVideoPosts = 0;

	get totalActivityOnVideoPosts() {
		return this._totalActivityOnVideoPosts;
	}

	set totalActivityOnVideoPosts(input) {
		this._totalActivityOnVideoPosts = Math.round(Number(input));
	}

	private _totalActivityOnPhotoPosts = 0;

	get totalActivityOnPhotoPosts() {
		return this._totalActivityOnPhotoPosts;
	}

	set totalActivityOnPhotoPosts(input) {
		this._totalActivityOnPhotoPosts = Math.round(Number(input));
	}

	private _totalActivityOnTextPosts = 0;

	get totalActivityOnTextPosts() {
		return this._totalActivityOnTextPosts;
	}

	set totalActivityOnTextPosts(input) {
		this._totalActivityOnTextPosts = Math.round(Number(input));
	}

	private _totalCommentsPerPosts = 0;

	get totalCommentsPerPosts() {
		return this._totalCommentsPerPosts;
	}

	set totalCommentsPerPosts(input) {
		this._totalCommentsPerPosts = Number(Number(input).toFixed(2));
	}

	private _totalActivityRate = 0;

	get totalActivityRate() {
		return this._totalActivityRate;
	}

	set totalActivityRate(input) {
		const totalActivity = Number(input);
		this._totalActivityRate = Number.isInteger(totalActivity) ? totalActivity : Number(totalActivity.toFixed(2));
	}

	private _totalEngagementRate = 0;

	get totalEngagementRate() {
		return this._totalEngagementRate;
	}

	set totalEngagementRate(input) {
		this._totalEngagementRate = Number(Number(input).toFixed(2));
	}

	get totalActivityRateOnVideoPosts() {
		return this.getActivityRatePerTypePost(this._totalActivityOnVideoPosts, this.totalVideoPosts);
	}

	get totalActivityRateOnPhotoPosts() {
		return this.getActivityRatePerTypePost(this._totalActivityOnPhotoPosts, this.totalPhotoPosts);
	}

	get totalActivityRateOnTextPosts() {
		return this.getActivityRatePerTypePost(this._totalActivityOnTextPosts, this.totalTextPosts);
	}

	getActivityRatePerTypePost(totalActivity, totalPost) {
		if (!totalPost) {
			return 0;
		}
		const activityRatePerPost = totalActivity / totalPost;
		return Number.isInteger(activityRatePerPost) ? activityRatePerPost : Number(activityRatePerPost).toFixed(2);
	}
}
