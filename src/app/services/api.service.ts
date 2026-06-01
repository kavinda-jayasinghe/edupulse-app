import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.apiUrl;

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  // ── Dashboard ─────────────────────────────────────────────
  joinClass(studentId: number, classCode: string) {
    return this.http.post<{ className: string; message: string }>(
      `${this.base}/users/${studentId}/join-class`,
      { classCode },
      { headers: this.headers() }
    );
  }

  getDashboard(studentId: number) {
    return this.http.get<any>(`${this.base}/users/${studentId}/dashboard`, { headers: this.headers() });
  }

  getProfile(studentId: number) {
    return this.http.get<any>(`${this.base}/users/${studentId}/profile`, { headers: this.headers() });
  }

  // ── Exams ─────────────────────────────────────────────────
  getStudentExams(studentId: number) {
    return this.http.get<any[]>(`${this.base}/exams/student/${studentId}`, { headers: this.headers() });
  }

  getExam(examId: number) {
    return this.http.get<any>(`${this.base}/exams/${examId}`, { headers: this.headers() });
  }

  submitExam(payload: { examId: number; studentId: number; answers: { questionId: number; selectedAnswer: string }[] }) {
    return this.http.post<any>(`${this.base}/exams/submit`, payload, { headers: this.headers() });
  }

  // ── Rankings ──────────────────────────────────────────────
  getRankings(classId: number) {
    return this.http.get<any[]>(`${this.base}/rankings/class/${classId}`, { headers: this.headers() });
  }

  // ── Notifications ─────────────────────────────────────────
  getNotifications(userId: number) {
    return this.http.get<any[]>(`${this.base}/notifications/${userId}`, { headers: this.headers() });
  }

  markNotificationRead(id: number) {
    return this.http.put(`${this.base}/notifications/${id}/read`, {}, { headers: this.headers() });
  }

  markAllNotificationsRead(userId: number) {
    return this.http.put(`${this.base}/notifications/user/${userId}/read-all`, {}, { headers: this.headers() });
  }

  // ── Teacher ───────────────────────────────────────────────
  getTeacherOverview(teacherId: number) {
    return this.http.get<any>(`${this.base}/teacher/${teacherId}/overview`, { headers: this.headers() });
  }

  getTeacherRankings(teacherId: number, classId: number) {
    return this.http.get<any[]>(`${this.base}/teacher/${teacherId}/rankings/${classId}`, { headers: this.headers() });
  }

  createTeacherClass(teacherId: number, body: { name: string; classCode: string; subject: string }) {
    return this.http.post<any>(`${this.base}/teacher/${teacherId}/classes`, body, { headers: this.headers() });
  }

  getTeacherClassDetail(teacherId: number, classId: number) {
    return this.http.get<any>(`${this.base}/teacher/${teacherId}/classes/${classId}`, { headers: this.headers() });
  }

  updateTeacherClass(teacherId: number, classId: number, body: { name: string; classCode: string; subject: string }) {
    return this.http.put<any>(`${this.base}/teacher/${teacherId}/classes/${classId}`, body, { headers: this.headers() });
  }

  deleteTeacherClass(teacherId: number, classId: number) {
    return this.http.delete<any>(`${this.base}/teacher/${teacherId}/classes/${classId}`, { headers: this.headers() });
  }

  searchStudentByMobile(teacherId: number, mobile: string) {
    return this.http.get<any>(`${this.base}/teacher/${teacherId}/students/search?mobile=${encodeURIComponent(mobile)}`, { headers: this.headers() });
  }

  addStudentToClass(teacherId: number, classId: number, mobile: string) {
    return this.http.post<any>(`${this.base}/teacher/${teacherId}/classes/${classId}/students`, { mobile }, { headers: this.headers() });
  }

  removeStudentFromClass(teacherId: number, classId: number, studentId: number) {
    return this.http.delete<any>(`${this.base}/teacher/${teacherId}/classes/${classId}/students/${studentId}`, { headers: this.headers() });
  }

  createAssignment(teacherId: number, classId: number, body: { title: string; description: string; dueDate: string }) {
    return this.http.post<any>(`${this.base}/teacher/${teacherId}/classes/${classId}/assignments`, body, { headers: this.headers() });
  }

  updateAssignment(teacherId: number, classId: number, assignmentId: number, body: { title: string; description: string; dueDate: string }) {
    return this.http.put<any>(`${this.base}/teacher/${teacherId}/classes/${classId}/assignments/${assignmentId}`, body, { headers: this.headers() });
  }

  deleteAssignment(teacherId: number, classId: number, assignmentId: number) {
    return this.http.delete<any>(`${this.base}/teacher/${teacherId}/classes/${classId}/assignments/${assignmentId}`, { headers: this.headers() });
  }

  uploadAssignmentFiles(teacherId: number, classId: number, assignmentId: number, files: File[]) {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f, f.name));
    return this.http.post<any[]>(
      `${this.base}/teacher/${teacherId}/classes/${classId}/assignments/${assignmentId}/files`,
      fd,
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` }) }
    );
  }

  getAssignmentFileBlob(teacherId: number, classId: number, assignmentId: number, fileId: number) {
    return this.http.get(
      `${this.base}/teacher/${teacherId}/classes/${classId}/assignments/${assignmentId}/files/${fileId}`,
      { headers: this.headers(), responseType: 'blob' as 'json' }
    ) as any;
  }

  deleteAssignmentFile(teacherId: number, classId: number, assignmentId: number, fileId: number) {
    return this.http.delete<void>(
      `${this.base}/teacher/${teacherId}/classes/${classId}/assignments/${assignmentId}/files/${fileId}`,
      { headers: this.headers() }
    );
  }

  createQuiz(formData: FormData) {
    return this.http.post<any>(
      `${this.base}/quiz`,
      formData,
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` }) }
    );
  }

  getQuizzesByClass(classId: number) {
    return this.http.get<any[]>(`${this.base}/quiz/class/${classId}`, { headers: this.headers() });
  }

  getQuizPaperBlob(quizId: number) {
    return this.http.get(`${this.base}/quiz/${quizId}/paper`,
      { headers: this.headers(), responseType: 'blob' as 'json' }) as any;
  }

  updateQuiz(quizId: number, teacherId: number, body: { title: string; instruction: string; timeDuration: number; dueDate: string }) {
    return this.http.put<any>(`${this.base}/quiz/${quizId}?teacherId=${teacherId}`, body, { headers: this.headers() });
  }

  deleteQuiz(quizId: number, teacherId: number) {
    return this.http.delete<void>(`${this.base}/quiz/${quizId}?teacherId=${teacherId}`, { headers: this.headers() });
  }

  // ── Admin ─────────────────────────────────────────────────
  getAdminStats() {
    return this.http.get<any>(`${this.base}/admin/stats`, { headers: this.headers() });
  }

  getClassOverview() {
    return this.http.get<any[]>(`${this.base}/admin/class-overview`, { headers: this.headers() });
  }

  getAdminStudents() {
    return this.http.get<any[]>(`${this.base}/admin/students`, { headers: this.headers() });
  }

  getAdminRankings(classId: number) {
    return this.http.get<any[]>(`${this.base}/admin/rankings/${classId}`, { headers: this.headers() });
  }

  getAdminUsers(page = 0, size = 10) {
    return this.http.get<any>(`${this.base}/admin/users?page=${page}&size=${size}`, { headers: this.headers() });
  }

  searchAdminUser(mobile: string) {
    return this.http.get<any>(`${this.base}/admin/users/search?mobile=${encodeURIComponent(mobile)}`, { headers: this.headers() });
  }

  changeProfileType(userId: number, profileType: string) {
    return this.http.put<any>(`${this.base}/admin/users/${userId}/profile-type`, { profileType }, { headers: this.headers() });
  }

  toggleUserEnabled(userId: number) {
    return this.http.put<any>(`${this.base}/admin/users/${userId}/toggle-enabled`, {}, { headers: this.headers() });
  }

  deleteAdminUser(userId: number) {
    return this.http.delete<any>(`${this.base}/admin/users/${userId}`, { headers: this.headers() });
  }
}
