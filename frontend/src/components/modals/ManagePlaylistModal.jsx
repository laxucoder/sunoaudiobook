import React, { useState, useEffect } from 'react';
import { X, Upload, Music, Image as ImageIcon, Loader2, Save, Plus } from 'lucide-react'; // Added Plus icon

const ManagePlaylistModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('0');
  const [isFree, setIsFree] = useState(true);
  const [genre, setGenre] = useState('New & Hot');
  const [isCustomGenre, setIsCustomGenre] = useState(false); 
  const [audioFiles, setAudioFiles] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setArtist(initialData.artist || '');
        setGenre(initialData.category || 'New & Hot');
        setIsFree(initialData.isFree);
        setPrice(initialData.price || 0);
        setExistingThumbnail(initialData.thumbnail);
        setAudioFiles([]);
        setIsCustomGenre(false);
      } else {
        setTitle(''); setArtist(''); setGenre('New & Hot');
        setIsFree(true); setPrice(0);
        setAudioFiles([]); setImageFile(null); setExistingThumbnail(null);
        setIsCustomGenre(false);
      }
    }
  }, [isOpen, initialData]);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('category', genre);
    formData.append('isFree', isFree);
    formData.append('price', isFree ? 0 : price);
    if (imageFile) formData.append('thumbnail', imageFile);
    if (!initialData) {
      if (audioFiles.length === 0) {
        setLoading(false);
        return alert("Please upload at least one audio file");
      }
      audioFiles.forEach(f => formData.append('audioFiles', f));
    }
    await onSave(formData, !!initialData, initialData?.id);
    setLoading(false);
  };
  const defaultGenres = ["New & Hot", "Popular", "Trending", "English Story", "Sci-Fi", "Romance"];
  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-[#181825] w-full max-w-2xl p-8 rounded-2xl border border-white/10 animate-scale-in max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} disabled={loading} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>

        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          {initialData ? <Save className="text-[#E50914]" /> : <Upload className="text-[#E50914]" />}
          {initialData ? 'Edit Details' : 'Upload Series'}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="text-gray-400 text-xs font-bold uppercase">Title</label><input className="w-full bg-[#121212] border border-gray-700 p-3 rounded text-white" value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div><label className="text-gray-400 text-xs font-bold uppercase">Artist</label><input className="w-full bg-[#121212] border border-gray-700 p-3 rounded text-white" value={artist} onChange={e => setArtist(e.target.value)} required /></div>
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase flex justify-between">
                Genre
                <button type="button" onClick={() => { setIsCustomGenre(!isCustomGenre); setGenre(''); }} className="text-[#E50914] text-[10px] hover:underline">
                  {isCustomGenre ? "Select Existing" : "Create New"}
                </button>
              </label>
              {isCustomGenre ? (
                <input
                  className="w-full bg-[#121212] border border-[#E50914] p-3 rounded text-white placeholder-gray-600 animate-fade-in"
                  placeholder="Type new genre name..."
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  autoFocus
                  required
                />
              ) : (
                <select className="w-full bg-[#121212] border border-gray-700 p-3 rounded text-white" value={genre} onChange={e => setGenre(e.target.value)}>
                  {defaultGenres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              )}
            </div>
            <div className="bg-[#121212] p-4 rounded border border-gray-700">
              <div className="flex justify-between"><span className="text-gray-300 font-bold">Free?</span><input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-5 h-5 accent-red-500" /></div>
              {!isFree && <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#181825] border border-gray-600 p-2 mt-2 rounded text-white" placeholder="Price in ₹" />}
            </div>
          </div>
          <div className="space-y-4">
            {!initialData && (
              <div>
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 block">Audio Files</span>
                <label className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center block cursor-pointer hover:border-[#E50914] hover:bg-white/5 transition-all">
                  <input type="file" multiple onChange={e => setAudioFiles(Array.from(e.target.files))} className="hidden" />
                  <Music className="mx-auto mb-2 text-gray-400" />
                  <span className="text-gray-300 block">{audioFiles.length ? `${audioFiles.length} Selected` : "Click to Select Episodes"}</span>
                </label>
              </div>
            )}
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase mb-2 block">Cover Image</span>
              <label className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center flex flex-col items-center cursor-pointer hover:border-[#E50914] hover:bg-white/5 transition-all">
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" />
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} className="w-20 h-20 object-cover rounded mb-2 shadow-lg" alt="Preview" />
                ) : existingThumbnail ? (
                  <img src={existingThumbnail} className="w-20 h-20 object-cover rounded mb-2 shadow-lg" alt="Existing" />
                ) : (
                  <ImageIcon className="text-gray-500 mb-2" />
                )}
                <span className="text-sm text-gray-300">Change Cover</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full bg-[#E50914] py-4 rounded-xl font-bold text-white hover:bg-red-600 transition-colors shadow-lg mt-2 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin" /> : (initialData ? <Save size={20} /> : <Upload size={20} />)}
            {loading ? 'Processing...' : (initialData ? 'Update Playlist' : 'Upload Series')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagePlaylistModal;