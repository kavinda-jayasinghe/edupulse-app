import { Component } from '@angular/core';
import { UserManagementComponent } from "../../components/admin/user-management/user-management.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [UserManagementComponent],
  templateUrl: './admin.component.html',
  styleUrl:    './admin.component.scss',
})
export class AdminComponent  {
  
}