import { useState } from "react";
import CpuChart from "./CpuChart";
import NetworkChart from "./NetworkChart";

export default function ServiceMetricsDashboard({ metrics }: { metrics: [] }) {
  const tabs = [
    { key: "cpuUtilization", label: "CPU" },
    { key: "networkIn", label: "Network In" },
    { key: "networkOut", label: "Network Out" },
  ];

  const [activeTab, setActiveTab] = useState("cpuUtilization");

  const renderChart = () => {
    if (!metrics) return <p className="text-gray-400">Loading metrics...</p>;

    const data = metrics[activeTab] || [];
    console.log("Rendering chart:", activeTab, data);

    switch (activeTab) {
      case "cpuUtilization":
        return <CpuChart data={data} />;
      case "networkIn":
      case "networkOut":
        return <NetworkChart data={data} title={activeTab} />;
      default:
        return null;
    }
  };

  if (!metrics) {
    return (
      <div className="w-full bg-[#0d0d0d] rounded-xl border border-white/10 p-4">
        <p className="text-gray-400">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0d0d0d] rounded-xl border border-white/10 p-4">
      <div className="flex gap-3 mb-4 border-b border-white/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderChart()}
    </div>
  );
}
