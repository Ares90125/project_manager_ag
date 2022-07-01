import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {PublishService} from '@groupAdminModule/_services/publish.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupModel} from '@sharedModule/models/group.model';
import {UtilityService} from '@sharedModule/services/utility.service';
import {AlertService} from '@sharedModule/services/alert.service';
import {Router} from '@angular/router';

declare var window: any;
@Component({
	selector: 'app-group-unanswered',
	templateUrl: './group-unanswered.component.html',
	styleUrls: ['./group-unanswered.component.scss']
})
export class GroupUnansweredComponent extends BaseComponent implements OnInit, OnDestroy {
	group: GroupModel;
	lastSevenDaysUnansweredPosts = [];
	todayUnansweredPosts = [];
	isLoading = false;

	constructor(
		injector: Injector,
		private publishService: PublishService,
		private alertService: AlertService,
		private utilityService: UtilityService,
		public router: Router
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				if (this.group && this.group?.id === group.id) {
					return;
				}
				this.group = group;
				super.setPageTitle(`GA - ${this.group.name} - Unanswered Posts`, 'Unanswered Posts', {
					group_id: this.group.id,
					group_name: this.group.name,
					group_fb_id: this.group.fbGroupId
				});
				this.getZeroCommentPostsByGroupId();
			})
		);
	}

	async getZeroCommentPostsByGroupId() {
		this.isLoading = true;
		await this.group.getZeroCommentPostsByGroupId(this.publishService);
		this.todayUnansweredPosts = this.group.unansweredPostsForToday;
		this.lastSevenDaysUnansweredPosts = this.group.unansweredPostsForLastSevenDays;
		window.Cypress && (window.todaysUnansweredPosts = this.todayUnansweredPosts);
		this.isLoading = false;
	}

	async showUpdatedImageFromFacebook(event, postId) {
		return await this.utilityService.getUpdatedImageFromFacebook(event, postId);
	}

	async markUnansweredPostAsRead($event, postSelected, timePeriod: 'lastSevenDays' | 'today') {
		postSelected.isMarkingRead = true;
		this.recordButtonClick($event);
		this[timePeriod + 'UnansweredPosts'] = this[timePeriod + 'UnansweredPosts'].filter(
			post => post.id !== postSelected.id
		);
		delete postSelected.isMarkingRead;
		try {
			await this.publishService.markUnansweredPostAsRead(postSelected.id, this.group.id);
		} catch {
			this.isLoading = true;
			delete postSelected.isMarkingRead;
			setTimeout(() => {
				this.alertService.error(
					'Error while processing your request',
					'We are unable to process your request at this moment. Please try again later.'
				);
				this.isLoading = false;
			}, 200);
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
