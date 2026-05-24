import React, { useState, useEffect } from 'react';
import { X, Upload, Music, Loader2, List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const AddEpisodeModal = ({ isOpen, onClose, playlist, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [isFree, setIsFree] = useState(false);

  useEffect(() => {
    if (isOpen && playlist) {
      setIsFree(playlist.isFree || false);
      setAudioFiles([]);
    }
  }, [isOpen, playlist]);

  if (!isOpen || !playlist) return null;

  const handleAudioChange = (e) => {
    if (e.target.files) {
      setAudioFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (audioFiles.length === 0) return toast.error("Please select files");

    setLoading(true);
    const formData = new FormData();
    audioFiles.forEach(f => formData.append('audioFiles', f));
    formData.append('isFree', isFree);

    try {
      await api.post(`/audio/playlist/${playlist.id}/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Episodes added successfully!");
      onSuccess(); // Refresh data
      onClose();
      setAudioFiles([]);
      setIsFree(playlist.isFree || false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add episodes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-[#181825] w-full max-w-md p-8 rounded-2xl border border-white/10 animate-scale-in">
        <button onClick={onClose} disabled={loading} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>

        <h3 className="text-xl font-bold text-white mb-2">Add Episodes</h3>
        <p className="text-sm text-gray-400 mb-6">Adding to: <span className="text-white font-bold">{playlist.title}</span></p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Select Audio Files</label>
            <div className={`border-2 border-dashed border-gray-700 rounded-xl p-6 text-center transition-colors ${audioFiles.length > 0 ? 'bg-green-900/10 border-green-500/50' : 'hover:border-[#E50914]/50'}`}>
              <input type="file" accept="audio/*" id="addEpUpload" className="hidden" multiple onChange={handleAudioChange} />
              <label htmlFor="addEpUpload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="bg-[#121212] p-3 rounded-full text-gray-400"><Music size={24} /></div>
                <span className="text-sm font-medium text-gray-300">
                  {audioFiles.length > 0 ? `${audioFiles.length} New Files` : "Click to Upload"}
                </span>
              </label>
            </div>
            {/* Preview */}
            {audioFiles.length > 0 && (
              <div className="mt-2 bg-[#121212] rounded-lg p-3 max-h-32 overflow-y-auto border border-gray-800">
                {audioFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400 py-1 border-b border-gray-800 last:border-0">
                    <List size={12} /> {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-bold text-sm">Is Free Episode?</span>
              <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-5 h-5 accent-red-500 cursor-pointer" />
            </div>
            <p className="text-xs text-gray-500 mt-1">If checked, anyone can play this episode for free.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#E50914] py-3 rounded-xl font-bold text-white hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
            {loading ? 'Uploading...' : 'Add Episodes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEpisodeModal;