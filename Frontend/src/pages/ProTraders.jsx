import { useState } from 'react';
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

  const topTraders = [
    { name: "John Smith", photo: "https://i.pravatar.cc/150?img=1" },
    { name: "Emma Wilson", photo: "https://i.pravatar.cc/150?img=2" },
    { name: "Michael Brown", photo: "https://i.pravatar.cc/150?img=3" },
    { name: "Sarah Davis", photo: "https://i.pravatar.cc/150?img=4" },
    { name: "James Johnson", photo: "https://i.pravatar.cc/150?img=5" },
    { name: "Lisa Anderson", photo: "https://i.pravatar.cc/150?img=6" },
    { name: "David Miller", photo: "https://i.pravatar.cc/150?img=7" },
    { name: "Emily Taylor", photo: "https://i.pravatar.cc/150?img=8" },
    { name: "Robert Wilson", photo: "https://i.pravatar.cc/150?img=9" },
    { name: "Jessica Moore", photo: "https://i.pravatar.cc/150?img=10" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
  
    try {
      await leagueApplicationSchema.validate(formData, { abortEarly: false });
  
      const form = new FormData();
      form.append('leagueDate', leagueData.currentLeague.nextLeagueStart); // 👈 this line is important
      form.append('name', formData.name);
      form.append('mobile', formData.mobile);
      form.append('image', formData.image);
  
      const res = await fetch('http://localhost:5002/api/applicationsByDate', {
        method: 'POST',
        body: form,
      });
  
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');
  
      setApplications((prev) => [...prev, result.application]);
      toast.success('Application submitted!');
      setFormData({ name: '', mobile: '', image: null });
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
      <motion.h1 className="page-heading">Next league will start from 01/04/2025</motion.h1>

      <div className="traders-content">
        <div className="leagues-section">
          {/* Current League */}
          <div className="league-block">
            <h2 className="league-date">Current League ({leagueData.currentLeague.startDate})</h2>
            <div className="league-table">
              <table>
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="name-col">Trader</th>
                    <th className="trades-col">Trades</th>
                    <th className="roi-col">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueData.currentLeague.traders.slice(0, 3).map((trader) => (
                    <motion.tr 
                      key={trader.rank}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: trader.rank * 0.1 }}
                      className={trader.rank === 1 ? 'top-trader' : ''}
                    >
                      <td className="rank-col">{trader.rank}</td>
                      <td className="name-col">{trader.name}</td>
                      <td className="trades-col">{trader.trades}</td>
                      <td className="roi-col">
                        <span className="roi">{trader.roi}%</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Previous League */}
          <div className="league-block">
            <h2 className="league-date">Previous League ({leagueData.previousLeague.startDate})</h2>
            <div className="league-table">
              <table>
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="name-col">Trader</th>
                    <th className="trades-col">Trades</th>
                    <th className="roi-col">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueData.previousLeague.traders.slice(0, 3).map((trader) => (
                    <motion.tr 
                      key={trader.rank}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: trader.rank * 0.1 }}
                      className={trader.rank === 1 ? 'top-trader' : ''}
                    >
                      <td className="rank-col">{trader.rank}</td>
                      <td className="name-col">{trader.name}</td>
                      <td className="trades-col">{trader.trades}</td>
                      <td className="roi-col">
                        <span className="roi">{trader.roi}%</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Previous Previous League Winners */}
          <div className="league-block">
            <h2 className="league-date">Previous Winners</h2>
            <div className="previous-winners">
              <div className="winner-card">
                <span className="winner-date">January 2024</span>
                <span className="winner-name">Alex Thompson</span>
                <span className="winner-roi">ROI: 92.5%</span>
              </div>
              <div className="winner-card">
                <span className="winner-date">December 2023</span>
                <span className="winner-name">Maria Garcia</span>
                <span className="winner-roi">ROI: 88.7%</span>
              </div>
              <div className="winner-card">
                <span className="winner-date">November 2023</span>
                <span className="winner-name">Chris Wilson</span>
                <span className="winner-roi">ROI: 85.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Traders Photos */}
        <div className="top-traders-photos">
          <h2>Top 10 Traders</h2>
          <div className="traders-grid">
            {topTraders.map((trader, index) => (
              <motion.div 
                key={index}
                className="trader-photo-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <img src={trader.photo} alt={trader.name} className="trader-photo" />
                <span className="trader-name">{trader.name}</span>
                <span className="trader-rank">#{index + 1}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="league-info">
        <div className="next-league">
          <h2>Apply Next League</h2>
          <div className="dates">
            <p>Current League Start: {leagueData.currentLeague.startDate}</p>
            <p>Current Participants: {leagueData.currentLeague.participants}</p>
            <p>Next League Start: {leagueData.currentLeague.nextLeagueStart}</p>
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
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className={errors.image ? 'error' : ''}
              />
              {errors.image && <span className="error-message">{errors.image}</span>}
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
  );
}

export default ProTraders;