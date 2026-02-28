// YouTube to MP3/MP4 Converter Script - Using Open Source APIs

// Get the yt-dlp web service endpoint
const YT_DLP_API = 'https://yt-dlp-api.vercel.app/api/download';
const Y2MATE_API = 'https://www.y2mate.com/api/v1/convert';

// Function to validate the YouTube URL
function validateYouTubeUrl(url) {
    const regex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+;/;
    return regex.test(url);
}

// Function to extract video ID from the YouTube URL
function getVideoID(url) {
    try {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('v') || url.split('/').pop();
    } catch (e) {
        return null;
    }
}

// Function to show messages to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Function to fetch video info using yt-dlp API
async function getVideoInfo(videoID) {
    try {
        showMessage('Fetching video information...', 'info');
        
        const response = await fetch(`${YT_DLP_API}?video_id=${videoID}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching video info:', error);
        throw new Error('Could not fetch video information. Please check the URL and try again.');
    }
}

// Alternative: Convert video using y2mate open-source API
async function convertVideoY2mate(videoID, format) {
    try {
        showMessage('Converting video (y2mate)...', 'info');
        
        const response = await fetch(Y2MATE_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                url: `https://www.youtube.com/watch?v=${videoID}`,
                format: format === 'mp4' ? '18' : '140',
            })
        });
        
        if (!response.ok) {
            throw new Error(`Conversion failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.download_url) {
            window.open(data.download_url, '_blank');
            showMessage('✅ Download started! Your file will begin downloading shortly.', 'success');
        } else {
            throw new Error('No download URL received');
        }
    } catch (error) {
        console.error('y2mate Conversion error:', error);
        showMessage(`⚠️ y2mate service temporarily unavailable. Please try again in a moment.`, 'error');
    }
}

// Primary conversion using cobalt.tools API (open-source, no auth needed)
async function convertVideo(videoID, format) {
    try {
        showMessage('🔄 Processing your video...', 'info');
        
        const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
        
        // Using cobalt.tools open-source API
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                vCodec: format === 'mp4' ? 'h264' : null,
                aCodec: format === 'mp3' ? 'aac' : null,
                filenamePattern: 'pretty',
                isAudioOnly: format === 'mp3',
                youtubeVideoQuality: format === 'mp4' ? '22' : null
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.url) {
            // Open download in new tab
            window.open(data.url, '_blank');
            showMessage(`✅ Download starting! Your ${format.toUpperCase()} file will begin shortly. Check your downloads folder.`, 'success');
            
            // Log for debugging
            console.log('Download initiated for:', {
                videoID,
                format,
                downloadUrl: data.url
            });
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Invalid response from conversion service');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        
        // Fallback to alternative method
        console.log('Trying alternative conversion method...');
        try {
            await convertVideoY2mate(videoID, format);
        } catch (fallbackError) {
            showMessage(`❌ Error: ${error.message}. Please try again or check if the video URL is correct.`, 'error');
        }
    }
}

// Event listener for form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('convert-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('youtube-url').value.trim();
            const format = document.querySelector('input[name="format"]:checked')?.value || 'mp3';
            
            if (!url) {
                showMessage('❌ Please enter a YouTube URL.', 'error');
                return;
            }
            
            if (!validateYouTubeUrl(url)) {
                showMessage('❌ Please enter a valid YouTube URL (youtube.com or youtu.be).', 'error');
                return;
            }
            
            const videoID = getVideoID(url);
            if (!videoID) {
                showMessage('❌ Could not extract video ID from URL.', 'error');
                return;
            }
            
            convertVideo(videoID, format);
        });
    }
});

// Add keyboard support (Enter key to submit)
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('youtube-url');
    if (urlInput) {
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('convert-form').dispatchEvent(new Event('submit'));
            }
        });
    }
});