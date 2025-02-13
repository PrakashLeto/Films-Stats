import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { NavigationExtras, Router } from '@angular/router';
import { months } from '../model/Months';
import { StatsComponent } from '../stats/stats.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { BreakpointObserver,Breakpoints, BreakpointState } from '@angular/cdk/layout';

interface Film {
  no: number,
  date: Date,
  name: string;
  year: number;
  director: string;
  genre: string;
  duration: string;
  country: string;
  language: string;
  rating: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatGridListModule, FormsModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatListModule, MatCardModule, CanvasJSAngularChartsModule, StatsComponent, SlickCarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  public excelData: any[] = [];
  public nameYear: string[] = [];
  public films: Film[] = [];
  public daysMap = new Map<string, number>();
  public watchesByMonth: any[] = [];
  public totalMinutesWatched: Number = 0;
  public slideConfig: any;
  public isPhone: boolean = false;

  state = 0;

  scrollDone() {
    this.state++;
  }

  ngOnInit() {
    console.log('Init');
    this.slideConfig = { 
      slidesToShow: 1, 
      slidesToScroll: 1, 
      arrows: true, 
      infinite: true,
      adaptiveHeight: true,
      // centerMode: true,
      speed: 300,
      autoplay: true,
      // fade: true,
    };

    this.responsive
      .observe([Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => {
        this.isPhone = false;
        if (state.matches) {
          this.isPhone = true;
        }
      });
  }

  public stats: { no: number, heading: string, subHeading1: string, subHeading2: string }[] = [];

  constructor(private router: Router, public responsive: BreakpointObserver) {}

  public onFileChange(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.excelData = [];
    this.films = [];
    this.daysMap = new Map<string, number>();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      this.excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      const sheetList = workbook.SheetNames;
      console.log(sheetList);
      console.log('Excel data:', this.excelData);
      this.nameYear = sheetList[0].split('_');
      this.processFilmData(this.excelData);
    };
    reader.readAsBinaryString(file);
  }

  public processFilmData(eData: any[]): void {
    for (var f of eData) {
      this.films.push({ no: f.No, date: this.getDate(f.Date), name: f.Movie, year: f.Year, director: f.Director, genre: f.Genre, duration: f.Duration, country: f.Country, language: f.Language, rating: f.Rating });
    }
    this.processDays(this.films);
    this.getMostWatchedMonth();
    this.processMonths();
    // this.navigateToStats();
    this.prepareStats();
  }

  private navigateToStats(): void {
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.films
      }
    };
    this.router.navigate(['/stats'], navigationExtras);
  }

  private getDate(dateString: string): Date {
    return moment.utc(dateString).add(1, 'days').toDate();
  }

  private getMinutes(duration: string): number {
    let t = duration.split(' ');
    let trimmed = t.map(s => s.slice(0, -1));
    return Number(trimmed[0]) * 60 + Number(trimmed[1]);
  }

  private processDays(filmsArr: Film[]): void {
    for (var f of filmsArr) {
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
    for (var f of this.films) {
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

  private getMonthNameByValue(value: string): string {
    let month = months.filter(m => m.value == value);
    return month[0].label;
  }

  private processLanguages(): any[] {
    let langMap = new Map<string, Number>();
    for (var f of this.films) {
      let lang = f.language.trim();
      if (langMap.has(lang)) {
        langMap.set(lang, Number(langMap.get(lang)) + 1);
      } else {
        langMap.set(lang, 1);
      }
    }

    let langDataPoints: any[] = [];
    langMap.forEach((value, key) => {
      langDataPoints.push({ y: value, name: key });
    });
    return langDataPoints;
  }

  public calculateTotalMinutesWatched(): number {
    let totalMinutes: number = 0;
    for (var f of this.films) {
      totalMinutes = totalMinutes + this.getMinutes(f.duration);
    }
    return totalMinutes;
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

  public processDecades(): any[] {
    let decadesMap = new Map<Number, Number>();
    let decadesDataPoints: any[] = [];
    for (let f of this.films) {
      let decade = this.getDecadesFromYear(f.year);
      if (decadesMap.has(decade.start)) {
        decadesMap.set(decade.start, Number(decadesMap.get(decade.start)) + 1);
      } else {
        decadesMap.set(decade.start, 1);
      }
    }

    decadesMap.forEach((value, key) => {
      decadesDataPoints.push({ y: value, name: key.toString() + 's' });
    });
    return decadesDataPoints;
  }

  public getDirectorsCount(): number {
    let directorsSet = new Set<string>();
    this.films.forEach(f => directorsSet.add(f.director));
    return directorsSet.size;
  }

  public getLanguageCount() {
    let languages: any[] = this.processLanguages();
    return languages.length;
  }

  public getMostWatchedDay() {
    let maxCount: number = 0;
    this.daysMap.forEach((value, key) => {
      if (value > maxCount) {
        maxCount = value;
      }
    });

    let daysWithMostWatches: any[] = [];
    this.daysMap.forEach((value, key) => {
      if (value == maxCount) {
        daysWithMostWatches.push({ day: key, count: value });
      }
    });

    let mostWatchedDaysNames: string = '';
    daysWithMostWatches.forEach(d => {
      mostWatchedDaysNames = mostWatchedDaysNames ? mostWatchedDaysNames.concat(', ').concat(d.day) : mostWatchedDaysNames.concat(d.day);
    });
    return { day: mostWatchedDaysNames, count: maxCount };
  }

  public getMostWatchedMonth(): any {
    let maxCount: number = 0;
    for (let i = 0; i < this.watchesByMonth.length; i++) {
      if (this.watchesByMonth[i].y > maxCount) {
        maxCount = this.watchesByMonth[i].y;
      }
    }
    
    let monthsWithMaxWatches: any[] = this.watchesByMonth.filter(m => m.y == maxCount);
    let mostWatchedMonthNames: string = '';
    monthsWithMaxWatches.forEach(m => {
      mostWatchedMonthNames = mostWatchedMonthNames ? mostWatchedMonthNames.concat(', ').concat(this.getMonthNameByValue(m.label)) 
        : mostWatchedMonthNames.concat(this.getMonthNameByValue(m.label));
    });
    return { month: mostWatchedMonthNames, count: maxCount };
  }

  public getHighestRatingAndFilms() {
    let maxRating: number = Math.max.apply(Math, this.films.map(f => { return f.rating; }));
    let maxRatedFilms: Film[] = this.films.filter(f => f.rating == maxRating);
    // return Math.max.apply(Math, this.films.map(f => { return f.rating; }));
    return {rating: maxRating, count: maxRatedFilms.length};
  }

  public getLowestRatingAndFilms() {
    let minRating: number = Math.min.apply(Math, this.films.map(f => { return f.rating; }));
    let minRatedFilms: Film[] = this.films.filter(f => f.rating == minRating);
    // return Math.min.apply(Math, this.films.map(f => { return f.rating; }));
    return {rating: minRating, count: minRatedFilms.length};
  }

  public getMostWatchedLanguage() {
    return 'English';
  }

  slickInit(e: any) {
    // console.log('slick initialized');
  }
  
  breakpoint(e: any) {
    // console.log('breakpoint');
  }
  
  afterChange(e: any) {
    // console.log('afterChange');
  }
  
  beforeChange(e: any) {
    // console.log('beforeChange');
  }

  public prepareStats() {
    this.stats = [];
    this.stats.push({ 
      no: 1, 
      heading: this.getMostWatchedDay().day, 
      subHeading1: 'Most Watched Day', 
      subHeading2: this.getMostWatchedDay().count + this.getSinglaurOrPlural(this.getMostWatchedDay().count, ' film') 
    });
    this.stats.push({
      no: 2, 
      heading: this.getMostWatchedMonth().month, 
      subHeading1: 'Most Watched Month', 
      subHeading2: this.getMostWatchedMonth().count + this.getSinglaurOrPlural(this.getMostWatchedMonth().count, ' film')
    });
    this.stats.push({
      no: 3, 
      heading: this.getHighestRatingAndFilms().rating.toString(), 
      subHeading1: 'Your Highest Rating is', 
      subHeading2: this.getHighestRatingAndFilms().count + this.getSinglaurOrPlural(this.getHighestRatingAndFilms().count, ' film')
    });
    this.stats.push({
      no: 4, 
      heading: this.getLowestRatingAndFilms().rating.toString(), 
      subHeading1: 'Your Lowest Rating is', 
      subHeading2: this.getLowestRatingAndFilms().count + this.getSinglaurOrPlural(this.getLowestRatingAndFilms().count, ' film')
    });
    this.stats.push({
      no: 5, 
      heading: this.getLanguageStat().lang, 
      subHeading1: this.getSinglaurOrPlural(this.getLanguageStat().count, 'Your Favourite Language'), 
      subHeading2: this.getLanguageStat().count + this.getSinglaurOrPlural(this.getLanguageStat().count, ' film')
    });
    this.stats.push({
      no: 6, 
      heading: this.toHoursAndMinutes().hours + 'hrs ' + this.toHoursAndMinutes().minutes + 'mins', 
      subHeading1: 'You\'ve Watched', 
      subHeading2: 'That\'s ' + this.getDaysFromMinutes() + ' Days!' });
  }

  private getSinglaurOrPlural(count: number, word: string) {
    if (count > 1) {
      return word.concat('s');
    }
    return word;
  }

  private getLanguageStat() {
    let langs = this.processLanguages();
    let maxLangCount: number = Math.max.apply(Math, langs.map(f => { return f.y; }));
    let maxWatchedLang = langs.filter(l => l.y == maxLangCount);

    let langString = '';
    maxWatchedLang.forEach(l => {
      langString = langString ? langString.concat(', ').concat(l.name) : l.name;
    });
    return { lang: langString, count: maxLangCount };
  }

  public toHoursAndMinutes() {
    let totalMinutes = this.calculateTotalMinutesWatched();
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }

  public getDaysFromMinutes() {
    var duration = this.calculateTotalMinutesWatched();
    return duration ? (duration / (60 * 24)).toFixed(2) : 0;
  }

}
