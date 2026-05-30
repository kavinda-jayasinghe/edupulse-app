import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TeacherDashboardComponent } from "../../components/teacher/teacher-dashboard/teacher-dashboard.component";

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [TeacherDashboardComponent],
  templateUrl: './teacher.component.html',
  styleUrl:    './teacher.component.scss',
})
export class TeacherComponent {

}