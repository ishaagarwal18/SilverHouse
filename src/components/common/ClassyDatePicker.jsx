import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * ClassyDatePicker - Luxury, bespoke calendar popup component.
 * Uses smart portal rendering to prevent container overflow/clipping, with rich Gold styling.
 */
export default function ClassyDatePicker({
  value,
  onChange,
  placeholder = 'dd - mm - yyyy',
  icon: IconComponent = CalendarIcon,
  label,
  optional = false,
  minYear = 1940,
  maxYear = 2035,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('DAYS'); // 'DAYS' | 'MONTHS' | 'YEARS'
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320 });

  // Parse YYYY-MM-DD
  const parsedDate = (() => {
    if (!value || typeof value !== 'string') return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return null;
  })();

  const today = new Date();
  const [viewYear, setViewYear] = useState(() => (parsedDate ? parsedDate.getFullYear() : today.getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (parsedDate ? parsedDate.getMonth() : today.getMonth()));

  // Synchronize view when value changes externally
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [value]);

  // Update popup coordinates based on trigger position
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = Math.max(300, Math.min(340, window.innerWidth - 32));
      
      // Calculate top position (if near bottom of screen, show above trigger)
      let topPos = rect.bottom + window.scrollY + 8;
      const expectedHeight = 380;
      if (rect.bottom + expectedHeight > window.innerHeight && rect.top - expectedHeight > 0) {
        topPos = rect.top + window.scrollY - expectedHeight - 8;
      }

      // Calculate left position (keep inside screen viewport)
      let leftPos = rect.left + window.scrollX;
      if (leftPos + popoverWidth > window.innerWidth - 16) {
        leftPos = window.innerWidth - popoverWidth - 16;
      }
      if (leftPos < 16) leftPos = 16;

      setCoords({ top: topPos, left: leftPos, width: popoverWidth });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
      setViewMode('DAYS');
    }
    setIsOpen(!isOpen);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => Math.max(minYear, prev - 1));
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => Math.min(maxYear, prev + 1));
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setViewYear(y);
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Days calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  // Formatted display text (e.g. 09 Oct 2026)
  const displayFormatted = parsedDate
    ? `${String(parsedDate.getDate()).padStart(2, '0')} ${MONTH_NAMES[parsedDate.getMonth()].slice(0, 3)} ${parsedDate.getFullYear()}`
    : '';

  // Years array
  const yearsList = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearsList.push(y);
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-[11px] font-semibold text-[var(--th-text-main)] mb-1 flex items-center justify-between select-none">
          <span>{label}</span>
          {optional && <span className="text-[10px] text-[var(--th-text-muted)] font-normal">(Optional)</span>}
        </label>
      )}

      {/* Trigger Button Input Field */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={`flex items-center rounded-xl border border-[var(--th-border)] bg-[var(--th-surface-alt)] hover:border-[var(--th-accent)] focus-within:border-[var(--th-primary)] transition-all overflow-hidden cursor-pointer ${
          isOpen ? 'ring-2 ring-[var(--th-accent)]/30 border-[var(--th-accent)] shadow-md' : ''
        }`}
      >
        <div className="flex items-center px-3 py-2 bg-[var(--th-surface-alt)] border-r border-[var(--th-border)] text-xs font-bold text-[var(--th-accent)] select-none shrink-0">
          <IconComponent className="w-4 h-4 text-[var(--th-accent)]" />
        </div>

        <div className="flex-1 px-3 py-2 text-xs font-medium text-[var(--th-text-main)] select-none truncate">
          {displayFormatted ? (
            <span className="font-semibold tracking-wide text-[var(--th-text-main)]">
              {displayFormatted}
            </span>
          ) : (
            <span className="text-[var(--th-text-muted)]/60 italic">
              {placeholder}
            </span>
          )}
        </div>

        {displayFormatted ? (
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-2 text-[var(--th-text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="px-2.5 py-2 text-[var(--th-text-muted)]/50">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Portal-Rendered Floating Calendar Modal (Prevents Clipping) */}
      {isOpen && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`
          }}
          className="z-[99999] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18),0_0_20px_rgba(217,119,6,0.1)] border border-amber-200 p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 select-none text-slate-800"
        >
          {/* Opulent Top Brand Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400" />

          <div className="p-4 sm:p-5">
            {/* Top Header Bar: Luxury Capsule Month/Year Toggle + Chevron Controls */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                {/* Combined Month & Year Interactive Capsule */}
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'DAYS' ? 'MONTHS' : 'DAYS')}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border ${
                    viewMode !== 'DAYS'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/25'
                      : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 hover:border-amber-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center space-x-1">
                {viewMode === 'DAYS' ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('DAYS')}
                    className="text-[11px] font-bold text-amber-700 hover:underline px-2 py-1 cursor-pointer"
                  >
                    Back to Calendar
                  </button>
                )}
              </div>
            </div>

            {/* VIEW MODE 1: DAYS GRID */}
            {viewMode === 'DAYS' && (
              <>
                {/* Weekdays Row */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2 py-1.5 bg-amber-50/70 rounded-xl border border-amber-100/80">
                  {WEEKDAY_NAMES.map(day => (
                    <span key={day} className="text-[10px] font-black tracking-widest text-amber-800/80 uppercase">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center pt-1">
                  {/* Prev Month Fill */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => {
                    const dayNum = prevMonthDays - firstDayIndex + idx + 1;
                    return (
                      <div key={`prev-${idx}`} className="h-9 flex items-center justify-center text-xs text-slate-300 select-none font-normal">
                        {dayNum}
                      </div>
                    );
                  })}

                  {/* Days of Current Month */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const isSelected = parsedDate &&
                      parsedDate.getFullYear() === viewYear &&
                      parsedDate.getMonth() === viewMonth &&
                      parsedDate.getDate() === day;

                    const isToday = today.getFullYear() === viewYear &&
                      today.getMonth() === viewMonth &&
                      today.getDate() === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`h-9 w-9 mx-auto rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative ${
                          isSelected
                            ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 text-white font-extrabold shadow-md shadow-amber-500/30 scale-105 ring-2 ring-amber-300 z-10'
                            : isToday
                            ? 'border-2 border-amber-500 text-amber-900 font-bold bg-amber-50 hover:bg-amber-500 hover:text-white'
                            : 'text-slate-700 hover:bg-amber-100/80 hover:text-amber-900 hover:scale-105'
                        }`}
                      >
                        <span>{day}</span>
                        {isToday && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-amber-500 absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* VIEW MODE 2: MONTHS SELECTOR GRID */}
            {viewMode === 'MONTHS' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Select Month</span>
                  <button
                    type="button"
                    onClick={() => setViewMode('YEARS')}
                    className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Change Year ({viewYear})
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1">
                  {MONTH_NAMES.map((mName, idx) => {
                    const isCurrentMonth = viewMonth === idx;
                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => {
                          setViewMonth(idx);
                          setViewMode('DAYS');
                        }}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer border ${
                          isCurrentMonth
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900'
                        }`}
                      >
                        {mName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW MODE 3: YEARS SELECTOR GRID */}
            {viewMode === 'YEARS' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Select Year</span>
                  <button
                    type="button"
                    onClick={() => setViewMode('MONTHS')}
                    className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Back to Months
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto py-1 pr-1 custom-scrollbar">
                  {yearsList.map((y) => {
                    const isCurrentYear = viewYear === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setViewYear(y);
                          setViewMode('DAYS');
                        }}
                        className={`py-2 text-xs font-bold rounded-xl transition-all text-center cursor-pointer border ${
                          isCurrentYear
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900'
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Bar: Action Buttons */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-rose-50 flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={handleSelectToday}
                className="text-white bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 font-bold flex items-center space-x-1.5 transition-all cursor-pointer px-3.5 py-1.5 rounded-xl shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>Today</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
