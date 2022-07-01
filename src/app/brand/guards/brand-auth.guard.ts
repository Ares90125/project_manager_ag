import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {BrandService} from '@brandModule/services/brand.service';
import {UserTypeEnum} from '@sharedModule/enums/user-type.enum';
import {UserService} from '@sharedModule/services/user.service';
import {LoggerService} from '@sharedModule/services/logger.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';

@Injectable()
export class BrandAuthGuard implements CanActivate {
	constructor(
		private readonly router: Router,
		private userService: UserService,
		private loggerService: LoggerService,
		private readonly brandService: BrandService
	) {}

	async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>(resolve => {
			try {
				this.userService.isLoggedIn.subscribe(async isLoggedInValue => {
					const currentUser = await this.userService.getUser();
					if (!isLoggedInValue) {
						return;
					} else if (isLoggedInValue && currentUser.userType === UserTypeEnum.BrandMember) {
						this.brandService.selectedBrand.subscribe(brand => {
							if (!brand) {
								return;
							}
							resolve(true);
						});
					} else {
						this.router.navigate(['/brand-login'], {queryParams: {returnUrl: state.url}});
						resolve(false);
					}
				});
			} catch (e) {
				this.loggerService.error(
					e,
					'Error while redirecting to brand module',
					{},
					'BrandAuthGuard',
					'canActivate',
					LoggerCategory.AppLogs
				);
			}
		});
	}
}
