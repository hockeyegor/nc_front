import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {CompanyService} from "../../../../shared/company.service";
import {Transport} from "../../../../entity/transport";
import {map} from "rxjs/operators";
import {TransportService} from "../../../../shared/transport.service";
import { Observable } from 'rxjs';
import {Company} from "../../../../entity/company";
import {LocaleStorageService} from "../../../../shared/locale-storage.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material";
import {MatTableDataSource} from "@angular/material/table";
import {User} from "../../../../entity/user";
import {SnackBarComponent} from "../../../../components/snack-bar/snack-bar.component";

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  public  addCompanyForm;
  public  companySearchForm;
  public  addTransport;

  public  transports: Transport[];
  public  companies: Company[];

  public  displayedColumns: string[] = ['id', 'name', 'rating','transportCount','delete'];
  public  dataSource;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  public  addTransportBtn: boolean = false;
  public  transportSelect: boolean = false;

  @ViewChild("edit", {static: false}) input1ElementRef;

  constructor(public  companyService: CompanyService,
    public  transportService: TransportService,
    public  notFoundSnackBar: SnackBarComponent,
    public  localeStorageService: LocaleStorageService) {
    this.addCompanyForm = new FormGroup({
      companyName: new FormControl(''),
      transportCount: new FormControl('')
    });

    this.addTransport = new FormControl();

    this.companySearchForm = new FormGroup({
      name: new FormControl(''),
    });
  }

  addCompany(data) {
    this.companyService.saveCompany(data).subscribe(
      (company: Company) => {
        this.addTransportBtn = true;
        this.transportSelect = true;

        this.companies.push(new Company(company));
        this.localeStorageService.update('companies', this.companies);
        this.dataSource.data = this.companies;

        if(this.transports === null) {
          this.loadTransport().subscribe(
            transports => {
              this.transports = transports;
            },
            error1 => {
              console.log(error1);
            }
          );
        }

      },
      error => {
        console.log(error);
      }
    );

  }

  loadTransport(): Observable<Transport[]> {
    return this.transportService.getAllTransport().pipe(
      map((transport: any) => {
          return transport;
        }
      )
    );
  }

  showAll() {
    this.addTransportBtn = false;
    this.transportSelect = false;

    if (this.companies == undefined) {
      const companies = JSON.parse(localStorage.getItem('companies'));
      if(companies != undefined) {
        this.companies = companies;
      } else {
        this.companyService.getAllCompanies().subscribe(
          (comp: Company[]) => {
            this.companies = comp;

            this.dataSource = new MatTableDataSource<Company>(this.companies);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            localStorage.setItem('companies', JSON.stringify(comp));
          },
          error1 => {
            console.log(error1);
          }
        )
      }
    }
    this.dataSource = new MatTableDataSource<Company>(this.companies);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  search(data: any) {
    this.companyService.getByCompanyName(data.name).subscribe(
      (comp: Company) => {
        let companies: Company[] = [];
        companies.push(comp);
        if(!this.dataSource) {
          this.dataSource = new MatTableDataSource<Company>(companies);
        } else {
          this.dataSource.data = companies;
        }
      },
      () => {
        this.notFoundSnackBar.openNotFound();
      }
    );
  }

  delete(companyName: string) {
    this.companyService.deleteByName(companyName).subscribe(
      () => {
        this.companies = this.companies.filter(comp => {
          return comp.companyName !== companyName;
        });

        this.dataSource.data = this.companies;
        this.localeStorageService.update('companies', this.companies);
      },
      error1 => {
        console.log(error1);
      }
    );
  }



  ngOnInit() {
  }

}
