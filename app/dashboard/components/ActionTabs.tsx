type ActionTabsProps = {
  activeTab: "active" | "done";
  activeCount: number;
  doneCount: number;
  onChangeTab: (tab: "active" | "done") => void;
};

export default function ActionTabs({
  activeTab,
  activeCount,
  doneCount,
  onChangeTab,
}: ActionTabsProps) {
  return (
    <div className="mt-4 flex rounded-xl bg-white/70 p-1 ring-1 ring-amber-100">
      <TabButton
        isSelected={activeTab === "active"}
        label={`Active actions (${activeCount})`}
        onClick={() => onChangeTab("active")}
      />
      <TabButton
        isSelected={activeTab === "done"}
        label={`Done actions (${doneCount})`}
        onClick={() => onChangeTab("done")}
      />
    </div>
  );
}

function TabButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        isSelected
          ? "bg-stone-900 text-white shadow-sm"
          : "text-stone-600 hover:bg-amber-50"
      }`}
    >
      {label}
    </button>
  );
}
