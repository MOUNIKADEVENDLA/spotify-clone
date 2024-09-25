const audioPlayer = document.getElementById('audio-player');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const albumArt = document.getElementById('album-art');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressSlider = document.getElementById('progress-slider');
const currentTimeLabel = document.getElementById('current-time');
const totalTimeLabel = document.getElementById('total-time');

const defaultAlbumArt = 'http://localhost:5000/static/album-art.jpg';
let songs = [];
let currentSongIndex = 0;

const disableControls = () => {
    prevBtn.classList.add('disabled');
    playBtn.classList.add('disabled');
    nextBtn.classList.add('disabled');
};

const enableControls = () => {
    prevBtn.classList.remove('disabled');
    playBtn.classList.remove('disabled');
    nextBtn.classList.remove('disabled');
};

// Fetch songs from the backend
async function fetchSongs() {
    const response = await fetch('http://localhost:5000/songs');
    songs = await response.json(); // Update the outer songs variable
    loadPlaylist();

    if (songs.length > 0) {
        loadSong(currentSongIndex);
        enableControls(); // Enable controls once songs are loaded
    }
}

// Initially disable controls
disableControls();

// Load song information
function loadSong(index) {
    const song = songs[index];
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumArt.src = `http://localhost:5000/static/${song.cover_image}`;
    audioPlayer.src = `http://localhost:5000/static/${song.audio}`;

    // Set the slider max value to the song duration when metadata is loaded
    audioPlayer.onloadedmetadata = () => {
        progressSlider.max = audioPlayer.duration;
        totalTimeLabel.textContent = formatTime(audioPlayer.duration); // Show total duration
    };

    // Enable controls after loading the first song
    enableControls();
}

// Load the playlist into the UI
function loadPlaylist() {
    const carousel = document.getElementById('song-carousel');
    carousel.innerHTML = ''; // Clear the carousel
    songs.forEach((song, index) => {
        const item = document.createElement('div');
        item.classList.add('song-carousel-item');
        item.innerHTML = `
            <img src="http://localhost:5000/static/${song.cover_image}" alt="${song.title}">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
        item.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            audioPlayer.play();
        });
        carousel.appendChild(item);
    });
}

// Load the default album art and empty song info
// Load the default album art and empty song info
function loadDefaultState() {
    songTitle.textContent = 'No Song Selected';
    songArtist.textContent = '';
    albumArt.src = defaultAlbumArt; // Load default album art
    audioPlayer.src = ''; // No song is selected
    progressSlider.value = 0; // Reset slider
    currentTimeLabel.textContent = "0:00"; // Reset current time
    totalTimeLabel.textContent = "0:00"; // Reset total time
}


// Update slider value as the song plays
audioPlayer.addEventListener('timeupdate', () => {
    progressSlider.value = audioPlayer.currentTime; // Update slider value to current time
    currentTimeLabel.textContent = formatTime(audioPlayer.currentTime); // Update current time display

    // Optional: Fill the slider with color based on the current time
    progressSlider.style.background = `linear-gradient(to right, #1db954 ${ (audioPlayer.currentTime / audioPlayer.duration) * 100 }%, #444 ${ (audioPlayer.currentTime / audioPlayer.duration) * 100 }%)`;
});


// Seek to the position on slider input
progressSlider.addEventListener('input', () => {
    audioPlayer.currentTime = progressSlider.value; // Seek to the position on slider input
});

// Play/Pause toggle
playBtn.addEventListener('click', () => {
    if (!playBtn.classList.contains('disabled')) { // Only allow play if not disabled
        if (audioPlayer.paused) {
            audioPlayer.play();
            playBtn.classList.remove('fa-play');
            playBtn.classList.add('fa-pause');
        } else {
            audioPlayer.pause();
            playBtn.classList.remove('fa-pause');
            playBtn.classList.add('fa-play');
        }
    }
});

// Previous song
prevBtn.addEventListener('click', () => {
    if (!prevBtn.classList.contains('disabled')) { // Only allow if not disabled
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        audioPlayer.play();
    }
});

// Next song
nextBtn.addEventListener('click', () => {
    if (!nextBtn.classList.contains('disabled')) { // Only allow if not disabled
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        audioPlayer.play();
    }
});

// Automatically go to next song after completion
audioPlayer.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length; // Go to the next song
    loadSong(currentSongIndex);
    audioPlayer.play(); // Play the next song
});

// Function to format time in mm:ss format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Start fetching songs when the page loads
loadDefaultState(); // Load default album art and disable controls
fetchSongs();
