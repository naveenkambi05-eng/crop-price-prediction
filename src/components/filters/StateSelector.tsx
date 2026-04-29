type StateSelectorProps = {
  states: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function StateSelector({ states, value, onChange }: StateSelectorProps) {
  return (
    <label className="card flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-600">Select State</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        <option value="All States">All States</option>
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    </label>
  );
}
