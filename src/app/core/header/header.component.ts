import {Component, DoCheck, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from "../../shared/user.service";
import {AdminService} from "../admin/shared/admin.service";
import {DataTransferService} from "../../shared/data-transfer.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {
  public  isActiveUser: boolean;
  public  isActiveAdmin: boolean;
  constructor(private http: HttpClient,
              private translate: TranslateService,
              private transfer: DataTransferService,
              private userService: UserService,
              private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.isAuthenticated().subscribe(
      () => {
        this.isActiveAdmin = true;
        this.isActiveUser = true;
      }
    );

    this.userService.isAuthenticated().subscribe(
      () => {
        this.isActiveAdmin = false;
        this.isActiveUser = true;
      }
    );
  }

  ngDoCheck() {
    if (this.transfer.role$.getValue() !== undefined) {
      this.transfer.role$.subscribe(value => {
        if (value == 'ADMIN') {
          this.isActiveAdmin = true;
          this.isActiveUser = true;

        } else if (value == 'USER') {
          this.isActiveUser = true;
          this.isActiveAdmin = false;
        } else {
          this.isActiveUser = false;
          this.isActiveAdmin = false;
        }
      });
    }
  }

  ru() {
    this.translate.use('ru');
  }

  en() {
    this.translate.use('en');
  }
}
