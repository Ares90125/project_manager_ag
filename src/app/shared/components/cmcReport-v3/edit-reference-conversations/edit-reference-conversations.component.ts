import {HttpErrorResponse} from '@angular/common/http';
import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {FileService} from '@sharedModule/services/file.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import {defer, from, fromEvent, Observable, Subscription} from 'rxjs';
import {catchError, debounceTime, delay, map, mergeMap, retryWhen, shareReplay} from 'rxjs/operators';

import {
	BrandLevelFilter,
	PopupLevelFilter,
	TopPerformingPost
} from '../top-performing-post/top-performing-post.component';

@Component({
	selector: 'app-edit-reference-conversations',
	templateUrl: './edit-reference-conversations.component.html',
	styleUrls: ['./edit-reference-conversations.component.scss']
})
export class EditReferenceConversationsComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
	@Input()
	isBrandLoggedIn = false;

	@Input()
	posts: any[];

	@Output()
	updatedValue = new EventEmitter<TopPerformingPost[]>();

	@ViewChild('topPostBasicContainer', {static: true}) brandViewImageContainer: ElementRef;
	@ViewChild('topPerformingPostPopupContainer', {static: true}) brandViewPopupImageContainer: ElementRef;

	@Input()
	visibleToBrand: boolean = false;

	baseLevelFilteredPost: TopPerformingPost[];

	popupFilteredPosts: any[];

	form: FormGroup;

	isFormFirstTimeSubmitted = false;

	EditPopupLevelFilters: PopupLevelFilter = {
		showAdminPosts: true,
		showUGCPost: true,
		from: 0,
		end: 15,
		limit: 15,
		startDate: null,
		endDate: null,
		showVisibleToBrand: true,
		showComment: true,
		showManuallyUploaded: true,
		showPost: true,
		showIsSystemGeenrated: true,
		searchText: null
	};

	showUploadComponent = false;

	sectionName = 'topPerformingPost';
	editPopupScrollSubscription: Subscription;
	screenshotsObservables = {};
	screenshotsObservablesErrors = {};
	screenshotsProcessed = {};

	constructor(
		injector: Injector,
		private readonly fileService: FileService,
		private formBuilder: FormBuilder,
		private createCampaignService: CreateCampaignService,
		private loggerService: LoggerService,
		private accountService: AccountServiceService
	) {
		super(injector);
	}

	get totalPostVisibleToBrand() {
		return this.posts?.filter(post => post.visibleToBrand).length || 0;
	}

	ngOnInit(): void {
		this.setAllPostLists(this.posts);
		this.createForm(this.posts);
		this.listenToTopPerformaingPostEditScroll();
	}

	onFocusOfffFromOrderInput(postToUpdate: TopPerformingPost, element: HTMLInputElement, id: string) {
		let newOrder = element.valueAsNumber;
		if (!newOrder || isNaN(newOrder)) {
			document.getElementById(id)['value'] = postToUpdate.order + '';
			element.value = postToUpdate.order + '';
			return;
		}
		if (newOrder > this.totalPostVisibleToBrand) {
			element.value = this.totalPostVisibleToBrand + '';
			newOrder = this.totalPostVisibleToBrand;
		}
		if (newOrder < 1) {
			element.value = 1 + '';
			newOrder = 1;
		}
		if (postToUpdate.order === newOrder) {
			return;
		}
		const originalOrder = postToUpdate.order;

		// If post is moved to higher number / last in the order
		if (originalOrder < newOrder) {
			this.posts.forEach((post, i) => {
				if (post.id === postToUpdate.id) {
					post.order = newOrder;
					return;
				}
				if (post.order < originalOrder || post.order > newOrder) {
					return;
				}
				if (post.order > originalOrder && post.order <= newOrder) {
					post.order = post.order - 1;
				}
			});
		}

		// If post is moved to lower number / in front of order.
		if (originalOrder > newOrder) {
			this.posts.forEach((post, i) => {
				if (post.id === postToUpdate.id) {
					post.order = newOrder;
					return;
				}

				if (post.order < newOrder || post.order > originalOrder) {
					return;
				}
				post.order = post.order + 1;
			});
		}

		this.emitUpdatedDataToParent();
	}

	onTogglePostVisibility(postUpdated: TopPerformingPost, event: MatSlideToggleChange) {
		if (event.checked) {
			postUpdated.order = this.totalPostVisibleToBrand + 1;
			postUpdated.visibleToBrand = true;
		} else {
			const originalOrder = postUpdated.order;
			postUpdated.order = null;
			postUpdated.visibleToBrand = false;
			this.posts.forEach(post => {
				if (post.order && post.order > originalOrder) {
					post.order = post.order - 1;
				}
			});
		}
		this.emitUpdatedDataToParent();
	}

	ngOnDestroy() {
		this.editPopupScrollSubscription.unsubscribe();
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.posts && change.posts.currentValue !== change.posts.previousValue) {
			this.setAllPostLists(change.posts.currentValue);
		}
	}

	updateEditPopupLevelFilters(newFilter: Partial<BrandLevelFilter>) {
		this.EditPopupLevelFilters = {...this.EditPopupLevelFilters, ...newFilter};
		if (!this.posts?.length) {
			return;
		}

		this.popupFilteredPosts = this.posts.filter(post => {
			if (this.EditPopupLevelFilters.startDate) {
				if (new Date(post.postCreatedAtUTC || post.createdAtUTC) < this.EditPopupLevelFilters.startDate) {
					return false;
				}
			}

			if (this.EditPopupLevelFilters.endDate) {
				if (this.EditPopupLevelFilters.endDate < new Date(post.postCreatedAtUTC || post.createdAtUTC)) {
					return false;
				}
			}

			if (this.EditPopupLevelFilters.showVisibleToBrand) {
				if (!post.visibleToBrand) {
					return false;
				}
			}
			if (this.EditPopupLevelFilters.showManuallyUploaded && !this.EditPopupLevelFilters.showIsSystemGeenrated) {
				if (!post['isManuallyUploaded']) {
					return false;
				}
			}
			if (this.EditPopupLevelFilters.showIsSystemGeenrated && !this.EditPopupLevelFilters.showManuallyUploaded) {
				if (post['isManuallyUploaded']) {
					return false;
				}
			}

			if (this.EditPopupLevelFilters.showPost && !this.EditPopupLevelFilters.showComment) {
				if (post.contenType !== 'Post' && post.type !== 'Post') {
					return false;
				}
			}

			if (this.EditPopupLevelFilters.showComment && !this.EditPopupLevelFilters.showPost) {
				if (post.contenType !== 'Comment' && post.type !== 'Comment') {
					return false;
				}
			}

			if (this.EditPopupLevelFilters.searchText?.trim()) {
				if (!post.groupName?.includes(this.EditPopupLevelFilters.searchText)) {
					return false;
				}
			}

			return true;
		});
	}

	onSelectingDateRange(startDate: string, endDate: string) {
		this.EditPopupLevelFilters.startDate = startDate ? new Date(startDate) : null;
		this.EditPopupLevelFilters.endDate = endDate ? new Date(endDate) : null;
		this.updateEditPopupLevelFilters(this.EditPopupLevelFilters);
	}

	onClickingSearchPost() {
		this.EditPopupLevelFilters.searchText = this.form.value.searchText;
		this.updateEditPopupLevelFilters(this.EditPopupLevelFilters);
	}

	cancelContentEdit() {}

	saveUpdatedDetails() {
		this.emitUpdatedDataToParent();
	}

	resetForm() {}

	async testing() {
		const response = await this.createCampaignService.getScreenshotsFromPostIds({
			sourceId: '1057693781056222_2058350290990561',
			commentEnable: false,
			skipScreenshot: true
		});
	}

	getScreenshot(id: string): Observable<any> {
		if (!this.screenshotsObservables[id]) {
			const observable = defer(() =>
				from(
					this.createCampaignService.getScreenshotsFromPostIds({
						sourceId: id,
						commentEnable: false,
						skipScreenshot: true
					})
				)
			).pipe(
				map(response => {
					if (response?.error) {
						this.screenshotsObservablesErrors[id] = response;
					}
					if (response instanceof HttpErrorResponse) {
						throw response;
					}
					this.screenshotsProcessed[id] = true;
					return response;
				}),
				retryWhen(errors => {
					return errors.pipe(
						delay(1000),
						mergeMap((error, index) => from(this.accountService.refreshToken()))
					);
				}),

				catchError(err => {
					return null;
				}),
				shareReplay()
			);
			this.screenshotsObservables[id] = observable;
		}
		return this.screenshotsObservables[id];
	}

	private listenToTopPerformaingPostEditScroll() {
		this.editPopupScrollSubscription = fromEvent(this.brandViewPopupImageContainer.nativeElement, 'scroll')
			.pipe(
				debounceTime(200),
				map((event: Event) => event.target)
			)
			.subscribe((obj: HTMLElement) => {
				if (!this.isNearBottom(obj)) {
					return;
				}
				if (this.EditPopupLevelFilters.end >= this.posts?.length) {
					return;
				}
				const newEnd = Math.min(this.EditPopupLevelFilters.limit + this.EditPopupLevelFilters.end, this.posts.length);
				this.updateEditPopupLevelFilters({...this.EditPopupLevelFilters, end: newEnd});
			});
	}

	private isNearBottom(element: HTMLElement) {
		return element.offsetHeight + element.scrollTop >= element.scrollHeight - 450;
	}

	private createForm(post: TopPerformingPost[]) {
		this.form = this.formBuilder.group({
			searchText: ['']
		});
	}

	private emitUpdatedDataToParent() {
		this.updatedValue.emit(this.posts);
	}

	private async setAllPostLists(list: TopPerformingPost[]) {
		this.popupFilteredPosts = list;
		this.setBaseLevelPosts(list);
	}

	private setBaseLevelPosts(list: TopPerformingPost[]) {
		this.popupFilteredPosts = list
			?.filter(post => {
				// if (!this.isBrandLoggedIn) return true;
				return post.visibleToBrand;
			})
			.sort((postA, postB) => postA.order - postB.order);
	}
}
