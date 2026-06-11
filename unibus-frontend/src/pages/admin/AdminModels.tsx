import React, { useState, useEffect } from "react";
import { Trash2, Info, Layers, RefreshCw } from "lucide-react";
import {
  flattenBusSeats,
  generateSeatColumns,
  seatsArrayToMap
} from "@/lib/utils";
import type { BusModelProperties } from "@/lib/utils";
import BusWrapper from "@/components/bus/BusWrapper";
import { BusPropsProvider, useSeat } from "@/contexts/BusPropsContext";
import { SeatsDataProvider } from "@/contexts/seatsDataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

const Label = ({ htmlFor, children, className }: any) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none text-slate-700 dark:text-slate-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>
    {children}
  </label>
);

const RangeSlider = ({ label, value, onChange, min = 0, max = 100 }: any) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <Label>{label}</Label>
      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{value}px</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
    />
  </div>
);

const NumberInput = ({ label, value, onChange, min = 0 }: any) => (
  <div className="flex flex-col gap-1.5">
    <Label>{label}</Label>
    <Input
      type="number"
      min={min}
      value={value}
      onChange={onChange}
      className="bg-white/50 dark:bg-slate-900/50 focus:ring-indigo-500 transition-all border-slate-200 dark:border-slate-700"
    />
  </div>
);

export default function AdminModels() {
  const [activeTab, setActiveTab] = useState("general");
  const [viewMode, setViewMode] = useState<"create" | "list">("create");
  const [savedModels, setSavedModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [modelName, setModelName] = useState("");
  const [leftTopCols, setLeftTopCols] = useState(2);
  const [leftTopRows, setLeftTopRows] = useState(2);
  const [leftCols, setLeftCols] = useState(8);
  const [leftRows, setLeftRows] = useState(2);
  const [rightCols, setRightCols] = useState(10);
  const [rightRows, setRightRows] = useState(3);
  const [backCols, setBackCols] = useState(1);
  const [backRows, setBackRows] = useState(6);
  const [leftTopHeight, setLeftTopHeight] = useState<number>(80);
  const [doorHeight, setDoorHeight] = useState<number>(50);
  const [leftHeight, setLeftHeight] = useState<number>(40);
  const [rightHeight, setRightHeight] = useState<number>(40);
  const [driverHeight, setDriverHeight] = useState<number>(50);
  const [backHeight, setBackHeight] = useState<number>(50);

  const [isPending, setIsPending] = useState(false);

  const [hiddenSeats, setHiddenSeats] = useState<string[]>([]);

  const fetchSavedModels = async () => {
    setLoadingModels(true);
    try {
      const res = await api.get("/admin/models");
      setSavedModels(res.data);
    } catch (err) {
      console.error("Failed to fetch saved models", err);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchSavedModels();
  }, []);

  const handleDeleteModel = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bus model?")) return;
    try {
      await api.delete(`/admin/deleteModel/${id}`);
      alert("Model deleted successfully!");
      fetchSavedModels();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete model");
    }
  };

  const getSeatCount = (modelDataStr: string) => {
    try {
      const model = typeof modelDataStr === 'string' ? JSON.parse(modelDataStr) : modelDataStr;
      let count = 0;
      const seatGroups = [
        model.leftTopSeatColumns,
        model.leftSeatColumns,
        model.rightSeatColumns,
        model.backSeats
      ];
      for (const group of seatGroups) {
        if (group && Array.isArray(group.seatsRows)) {
          for (const row of group.seatsRows) {
            if (Array.isArray(row)) {
              count += row.filter((seat: any) => seat && seat.seatStatus !== 'unavailable' && seat.seatStatus !== 'deleted').length;
            }
          }
        }
      }
      return count;
    } catch (e) {
      return 0;
    }
  };

  const applyHiddenSeats = (seatGroup: any) => {
    if (!seatGroup) return seatGroup;
    const newSeatsRows = seatGroup.seatsRows.map((row: any[]) =>
      row.map((seat: any) => {
        if (hiddenSeats.includes(seat.id)) {
          return { ...seat, seatStatus: "deleted" };
        }
        return seat;
      })
    );
    return { ...seatGroup, seatsRows: newSeatsRows };
  };

  // Prepare busSeats for preview and submission
  const busSeats: BusModelProperties = {
    leftTopSeatColumns: applyHiddenSeats({
      height: leftTopHeight,
      seatsRows: generateSeatColumns(leftTopCols, leftTopRows, "A", "L"),
      seatsPerRow: leftTopRows,
    }),
    door: { height: doorHeight },
    leftSeatColumns: applyHiddenSeats({
      height: leftHeight,
      seatsRows: generateSeatColumns(
        leftCols,
        leftRows,
        String.fromCharCode("A".charCodeAt(0) + leftTopCols),
        "L",
      ),
      seatsPerRow: leftRows,
    }),
    rightSeatColumns: applyHiddenSeats({
      height: rightHeight,
      seatsRows: generateSeatColumns(rightCols, rightRows, "A", "R"),
      seatsPerRow: rightRows,
    }),
    driver: { height: driverHeight },
    backSeats: applyHiddenSeats({
      height: backHeight,
      seatsRows: generateSeatColumns(backCols, backRows, "A", "B"),
      seatsPerRow: backRows,
    }),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    // When submitting, change "deleted" status to "unavailable" so they are properly hidden in the actual app
    const submitBusSeats = JSON.parse(JSON.stringify(busSeats));
    const groups = [submitBusSeats.leftTopSeatColumns, submitBusSeats.leftSeatColumns, submitBusSeats.rightSeatColumns, submitBusSeats.backSeats];
    groups.forEach(group => {
      if (group && group.seatsRows) {
        group.seatsRows.forEach((row: any[]) => {
          row.forEach((seat: any) => {
            if (seat.seatStatus === "deleted") {
              seat.seatStatus = "unavailable";
            }
          });
        });
      }
    });

    try {
      await api.post("/admin/addModel", {
        modelName: modelName,
        data: JSON.stringify(submitBusSeats)
      });

      setModelName("");
      setHiddenSeats([]);
      alert("Model saved successfully!");
      fetchSavedModels();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Server error");
    } finally {
      setIsPending(false);
    }
  };

  const tabs = [
    { id: "general", label: "General & Heights" },
    { id: "left", label: "Left Columns" },
    { id: "right", label: "Right & Back" },
  ];

  // Wrapper component to listen to context changes
  const InteractivePreview = () => {
    const { selectedSeat, setSelectedSeat } = useSeat();

    React.useEffect(() => {
      if (selectedSeat) {
        if (hiddenSeats.includes(selectedSeat.id)) {
          setHiddenSeats(hiddenSeats.filter(id => id !== selectedSeat.id));
        } else {
          setHiddenSeats([...hiddenSeats, selectedSeat.id]);
        }
        setSelectedSeat(null); // Reset after handling
      }
    }, [selectedSeat]);

    return (
      <SeatsDataProvider data={seatsArrayToMap(flattenBusSeats(busSeats))}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
        >
          <BusWrapper
            busId="preview"
            busSeats={busSeats}
            className="origin-top-center scale-90 md:scale-100"
          />
        </motion.div>
      </SeatsDataProvider>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 rounded-2xl">
      <div className="mb-8 relative z-10">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Configure <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">Bus Model</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-4">
          Design seat layouts, adjust dimensions, and preview your custom bus models in real-time before deploying to production.
        </p>
        <div className="inline-block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300 font-medium text-sm">
          💡 Tip: Click on any seat in the preview to delete/restore it (e.g., to create space for wheels or custom layouts).
        </div>
      </div>

      {/* Toggle buttons to switch views */}
      <div className="flex gap-4 mb-8 relative z-10">
        <button
          onClick={() => setViewMode("create")}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all ${viewMode === "create"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
        >
          Configure Model
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all ${viewMode === "list"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
        >
          Saved Models
        </button>
      </div>

      {viewMode === "list" ? (
        <Card className="border border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Saved Bus Models
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage all registered bus models and view their capacities.
              </p>
            </div>
            <button
              onClick={fetchSavedModels}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Refresh models list"
            >
              <RefreshCw className={`w-4 h-4 ${loadingModels ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingModels ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              Loading saved models...
            </div>
          ) : savedModels.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-350 dark:border-slate-750 rounded-2xl">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Bus Models Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Configure your first bus model using the "Configure Model" tab above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Model Name</th>
                    <th className="px-6 py-4">Structure Info</th>
                    <th className="px-6 py-4">Calculated Seats</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {savedModels.map((model) => {
                    const seatCount = getSeatCount(model.data);
                    return (
                      <tr key={model.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                            {model.modelName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                          {(() => {
                            try {
                              const parsed = typeof model.data === 'string' ? JSON.parse(model.data) : model.data;
                              const zones = [];
                              if (parsed.leftTopSeatColumns) zones.push(`Front Left: ${parsed.leftTopSeatColumns.seatsRows.length}x${parsed.leftTopSeatColumns.seatsPerRow}`);
                              if (parsed.leftSeatColumns) zones.push(`Left: ${parsed.leftSeatColumns.seatsRows.length}x${parsed.leftSeatColumns.seatsPerRow}`);
                              if (parsed.rightSeatColumns) zones.push(`Right: ${parsed.rightSeatColumns.seatsRows.length}x${parsed.rightSeatColumns.seatsPerRow}`);
                              if (parsed.backSeats) zones.push(`Back: ${parsed.backSeats.seatsRows[0]?.length || 0}`);
                              return zones.join(" | ");
                            } catch (e) {
                              return "Standard Layout";
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                            {seatCount} Active Seats
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteModel(model.id)}
                            className="p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                            title="Delete model"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <div className="flex w-full flex-col gap-8 lg:flex-row relative z-10">
          <Card className="flex w-full flex-col overflow-hidden border border-slate-200/60 bg-white/60 p-0 shadow-2xl backdrop-blur-xl lg:w-[450px] shrink-0 dark:border-slate-700/60 dark:bg-slate-800/60">
            <div className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6 pb-4">
              <Label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Model Identifier</Label>
              <Input
                placeholder="e.g., Volvo Multi-Axle Sleeper"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="text-lg font-medium border-0 border-b-2 border-slate-300 dark:border-slate-600 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-indigo-500"
                required
              />
            </div>

            <div className="flex px-6 pt-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-4 font-medium text-sm transition-all relative whitespace-nowrap ${activeTab === tab.id
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] lg:max-h-none custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {activeTab === "general" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <NumberInput label="Door Height" value={doorHeight} onChange={(e: any) => setDoorHeight(Number(e.target.value))} />
                        <NumberInput label="Driver Height" value={driverHeight} onChange={(e: any) => setDriverHeight(Number(e.target.value))} />
                      </div>
                      <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl space-y-4">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Spacing Heights</h3>
                        <RangeSlider label="Left Top Space" value={leftTopHeight} onChange={(e: any) => setLeftTopHeight(Number(e.target.value))} />
                        <RangeSlider label="Left Space" value={leftHeight} onChange={(e: any) => setLeftHeight(Number(e.target.value))} />
                        <RangeSlider label="Right Space" value={rightHeight} onChange={(e: any) => setRightHeight(Number(e.target.value))} />
                        <RangeSlider label="Back Space" value={backHeight} onChange={(e: any) => setBackHeight(Number(e.target.value))} />
                      </div>
                    </div>
                  )}

                  {activeTab === "left" && (
                    <div className="space-y-6">
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Front Left Zone</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <NumberInput label="Columns (Depth)" value={leftTopCols} onChange={(e: any) => setLeftTopCols(Number(e.target.value))} />
                          <NumberInput label="Rows (Width)" value={leftTopRows} onChange={(e: any) => setLeftTopRows(Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Main Left Zone</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <NumberInput label="Columns (Depth)" value={leftCols} onChange={(e: any) => setLeftCols(Number(e.target.value))} />
                          <NumberInput label="Rows (Width)" value={leftRows} onChange={(e: any) => setLeftRows(Number(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "right" && (
                    <div className="space-y-6">
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Right Zone</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <NumberInput label="Columns (Depth)" value={rightCols} onChange={(e: any) => setRightCols(Number(e.target.value))} />
                          <NumberInput label="Rows (Width)" value={rightRows} onChange={(e: any) => setRightRows(Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Back Row Zone</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <NumberInput label="Columns (Depth)" value={backCols} onChange={(e: any) => setBackCols(Number(e.target.value))} />
                          <NumberInput label="Rows (Width)" value={backRows} onChange={(e: any) => setBackRows(Number(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 mt-auto border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={handleSubmit}
                disabled={isPending || !modelName}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all rounded-xl text-base font-semibold"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Configuration...
                  </div>
                ) : "Deploy Bus Model"}
              </Button>
            </div>
          </Card>

          <Card className="flex-1 overflow-hidden border border-slate-200/60 bg-gradient-to-br from-slate-100 to-slate-200 p-0 shadow-2xl backdrop-blur-sm dark:border-slate-700/60 dark:from-slate-900 dark:to-slate-800 flex flex-col relative rounded-2xl min-h-[500px]">
            <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 bg-[size:20px_20px]" />
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md relative z-10 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Preview Engine
              </h2>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {flattenBusSeats(busSeats).filter(s => s.seatStatus !== "deleted").length} Total Seats
              </div>
            </div>

            <div className="flex-1 overflow-auto p-8 relative z-10 custom-scrollbar flex items-center justify-center">
              <BusPropsProvider>
                <InteractivePreview />
              </BusPropsProvider>
            </div>
          </Card>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
        .bg-grid-slate-200\\/50 {
          background-image: linear-gradient(to right, rgba(226, 232, 240, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.5) 1px, transparent 1px);
        }
        .dark .bg-grid-slate-700\\/25 {
          background-image: linear-gradient(to right, rgba(51, 65, 85, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(51, 65, 85, 0.25) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
