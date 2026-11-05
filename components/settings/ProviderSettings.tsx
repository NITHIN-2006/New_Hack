import React, { useState, useEffect, useRef } from 'react';
import { AidmateProfile } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ProviderSettingsProps {
  profileData: AidmateProfile;
  onUpdateProfile: (updatedProfile: AidmateProfile) => void;
}

const ProviderSettings: React.FC<ProviderSettingsProps> = ({ profileData, onUpdateProfile }) => {
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [newProfilePicUrl, setNewProfilePicUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedSkills(profileData.skills);
    setNewProfilePicUrl(profileData.profilePictureUrl);

    // Clean up object URL on unmount
    return () => {
        if (newProfilePicUrl && newProfilePicUrl.startsWith('blob:')) {
            URL.revokeObjectURL(newProfilePicUrl);
        }
    };
  }, [profileData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePic(file);
      if (newProfilePicUrl && newProfilePicUrl.startsWith('blob:')) {
        URL.revokeObjectURL(newProfilePicUrl);
      }
      setNewProfilePicUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !editedSkills.includes(newSkill.trim())) {
      setEditedSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleSaveChanges = () => {
    const updatedProfile = {
      ...profileData,
      skills: editedSkills,
      // In a real app, you'd upload the newProfilePic and get a new URL.
      // For this demo, we'll just use the local blob URL for the preview.
      profilePictureUrl: newProfilePicUrl || profileData.profilePictureUrl,
    };
    onUpdateProfile(updatedProfile);
    window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { title: 'Profile Updated', body: 'Your changes have been successfully saved.' }
    }));
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Your Profile</h3>
      <div className="space-y-6">
        {/* Profile Picture Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <div className="mt-2 flex items-center space-x-4">
            <img src={newProfilePicUrl || ''} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50"
            >
              Change
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        </div>

        {/* Services Editor */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Your Services / Skills</label>
             <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-[40px]">
                {editedSkills.map(skill => (
                    <span key={skill} className="flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="ml-1.5 text-indigo-500 hover:text-indigo-700">
                            &times;
                        </button>
                    </span>
                ))}
            </div>
             <div className="flex items-center gap-2 mt-2">
                <input 
                    type="text" 
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add a new skill"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button onClick={handleAddSkill} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Add</button>
            </div>
        </div>
        
        <div className="pt-4 border-t">
            <Button onClick={handleSaveChanges}>
                Save Changes
            </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProviderSettings;