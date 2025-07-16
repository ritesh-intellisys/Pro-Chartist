import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminPanel.css';

function AdminPanel({ leagueData, setLeagueData, applications, setApplications }) {
  const [selectedImage, setSelectedImage] = useState(null);
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
  const navigate = useNavigate();

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
        const res = await fetch('http://localhost:5002/api/league');
const data = await res.json();

        if (data) {
          setLeagueData(data);
          setModifiedTraders(data.currentLeague.traders);
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
        const res = await fetch('http://localhost:5002/api/videos');
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
        const res = await fetch(`http://localhost:5002/api/applicationsByDate?date=${selectedDate}`);
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
      xhr.open('POST', 'http://localhost:5002/api/videos/upload', true);
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

      const res = await fetch('http://localhost:5002/api/videos/bulk/update', {
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
    try {
      const appId = application._id || application.id;
      const res = await fetch(`http://localhost:5002/api/applicationsByDate/${appId}`, {
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
  };

  const handleLogout = () => navigate('/admin/login');

  const updateLeagueData = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5002/api/league', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLeague: leagueData.currentLeague }),
      });
  
      if (!res.ok) throw new Error('Failed to save league data');
  
      const updated = await res.json();
      setLeagueData(updated);
      setModifiedTraders(updated.currentLeague.traders);
      localStorage.setItem("leagueData", JSON.stringify(updated));
      toast.success('League data saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save league data');
    }
  };
  

  const handleUpdateTrader = (rank, field, value) => {
    setModifiedTraders(
      modifiedTraders.map((trader) =>
        trader.rank === rank ? { ...trader, [field]: value } : trader
      )
    );
  };

  const handleSubmitTraders = async () => {
    const updatedLeague = {
      ...leagueData,
      currentLeague: {
        ...leagueData.currentLeague,
        traders: modifiedTraders.slice(0, 3),
      },
    };

    try {
      const res = await fetch('http://localhost:5002/api/league', {
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
  };

  const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
  const closeImageModal = () => setSelectedImage(null);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-content">
        <div className="league-management">
          <h2>League Management</h2>
          <form onSubmit={updateLeagueData}>
            <div className="form-group">
              <label>Current League Start Date</label>
              <input
                type="date"
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
              <label>Next League Start Date</label>
              <input
                type="date"
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
              <label>Current Participants</label>
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

        <div className="video-management">
          <h2>Video Management</h2>
          <div className="video-grid-admin">
            {videos.map((video) => (
              <div key={video.id} className="video-card-admin">
                <h3>Video {video.id}</h3>
                
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => handleVideoUpdate(video.id, 'title', e.target.value)}
                    placeholder="Video title"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={video.description}
                    onChange={(e) => handleVideoUpdate(video.id, 'description', e.target.value)}
                    placeholder="Video description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleVideoUpload(video.id, e.target.files[0], 'thumbnail');
                      }
                    }}
                    disabled={uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail'}
                  />
                  {video.thumbnail && (
                    <img 
                      src={video.thumbnail.startsWith('http') ? video.thumbnail : `http://localhost:5002${video.thumbnail}`}
                      alt="Thumbnail" 
                      style={{ width: '100px', height: '60px', objectFit: 'cover', marginTop: '5px' }}
                    />
                  )}
                  {uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail' && (
                    <span>Uploading thumbnail...</span>
                  )}
                  {uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail' && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress[`${video.id}_thumbnail`] || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{Math.round(uploadProgress[`${video.id}_thumbnail`] || 0)}%</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Video File</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleVideoUpload(video.id, e.target.files[0], 'video');
                      }
                    }}
                    disabled={uploadingVideo?.id === video.id && uploadingVideo?.type === 'video'}
                  />
                  {video.videoUrl && (
                    <video 
                      src={video.videoUrl} 
                      controls 
                      style={{ width: '100%', maxHeight: '150px', marginTop: '5px' }}
                    />
                  )}
                  {uploadingVideo?.id === video.id && uploadingVideo?.type === 'video' && (
                    <span>Uploading video...</span>
                  )}
                  {uploadingVideo?.id === video.id && uploadingVideo?.type === 'video' && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress[`${video.id}_video`] || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{Math.round(uploadProgress[`${video.id}_video`] || 0)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={saveVideos} className="update-btn" style={{ marginTop: '20px' }}>
            Save All Videos
          </button>
        </div>

        <div className="applications">
          <h2 className='h2'>Pending Applications of <p>{leagueData.currentLeague.nextLeagueStart}</p> league</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Mobile</th><th>Image</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody className='applications-body'>
              {applications.map((app, index) => (
                <tr key={app._id || index}>
                  <td>{app.name}</td>
                  <td>{app.mobile}</td>
                  <td>
                    {app.imageUrl && (
                      <img
                        src={`http://localhost:5002/${app.imageUrl}`}
                        alt="Trading Screenshot"
                        width="50"
                        onClick={() => openImageModal(`http://localhost:5002/${app.imageUrl}`)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                  </td>
                  <td>Pending</td>
                  <td>
                    <button onClick={() => handleApplicationStatus(app, 'approved')} className="action-btn approve">Approve</button>
                    <button onClick={() => handleApplicationStatus(app, 'rejected')} className="action-btn reject">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="accepted-applications">
          <h2>Accepted Applications</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Mobile</th><th>Image</th><th>Actions</th></tr>
            </thead>
            <tbody className='accepted-applications-body'>
              {acceptedApplications.map((app, index) => (
                <tr key={app._id || index}>
                  <td>{app.name}</td>
                  <td>{app.mobile}</td>
                  <td>
                    {app.imageUrl && (
                      <img
                        src={`http://localhost:5002/${app.imageUrl}`}
                        alt="Trading Screenshot"
                        width="50"
                        onClick={() => openImageModal(`http://localhost:5002/${app.imageUrl}`)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleApplicationStatus(app, 'rejected')} className="action-btn reject">Reject</button>
                    <button onClick={() => handleApplicationStatus(app, 'pending')} className="action-btn revert">Revert to Pending</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rejected-applications">
          <h2>Rejected Applications</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Mobile</th><th>Image</th><th>Actions</th></tr>
            </thead>
            <tbody className='rejected-applications-body'>
              {rejectedApplications.map((app, index) => (
                <tr key={app._id || index}>
                  <td>{app.name}</td>
                  <td>{app.mobile}</td>
                  <td>
                    {app.imageUrl && (
                      <img
                        src={`http://localhost:5002/${app.imageUrl}`}
                        alt="Trading Screenshot"
                        width="50"
                        onClick={() => openImageModal(`http://localhost:5002/${app.imageUrl}`)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleApplicationStatus(app, 'approved')} className="action-btn approve">Approve</button>
                    <button onClick={() => handleApplicationStatus(app, 'pending')} className="action-btn revert">Revert to Pending</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="update-traders">
  <h2>Update Top Traders</h2>
  <table>
    <thead>
      <tr><th>Rank</th><th>Name</th><th>Trades</th><th>ROI</th></tr>
    </thead>
    <tbody className='traders-table-modified'>
      {modifiedTraders.slice(0, 3).map((trader) => (
        <tr key={trader.rank}>
          <td>{trader.rank}</td>
          <td><input type="text" value={trader.name} onChange={(e) => handleUpdateTrader(trader.rank, 'name', e.target.value)} /></td>
          <td><input type="number" value={trader.trades} onChange={(e) => handleUpdateTrader(trader.rank, 'trades', parseInt(e.target.value))} /></td>
          <td><input type="number" value={trader.roi} onChange={(e) => handleUpdateTrader(trader.rank, 'roi', parseFloat(e.target.value))} /></td>
        </tr>
      ))}
    </tbody>
  </table>
  <button onClick={handleSubmitTraders} className="update-btn">Update Top Traders</button>
</div>
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content">
            <img src={selectedImage} alt="Enlarged Trading Screenshot" style={{ maxWidth: '90%', maxHeight: '90%' }} />
            <button className="close-modal-btn" onClick={closeImageModal}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;