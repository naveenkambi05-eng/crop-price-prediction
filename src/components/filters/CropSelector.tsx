type CropSelectorProps = {
  crops: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function CropSelector({ crops, value, onChange }: CropSelectorProps) {
  return (
    <label className="card flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-600">Select Crop</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        {crops.map((crop) => (
          <option key={crop} value={crop}>
            {crop}
          </option>
        ))}
      </select>
    </label>
  );
}

