'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, Camera, Upload } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TextField from '../../components/TextField';
import Button from '../../components/Button';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  contact_number: string;
  birthday: string;
}

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  contact_number: string;
  birthday: string | null;
  profile_image: string | null;
  bio: string;
}

export default function AccountPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    contact_number: '',
    birthday: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = currentDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('https://todo-app.pioneeralpha.com/api/users/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data: UserData = await response.json();
      setUserData(data);
      
      const birthdayValue = data.birthday 
        ? new Date(data.birthday).toISOString().split('T')[0]
        : '';

      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        address: data.address || '',
        contact_number: data.contact_number || '',
        birthday: birthdayValue,
      });

      if (data.profile_image) {
        setProfileImage(data.profile_image);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('contact_number', formData.contact_number);
      
      if (formData.birthday) {
        formDataToSend.append('birthday', formData.birthday);
      }

      if (selectedImageFile) {
        formDataToSend.append('profile_image', selectedImageFile);
      }

      const response = await fetch('https://todo-app.pioneeralpha.com/api/users/me/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to update profile');
      }

      const updatedData: UserData = await response.json();
      
      setUserData(updatedData);
      
      if (updatedData.profile_image) {
        setProfileImage(updatedData.profile_image);
      }
      
      setSelectedImageFile(null);
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      const birthdayValue = userData.birthday 
        ? new Date(userData.birthday).toISOString().split('T')[0]
        : '';

      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        address: userData.address || '',
        contact_number: userData.contact_number || '',
        birthday: birthdayValue,
      });

      if (userData.profile_image) {
        setProfileImage(userData.profile_image);
      } else {
        setProfileImage(null);
      }
      setSelectedImageFile(null);
    }
    setSaveError(null);
    setSaveSuccess(false);
  };

  const getUserDisplayName = () => {
    if (userData) {
      const firstName = userData.first_name || '';
      const lastName = userData.last_name || '';
      return `${firstName} ${lastName}`.trim() || userData.email.split('@')[0];
    }
    return 'User';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-blue-50">
        <Sidebar userName="Loading..." userEmail="" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar
        userName={getUserDisplayName()}
        userEmail={userData?.email || ''}
        userAvatar={profileImage || userData?.profile_image || undefined}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-bold text-blue-600">DREAMY SOFTWARE</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{dayName}</span>
                <span className="ml-2">{dateString}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Account Information</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-semibold text-gray-400">
                        {formData.first_name.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleUploadClick}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <Button
                  onClick={handleUploadClick}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Photo
                </Button>
              </div>

              {saveSuccess && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">Profile updated successfully!</p>
                </div>
              )}
              {saveError && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <TextField
                    label="First Name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    label="Last Name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <TextField
                    label="Address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Contact Number"
                    name="contact_number"
                    type="tel"
                    value={formData.contact_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="birthday"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Birthday
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex items-center justify-center"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
