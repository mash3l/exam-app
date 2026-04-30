import { Filter, X, ArrowDownUp, Search } from "lucide-react";

type AuditLogFiltersProps = {
  isFiltersVisible: boolean;
  setIsFiltersVisible: (v: boolean) => void;
  category: string;
  setCategory: (v: string) => void;
  actionFilter: string;
  setActionFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
};

export function AuditLogFilters({
  isFiltersVisible, setIsFiltersVisible,
  category, setCategory,
  actionFilter, setActionFilter,
  searchQuery, setSearchQuery,
  onApply, onClear
}: AuditLogFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm w-full rounded-[4px] overflow-hidden">
      <div className="bg-[#175FFF] px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white font-mono text-[13px] font-bold tracking-wide">
          <Filter size={16} strokeWidth={2.5} /> Search & Filters
        </div>
        <button 
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="flex items-center gap-1.5 text-white/90 hover:text-white font-mono text-[12px] font-bold transition-colors"
        >
          <X size={14} strokeWidth={3} /> {isFiltersVisible ? "Hide" : "Show"}
        </button>
      </div>
      
      {isFiltersVisible && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full border border-gray-200 bg-white px-4 font-mono text-[13px] text-slate-500 outline-none focus:border-[#175FFF] rounded-[4px] appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="EXAM">Exam</option>
                <option value="QUESTION">Question</option>
                <option value="USER">User</option>
                <option value="SYSTEM">System</option>
              </select>
              <ArrowDownUp size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select 
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-11 w-full border border-gray-200 bg-white px-4 font-mono text-[13px] text-slate-500 outline-none focus:border-[#175FFF] rounded-[4px] appearance-none cursor-pointer"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="SET_IMMUTABLE">Set Immutable</option>
                <option value="SEED_DATA">Seed Data</option>
              </select>
              <ArrowDownUp size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative flex items-center">
              <Search size={16} className="absolute left-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search username, email, entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full border border-gray-200 bg-white pl-10 pr-4 font-mono text-[13px] text-slate-700 outline-none focus:border-[#175FFF] rounded-[4px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end items-center gap-3">
            <button 
              onClick={onClear}
              className="font-mono text-[13px] font-bold text-slate-600 hover:text-[#175FFF] transition-colors px-4"
            >
              Clear
            </button>
            <button 
              onClick={onApply}
              className="bg-[#E2E8F0] hover:bg-slate-300 text-slate-700 font-mono text-[13px] font-bold h-10 px-8 rounded-[4px] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}