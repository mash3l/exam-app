import { Search, ChevronsUpDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export default function ExamsLoadingSkeleton() {
  return (
    <div className="w-full pb-10">
      {/* 1. هيكل الهيدر */}
      <div className="bg-white w-full border-b border-gray-200 px-8 py-6">
        <div className="w-20 h-4 bg-slate-200 animate-pulse mb-5"></div>
        <div className="flex justify-between items-center">
          <div className="w-32 h-6 bg-slate-200 animate-pulse"></div>
          <div className="w-40 h-9 bg-slate-200 animate-pulse"></div>
        </div>
      </div>

      <div className="p-8 pt-6">
        {/* 2. هيكل الفلاتر */}
        <div className="bg-white border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="space-y-3">
            <div className="h-10 w-full bg-slate-100 animate-pulse border border-gray-200"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 w-full bg-slate-100 animate-pulse border border-gray-200"></div>
              <div className="h-10 w-full bg-slate-100 animate-pulse border border-gray-200"></div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
               <div className="h-9 w-20 bg-slate-100 animate-pulse"></div>
               <div className="h-9 w-20 bg-slate-200 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 3. هيكل الجدول */}
        <div className="bg-white border border-gray-200 shadow-sm min-h-[300px]">
          <table className="w-full text-left font-mono whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#175FFF] text-white">
              <tr>
                <th className="px-5 py-3 w-[80px]"><div className="w-10 h-4 bg-blue-400/50 animate-pulse"></div></th>
                <th className="px-5 py-3 w-[35%]"><div className="w-24 h-4 bg-blue-400/50 animate-pulse"></div></th>
                <th className="px-5 py-3 w-[25%]"><div className="w-20 h-4 bg-blue-400/50 animate-pulse"></div></th>
                <th className="px-5 py-3 w-[15%]"><div className="w-32 h-4 bg-blue-400/50 animate-pulse"></div></th>
                <th className="px-5 py-3"><div className="w-10 h-4 bg-blue-400/50 animate-pulse ml-auto"></div></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-b border-gray-100">
                  <td className="px-5 py-3"><div className="w-12 h-12 bg-slate-200 animate-pulse"></div></td>
                  <td className="px-5 py-3"><div className="w-48 h-4 bg-slate-200 animate-pulse"></div></td>
                  <td className="px-5 py-3"><div className="w-32 h-4 bg-slate-200 animate-pulse"></div></td>
                  <td className="px-5 py-3"><div className="w-16 h-4 bg-slate-200 animate-pulse"></div></td>
                  <td className="px-5 py-3"><div className="w-8 h-8 bg-slate-200 animate-pulse ml-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}