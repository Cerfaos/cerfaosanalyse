interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

const colorMap: Record<string, string> = {
  brand: "bg-[#5CE1E6]/10 group-hover:bg-[#5CE1E6]/20",
  orange: "bg-[#FFAB40]/10 group-hover:bg-[#FFAB40]/20",
  green: "bg-[#8BC34A]/10 group-hover:bg-[#8BC34A]/20",
  red: "bg-[#FF5252]/10 group-hover:bg-[#FF5252]/20",
};

export default function StatCard({
  label,
  value,
  icon,
  color = "brand",
}: StatCardProps) {
  return (
    <div className="glass-panel px-4 py-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${
          colorMap[color] || colorMap.brand
        } rounded-full -translate-y-12 translate-x-12 transition-all duration-500`}
      />
      <div className="relative z-10">
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
          {label}
        </p>
        <p className="text-2xl font-semibold text-white group-hover:scale-105 transition-transform duration-300 origin-left">
          {value}
        </p>
      </div>
    </div>
  );
}
