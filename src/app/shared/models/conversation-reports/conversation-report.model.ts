export class ConversationReportModel {
	id: string;
	groupId: string;
	ownerId: string;
	name: string;
	keywords: string;
	keywordList: string[];
	displayName: string;
	numOfOccurances: number;
	numOfActionRequired: number;

	numOfHiddenComments: number;
	numOfRemovedComments: number;

	numOfReported: number;
	numOfTurnedOffCommenting: number;
	numOfMutedMembers: number;
	numOfRemovedMembers: number;
	numOfRemovedPost: number;
	numOfBlockedUser: number;
	numOfIgnored: number;

	createdAtUTC: string;
}
