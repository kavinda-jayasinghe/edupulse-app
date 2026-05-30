import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-contribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contribution.component.html',
  styleUrl: './contribution.component.scss'
})
export class ContributionComponent {
   daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  contributions = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(new Date().setDate(new Date().getDate() - 364 + i)),
    count: Math.floor(Math.random() * 10) 
  }));

  getWeekColumns() {
    const weeks = [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    for (let w = 0; w < 53; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const match = this.contributions.find(c =>
          c.date.toDateString() === date.toDateString()
        );
        week.push(match || { date, count: 0 });
      }
      weeks.push(week);
    }

    return weeks;
  }

  getColor(count: number): string {
    if (count === 0) return '#ebedf0';
    if (count < 3) return '#9be9a8';
    if (count < 5) return '#40c463';
    if (count < 8) return '#30a14e';
    return '#216e39';
  }

getMonthLabels(): { label: string, offset: number }[] {
  const labels: { label: string, offset: number }[] = [];
  const weeks = this.getWeekColumns();

  let lastMonth = -1;

  for (let i = 0; i < weeks.length; i++) {
    const firstDayOfWeek = weeks[i][0].date;
    const month = firstDayOfWeek.getMonth();

    if (month !== lastMonth) {
      labels.push({
        label: firstDayOfWeek.toLocaleString('default', { month: 'short' }),
        offset: i
      });
      lastMonth = month;
    }
  }

  return labels;
}


}