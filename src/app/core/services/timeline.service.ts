import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ZoomLevel } from '../models/zoom-level.type';

/**
 * TimelineService
 * 
 * Pure mathematical engine for timeline calculations.
 * Manages zoom levels, date ranges, and position calculations.
 * No UI logic - only computation.
 */
@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  // Timeline configuration constants
  private readonly DAY_COLUMN_WIDTH = 80;
  private readonly WEEK_COLUMN_WIDTH = 120;
  private readonly MONTH_COLUMN_WIDTH = 160;

  // Range buffer configurations
  private readonly DAY_BUFFER_DAYS = 14;
  private readonly WEEK_BUFFER_WEEKS = 8;
  private readonly MONTH_BUFFER_MONTHS = 6;

  // State management
  private readonly zoomLevel$ = new BehaviorSubject<ZoomLevel>('day');
  private readonly visibleStartDate$ = new BehaviorSubject<Date>(new Date());
  private readonly columnWidth$ = new BehaviorSubject<number>(this.DAY_COLUMN_WIDTH);

  constructor() {
    this.initializeTimeline();
  }

  // Observable streams
  getZoomLevel(): Observable<ZoomLevel> {
    return this.zoomLevel$.asObservable();
  }

  getVisibleStartDate(): Observable<Date> {
    return this.visibleStartDate$.asObservable();
  }

  getColumnWidth(): Observable<number> {
    return this.columnWidth$.asObservable();
  }

  // Zoom level management
  setZoomLevel(level: ZoomLevel): void {
    this.zoomLevel$.next(level);
    this.updateColumnWidth(level);
    this.updateVisibleWindow(level);
  }

  /**
   * Pure calculation: Convert date to pixel position (zoom-aware)
   * In day view: each day = columnWidth
   * In week view: each week = columnWidth, so each day = columnWidth/7
   * In month view: each month = columnWidth, so each day = columnWidth/30
   */
  dateToPosition(date: Date, visibleStartDate: Date, columnWidth: number, zoomLevel?: ZoomLevel): number {
    const currentZoomLevel = zoomLevel || this.zoomLevel$.value;
    const daysDifference = this.differenceInDays(date, visibleStartDate);
    
    switch (currentZoomLevel) {
      case 'day':
        return daysDifference * columnWidth;
      case 'week':
        return (daysDifference / 7) * columnWidth;
      case 'month':
        // Approximate: 30 days per month
        return (daysDifference / 30) * columnWidth;
      default:
        return daysDifference * columnWidth;
    }
  }

  /**
   * Pure calculation: Calculate bar width based on date range (zoom-aware)
   */
  calculateBarWidth(startDate: Date, endDate: Date, columnWidth: number, zoomLevel?: ZoomLevel): number {
    const currentZoomLevel = zoomLevel || this.zoomLevel$.value;
    const daysDifference = this.differenceInDays(endDate, startDate);
    
    switch (currentZoomLevel) {
      case 'day':
        return daysDifference * columnWidth;
      case 'week':
        return (daysDifference / 7) * columnWidth;
      case 'month':
        // Approximate: 30 days per month
        return (daysDifference / 30) * columnWidth;
      default:
        return daysDifference * columnWidth;
    }
  }

  /**
   * Calculate date from pixel position (zoom-aware)
   */
  positionToDate(position: number, visibleStartDate: Date, columnWidth: number, zoomLevel?: ZoomLevel): Date {
    const currentZoomLevel = zoomLevel || this.zoomLevel$.value;
    const date = new Date(visibleStartDate);
    
    switch (currentZoomLevel) {
      case 'day':
        const dayOffset = Math.floor(position / columnWidth);
        date.setDate(date.getDate() + dayOffset);
        break;
      case 'week':
        const weekOffset = Math.floor(position / columnWidth);
        date.setDate(date.getDate() + (weekOffset * 7));
        break;
      case 'month':
        const monthOffset = Math.floor(position / columnWidth);
        date.setMonth(date.getMonth() + monthOffset);
        break;
    }
    
    return date;
  }

  /**
   * Calculate current day indicator position (zoom-aware)
   */
  getCurrentDayPosition(visibleStartDate: Date, columnWidth: number, zoomLevel?: ZoomLevel): number {
    const today = new Date();
    return this.dateToPosition(today, visibleStartDate, columnWidth, zoomLevel);
  }

  /**
   * Format date to ISO string (yyyy-mm-dd)
   */
  formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Private helper methods
  private initializeTimeline(): void {
    const today = new Date();
    const startDate = this.calculateVisibleStartDate(today, 'day');
    this.visibleStartDate$.next(startDate);
  }

  private updateColumnWidth(level: ZoomLevel): void {
    const widthMap: Record<ZoomLevel, number> = {
      day: this.DAY_COLUMN_WIDTH,
      week: this.WEEK_COLUMN_WIDTH,
      month: this.MONTH_COLUMN_WIDTH
    };
    this.columnWidth$.next(widthMap[level]);
  }

  private updateVisibleWindow(level: ZoomLevel): void {
    const today = new Date();
    const startDate = this.calculateVisibleStartDate(today, level);
    this.visibleStartDate$.next(startDate);
  }

  private calculateVisibleStartDate(centerDate: Date, level: ZoomLevel): Date {
    const date = new Date(centerDate);
    
    switch (level) {
      case 'day':
        date.setDate(date.getDate() - this.DAY_BUFFER_DAYS);
        break;
      case 'week':
        date.setDate(date.getDate() - (this.WEEK_BUFFER_WEEKS * 7));
        break;
      case 'month':
        date.setMonth(date.getMonth() - this.MONTH_BUFFER_MONTHS);
        break;
    }
    
    return date;
  }

  /**
   * Pure calculation: Difference in days between two dates
   */
  private differenceInDays(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc1 - utc2) / msPerDay);
  }
}
