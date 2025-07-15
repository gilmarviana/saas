import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export function StatsCard({ title, value, change, icon, iconColor, iconBg }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-secondary">{value}</p>
          </div>
          <div className={`${iconBg} p-3 rounded-lg`}>
            <i className={`${icon} ${iconColor} text-xl`}></i>
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center text-sm">
            <span className="text-accent">{change}</span>
            <span className="text-slate-500 ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
