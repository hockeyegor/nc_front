import {Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../../../entity/user";
import {UserService} from "../../../../shared/user.service";
import {AdminService} from "../../shared/admin.service";
import {LocaleStorageService} from "../../../../shared/locale-storage.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material";
import {MatTableDataSource} from "@angular/material/table";
import {FormControl, FormGroup} from "@angular/forms";
import {SnackBarComponent} from "../../../../components/snack-bar/snack-bar.component";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  public  users: User[];
  public  displayedColumns: string[] = ['id','user-name', 'first-name', 'last-name', 'email','state','ban'];
  public  dataSource;

  @ViewChild(MatPaginator, {static: true}) public paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  public  userSearchForm;

  constructor(public  userService: UserService,
    public  adminService: AdminService,
    public  localeStorageService: LocaleStorageService,
    public  notFoundSnackBar: SnackBarComponent
    ) {

    this.userSearchForm = new FormGroup({
      username: new FormControl(''),
    });
  }

  showAll() {
    if (this.users == undefined) {
      const users = JSON.parse(localStorage.getItem('users'));
      if(users != undefined) {
        this.users = users;
      } else {
        this.userService.getAllUsers().subscribe(
          (u: User[]) => {
            this.users = [];
            u.forEach(
              (user: User) => {
                this.users.push(new User(user));
              }
            );

            this.dataSource = new MatTableDataSource<User>(this.users);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            localStorage.setItem('users', JSON.stringify(this.users));
          },
          error => {
            console.log(error);
          });
      }
    }
    this.dataSource = new MatTableDataSource<User>(this.users);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  lockUser(user: User) {
    console.log(user.userId);
    this.adminService.lockUser(user.userId).subscribe(
      () => {
        user.locked = true;
        this.localeStorageService.update('users', this.users);
      },
      error1 => {
        console.log(error1);
      }
    );
  }

  unlockUser(user: User) {
    this.adminService.unlockUser(user.userId).subscribe(
      () => {
        user.locked = false;
      },
      error1 => {
        console.log(error1);
      }
    );
  }

  search(data: any) {
    this.userService.getByUserName(data.username).subscribe(
      (user: User) => {
        let users: User[] = [];
        users.push(user);
        if(!this.dataSource) {
          this.dataSource = new MatTableDataSource<User>(users);
        } else {
          this.dataSource.data = users;
        }
      },
      () => {
        this.notFoundSnackBar.openNotFound();
      }
    );
  }

  ngOnInit() {

  }
}
