type ScheduleRules = {
  pickupTime: string;
  dropoffTime: string;
  preparationMinutes: number;
  travelBufferMinutes: number;
};

type SettingsCardProps = {
  rules: ScheduleRules;
  onChangeRules: (rules: ScheduleRules) => void;
};

export default function SettingsCard({
  rules,
  onChangeRules,
}: SettingsCardProps) {
  function updateRule(field: keyof ScheduleRules, value: string) {
    onChangeRules({
      ...rules,
      [field]:
        field === "pickupTime" || field === "dropoffTime"
          ? value
          : Number(value),
    });
  }

  return (
    <section className="rounded-3xl bg-[#fffaf2] p-4 shadow-sm ring-1 ring-amber-100 sm:p-5">
      <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
        Family rules
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-stone-950">
        Schedule settings
      </h2>

      <div className="mt-5 grid gap-4">
        <SettingsField
          label="School pickup time"
          type="time"
          value={rules.pickupTime}
          onChange={(value) => updateRule("pickupTime", value)}
        />
        <SettingsField
          label="School drop-off time"
          type="time"
          value={rules.dropoffTime}
          onChange={(value) => updateRule("dropoffTime", value)}
        />
        <SettingsField
          label="Default activity preparation time"
          type="number"
          value={String(rules.preparationMinutes)}
          suffix="minutes"
          onChange={(value) => updateRule("preparationMinutes", value)}
        />
        <SettingsField
          label="Default travel buffer time"
          type="number"
          value={String(rules.travelBufferMinutes)}
          suffix="minutes"
          onChange={(value) => updateRule("travelBufferMinutes", value)}
        />
      </div>
    </section>
  );
}

function SettingsField({
  label,
  type,
  value,
  suffix,
  onChange,
}: {
  label: string;
  type: "time" | "number";
  value: string;
  suffix?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-amber-100 bg-white/80 p-4">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type={type}
          min={type === "number" ? 0 : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400"
        />
        {suffix && <span className="text-sm text-stone-500">{suffix}</span>}
      </div>
    </label>
  );
}
