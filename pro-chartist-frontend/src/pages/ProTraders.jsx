import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { leagueApplicationSchema } from '../validation/schemas';
import toast from 'react-hot-toast';
import './ProTraders.css';

function ProTraders({ leagueData, setLeagueData, applications, setApplications }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_IMAGE_SIZE_MB = 2;
  const [imagePreview, setImagePreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Helper to get the full backend URL for images (Cloudinary or local)
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}/${url.replace(/^\/?/, '')}`;
  };

  // ✅ Fetch updated league data on mount
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/league`);
        const data = await res.json();
        setLeagueData(data);
      } catch (err) {
        console.error('Failed to fetch league data:', err);
      }
    };

    fetchLeagueData();
  }, [setLeagueData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Only image files are allowed.' }));
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }
    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: `Image must be less than ${MAX_IMAGE_SIZE_MB}MB.` }));
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    setErrors((prev) => ({ ...prev, image: undefined }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Defensive: check for leagueData
    if (!leagueData?.currentLeague?.nextLeagueStart) {
      toast.error('League data not loaded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    try {
      await leagueApplicationSchema.validate(formData, { abortEarly: false });

      const form = new FormData();
      form.append('leagueDate', leagueData.currentLeague.nextLeagueStart);
      form.append('name', formData.name);
      form.append('mobile', formData.mobile);
      form.append('image', formData.image);

      const res = await fetch(`${API_URL}/api/applicationsByDate`, {
        method: 'POST',
        body: form,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');

      setApplications((prev) => [...prev, result.application]);
      toast.success('Application submitted!');
      setFormData({ name: '', mobile: '', image: null });
      setImagePreview(null);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach((err) => (newErrors[err.path] = err.message));
        setErrors(newErrors);
      } else {
        console.error('Application submission error:', error);
        toast.error(error.message || 'Failed to submit application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pro-traders-page">
      <motion.h1 
        className="page-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Top Traders
      </motion.h1>
      <motion.h1 className="page-heading">
        Next league will start from {leagueData?.currentLeague?.nextLeagueStart || '...'}
      </motion.h1>

      <div className="traders-content">
        <div className="leagues-section">
          {/* ✅ Current League */}
          <div className="league-block">
            <h2 className="league-date">
              Previous League Winners <br/>({leagueData?.currentLeague?.startDate || '...'})
            </h2>
            <div className="league-table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Trader</th>
                    <th>Trades</th>
                    <th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueData?.currentLeague?.traders?.slice(0, 3).map((trader) => (
                    <motion.tr
                      key={trader.rank}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: trader.rank * 0.1 }}
                      className={trader.rank === 1 ? 'top-trader' : ''}
                    >
                      <td>{trader.rank}</td>
                      <td>{trader.name}</td>
                      <td>{trader.trades}</td>
                      <td><span className="roi">{trader.roi}%</span></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          

          {/* Previous Winners (Static for now) */}
          <div className="league-block">
            <h2 className="league-date">Top Traders</h2>
            <div className="previous-winners">
              <div className="winner-card">
                <span className="winner-date">Jan 2024</span>
                <span className="winner-name">Ashish C</span>
                <span className="winner-roi">ROI: 92.5%</span>
              </div>
              <div className="winner-card">
                <span className="winner-date">Dec 2023</span>
                <span className="winner-name">Manisha M</span>
                <span className="winner-roi">ROI: 88.7%</span>
              </div>
              <div className="winner-card">
                <span className="winner-date">Nov 2023</span>
                <span className="winner-name">Chetan Patil</span>
                <span className="winner-roi">ROI: 85.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next League Form */}
        <div className="league-info">
          <div className="next-league">
            <h2>Apply Next League</h2>
            <div className="dates">
              <p>Current League Start: {leagueData?.currentLeague?.startDate}</p>
              <p>Current Participants: {leagueData?.currentLeague?.participants}</p>
              <p>Next League Start: {leagueData?.currentLeague?.nextLeagueStart}</p>
            </div>
            <form onSubmit={handleSubmit} className="application-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={errors.mobile ? 'error' : ''}
                />
                {errors.mobile && <span className="error-message">{errors.mobile}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="image">Upload Trading Screenshot</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={errors.image ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.image && <span className="error-message">{errors.image}</span>}
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, marginTop: 8 }} />
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="join-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Join Next League'}
              </button>
            </form>
          </div>

          <div className="rules">
            <h2>Rules</h2>
            <ul>
              <li>Register using your platform credentials</li>
              <li>Trading data will be reset before new league begins</li>
              <li>Rankings are based on trading performance and ROI</li>
              <li>Minimum 50 trades required per week</li>
              <li>Maximum leverage allowed: 20x</li>
              <li>Weekly performance updates every Sunday</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProTraders;