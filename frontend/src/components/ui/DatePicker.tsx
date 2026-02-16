import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
}

export default function CustomDatePicker({
  selected,
  onChange,
  placeholderText,
  className,
}: CustomDatePickerProps) {
  return (
    <div className="custom-datepicker-wrapper w-full">
      <style>{`
        .react-datepicker {
          font-family: inherit;
          background-color: var(--surface-deep);
          border: 1px solid rgba(139, 195, 74, 0.3);
          border-radius: 0.75rem;
          color: var(--text-primary);
        }
        .react-datepicker__header {
          background-color: rgba(139, 195, 74, 0.1);
          border-bottom: 1px solid rgba(139, 195, 74, 0.2);
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          padding-top: 10px;
        }
        .react-datepicker__current-month,
        .react-datepicker-time__header,
        .react-datepicker-year-header {
          color: var(--text-primary);
          font-weight: 600;
        }
        .react-datepicker__day-name {
          color: var(--brand-primary);
        }
        .react-datepicker__day {
          color: var(--text-secondary);
        }
        .react-datepicker__day:hover {
          background-color: rgba(139, 195, 74, 0.2);
          border-radius: 0.3rem;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: var(--brand-primary);
          color: var(--text-inverse);
          font-weight: bold;
          border-radius: 0.3rem;
        }
        .react-datepicker__day--disabled {
          color: var(--text-disabled);
        }
        .react-datepicker__time-container {
          border-left: 1px solid rgba(139, 195, 74, 0.2);
        }
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
          border-radius: 0.3rem;
        }
        .react-datepicker__time-container .react-datepicker__time {
          background-color: var(--surface-deep);
          border-top-right-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        .react-datepicker__time-name {
          color: var(--brand-primary);
        }
        .react-datepicker__time-list-item {
          color: var(--text-secondary);
        }
        .react-datepicker__time-list-item:hover {
          background-color: rgba(139, 195, 74, 0.2) !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: var(--brand-primary) !important;
          color: #000 !important;
          font-weight: bold;
        }
        .react-datepicker__input-container input {
          width: 100%;
          outline: none;
        }
        .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before,
        .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
          border-bottom-color: var(--surface-deep);
        }
      `}</style>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="d MMMM yyyy, HH:mm"
        locale={fr}
        placeholderText={placeholderText}
        className={className}
        calendarClassName="shadow-xl"
      />
    </div>
  );
}
