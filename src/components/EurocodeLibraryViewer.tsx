import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Tag,
  ExternalLink,
  Filter,
  FileText,
  Bookmark
} from 'lucide-react';
import { EUROCODE_LIBRARY, EurocodeClause } from '../data/eurocodeLibrary';

export const EurocodeLibraryViewer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Execution Class & Compliance', 'Structural Verification', 'Lifting & Rigging', 'Connections & Welds', 'Quality & Testing'];

  const popularKeywords = ['Table 24', 'EXC', 'Cl. 6.2.5', 'DAF', 'WPS', 'DoP', 'Pad-Eye', 'Bearing', 'Deflection', 'Annex ZA'];

  const filteredClauses = useMemo(() => {
    return EUROCODE_LIBRARY.filter((clause) => {
      const matchesCategory = selectedCategory === 'All' || clause.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        clause.clauseNumber.toLowerCase().includes(q) ||
        clause.codeStandard.toLowerCase().includes(q) ||
        clause.title.toLowerCase().includes(q) ||
        clause.summary.toLowerCase().includes(q) ||
        clause.practicalApplication.toLowerCase().includes(q) ||
        clause.tags.some(t => t.toLowerCase().includes(q)) ||
        clause.normativeRequirements.some(r => r.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyCitation = (clause: EurocodeClause) => {
    const citation = `${clause.codeStandard} - ${clause.clauseNumber}: "${clause.title}". ${clause.summary}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(clause.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            <span>Regulatory Standards Library</span>
            <span aria-hidden="true">·</span>
            <span>EN 1090 & Eurocode Clauses</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Searchable Eurocode & Execution Standards Reference
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Look up exact normative requirements, formulas, acceptance criteria, and Table 24 testing rules directly cited in calculations.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search clause numbers (e.g. 'Table 24', '6.2.5', 'Annex B'), standards, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Keyword Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Search:</span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setSearchQuery(kw)}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredClauses.length}</strong> matching Eurocode reference clauses
        </span>
        {searchQuery && (
          <span>
            Filter active: &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </div>

      {/* Clause Cards List */}
      <div className="space-y-4">
        {filteredClauses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No matching Eurocode clauses found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching by standard (e.g. &ldquo;EN 1090-2&rdquo;, &ldquo;EN 1993-1-1&rdquo;), clause number, or clearing your filter.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {clause.codeStandard}
                    </span>
                    <span className="font-mono font-semibold text-slate-700">
                      {clause.clauseNumber}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{clause.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">
                    {clause.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCitation(clause)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                  title="Copy standard citation"
                >
                  {copiedId === clause.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {clause.summary}
              </p>

              {/* Mathematical Formulas if any */}
              {clause.keyFormulas && clause.keyFormulas.length > 0 && (
                <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 font-mono text-xs space-y-1.5 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Normative Equations & Formulas:
                  </div>
                  {clause.keyFormulas.map((eq, i) => (
                    <div key={i} className="text-indigo-200">
                      {eq}
                    </div>
                  ))}
                </div>
              )}

              {/* Normative Requirements List */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Normative Compliance Requirements:
                </span>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc marker:text-indigo-500">
                  {clause.normativeRequirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical Workshop Application Tip */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 space-y-0.5">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                  Workshop & Inspection Application:
                </span>
                <p className="leading-relaxed">
                  {clause.practicalApplication}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {clause.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
