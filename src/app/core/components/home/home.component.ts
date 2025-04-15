import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private breadcrumbService:BreadcrumbService) { }

  ngOnInit(): void {
    this.breadcrumbService.setItems([{ label: 'Inicio' , routerLink: '/'}])
  }

}
