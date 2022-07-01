import {HttpErrorResponse} from '@angular/common/http';
import {
	ChangeDetectorRef,
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
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {CreateCampaignService} from '@csAdminModule/services/create-campaign.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {defer, from, fromEvent, Observable, Subscription} from 'rxjs';
import {catchError, debounceTime, delay, map, mergeMap, retryWhen, shareReplay} from 'rxjs/operators';

import {CampaignModelv3} from '../cmcreport-v3/cmcreport-v3.component';
import {
	BrandLevelFilter,
	PopupLevelFilter,
	TopPerformingPost,
	TopPerformingPostSection
} from '../top-performing-post/top-performing-post.component';
import {INewScreenshotAdded} from '../upload-screenshot/upload-screenshot.component';

@Component({
	selector: 'app-all-posts',
	templateUrl: './all-posts.component.html',
	styleUrls: ['./all-posts.component.scss']
})
export class AllPostsComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
	@Input()
	campaign: CampaignModelv3;

	@Input()
	isBrandLoggedIn = false;

	@Input()
	posts: TopPerformingPost[];

	@Input()
	supportingText: string;

	@Input()
	visibleToBrand = false;

	@Input()
	campaignGroups: any[];

	@Output()
	updatedValue = new EventEmitter<TopPerformingPostSection>();

	@ViewChild('topPostBasicContainer', {static: true}) brandViewImageContainer: ElementRef;
	@ViewChild('topPerformingPostPopupContainer', {static: true}) brandViewPopupImageContainer: ElementRef;

	baseLevelFilteredPost: TopPerformingPost[];

	popupFilteredPosts: TopPerformingPost[];

	editingSupportingText = false;

	form: FormGroup;

	isFormFirstTimeSubmitted = false;

	brandLevelFilters: BrandLevelFilter = {
		showAdminPosts: true,
		showUGCPost: true,
		from: 0,
		end: 10,
		limit: 10
	};

	EditPopupLevelFilters: PopupLevelFilter = {
		showAdminPosts: true,
		showUGCPost: true,
		from: 0,
		end: 10,
		limit: 10,
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

	sectionName = 'allPosts';

	modalId = this.randomUuid();
	baseLevelScrollSubscription: Subscription;
	editPopupScrollSubscription: Subscription;
	screenshotsObservables = {};
	screenshotsObservablesErrors = {};
	screenshotProcessed = {};
	constructor(
		injector: Injector,
		private formBuilder: FormBuilder,
		private createCampaignService: CreateCampaignService,
		private accountService: AccountServiceService,
		private changeDetector: ChangeDetectorRef
	) {
		super(injector);
	}

	get totalPostVisibleToBrand() {
		return this.posts?.filter(post => post.visibleToBrand).length || 0;
	}

	get totalFailedPosts() {
		return Object.keys(this.screenshotsObservablesErrors).length || 0;
	}

	get FailedPosts() {
		return Object.keys(this.screenshotsObservablesErrors)?.map(id => this.screenshotsObservablesErrors[id]) || [];
	}

	onClickingBackButton() {}

	ngOnInit(): void {
		this.setAllPostLists(this.posts);

		this.createForm(this.posts, this.supportingText, this.visibleToBrand);
		this.listenToTopPerformaingPostEditScroll();
	}

	onNewScreenshotAdded(event: INewScreenshotAdded) {
		if (this.posts) {
			this.posts.push({...event, visibleToBrand: true} as unknown as TopPerformingPost);
		}
		this.emitUpdatedDataToParent();
		if (this.brandLevelFilters.end >= this.baseLevelFilteredPost?.length) {
			this.brandLevelFilters.end = this.brandLevelFilters.end + 1;
		}
		this.updateBrandLevelFilters(this.brandLevelFilters);
		if (this.EditPopupLevelFilters.end >= this.popupFilteredPosts?.length) {
			this.EditPopupLevelFilters.end = this.EditPopupLevelFilters.end + 1;
		}

		this.updateEditPopupLevelFilters(this.EditPopupLevelFilters);
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

		this.updateBrandLevelFilters(this.brandLevelFilters);
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

		this.updateBrandLevelFilters(this.brandLevelFilters);
	}

	ngOnDestroy() {
		this.baseLevelScrollSubscription?.unsubscribe();
		this.editPopupScrollSubscription?.unsubscribe();
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.posts && change.posts.currentValue !== change.posts.previousValue) {
			this.setAllPostLists(change.posts.currentValue);
		}
	}

	updateBrandLevelFilters(newFilter: Partial<BrandLevelFilter>) {
		this.brandLevelFilters = {...this.brandLevelFilters, ...newFilter};
		if (!this.posts?.length) {
			return;
		}
		this.baseLevelFilteredPost = this.posts
			.filter(post => {
				if (!post.visibleToBrand) {
					return false;
				}

				if (this.brandLevelFilters.showAdminPosts && this.brandLevelFilters.showUGCPost) {
					return true;
				}
				if (this.brandLevelFilters.showAdminPosts) {
					if (post['isAdminPost'] != 'true') {
						return false;
					}
				}
				if (this.brandLevelFilters.showUGCPost) {
					if (post['isAdminPost'] && post['isAdminPost'] != 'false') {
						return false;
					}
				}
				return true;
			})
			.sort((postA, postB) => postA.order - postB.order);
	}

	updateEditPopupLevelFilters(newFilter: Partial<BrandLevelFilter>) {
		this.EditPopupLevelFilters = {...this.EditPopupLevelFilters, ...newFilter};
		if (!this.posts?.length) {
			return;
		}
		this.popupFilteredPosts = this.posts
			.filter(post => {
				if (this.EditPopupLevelFilters.startDate) {
					if (new Date(post.postCreatedAtUTC || post.createdAtUTC) < this.EditPopupLevelFilters.startDate) {
						return false;
					}
				}
				if (this.EditPopupLevelFilters.showAdminPosts && !this.EditPopupLevelFilters.showUGCPost) {
					if (post['isAdminPost'] != 'true') {
						return false;
					}
				}
				if (this.EditPopupLevelFilters.showUGCPost && !this.EditPopupLevelFilters.showAdminPosts) {
					if (post['isAdminPost'] && post['isAdminPost'] != 'false') {
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
					if (post.isSystemGenerated) {
						return false;
					}
				}
				if (this.EditPopupLevelFilters.showIsSystemGeenrated && !this.EditPopupLevelFilters.showManuallyUploaded) {
					if (!post.isSystemGenerated) {
						return false;
					}
				}

				if (this.EditPopupLevelFilters.showPost && !this.EditPopupLevelFilters.showComment) {
					if (!post.isSystemGenerated) {
						return false;
					}
				}

				if (this.EditPopupLevelFilters.showComment && !this.EditPopupLevelFilters.showPost) {
					if (post.isSystemGenerated || post.type === 'Post') {
						return false;
					}
				}

				if (this.EditPopupLevelFilters.searchText?.trim()) {
					if (!post.groupName?.includes(this.EditPopupLevelFilters.searchText)) {
						return false;
					}
				}

				return true;
			})
			.sort((postA, postB) => postA.order - postB.order);
		this.changeDetector.detectChanges();
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

	onSubmittingSuportingText() {
		this.editingSupportingText = false;
		this.supportingText = this.form.value.supportingText;
		this.emitUpdatedDataToParent();
	}

	saveUpdatedDetails() {
		this.emitUpdatedDataToParent();
	}

	resetForm() {
		this.form.get('supportingText').setValue(this.supportingText);
		this.editingSupportingText = false;
	}

	getScreenshot(post: TopPerformingPost): Observable<any> {
		if (!this.screenshotsObservables[post.sourceId]) {
			const observable = defer(() =>
				from(
					this.createCampaignService.getScreenshotsFromPostIds({
						sourceId: post.sourceId,
						commentEnable: false,
						skipScreenshot: true
					})
				)
			).pipe(
				map(response => {
					if (response?.error) {
						this.screenshotsObservablesErrors[post.sourceId] = post;
					}
					if (response instanceof HttpErrorResponse) {
						throw response;
					}
					this.screenshotProcessed[post.sourceId] = true;

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
			this.screenshotsObservables[post.sourceId] = observable;
		}
		return this.screenshotsObservables[post.sourceId];
	}

	private listenToTopPerformaingPostScroll() {
		this.baseLevelScrollSubscription = fromEvent(this.brandViewImageContainer.nativeElement, 'scroll')
			.pipe(
				debounceTime(200),
				map((event: Event) => event.target)
			)
			.subscribe((obj: HTMLElement) => {
				if (!this.isNearBottom(obj)) {
					return;
				}
				if (this.brandLevelFilters.end >= this.posts?.length) {
					return;
				}
				const newEnd = Math.min(this.brandLevelFilters.limit + this.brandLevelFilters.end, this.posts.length);
				this.updateBrandLevelFilters({...this.brandLevelFilters, end: newEnd});
			});
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

	private createForm(post: TopPerformingPost[], supportingText: string, visibleToBrand: boolean) {
		this.form = this.formBuilder.group({
			supportingText: [supportingText || '', [Validators.required]],
			visibleToBrand: [visibleToBrand || true],
			searchText: ['']
		});

		this.form.get('visibleToBrand').valueChanges.subscribe(newValue => {
			setTimeout(() => this.emitUpdatedDataToParent());
		});
	}

	private emitUpdatedDataToParent() {
		const obj = {...this.form.value, posts: this.posts};
		this.updatedValue.emit(obj);
	}

	private async setAllPostLists(list: TopPerformingPost[]) {
		this.popupFilteredPosts = list;
		this.setBaseLevelPosts(list);
	}

	private setBaseLevelPosts(list: TopPerformingPost[]) {
		this.popupFilteredPosts = list
			?.filter(post => {
				if (!this.isBrandLoggedIn) {
					return true;
				}
				return post.visibleToBrand;
			})
			.sort((postA, postB) => +(postA.order || 0) - +(postB.order || 0));
	}
}
