import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import Chart from 'chart.js/auto';
import { Colors, ChartData, registerables } from 'chart.js';
import { Router } from '@angular/router';
import { Film } from '../model/Film';
import moment from 'moment';
import { months } from '../model/Months';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {

  @Input() item: Film[] = [];

  public filmsList: Film[] = [];
  public allMoviesChart: any = [];
  public decadesPieChart: any = [];

  public languagesDoughnutChart: any = [];
  public daysWatchedHorizontalBarChart: any = [];
  public monthsWatchedBarChart: any = [];

  public daysMap = new Map<string, Number>();
  public watchesByMonth: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // const currentState = this.router.lastSuccessfulNavigation;
    // this.filmsList = currentState?.extras?.state?.['data'];
    this.filmsList = this.item;
    this.processLanguages();
    this.prepareAllFilmsCharts();
    this.prepareDecadesCharts();
    this.prepareLanguagesCharts();

    this.processDays();
    this.prepareDaysWatchedCharts();
    this.prepareMonthsWatchedCharts();
  }

  private prepareAllFilmsCharts() {
    // Chart.register(Colors);
    let data = {
      labels: this.processAllFilms().labels,
      datasets: [{
        label: '',
        data: this.processAllFilms().data,
        // backgroundColor: '#0a91ab', // BCCCDC
        backgroundColor: '#48CFCB',
        borderRadius: 5
      }]
    };

    let options: any = {
      // responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: 5,
          ticks: {
            stepSize: 0.5
          }
        },
        x: {
          ticks: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
            display: false
        },
        title: {
          display: true,
          text: 'Films & Ratings',
          color: 'navy',
          position: 'top',
          align: 'center',
          font: {
            weight: 'bold',
            size: 20,
            family: 'Outfit, serif'
          },
          padding: 8,
          fullSize: true,
        },
        datalabels: {
          anchor: 'center', // Position of the labels (start, end, center, etc.)
          align: 'end', // Alignment of the labels (start, end, center, etc.)
          color: 'blue', // Color of the labels
          font: {
              weight: 'bold',
          },
          formatter: function (value: any, context: any) {
              return value; // Display the actual data value
          }
      }
      }
    };

    this.allMoviesChart = new Chart('canvas', {
      type: 'bar',
      data: data,
      options: options
    });
  }

  private processAllFilms() {
    let labels: string[] = [];
    let filmNo: number[] = [];
    this.filmsList.forEach(f => labels.push(f.no + ' - ' + f.name + ' (' + f.year + ')'));
    this.filmsList.forEach((f: Film) => filmNo.push(f.rating));
    return {labels: labels, data: filmNo};
  }

  private prepareDecadesCharts() {
    let data = {
      labels: this.processDecades().d,
      datasets: [
        {
          label: '',
          data: this.processDecades().c,
        }
      ]
    };
    let options: any = {
      // responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Decades',
          color: 'navy',
          position: 'top',
          align: 'center',
          font: {
            weight: 'bold',
            size: 20,
            family: 'Outfit, serif'
          },
          padding: 8,
          fullSize: true,
        }
      }
    };
    this.decadesPieChart = new Chart('decadeschart', {
      type: 'pie',
      data: data,
      options: options,
    });
  }

  private prepareLanguagesCharts() {
    let data = {
      labels: this.processLanguages().l,
      datasets: [
        {
          label: '',
          data: this.processLanguages().c,
        }
      ]
    };
    let options: any = {
      // responsive: true,
      maintainAspectRatio: false,
      spacing: 0,
      cutout: 80,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Languages',
          color: 'navy',
          position: 'top',
          align: 'center',
          font: {
            weight: 'bold',
            size: 20,
            family: 'Outfit, serif'
          },
          padding: 8,
          fullSize: true,
        }
      }
    };
    this.languagesDoughnutChart = new Chart('languageschart', {
      type: 'doughnut',
      data: data,
      options: options,
    });
  }

  private prepareDaysWatchedCharts() {
    let data = {
      labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      datasets: [{
        label: '',
        data: [
          this.daysMap.get('Sunday'),
          this.daysMap.get('Monday'),
          this.daysMap.get('Tuesday'),
          this.daysMap.get('Wednesday'),
          this.daysMap.get('Thursday'),
          this.daysMap.get('Friday'),
          this.daysMap.get('Saturday'),
        ],
        backgroundColor: ['#ffd373', '#fd8021', '#e05400', '#0073cc', '#003488', '#001d59', '#001524'],
        // backgroundColor: ['#03045e',  '#262d79',  '#475492',  '#677bab',  '#88a2c4',  '#a9c9dd', '#caf0f6'],
        // backgroundColor: '#677bab',
        // backgroundColor: ['#ffadad',  '#ffd6a5',  '#fdffb6',  '#caffbf',  '#9bf6ff',  '#b2b9ff', '#ffc6ff'],
        borderRadius: 4,
      }]
    };

    let options: any = {
      // responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          // max: 5,
          ticks: {
            stepSize: 1
          }
        },
        y: {
          ticks: {
            display: true
          }
        }
      },
      plugins: {
        legend: {
            display: false
        },
        title: {
          display: true,
          text: 'Watches by Days',
          color: 'navy',
          position: 'top',
          align: 'center',
          font: {
            weight: 'bold',
            size: 20,
            family: 'Outfit, serif'
          },
          padding: 8,
          fullSize: true,
        }
    }
    };

    this.daysWatchedHorizontalBarChart = new Chart('daysChart', {
      type: 'bar',
      data: data,
      options: options
    });
  }

  private prepareMonthsWatchedCharts() {
    let data = {
      labels: this.processMonths().map(m => {return m.label;}),
      datasets: [{
        label: '',
        data: this.processMonths().map(m => {return m.y;}),
        backgroundColor: ['#ff0000', '#ff8000', '#ffff00',
        '#80ff00', '#00ff00', '#00ff80',
        '#00ffff', '#0080ff', '#0000ff',
        '#8000ff', '#ff00ff', '#ff0080'],
        borderRadius: 4,
      }]
    };

    let options: any = {
      // responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          // max: 5,
          ticks: {
            stepSize: 1
          }
        },
        y: {
          ticks: {
            display: true
          }
        }
      },
      plugins: {
        legend: {
            display: false
        },
        title: {
          display: true,
          text: 'Watches by Months',
          color: 'navy',
          position: 'top',
          align: 'center',
          font: {
            weight: 'bold',
            size: 20,
            family: 'Outfit, serif'
          },
          padding: 8,
          fullSize: true,
        }
    }
    };

    this.monthsWatchedBarChart = new Chart('monthsChart', {
      type: 'bar',
      data: data,
      options: options
    });
  }

  private processLanguages() {
    let langMap = new Map<string, Number>();
    for (var f of this.filmsList) {
      let lang = f.language.trim();
      if (langMap.has(lang)) {
        langMap.set(lang, Number(langMap.get(lang)) + 1);
      } else {
        langMap.set(lang, 1);
      }
    }

    let langs: any[] = [];
    let count: any[] = [];

    let langDataPoints: any[] = [];
    langMap.forEach((value, key) => {
      langDataPoints.push({ y: value, name: key });
      langs.push(key); count.push(value);
    });
    
    return {l: langs, c: count};
  }

  private getDecadesFromYear(year: number): any {
    if (Number.isNaN(year) || (year.toString().length < 4) || (year.toString().length > 4)) {
      throw new Error('Date must be valid and have a 4-digit year attribute');
    }
    let start = Number(`${year.toString()[2]}0`);
    let startIdx = year.toString().substring(0, 2);
    let end = 0;
    start = (start === 0) ? Number(`${startIdx}00`) : Number(`${startIdx}${start}`);
    end = start + 10;
    return { start: start, end: end };
  }

  public processDecades(): any {
    let decadesMap = new Map<Number, Number>();
    let decadesDataPoints: any[] = [];
    for (let f of this.filmsList) {
      let decade = this.getDecadesFromYear(f.year);
      if (decadesMap.has(decade.start)) {
        decadesMap.set(decade.start, Number(decadesMap.get(decade.start)) + 1);
      } else {
        decadesMap.set(decade.start, 1);
      }
    }

    let decades: any[] = [];
    let count: any[] = [];
    decadesMap.forEach((value, key) => {
      decadesDataPoints.push({ y: value, name: key.toString() + 's' });
      decades.push(key.toString() + 's');
      count.push(value);
    });
    let dec: any = { d: decades, c: count };
    return dec;
  }

  private processDays(): void {
    for (var f of this.filmsList) {
      let day = moment(f.date).format("dddd");

      if (this.daysMap.has(day)) {
        this.daysMap.set(day, Number(this.daysMap.get(day)) + 1);
      } else {
        this.daysMap.set(day, 1);
      }
    }
  }

  private processMonths(): any[] {
    let monthsWatchMap = new Map<string, number>();
    let monthsWatch: any[] = [];
    for (var f of this.filmsList) {
      var month = moment(f.date).format('MM');
      if (month.startsWith('0')) {
        month = month.substring(1);
      }
      if (monthsWatchMap.has(month)) {
        monthsWatchMap.set(month, Number(monthsWatchMap.get(month)) + 1);
      } else {
        monthsWatchMap.set(month, 1);
      }
    }

    for (let index = 1; index < 13; index++) {
      if (monthsWatchMap.has(index.toString())) {
        monthsWatch.push({ label: this.getMonthName(index.toString()), y: monthsWatchMap.get(index.toString()) });
      } else {
        monthsWatch.push({ label: this.getMonthName(index.toString()), y: 0 });
      }
    }
    this.watchesByMonth = monthsWatch;
    return monthsWatch;
  }

  private getMonthName(key: string): string {
    let month = months.filter(m => m.key.toString() == key);
    return month[0].value;
  }

  public getFilmName() {

  }
}
