import {BrandSentitmentSection} from '../brand-sentiments/brand-sentiments.component';
import {BrandShareofVoiceDetails} from '../brand-share-of-voice/brand-share-of-voice.component';
import {IEngagementInsightSection} from '../engagement-insight/engagement-insight.component';
import {IUpdatedKPISection} from '../kpis/kpis.component';
import {IUpdatedPhaseIdeaValues} from '../phase-idea/phase-idea.component';
import {IUpdatedResultSection} from '../results/results.component';
import {TopPerformingPostSection} from '../top-performing-post/top-performing-post.component';
import {IWordCloudSection} from '../wordcloud/wordcloud.component';

export interface CMCReportv3S3Data {
	totalAudience: number;
	totalCommunities: number;
	phaseIdeaDetails: IUpdatedPhaseIdeaValues;
	brandObjective: string;
	keyFindings: IUpdatedPhaseIdeaValues;
	overallSnapshot: {name: string; statistics: {value: number}}[];
	results: IUpdatedResultSection;
	kpiDetails: IUpdatedKPISection;
	brandShareOfVoice: BrandShareofVoiceDetails;
	brandSentiment: BrandSentitmentSection;
	wordCloud: IWordCloudSection;
	engagementInsight: IEngagementInsightSection;
	topPerformingPosts: TopPerformingPostSection;
	allPosts: TopPerformingPostSection;
	referenceConversation: {brandShareOfVoice: {}};
}
