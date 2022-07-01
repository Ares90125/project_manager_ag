import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {ConversationModel} from '@sharedModule/models/conversation.model';
import {UtilityService} from '@sharedModule/services/utility.service';

import {CampaignModelv3} from '../cmcreport-v3/cmcreport-v3.component';
import {INewScreenshotAdded} from '../upload-screenshot/upload-screenshot.component';

export interface ReferenceConversationData {
	conversationList: Array<any | INewScreenshotAdded>;
	brandName: string;
	section: string;
	stage: string;
	percentage: number;
	isBrandLoggedIn: Boolean; // If Brand is logged in, we wont show Edit / Toggle / Upload Screenshot.
	uploadDataSectionName?: string;
	visibleToBrand?: boolean;
}

export interface IPostUpdatedDetails {
	[postId: string]: {order?: number; visibleToBrand?: boolean};
}

export interface IUpdatedReferenceConversationDetails {
	brandName: string;
	section: string;
	stage: string;
	visibleToBrand?: boolean;
	postDetails: IPostUpdatedDetails;
}

@Component({
	selector: 'app-reference-conversation',
	templateUrl: './reference-conversation.component.html',
	styleUrls: ['./reference-conversation.component.scss']
})
export class ReferenceConversationComponent implements OnInit, OnChanges {
	@Input()
	data: ReferenceConversationData;

	@Input()
	isReportCBR: boolean = false;

	@Input()
	showReferenceConversationDialog: boolean;
	@Input()
	campaignGroups: any[];

	@Input()
	campaign: CampaignModelv3;

	@Output()
	visibleToBrand = new EventEmitter<boolean>();

	@Output()
	dataUpdated = new EventEmitter<IUpdatedReferenceConversationDetails>(null);

	@Output()
	resetModalData = new EventEmitter<boolean>();

	@Output()
	newScreenshotAdded = false;
	showCompletePost: boolean;
	postData: ConversationModel;
	PostDetails: IPostUpdatedDetails = {};

	constructor(private utilityService: UtilityService, private changeDetector: ChangeDetectorRef) {}

	ngOnChanges(change: SimpleChanges) {
		this.changeDetector.detectChanges();
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	resetModalDataData() {
		const element = document.getElementById('closeReferenceConversationButton') as HTMLButtonElement;
		element.click();
		this.resetModalData.emit(true);
	}

	// eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
	ngOnInit(): void {}

	onNewScreenshotAdded(newData) {
		this.data.conversationList.push(newData);
	}

	onUpdatingPostOrderAndVisiblity(posts: any[]) {
		this.data.conversationList = this.data.conversationList?.sort((postA, postB) => {
			if (postA.order && postB.order) {
				return postA.order - postB.order;
			}
			if (postA.order) {
				-1;
			}
			return 1;
		});
		posts.forEach(post => {
			this.PostDetails[post.id] = {order: post.order, visibleToBrand: post.visibleToBrand};
		});

		this.onChangingDefaultConfigurations();
	}

	onChaningVisiblity(event: MatSlideToggleChange) {
		this.data.visibleToBrand = event.checked;
		this.onChangingDefaultConfigurations();
	}

	onChangingDefaultConfigurations() {
		const obj: IUpdatedReferenceConversationDetails = {
			brandName: this.data.brandName,
			section: this.data.section,
			stage: this.data.stage,
			visibleToBrand: this.data.visibleToBrand,
			postDetails: this.PostDetails
		};
		this.dataUpdated.emit(obj);
	}
}
