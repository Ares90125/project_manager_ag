import {Injectable} from '@angular/core';
import {GroupMetricModel} from 'src/app/shared/models/group-metric.model';
import {SummaryReportModel} from 'src/app/shared/models/group-reports/summary-report.model';
import {LoggerService} from '@sharedModule/services/logger.service';

@Injectable()
export class SummaryReportService {
	constructor(private logger: LoggerService) {}

	getSummaryReport(data) {
		const metrics = data as GroupMetricModel[];
		const summaryMetrics = new SummaryReportModel();

		let totalShares = 0;
		let totalReactions = 0;

		metrics.forEach(met => {
			summaryMetrics.totalConversations += met.numPosts + met.numComments;
			summaryMetrics.totalPosts += met.numPosts;

			summaryMetrics.totalVideoPosts += met.numVideoPosts;
			summaryMetrics.totalPhotoPosts += met.numPhotoPosts;
			summaryMetrics.totalTextPosts += met.numTextPosts;

			summaryMetrics.totalActivityOnPhotoPosts += met.numCommentsOnPhotoPosts + met.numReactionsOnPhotoPosts;
			summaryMetrics.totalActivityOnVideoPosts += met.numCommentsOnVideoPosts + met.numReactionsOnVideoPosts;
			summaryMetrics.totalActivityOnTextPosts += met.numCommentsOnTextPosts + met.numReactionsOnTextPosts;

			summaryMetrics.totalComments += met.numComments;
			totalReactions += met.numReactions;
			totalShares += met.numShares;
		});

		summaryMetrics.totalCommentsPerPosts =
			summaryMetrics.totalPosts !== 0 ? summaryMetrics.totalComments / summaryMetrics.totalPosts : 0;

		const memberMetrics = metrics.reverse().find(x => x.memberCount > 0);
		const memberCount = memberMetrics ? memberMetrics.memberCount : 0;
		summaryMetrics.totalEngagementRate =
			memberCount !== 0 ? ((summaryMetrics.totalConversations + totalReactions + totalShares) / memberCount) * 100 : 0;
		summaryMetrics.totalActivityRate =
			summaryMetrics.totalPosts !== 0
				? (summaryMetrics.totalComments + totalReactions + totalShares) / summaryMetrics.totalPosts
				: 0;
		return summaryMetrics;
	}
}
