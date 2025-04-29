import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './PostForm.css'; // Import the CSS file

const PostForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image1: null,
    image2: null,
    image3: null,
    video: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to create a post');
      setLoading(false);
      return;
    }

    // Extract and validate user ID
    const userId = user.sub || user.id;
    if (!userId) {
      setError('Unable to determine user ID. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('userId', userId);

      // Add images as an array
      const images = [];
      if (formData.image1) images.push(formData.image1);
      if (formData.image2) images.push(formData.image2);
      if (formData.image3) images.push(formData.image3);

      // Append each image with the same parameter name
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Add video if present
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }

      console.log('Submitting form data:', {
        title: formData.title,
        description: formData.description,
        userId: userId,
        numberOfImages: images.length,
        hasVideo: !!formData.video
      });

      const response = await axios.post('http://localhost:8081/api/posts', formDataToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        console.log('Post created successfully:', response.data);
        navigate('/posts');
      } else {
        setError('Failed to create post. No response data received.');
      }
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message ||
                         'Failed to create post. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!user) {
    return (
      <div className="post-form-container">
        <div className="error-message">Please log in to create a post.</div>
      </div>
    );
  }

  return (
    <div className="post-form-container">
      <h1>Create a New Post</h1>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter post title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Share your knowledge or ask a question..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="image1">Image 1</label>
          <input
            type="file"
            id="image1"
            name="image1"
            onChange={handleChange}
            accept="image/*"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image2">Image 2</label>
          <input
            type="file"
            id="image2"
            name="image2"
            onChange={handleChange}
            accept="image/*"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image3">Image 3</label>
          <input
            type="file"
            id="image3"
            name="image3"
            onChange={handleChange}
            accept="image/*"
          />
        </div>

        <div className="form-group">
          <label htmlFor="video">Video</label>
          <input
            type="file"
            id="video"
            name="video"
            onChange={handleChange}
            accept="video/*"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default PostForm;