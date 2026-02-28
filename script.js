// YouTube to MP3/MP4 Converter Script

// Function to validate the YouTube URL
function validateYouTubeUrl(url) {
    const regex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.test(url);
    return regex;
}

// Function to extract video ID from the YouTube URL
function getVideoID(url) {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v') || url.split('/').pop();
}

// Function to convert video to MP3/MP4 (placeholder)
async function convertVideo(videoID, format) {
    // Implementation for conversion would go here. You could use an API or custom logic.
    console.log(`Converting video ID: ${videoID} to ${format}`);
    // Add conversion logic here
}

// Event listener for form submission (example)
document.getElementById('convert-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const url = document.getElementById('youtube-url').value;
    if (validateYouTubeUrl(url)) {
        const videoID = getVideoID(url);
        const format = document.querySelector('input[name="format"]:checked').value;
        convertVideo(videoID, format);
    } else {
        alert('Please enter a valid YouTube URL.');
    }
});
