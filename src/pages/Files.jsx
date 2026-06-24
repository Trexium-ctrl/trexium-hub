import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, LoadingState, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderOpen, Download, Trash2, Search, Upload as UploadIcon } from 'lucide-react';
import { format } from 'date-fns';
import FileUploadDialog from '@/components/FileUploadDialog';

const CATEGORIES = ['Questionnaire', 'Logo', 'Photos', 'Website copy', 'Contract', 'Invoice', 'Brand guide', 'Inspiration sites', 'Screenshots', 'Other'];
const CATEGORY_ICONS = {
  'Questionnaire': '📋', 'Logo': '🎨', 'Photos': '📷', 'Website copy': '✍️',
  'Contract': '📄', 'Invoice': '💳', 'Brand guide': '🎯', 'Inspiration sites': '💡', 'Screenshots': '📸', 'Other': '📎'
};

export default function Files() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [f, c] = await Promise.all([
        base44.entities.ClientFile.list('-created_date', 200),
        base44.entities.Customer.list('-created_date', 200),
      ]);
      setFiles(f); setCustomers(c);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const filtered = files.filter(f => {
    const matchSearch = !search || f.file_name?.toLowerCase().includes(search.toLowerCase()) || f.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || f.file_category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Files"
        subtitle={`${filtered.length} files`}
        action={<Button onClick={() => setUploadOpen(true)} className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white"><Plus className="w-4 h-4 mr-1.5" />Upload File</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="pl-9 bg-[#161B22] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58]" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-[#161B22] border-[#30363D] text-[#E6EDF3]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            <SelectItem value="all" className="text-[#E6EDF3] focus:bg-[#21262D]">All categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-[#E6EDF3] focus:bg-[#21262D]">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files found" subtitle="Upload client assets to get started" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(f => (
            <div key={f.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#484F58] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{CATEGORY_ICONS[f.file_category] || '📎'}</div>
                <div className="flex gap-1">
                  {f.file_url && <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center" title="Download"><Download className="w-3 h-3 text-[#8B949E]" /></a>}
                  <button onClick={async () => { await base44.entities.ClientFile.delete(f.id); load(); }} className="w-7 h-7 rounded-lg bg-[#21262D] hover:bg-red-500/20 flex items-center justify-center" title="Delete"><Trash2 className="w-3 h-3 text-[#8B949E] hover:text-red-400" /></button>
                </div>
              </div>
              <p className="text-sm font-medium text-[#E6EDF3] truncate">{f.file_name}</p>
              <p className="text-xs text-[#8B949E] truncate mt-0.5">{f.customer_name || 'Unassigned'}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{f.file_category}</span>
                <span className="text-[10px] text-[#484F58]">{f.created_date ? format(new Date(f.created_date), 'MMM d') : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <FileUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={load} />
    </div>
  );
}