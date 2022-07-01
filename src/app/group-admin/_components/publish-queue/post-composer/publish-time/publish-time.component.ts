import {
	Component,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {PublishService} from '@groupAdminModule/_services/publish.service';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {PostRecommendationModel} from '@groupAdminModule/models/post-recommendation.model';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupModel} from '@sharedModule/models/group.model';
import {DateTime} from '@sharedModule/models/date-time';
import {GroupsService} from '@sharedModule/services/groups.service';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {AppDateAdapter, DATE_FORMATS} from '@sharedModule/components/custom-date-format.component';

@Component({
	selector: 'app-publish-time',
	templateUrl: './publish-time.component.html',
	styleUrls: ['./publish-time.component.scss'],
	providers: [
		{provide: DateAdapter, useClass: AppDateAdapter},
		{provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}
	]
})
export class PublishTimeComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
	group: GroupModel;
	@Input() initialGroupId;
	@Output() publishPost = new EventEmitter();
	@Output() postToBePublishedAtTime = new EventEmitter();
	@Input() selectedPostOption;
	@Input() postToBeEdited;
	@Input() enablePublishPostButton;
	@Input() numOfGroupSelected;
	@Input() autoRecommendation;
	@Input() publishInProgress;
	@Input() selectedGroups;
	recommendationTimings: any[];
	timeOptions = [];
	private currentDay: string;
	private nextDay: string;
	publishMinDate: Date;
	publishMaxDate: Date;
	recommendationDate: FormControl;
	publishTimezone: any;
	publishTime: any;
	recommendedTimeFromUrl;
	recommendedDateFromUrl;
	nextBestTimeRecommendation: PostRecommendationModel;
	recommendation;

	constructor(
		injector: Injector,
		private publishService: PublishService,
		private route: ActivatedRoute,
		public groupsService: GroupsService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.route.queryParams.subscribe(params => {
			this.recommendedTimeFromUrl = params['time'];
			this.recommendedDateFromUrl = new DateTime(params['date'], 'DD/MM/YYYY').format('MM/DD/YYYY');
		});
		this.setInitialSchedule();
		await this.loadAutoRecommendations();
		this.triggerPostOptionChange();
		this.subscriptionsToDestroy.push(
			this.groupsService.groups.subscribe(groups => {
				if (!groups) {
					return;
				}

				this.group = groups.filter(group => group.id === this.initialGroupId)[0];
			})
		);
	}

	async loadAutoRecommendations() {
		this.recommendation = await this.publishService.getRecommendation(this.initialGroupId);
		this.recommendationTimings = [];
		if (!this.recommendation) {
			return;
		}

		if (this.publishService.dateSelectedFromRecommendation && this.publishService.timeSelectedFromRecommendation) {
			this.selectedPostOption = 'Custom';
			this.publishTime = this.publishService.timeSelectedFromRecommendation;
			this.recommendationDate = new FormControl(this.publishService.dateSelectedFromRecommendation);
		}
		this.currentDay = new DateTime().format('dddd');
		this.nextDay = new DateTime().add(1, 'day').format('dddd');
		const recommendationForToday = JSON.parse(this.recommendation.timings)[this.currentDay];
		const recommendationForNextDay = JSON.parse(this.recommendation.timings)[this.nextDay];
		const dateTimeNow = new DateTime();
		let parsedTiming = null;
		let parsedTimingString = null;
		recommendationForToday.forEach(timings => {
			parsedTiming = new DateTime(0).add(timings, 'hours').local();
			const parsedDateAndTime = new DateTime(dateTimeNow.format('MM-DD-YYYY') + ' ' + parsedTiming.format('hh:mm A'));
			if (dateTimeNow.isBefore(parsedDateAndTime.dayJsObj)) {
				parsedTimingString = parsedTiming.format('hh:mm A');
				this.recommendationTimings.push({
					time: parsedTimingString,
					day: 'Today',
					dateAndTime: dateTimeNow.format('MM-DD-YYYY') + ' ' + parsedTimingString
				});
			}
		});
		if (this.recommendationTimings.length < 2) {
			recommendationForNextDay.forEach(timings => {
				parsedTiming = new DateTime(0).add(timings, 'hours').local();
				parsedTimingString = parsedTiming.format('hh:mm A');
				this.recommendationTimings.push({
					time: parsedTimingString,
					day: 'Tomorrow',
					dateAndTime: new DateTime().add(1, 'day').format('MM-DD-YYYY') + ' ' + parsedTimingString
				});
			});
		}
	}

	publishPostTrigger(event) {
		for (const id in this.selectedGroups) {
			if (this.selectedGroups.hasOwnProperty(id)) {
				const grp = this.selectedGroups[id];
				this.recordButtonClick(event, grp, this.selectedPostOption);
			}
		}

		this.emitPostToBePublishedAtTime();
		this.publishPost.emit({value: event});
	}

	private emitPostToBePublishedAtTime() {
		this.postToBePublishedAtTime.emit({
			toBePublishedAtTime: this.getToBePublishedOnTicks(),
			toBeShownPublishedAtTime: this.publishTimeToBeShownTime(),
			toBePublishedType: this.selectedPostOption,
			nextBestTime: this.recommendationTimings?.length > 0 ? this.recommendationTimings[0].dateAndTime : null,
			nextBestDayAndTime:
				this.recommendationTimings?.length > 0
					? this.recommendationTimings[0].day + ', ' + this.recommendationTimings[0].time
					: null
		});
	}

	triggerPostOptionChange() {
		this.emitPostToBePublishedAtTime();
		this.publishService.selectedPostOption = this.selectedPostOption;
	}

	publishTimeToBeShownTime() {
		if (this.selectedPostOption === 'Publish now') {
			return 'Publish now';
		} else if (this.selectedPostOption === 'FirstScheduleTime') {
			return this.recommendationTimings[0].day + ' ' + this.recommendationTimings[0].time;
		} else if (this.selectedPostOption === 'SecondScheduleTime') {
			return this.recommendationTimings[1].day + ' ' + this.recommendationTimings[1].time;
		} else if (this.selectedPostOption === 'Auto-schedule') {
			return 'Auto-schedule';
		} else {
			return new DateTime(this.recommendationDate.value).format('DD MMM') + ' ' + this.publishTime;
		}
	}

	getToBePublishedOnTicks(): number {
		let dateString;
		switch (this.selectedPostOption) {
			case 'Publish now':
				return new DateTime().utc().unix();
			case 'FirstScheduleTime':
				dateString = this.recommendationTimings[0].dateAndTime;
				return new DateTime(dateString, 'MM-DD-YYYY h:mm A').utc().unix();
			case 'SecondScheduleTime':
				dateString = this.recommendationTimings[1].dateAndTime;
				return new DateTime(dateString, 'MM-DD-YYYY h:mm A').utc().unix();
			case 'Custom':
				dateString = new DateTime(this.recommendationDate.value).format('MM-DD-YYYY') + ' ' + this.publishTime;
				return new DateTime(dateString, 'MM-DD-YYYY h:mm A').utc().unix();
			case 'Auto-schedule':
				dateString = this.recommendationTimings[0].dateAndTime;
				return new DateTime(dateString, 'MM-DD-YYYY h:mm A').utc().unix();
		}
	}

	setInitialSchedule() {
		const dateTimeNow = new DateTime();
		this.timeOptions = this.publishService.getTimesOnWhichPostCanBePublished();
		let time;
		if (this.postToBeEdited) {
			time = new DateTime().parseUnix(this.postToBeEdited.toBePostedAtUTCTicks);
			time.subtract(time.minute() % 15, 'minutes');
		} else if (this.autoRecommendation && this.autoRecommendation.toBePostedAtUTCTicks) {
			time = new DateTime().parseUnix(this.autoRecommendation.toBePostedAtUTCTicks);
			time.subtract(time.minute() % 15, 'minutes');
			this.selectedPostOption = 'Custom';
		} else {
			time = new DateTime();
			time.add(15 - (time.minute() % 15), 'minutes');
		}
		this.publishMinDate = new DateTime().toDate();
		this.publishMaxDate = new DateTime().parseUnix(dateTimeNow.valueOf() + 30 * 86400000).toDate();
		if (this.recommendedTimeFromUrl && this.recommendedDateFromUrl) {
			this.selectedPostOption = 'Custom';
			this.publishTime = this.recommendedTimeFromUrl;
			this.recommendationDate = new FormControl(new DateTime(this.recommendedDateFromUrl).toDate());
		} else {
			this.publishTime = time.format('h:mm A');
			this.recommendationDate = new FormControl(time.toDate());
			this.publishTimezone = time.format('Z');
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.numOfGroupSelected) {
			if (
				changes.numOfGroupSelected?.currentValue > 1 &&
				(this.selectedPostOption === 'FirstScheduleTime' || this.selectedPostOption === 'SecondScheduleTime')
			) {
				this.selectedPostOption = 'Auto-schedule';
			}
			if (changes.numOfGroupSelected.currentValue === 1 && this.selectedPostOption === 'Auto-schedule') {
				this.selectedPostOption = 'FirstScheduleTime';
			}
			if (this.renderedOn === 'Mobile') {
				this.triggerPostOptionChange();
			}
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
