import {AfterViewInit, Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {takeUntil} from 'rxjs/operators';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {DateTime} from '@sharedModule/models/date-time';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
	selector: 'app-group-profile-key-stats',
	templateUrl: './group-profile-key-stats.component.html',
	styleUrls: ['./group-profile-key-stats.component.scss']
})
export class GroupProfileKeyStatsComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() resetHook: EventEmitter<boolean>;
	@Input() groupProfilePage: GroupProfilePageModel;
	@Input() isEditable: boolean;
	@Input() areGroupMetricsAvailable: boolean;
	@Output() saveKeyStatisticsSection = new EventEmitter();
	@ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

	isSaveButtonEnabled: boolean = false;
	isSaveInProgress = false;
	welcomeTitle: string = 'Show or hide elements';
	welcomeContent: string = 'You are able to hide certain elements from each section.';
	viewToolTip: boolean = false;
	initialShowActivityRate;
	initialShowEngagementRate;
	initialShowMonthlyConversations;
	tooltipToBeShown;
	selectedGroup;
	openKeyStatsModal: boolean = false;
	isExpanded: boolean = false;
	showNoFilledBorder: boolean = false;
	showKeyStatsVideo: boolean = false;
	constructor(injector: Injector, public readonly groupProfilePageService: GroupProfilePagesService) {
		super(injector);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.groupProfilePageService.selectedGroupForProfilePage$.pipe(takeUntil(this.destroy$)).subscribe(group => {
			if (!group) {
				return;
			}
			this.selectedGroup = group;
			const selectedMetricDate = new DateTime(this.selectedGroup.metricsAvailableUntilUTC).format('MMMM D YYYY');
			this.tooltipToBeShown = `The key stats are calculated as per data available until ${selectedMetricDate}`;
		});
		this.resetHook?.pipe(takeUntil(this.destroy$)).subscribe(() => (this.isSaveInProgress = false));
		this.initialShowActivityRate = this.groupProfilePage.showActivityRate;
		this.initialShowEngagementRate = this.groupProfilePage.showEngagementRate;
		this.initialShowMonthlyConversations = this.groupProfilePage.showMonthlyConversations;
		this.groupProfilePageService.profilePageOnboardingTracker
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => (this.viewToolTip = value === 2));
	}

	reset() {
		this.initialShowActivityRate = this.groupProfilePage.showActivityRate;
		this.openKeyStatsModal = false;
		this.initialShowEngagementRate = this.groupProfilePage.showEngagementRate;
		this.initialShowMonthlyConversations = this.groupProfilePage.showMonthlyConversations;
	}

	isSaveEnabled() {
		return (
			this.groupProfilePage.showActivityRate !== this.initialShowActivityRate ||
			this.groupProfilePage.showEngagementRate !== this.initialShowEngagementRate ||
			this.groupProfilePage.showMonthlyConversations !== this.initialShowMonthlyConversations
		);
	}

	updateKeysStats() {
		this.isSaveInProgress = true;
		this.groupProfilePage.isKeyStatisticsSectionChanged = true;
		this.saveKeyStatisticsSection.emit();
	}

	openStatsHelpVideo(){
		this.showKeyStatsVideo = true;
	}

	closeVideoPlayer(){
		this.showKeyStatsVideo = false;
	}

	ngAfterViewInit() {
		this.pannels.forEach((x, index) => {
			if(!this.groupProfilePage.keyStats || Object.keys(this.groupProfilePage.keyStats)?.length === 0) {
				this.showNoFilledBorder = true;
			}

			if(!this.groupProfilePage.keyStats || Object.keys(this.groupProfilePage.keyStats)?.length === 0 || this.groupProfilePageService.checkIfAllSectionNeedToBeExpanded(this.groupProfilePage)) {
				this.isExpanded = true;
				x.hideToggle = true;
				x.expanded = true;
			}
			x.expandedChange.subscribe(data => {
				if(data){
					this.isExpanded = true;
					x.hideToggle = true;
				} else {
					this.isExpanded = false;
					x.hideToggle = false;
				}
			})
		});
	}
}
