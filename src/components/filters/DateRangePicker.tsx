export type DateRange = {
  startDate: string;
  endDate: string;
};

type DateRangePickerProps = {
  value: DateRange;
  onChange: (next: DateRange) => void;
};

function toInputDate(dateText: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateText.trim());
  if (!match) {
    return "";
  }
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function toDisplayDate(inputDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inputDate.trim());
  if (!match) {
    return "";
  }
  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="card grid grid-cols-1 gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-600">Start Date</span>
        <input
          type="date"
          value={toInputDate(value.startDate)}
          onChange={(event) => onChange({ ...value, startDate: toDisplayDate(event.target.value) })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-600">End Date</span>
        <input
          type="date"
          value={toInputDate(value.endDate)}
          onChange={(event) => onChange({ ...value, endDate: toDisplayDate(event.target.value) })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </label>
    </div>
  );
}

