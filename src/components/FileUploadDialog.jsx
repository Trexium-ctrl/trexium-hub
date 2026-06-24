import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FileUploadDialog({ open, onClose, onUploaded, customerId, customerName, category }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState(category || 'Other');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = ['Questionnaire', 'Logo', 'Photos', 'Website copy', 'Contract', 'Invoice', 'Brand guide', 'Inspiration sites', 'Screenshots', 'Other'];

  useEffect(() => {
    if (open) {
      setFile(null);
      setFileName('');
      setFileCategory(category || 'Other');
      setNotes('');
    }
  }, [open, category]);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ClientFile.create({
        customer_id: customerId || '',
        customer_name: customerName || '',
        file_name: fileName,
        file_url,
        file_category: fileCategory,
        uploaded_by: 'Owner',
        notes
      });
      onUploaded && onUploaded();
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E6EDF3]">Upload File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[#8B949E] text-xs">File</Label>
            <div className="mt-1.5">
              <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border border-dashed border-[#30363D] rounded-lg cursor-pointer hover:border-[#7C3AED] transition-colors">
                <Upload className="w-5 h-5 text-[#8B949E]" />
                <span className="text-xs text-[#8B949E]">{file ? file.name : 'Click to select file'}</span>
                <input type="file" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          </div>
          <div>
            <Label className="text-[#8B949E] text-xs">File Name</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-1.5 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]"
            />
          </div>
          <div>
            <Label className="text-[#8B949E] text-xs">Category</Label>
            <Select value={fileCategory} onValueChange={setFileCategory}>
              <SelectTrigger className="mt-1.5 bg-[#0D1117] border-[#30363D] text-[#E6EDF3]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D]">
                {categories.map(c => <SelectItem key={c} value={c} className="text-[#E6EDF3] focus:bg-[#21262D]">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#8B949E] text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] resize-none"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#8B949E] hover:text-[#E6EDF3]">Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-[#7C3AED] hover:bg-[#6E56CF] text-white"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}