import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', oldPassword: '', newPassword: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({ name: user.name || '', email: user.email || '', oldPassword: '', newPassword: '' });
      setPreview(user.profilePic || null);
      setAvatarFile(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.newPassword) {
        data.append('oldPassword', formData.oldPassword);
        data.append('newPassword', formData.newPassword);
      }
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await api.put('/user/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Profile updated!");
      if (onUpdate && res.data.user) onUpdate(res.data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="relative bg-[#181825] w-full max-w-md p-8 rounded-2xl border border-white/10 animate-scale-in">
        <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-bold text-white mb-6">Edit Profile</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <label className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#E50914] shadow-lg group cursor-pointer bg-gray-800">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-[#E50914] to-purple-900">
                  {formData.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <input name="name" className="w-full bg-[#121212] border border-gray-700 p-3 rounded text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" required />
            <input name="email" className="w-full bg-[#121212] border border-gray-700 p-3 rounded text-white" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email" required />
          </div>

          <div className="p-4 bg-[#121212] rounded border border-gray-800">
            <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Change Password</span>
            <input name="newPassword" type="password" placeholder="New Password" className="w-full bg-[#181825] border border-gray-700 p-2 rounded text-white mb-2 text-sm" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} />
            {formData.newPassword && (
              <input name="oldPassword" type="password" placeholder="Current Password" className="w-full bg-[#181825] border border-[#E50914]/50 p-2 rounded text-white text-sm" value={formData.oldPassword} onChange={e => setFormData({ ...formData, oldPassword: e.target.value })} />
            )}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-[#E50914] py-3 rounded font-bold text-white hover:bg-red-600 flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;