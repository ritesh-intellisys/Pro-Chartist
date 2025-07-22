const API_URL = import.meta.env.VITE_API_URL;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminPanel.css';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Confirmation Modal Component
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[300px] max-w-xs">
        <div className="mb-4 text-gray-900 dark:text-gray-100">{message}</div>
        <div className="flex justify-end gap-2">
          <button className="update-btn bg-gray-400 hover:bg-gray-500 text-white" onClick={onCancel}>Cancel</button>
          <button className="update-btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState({
    title: course?.title || '',
    validity: course?.validity || '',
    discount: course?.discount || '',
    currentPrice: course?.currentPrice || '',
    originalPrice: course?.originalPrice || '',
    image: null,
  });
  const [preview, setPreview] = useState(
    course?.imageUrl
      ? `${import.meta.env.VITE_API_URL}/${course.imageUrl.replace(/^\/?/, '')}`
      : null
  );
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%',
    marginBottom: 10,
    background: 'var(--bg-primary, #fff)',
    color: 'var(--text-primary, #222)',
    border: '1px solid var(--border-color, #ccc)',
    borderRadius: 6,
    padding: '0.5rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files[0] }));
      setPreview(files[0] ? URL.createObjectURL(files[0]) : preview);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });
    const method = course ? 'PUT' : 'POST';
    const url = course ? `${API_URL}/api/courses/${course._id}` : `${API_URL}/api/courses`;
    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to save course');
        setLoading(false);
        return;
      }
      toast.success('Course saved successfully!');
      setLoading(false);
      onSave();
      onClose();
    } catch (err) {
      toast.error('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ color: 'var(--accent-color)', marginBottom: 16 }}>{course ? 'Edit Course' : 'Add New Course'}</h2>
        <label>Title<input name="title" value={form.title} onChange={handleChange} required style={inputStyle} /></label>
        <label>Validity<input name="validity" value={form.validity} onChange={handleChange} style={inputStyle} /></label>
        <label>Discount (%)<input name="discount" value={form.discount} onChange={handleChange} style={inputStyle} /></label>
        <label>Current Price (₹)<input name="currentPrice" value={form.currentPrice} onChange={handleChange} style={inputStyle} /></label>
        <label>Original Price (₹)<input name="originalPrice" value={form.originalPrice} onChange={handleChange} style={inputStyle} /></label>
        <label>Image<input name="image" type="file" accept="image/*" onChange={handleChange} style={inputStyle} /></label>
        {preview && <img src={preview} alt="Preview" style={{ width: 80, borderRadius: 8, marginBottom: 10 }} />}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="update-btn" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" className="update-btn bg-gray-400" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function AdminPanel({ leagueData, setLeagueData, applications, setApplications }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomedIn, setZoomedIn] = useState(false); // <-- Add zoom state
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [modifiedTraders, setModifiedTraders] = useState([]);
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Smart Money Concept Strategy',
      description: 'How to trade bot Bitcoin, Bank Nifty trade using Price line bot',
      thumbnail: '',
      videoUrl: ''
    },
    {
      id: 2,
      title: "Stock's Swing Bot Strategy",
      description: 'Stock swing bot: Use this bot to trade swing & stocks',
      thumbnail: '',
      videoUrl: ''
    },
    {
      id: 3,
      title: 'Price Line Bot Strategy',
      description: 'This bot presents and makes all kinds of levels of SMC',
      thumbnail: '',
      videoUrl: ''
    },
    {
      id: 4,
      title: 'Liquidity Bot Strategy',
      description: 'Learn how to identify and trade liquidity zones with this bot',
      thumbnail: '',
      videoUrl: ''
    }
  ]);
  const [uploadingVideo, setUploadingVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [applicationFilter, setApplicationFilter] = useState('pending'); // NEW: filter state
  const [editingVideoId, setEditingVideoId] = useState(null); // NEW: track which video is being edited
  const navigate = useNavigate();

  // Confirmation modal state
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });

  // Helper to open confirmation modal
  const askConfirm = (message, onConfirm) => {
    setConfirm({ open: true, message, onConfirm });
  };
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null });

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (editingVideoId) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [editingVideoId]);

  // Helper to update progress for a specific video and type
  const setProgressFor = (videoId, type, progress) => {
    setUploadProgress(prev => ({
      ...prev,
      [`${videoId}_${type}`]: progress
    }));
  };

  const clearProgressFor = (videoId, type) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[`${videoId}_${type}`];
      return newProgress;
    });
  };

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/league`);
const data = await res.json();

        if (data) {
          setLeagueData(data);
          // Fallback: if traders is empty or malformed, initialize with 3 blank traders
          let traders = Array.isArray(data.currentLeague.traders) && data.currentLeague.traders.length >= 3
            ? data.currentLeague.traders
            : [
                { rank: 1, name: '', trades: 0, roi: 0 },
                { rank: 2, name: '', trades: 0, roi: 0 },
                { rank: 3, name: '', trades: 0, roi: 0 }
              ];
          setModifiedTraders(traders);
          localStorage.setItem('leagueData', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Failed to fetch league data:', err);
      }
    };
    fetchLeagueData();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/videos`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          setVideos(data);
        } else {
          // Initialize with default videos if none exist
          const defaultVideos = [
            {
              id: 1,
              title: 'Smart Money Concept Strategy',
              description: 'How to trade bot Bitcoin, Bank Nifty trade using Price line bot',
              thumbnail: '',
              videoUrl: ''
            },
            {
              id: 2,
              title: "Stock's Swing Bot Strategy",
              description: 'Stock swing bot: Use this bot to trade swing & stocks',
              thumbnail: '',
              videoUrl: ''
            },
            {
              id: 3,
              title: 'Price Line Bot Strategy',
              description: 'This bot presents and makes all kinds of levels of SMC',
              thumbnail: '',
              videoUrl: ''
            },
            {
              id: 4,
              title: 'Liquidity Bot Strategy',
              description: 'Learn how to identify and trade liquidity zones with this bot',
              thumbnail: '',
              videoUrl: ''
            }
          ];
          setVideos(defaultVideos);
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        toast.error('Failed to fetch videos');
      }
    };
    
    fetchVideos();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      const selectedDate = leagueData?.currentLeague?.nextLeagueStart;
      if (!selectedDate) return;
  
      try {
        const res = await fetch(`${API_URL}/api/applicationsByDate?date=${selectedDate}`);
        const data = await res.json(); // ⬅️ DIRECTLY use the array
  
        const pending = data.filter(app => app.status === 'pending');
        const approved = data.filter(app => app.status === 'approved');
        const rejected = data.filter(app => app.status === 'rejected');
  
        setApplications(pending);
        setAcceptedApplications(approved);
        setRejectedApplications(rejected);
      } catch (err) {
        toast.error('Failed to fetch applications by date');
        console.error('fetchApplications error:', err);
      }
    };
  
    fetchApplications();
  }, [leagueData?.currentLeague?.nextLeagueStart]);

  // Backend upload logic
  const uploadFileToBackend = async (videoId, type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('videoId', videoId);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/videos/upload`, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setProgressFor(videoId, type, progress);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          setProgressFor(videoId, type, 100);
          const data = JSON.parse(xhr.responseText);
          resolve(data.url);
        } else {
          setProgressFor(videoId, type, 0);
          reject(new Error('Upload failed'));
        }
      };
      xhr.onerror = () => {
        setProgressFor(videoId, type, 0);
        reject(new Error('Upload failed'));
      };
      xhr.send(formData);
    });
  };

  const handleVideoUpload = async (videoId, file, type) => {
    try {
      setUploadingVideo({ id: videoId, type });
      setProgressFor(videoId, type, 0);
      const url = await uploadFileToBackend(videoId, type, file);
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, [type === 'video' ? 'videoUrl' : 'thumbnail']: url }
          : video
      ));
      toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} uploaded successfully!`);
    } catch (error) {
      console.error('Video upload failed:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploadingVideo(null);
      clearProgressFor(videoId, type);
    }
  };

  const handleVideoUpdate = (videoId, field, value) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, [field]: value } : video
    ));
  };

  const saveVideos = async () => {
    try {
      // Ensure all required fields are present for each video
      const videosToSave = videos.map((video, idx) => ({
        id: video.id ?? idx + 1,
        title: video.title || '',
        description: video.description || '',
        thumbnail: video.thumbnail || '',
        videoUrl: video.videoUrl || '',
      }));

      const res = await fetch(`${API_URL}/api/videos/bulk/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: videosToSave })
      });

      if (!res.ok) {
        throw new Error('Failed to save videos');
      }

      const updatedVideos = await res.json();
      setVideos(updatedVideos);
      toast.success('Videos saved successfully!');
    } catch (error) {
      console.error('Failed to save videos:', error);
      toast.error('Failed to save videos');
    }
  };

  const handleApplicationStatus = async (application, newStatus) => {
    let actionMsg = '';
    if (newStatus === 'approved') actionMsg = 'approve this application';
    else if (newStatus === 'rejected') actionMsg = 'reject this application';
    else actionMsg = 'revert this application to pending';
    askConfirm(`Are you sure you want to ${actionMsg}?`, async () => {
      closeConfirm();
    try {
      const appId = application._id || application.id;
      const res = await fetch(`${API_URL}/api/applicationsByDate/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update application');

      const updatedApp = await res.json();

      setApplications(prev => prev.filter(app => app._id !== appId));
      setAcceptedApplications(prev => prev.filter(app => app._id !== appId));
      setRejectedApplications(prev => prev.filter(app => app._id !== appId));

      if (newStatus === 'approved') setAcceptedApplications(prev => [...prev, updatedApp]);
      else if (newStatus === 'rejected') setRejectedApplications(prev => [...prev, updatedApp]);
      else setApplications(prev => [...prev, updatedApp]);

      toast.success(`Application marked as ${newStatus}`);
    } catch (err) {
      console.error('Update status failed:', err);
      toast.error('Failed to update application status');
    }
    });
  };

  const handleLogout = () => {
    askConfirm('Are you sure you want to logout?', () => {
      closeConfirm();
      navigate('/admin/login');
    });
  };

  // Get today's date in yyyy-mm-dd format
  const todayStr = new Date().toISOString().split('T')[0];

  // Update the League Management form submission to validate dates
  const updateLeagueData = async (e) => {
    e.preventDefault();
    const startDate = leagueData.currentLeague.startDate;
    const nextLeagueStart = leagueData.currentLeague.nextLeagueStart;
    if (startDate < todayStr || nextLeagueStart < todayStr) {
      toast.error('Please select today or a future date for league dates.');
      return;
    }
    askConfirm('Are you sure you want to update league dates?', async () => {
      closeConfirm();
    try {
      const res = await fetch(`${API_URL}/api/league`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLeague: leagueData.currentLeague }),
      });
      if (!res.ok) throw new Error('Failed to save league data');
      const updated = await res.json();
      setLeagueData(updated);
      setModifiedTraders(updated.currentLeague.traders);
      localStorage.setItem('leagueData', JSON.stringify(updated));
      toast.success('League data saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save league data');
    }
    });
  };
  

  const handleUpdateTrader = (rank, field, value) => {
    setModifiedTraders(
      modifiedTraders.map((trader) =>
        trader.rank === rank ? { ...trader, [field]: value } : trader
      )
    );
  };

  const handleSubmitTraders = async () => {
    askConfirm('Are you sure you want to update top traders?', async () => {
      closeConfirm();
    const updatedLeague = {
      ...leagueData,
      currentLeague: {
        ...leagueData.currentLeague,
        traders: modifiedTraders.slice(0, 3),
      },
    };

    try {
      const res = await fetch(`${API_URL}/api/league`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLeague: updatedLeague.currentLeague }),
      });

      if (!res.ok) throw new Error('Failed to save trader data');

      const updated = await res.json();
      setLeagueData(updated);
      setModifiedTraders(updated.currentLeague.traders);
      localStorage.setItem("leagueData", JSON.stringify(updated));
      toast.success('Top traders updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update traders');
    }
    });
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomedIn(false); // Reset zoom when opening
  };
  const closeImageModal = () => setSelectedImage(null);
  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoomedIn(z => !z);
  };

  // NEW: get filtered applications
  let filteredApplications = [];
  if (applicationFilter === 'pending') filteredApplications = applications;
  else if (applicationFilter === 'accepted') filteredApplications = acceptedApplications;
  else if (applicationFilter === 'rejected') filteredApplications = rejectedApplications;

  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then(res => res.json())
      .then(setCourses);
  }, []);
  const refreshCourses = () => {
    fetch(`${API_URL}/api/courses`)
      .then(res => res.json())
      .then(setCourses);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-content">
        {/* Flex row for League Management and Update Top Traders */}
        <div className="flex-row-admin-panel">
        <div className="league-management">
          <h2 className="text-2xl font-bold mb-4">League Management</h2>
          <form onSubmit={updateLeagueData}>
            <div className="form-group">
              <label className="font-medium mb-1 block">Current League Start Date</label>
              <input
                type="date"
                min={todayStr}
                value={leagueData.currentLeague.startDate}
                onChange={(e) => setLeagueData({
                  ...leagueData,
                  currentLeague: {
                    ...leagueData.currentLeague,
                    startDate: e.target.value,
                  },
                })}
              />
            </div>
            <div className="form-group">
              <label className="font-medium mb-1 block">Next League Start Date</label>
              <input
                type="date"
                min={todayStr}
                value={leagueData.currentLeague.nextLeagueStart}
                onChange={(e) => setLeagueData({
                  ...leagueData,
                  currentLeague: {
                    ...leagueData.currentLeague,
                    nextLeagueStart: e.target.value,
                  },
                })}
              />
            </div>
            <div className="form-group">
              <label className="font-medium mb-1 block">Current Participants</label>
              <input
                type="number"
                value={leagueData.currentLeague.participants}
                onChange={(e) => setLeagueData({
                  ...leagueData,
                  currentLeague: {
                    ...leagueData.currentLeague,
                    participants: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <button type="submit" className="update-btn">Update League Dates</button>
          </form>
          </div>

          <div className="update-traders">
            <h2 className="text-xl font-bold mb-4">Update Top Traders</h2>
            <table>
              <thead>
                <tr><th>Rank</th><th>Name</th><th>Trades</th><th>ROI</th></tr>
              </thead>
              <tbody className='traders-table-modified'>
                {modifiedTraders.slice(0, 3).map((trader) => (
                  <tr key={trader.rank}>
                    <td>{trader.rank}</td>
                    <td><input type="text" value={trader.name || ''} onChange={(e) => handleUpdateTrader(trader.rank, 'name', e.target.value)} /></td>
                    <td><input type="number" value={trader.trades ?? 0} onChange={(e) => handleUpdateTrader(trader.rank, 'trades', parseInt(e.target.value))} /></td>
                    <td><input type="number" value={trader.roi ?? 0} onChange={(e) => handleUpdateTrader(trader.rank, 'roi', parseFloat(e.target.value))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleSubmitTraders} className="update-btn">Update Top Traders</button>
          </div>
        </div>

        <div className="video-management relative">
          <h2 className="text-2xl font-bold mb-4">Video Management</h2>
          {/* Blur overlay for entire page when editing */}
          {editingVideoId && (
            <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/10 pointer-events-none" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {videos.map((video) => {
              const isEditing = editingVideoId === video.id;
              if (isEditing) {
                // Render the editing card as a fixed, centered modal above the blur
                return (
                  <div
                    key={video.id}
                    className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-lg w-full border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[90vh]"
                    style={{ minWidth: '320px' }}
                  >
                    <h3 className="text-lg font-semibold mb-2">Video {video.id}</h3>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Title</label>
                      <input
                        type="text"
                        value={video.title}
                        onChange={e => handleVideoUpdate(video.id, 'title', e.target.value)}
                        placeholder="Video title"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Description</label>
                      <textarea
                        value={video.description}
                        onChange={e => handleVideoUpdate(video.id, 'description', e.target.value)}
                        placeholder="Video description"
                        rows="3"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Thumbnail</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files[0]) {
                            handleVideoUpload(video.id, e.target.files[0], 'thumbnail');
                          }
                        }}
                        disabled={uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail'}
                        className="block w-full text-sm text-gray-400"
                      />
                      {video.thumbnail && (
                        <img
                        src={
                          video.thumbnail.startsWith('http')
                            ? video.thumbnail
                            : `${import.meta.env.VITE_API_URL}/${video.thumbnail.replace(/^\/?/, '')}`
                        }
                        alt="Thumbnail"
                        className="w-28 h-16 object-cover rounded-lg mt-2 border border-gray-300 dark:border-gray-700"
                      />
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail' && (
                        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">Uploading thumbnail...</div>
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail' && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-pink-500 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress[`${video.id}_thumbnail`] || 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Video File</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={e => {
                          if (e.target.files[0]) {
                            handleVideoUpload(video.id, e.target.files[0], 'video');
                          }
                        }}
                        disabled={uploadingVideo?.id === video.id && uploadingVideo?.type === 'video'}
                        className="block w-full text-sm text-gray-400"
                      />
                      {video.videoUrl && (
                        <video
                          src={video.videoUrl}
                          controls
                          className="w-full max-h-40 mt-2 rounded-lg border border-gray-300 dark:border-gray-700"
                        />
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'video' && (
                        <div className="mt-2 text-xs text-pink-600 dark:text-pink-400">Uploading video...</div>
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'video' && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-pink-400 to-amber-400 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress[`${video.id}_video`] || 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="update-btn"
                        onClick={e => {
                          e.preventDefault();
                          saveVideos();
                          setEditingVideoId(null);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="update-btn bg-gray-400 hover:bg-gray-500 text-white"
                        onClick={e => {
                          e.preventDefault();
                          setEditingVideoId(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }
              // Non-editing cards
              return (
                <div key={video.id} className="video-card-admin relative transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">Video {video.id}</h3>
                  <div className="mb-2"><span className="font-semibold">Title:</span> {video.title}</div>
                  <div className="mb-2"><span className="font-semibold">Description:</span> {video.description}</div>
                  <div className="mb-2">
                    <span className="font-semibold">Thumbnail:</span><br />
                    {video.thumbnail && (
                      <img
                      src={
                        video.thumbnail.startsWith('http')
                          ? video.thumbnail
                          : `${import.meta.env.VITE_API_URL}/${video.thumbnail.replace(/^\/?/, '')}`
                      }
                      alt="Thumbnail"
                      className="w-28 h-16 object-cover rounded-lg mt-2 border border-gray-300 dark:border-gray-700"
                    />
                    
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Video:</span><br />
                    {video.videoUrl && (
                      <video
                        src={video.videoUrl}
                        controls
                        className="w-full max-h-40 mt-2 rounded-lg border border-gray-300 dark:border-gray-700"
                      />
                    )}
                  </div>
                  <button
                    className="update-btn mt-2"
                    onClick={e => {
                      e.preventDefault();
                      setEditingVideoId(video.id);
                    }}
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combined Applications Table */}
        <div className="applications">
          <div className="flex items-center gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded font-semibold border ${applicationFilter === 'pending' ? 'border-amber-500' : 'border-gray-300'}`}
              onClick={() => setApplicationFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold border ${applicationFilter === 'accepted' ? 'border-green-500' : 'border-gray-300'}`}
              onClick={() => setApplicationFilter('accepted')}
            >
              Accepted
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold border ${applicationFilter === 'rejected' ? 'border-red-500' : 'border-gray-300'}`}
              onClick={() => setApplicationFilter('rejected')}
            >
              Rejected
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4 h2">
            {applicationFilter.charAt(0).toUpperCase() + applicationFilter.slice(1)} Applications
            {applicationFilter === 'pending' && (
              <span className="text-xl font-bold"> of {leagueData.currentLeague.nextLeagueStart} league</span>
            )}
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Image</th>
                  {applicationFilter === 'pending' && <th>Status</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={
                applicationFilter === 'pending' ? 'applications-body' :
                applicationFilter === 'accepted' ? 'accepted-applications-body' :
                'rejected-applications-body'
              }>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={applicationFilter === 'pending' ? 5 : 4} style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
                      No applications
                    </td>
                  </tr>
                ) : (
                  filteredApplications.filter(app => app && app.name).map((app, index) => (
                  <tr key={app._id || index}>
                    <td>{app.name}</td>
                    <td>{app.mobile}</td>
                    <td>
                      {app.imageUrl && (
                        <img
                        src={`${import.meta.env.VITE_API_URL}/${app.imageUrl.replace(/^\/?/, '')}`}
                        alt="Trading Screenshot"
                        onClick={() =>
                          openImageModal(`${import.meta.env.VITE_API_URL}/${app.imageUrl.replace(/^\/?/, '')}`)
                        }
                        style={{
                          cursor: 'pointer',
                          maxWidth: '100%',
                          maxHeight: '60px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      />
                      
                      )}
                    </td>
                    {applicationFilter === 'pending' && <td>Pending</td>}
                    <td>
                      {applicationFilter === 'pending' && (
                        <>
                          <button onClick={() => handleApplicationStatus(app, 'approved')} className="action-btn approve">Approve</button>
                          <button onClick={() => handleApplicationStatus(app, 'rejected')} className="action-btn reject">Reject</button>
                        </>
                      )}
                      {applicationFilter === 'accepted' && (
                        <>
                          <button onClick={() => handleApplicationStatus(app, 'rejected')} className="action-btn reject">Reject</button>
                          <button onClick={() => handleApplicationStatus(app, 'pending')} className="action-btn revert">Revert to Pending</button>
                        </>
                      )}
                      {applicationFilter === 'rejected' && (
                        <>
                          <button onClick={() => handleApplicationStatus(app, 'approved')} className="action-btn approve">Approve</button>
                          <button onClick={() => handleApplicationStatus(app, 'pending')} className="action-btn revert">Revert to Pending</button>
                        </>
                      )}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-courses-section" style={{ margin: '2rem 0', background: 'var(--card-bg)', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
          <h2 style={{ color: 'var(--accent-color)', marginBottom: 16 }}>Courses Management</h2>
          <div className="courses-grid-admin" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Add New Course Card */}
            <div
              className="course-card-admin add-new"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'var(--glass-bg)', borderRadius: 12, minHeight: 340, cursor: 'pointer', border: '2px dashed var(--accent-color)', color: 'var(--accent-color)', fontWeight: 600, fontSize: 18
              }}
              onClick={() => { setEditingCourse(null); setShowCourseModal(true); }}
            >
              <span style={{ fontSize: 48, marginBottom: 12 }}>+</span>
              Add New Course
            </div>
            {/* Course Cards */}
            {courses.map(course => (
              <div key={course._id} className="course-card-admin" style={{ background: 'var(--glass-bg)', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 340, position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', height: 160, background: '#222' }}>
  {course.imageUrl && (
    <img
      src={`${import.meta.env.VITE_API_URL}/${course.imageUrl.replace(/^\/?/, '')}`}
      alt={course.title}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )}
  <span
    className="discount-badge"
    style={{
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'var(--card-bg)',
      color: 'var(--accent-color)',
      padding: '0.4rem 1rem',
      borderRadius: 20,
      fontWeight: 500,
      fontSize: 14,
      boxShadow: '0 2px 4px rgba(0,0,0,0.10)',
    }}
  >
    {course.discount}%
  </span>
</div>

                <div style={{ flex: 1, padding: '1.2rem' }}>
                  <h3 style={{ color: 'var(--accent-color)', fontSize: 18, margin: 0, marginBottom: 6 }}>{course.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>{course.validity}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: 18 }}>₹{course.currentPrice}</span>
                    <span style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: 15 }}>₹{course.originalPrice}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="update-btn" onClick={() => { setEditingCourse(course); setShowCourseModal(true); }}>Edit</button>
                    <button className="update-btn bg-red-500" onClick={() => { setCourseToDelete(course); setShowDeleteConfirm(true); }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* CourseModal for Add/Edit */}
          {showCourseModal && (
            <CourseModal
              course={editingCourse}
              onClose={() => setShowCourseModal(false)}
              onSave={refreshCourses}
            />
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <ConfirmModal
              open={showDeleteConfirm}
              message={`Are you sure you want to delete "${courseToDelete?.title}"?`}
              onConfirm={async () => {
                await fetch(`${API_URL}/api/courses/${courseToDelete._id}`, { method: 'DELETE' });
                setShowDeleteConfirm(false);
                setCourseToDelete(null);
                refreshCourses();
              }}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
</div>

      </div>

      {selectedImage && (
        <div
          className="image-modal"
          onClick={closeImageModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            className="modal-content"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '90vw',
              height: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: false }}
              pinch={{ step: 0.1 }}
              panning={{ velocityDisabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <>
                  <TransformComponent>
                    <img
                      src={selectedImage}
                      alt="Enlarged Trading Screenshot"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </TransformComponent>
                  <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 8 }}>
                    <button onClick={zoomIn} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer' }}>+</button>
                    <button onClick={zoomOut} style={{ background: '#222', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer' }}>-</button>
                    <button onClick={resetTransform} style={{ background: '#666', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer' }}>Reset</button>
                  </div>
                </>
              )}
            </TransformWrapper>
            <button
              className="close-modal-btn"
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(30,30,30,0.85)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 44,
                height: 44,
                fontSize: 28,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(30,30,30,0.85)')}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}

export default AdminPanel;