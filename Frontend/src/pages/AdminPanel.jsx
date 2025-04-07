import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import './AdminPanel.css';

function AdminPanel({ leagueData, setLeagueData, applications, setApplications }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [modifiedTraders, setModifiedTraders] = useState([]);
  const navigate = useNavigate();

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

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `screenshots/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
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