import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mark-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule],
  templateUrl: './mark-sheet.component.html',
  styleUrl: './mark-sheet.component.scss'
})
export class MarkSheetComponent {
 questions: any[] = [];

  constructor() {
    // Initialize 50 questions
    for (let i = 1; i <= 50; i++) {
      this.questions.push({
        number: i,
        selectedOption: null,
        options: [1, 2, 3, 4, 5]
      });
    }
  }


  selectOption(question: any, option: number) {
    console.log(question.number,option);
    question.selectedOption = question.selectedOption === option ? null : option;
  }


  getQuestionRows() {
  const rows = [];
  const numRows = 10;
  const numCols = 5; 

  for (let row = 0; row < numRows; row++) {
    const currentRow = [];
    for (let col = 0; col < numCols; col++) {
      const index = col * numRows + row;
      currentRow.push(this.questions[index]);
    }
    rows.push(currentRow);
  }

  return rows;
}

}