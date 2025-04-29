import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './ProgressForm.css';
import { toast } from 'react-hot-toast';
import { deleteProgressUpdate } from '../services/api';

const ProgressForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    content: '',
    templateType: 'GENERAL',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to create a progress update');
      setLoading(false);
      return;
    }

    const userId = user.sub || user.id;
    if (!userId) {
      setError('Unable to determine user ID. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        'http://localhost:8081/api/progress',
        { ...formData },
        {
          params: { userId },
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      navigate('/progress');
    } catch (error) {
      setError(
        'Failed to create progress update: ' +
          (error.response?.data?.message || error.message)
      );
      console.error('Error creating progress update:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (progressId) => {
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      await deleteProgressUpdate(progressId, user.sub);
      toast.success('Progress update deleted successfully');
      navigate('/progress');
    } catch (error) {
      console.error('Error deleting progress update:', error);
      toast.error(error.message || 'Failed to delete progress update');
    }
  };

  if (!user) {
    return (
      <div className="error-message">
        Please log in to create a progress update.
      </div>
    );
  }

  return (
    <div className="progress-form-container">
      <h1>Create Progress Update</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="progress-form">
        <div className="form-group">
          <label htmlFor="templateType">Update Type</label>
          <select
            id="templateType"
            name="templateType"
            value={formData.templateType}
            onChange={handleChange}
            required
          >
            <option value="GENERAL">General Update</option>
            <option value="MILESTONE">Milestone</option>
            <option value="CHALLENGE">Challenge</option>
            <option value="REFLECTION">Reflection</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Share your progress..."
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Update'}
        </button>
      </form>
    </div>
  );
};

export default ProgressForm;
