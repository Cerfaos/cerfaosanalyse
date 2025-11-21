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
          background-color: #0A191A;
          border: 1px solid rgba(139, 195, 74, 0.3);
          border-radius: 0.75rem;
          color: #fff;
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
          color: #fff;
          font-weight: 600;
        }
        .react-datepicker__day-name {
          color: #8BC34A;
        }
        .react-datepicker__day {
          color: #e2e8f0;
        }
        .react-datepicker__day:hover {
          background-color: rgba(139, 195, 74, 0.2);
          border-radius: 0.3rem;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #8BC34A;
          color: #000;
          font-weight: bold;
          border-radius: 0.3rem;
        }
        .react-datepicker__day--disabled {
          color: #4b5563;
        }
        .react-datepicker__time-container {
          border-left: 1px solid rgba(139, 195, 74, 0.2);
        }
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
          border-radius: 0.3rem;
        }
        .react-datepicker__time-container .react-datepicker__time {
          background-color: #0A191A;
          border-top-right-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        .react-datepicker__time-name {
          color: #8BC34A;
        }
        .react-datepicker__time-list-item {
          color: #e2e8f0;
        }
        .react-datepicker__time-list-item:hover {
          background-color: rgba(139, 195, 74, 0.2) !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #8BC34A !important;
          color: #000 !important;
          font-weight: bold;
        }
        .react-datepicker__input-container input {
          width: 100%;
          outline: none;
        }
        .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before,
        .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
          border-bottom-color: #0A191A;
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
