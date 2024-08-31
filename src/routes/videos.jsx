// src/components/Videos.jsx
import React, { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar'; // Import ProgressBar from React Bootstrap


const Videos = () => {
  const [videos, setVideos] = useState([]); // State to hold the list of videos
  const [selectedVideo, setSelectedVideo] = useState(''); // State for the selected video
  const [format, setFormat] = useState('mp4'); // State for selected output format
  const [message, setMessage] = useState(''); // State to display messages
  const [progress, setProgress] = useState(0); // State to track transcoding progress
  const [statusMessage, setStatusMessage] = useState('');

  
  // Fetch the list of uploaded videos from the server
  useEffect(() => {
    fetch('http://localhost:5000/getVideos', {
      credentials: 'include', // Include credentials to ensure cookies are sent with the request
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setVideos(data))
      .catch((err) => {
        console.error('Error fetching videos:', err);
        setMessage('Failed to fetch videos. Please try again later.');
      });
  }, []);
  useEffect(() => {
      const eventSource = new EventSource('http://localhost:3000/transcode');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          setStatusMessage(data.error);
          eventSource.close();
        } else {
          console.log(data.progress)
          setProgress(data.progress);
          if (data.message) {
            setStatusMessage(data.message);
            eventSource.close();  // Close connection when transcoding is complete
          }
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        setStatusMessage('An error occurred during transcoding.');
        eventSource.close();
      };

      // Cleanup on unmount
      return () => {
        eventSource.close();
      };
    }, []);
  

  // Handle video selection change
  const handleVideoChange = (event) => {
    setSelectedVideo(event.target.value);
  };

  // Handle format selection change
  const handleFormatChange = (event) => {
    setFormat(event.target.value);
  };

  // Start transcoding process
  const startTranscoding = async (event) => {
    event.preventDefault();

    if (!selectedVideo) {
      setMessage('Please select a video to transcode.');
      return;
    }

    setMessage('Starting transcoding...');

    try {
      const response = await fetch('http://localhost:5000/transcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: selectedVideo, format }),
        credentials: 'include', // Include credentials to ensure cookies are sent with the request
      });

      if (response.ok) {
        const progressResponse = await fetch(`http://localhost:5000/progress?video_name=${selectedVideo}`, {
          credentials: 'include',
        });
        const progressData = await progressResponse.json();
        setProgress(progressData.progress);

        // Create a new URL object with the file URL
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element to initiate the download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `transcoded-${selectedVideo}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setMessage('Transcoding completed successfully and download started!');
      } else {
        const errorText = await response.text();
        setMessage(`Transcoding failed: ${errorText}`);
      }
    } catch (err) {
      console.error('Transcoding error:', err);
      setMessage('An error occurred during transcoding.');
    }
  
  };

  return (
    <div>
      <h1>Uploaded Videos</h1>
      <div id="videosList">
        <ul>
          {videos.map((video) => (
            <li key={`${video.id}-${video.original_file_name}`}>{video.original_file_name}</li>
          ))}
        </ul>
      </div>

      {/* Video Selector Form */}
      <form id="videoForm" onSubmit={startTranscoding}>
        <label htmlFor="videoSelector">Select a Video:</label>
        <select id="videoSelector" value={selectedVideo} onChange={handleVideoChange}>
          <option value="" disabled>
            --Please choose a video--
          </option>
          {videos.map((video) => (
            <option key={`${video.id}-${video.original_file_name}`} value={video.original_file_name}>
              {video.original_file_name}
            </option>
          ))}
        </select>

        <br />

        <label htmlFor="formatSelector">Select Output Format:</label>
        <select id="formatSelector" value={format} onChange={handleFormatChange}>
          <option value="mp4">MP4</option>
          <option value="avi">AVI</option>
          <option value="mov">MOV</option>
        </select>

        <br />

        <button type="submit">Transcode Selected Video</button>
      </form>
      {/* Progress Bar */}
      <div id="progress-container" className="mt-4">
        <h3>Transcoding Progress</h3>
        <ProgressBar now={progress} label={`${progress}%`} /> {/* Display progress using ProgressBar */}
      </div>

            <div>
      <h2>Transcoding Progress</h2>
      <p>Progress: {progress}%</p>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
      {message && <p>{message}</p>} {/* Display any messages to the user */}
    </div>
  );
};

export default Videos;
