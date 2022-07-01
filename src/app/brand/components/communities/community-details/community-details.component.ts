import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from 'src/app/shared/components/base.component';
import {GroupModel} from 'src/app/shared/models/group.model';
import {GroupsService} from 'src/app/shared/services/groups.service';
import {MatDialog} from '@angular/material/dialog';
import {BrandService} from 'src/app/brand/services/brand.service';

@Component({
	selector: 'app-community-details',
	templateUrl: './community-details.component.html',
	styleUrls: ['./community-details.component.scss']
})
export class CommunityDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
	group: GroupModel;

	constructor(
		injector: Injector,
		private groupsService: GroupsService,
		private readonly router: Router,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private brandService: BrandService
	) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.route.params.subscribe(async params => {
				const id = params['id'];
				this.setPageAndLog(id);
				this.group = await this.groupsService.getGroup(id);
			})
		);
	}

	async setPageAndLog(groupId) {
		this.subscriptionsToDestroy.push(
			this.brandService.brands.subscribe(brand => {
				if (!brand) {
					return;
				}

				super.setPageTitle('Community Details', 'Community Details', {
					brandId: brand[0].id,
					brandName: brand[0].name,
					group_id: groupId
				});
			})
		);
	}

	async goBack() {
		this.router.navigate(['/brand/manage-communities']);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
