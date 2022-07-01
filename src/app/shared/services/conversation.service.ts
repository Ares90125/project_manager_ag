import {Injectable} from '@angular/core';
import {ConversationActionEnum} from 'src/app/shared/enums/conversation-action.enum';
import {AmplifyAppSyncService} from 'src/app/shared/services/amplify-app-sync.service';
import {ConversationModel} from '../models/conversation.model';
import {LoggerService} from '@sharedModule/services/logger.service';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable({
	providedIn: 'root'
})
export class ConversationService {
	conversations = {};
	conversationsInlast2Days = {};
	conversationsInLast14Days = {};
	totalConversationsIn2DaysForReport = {};

	constructor(private readonly appSync: AmplifyAppSyncService, private readonly loggerService: LoggerService) {}

	public async getConversations(
		keywords: string[],
		groupIds: string[],
		actionsTaken: ConversationActionEnum[],
		from: number,
		limit: number,
		sentiments?: Array<string>,
		contentTypes?: Array<string>,
		fromDateAtUTC = null,
		toDateUTC = null
	): Promise<ConversationModel[]> {
		const convs = await this.appSync.fetchConversations(
			keywords,
			groupIds,
			actionsTaken,
			sentiments,
			contentTypes,
			from,
			limit,
			fromDateAtUTC,
			toDateUTC
		);
		const convModels = convs as undefined as ConversationModel[];
		return convModels;
	}

	public async initiateActionOnConversation(actionTaken: ConversationActionEnum, convId: string, input) {
		return await this.appSync.initiateActionOnConversation(actionTaken, convId, input);
	}

	public async fetchConversationsForReport(report, type, actionTakenFilter, from, contentTypes, groupIdsFilter) {
		if (type != 'navigate') {
			this.conversations[report.displayName] = await this.getConversations(
				report.keywords.split('|'),
				groupIdsFilter,
				actionTakenFilter,
				from,
				200,
				null,
				contentTypes,
				report.createdAtUTC
			);
		}
		if (this.conversations[report.displayName]) {
			const yesterday = new DateTime(new DateTime().startOf('day').add(-1, 'day').utc().format());
			this.conversationsInlast2Days[report.displayName] = this.conversations[report.displayName].filter(
				conversation => yesterday <= new DateTime(conversation.createdatutc)
			);
			this.conversationsInLast14Days[report.displayName] = this.conversations[report.displayName].filter(
				conversation =>
					new DateTime().diff(conversation.createdatutc, 'days') <= 15 &&
					yesterday > new DateTime(conversation.createdatutc)
			);
			this.totalConversationsIn2DaysForReport[report.displayName] =
				this.conversationsInlast2Days[report.displayName].length;
		}
	}
}
