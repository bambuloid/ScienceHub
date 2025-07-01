const apiKey = process.env.YOUTUBE_API_KEY;
const videoPlayer = document.getElementById("video-player");
const randomButton = document.getElementById("random-video-button");
const channelOptionsContainer = document.getElementById("channel-options");
const newChannelInput = document.getElementById("new-channel-input");
const addChannelButton = document.getElementById("add-channel");
const enableAllButton = document.getElementById("enable-all");
const disableAllButton = document.getElementById("disable-all");
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggle-sidebar");
const overlay = document.getElementById("overlay");

// Default channels
let channels = JSON.parse(localStorage.getItem("channels")) || [
    { id: "UCsXVk37bltHxD1rDPwtNM8Q", name: "Kurzgesagt", enabled: true },
    { id: "UCNIuvl7V8zACPpTmmNIqP2A", name: "Oversimplified", enabled: true },
    { id: "UCuCkxoKLYO_EQ2GeFtbM_bw", name: "Half as Interesting", enabled: true},
    { id: "UCogtnBlbC3RS1vEM4mndCaQ", name: "Fraser Cain", enabled: true },
    { id: "UCR1IuLEqb6UEA_zQ81kwXfg", name: "Real Engineering", enabled: true },
    { id: "UCf5POn4NNKIIGmXOu6qhbsQ", name: "Inside a Mind", enabled: true },
    { id: "UCoxcjq-8xIDTYp3uz647V5A", name: "Numberphile", enabled: true },
    { id: "UCLXo7UDZvByw2ixzpQCufnA", name: "Vox", enabled: true },
    { id: "UClI5iGXJlIXX4eYH9FqBnKA", name: "Psych2Go", enabled: true },
    { id: "UCO7ee7K7ejc1H9F6kH5gZzg", name: "Our Changing Climate", enabled: true },
    { id: "UCJm2TgUqtK1_NLBrjNQ1P-w", name: "Second Thought", enabled: true },
    { id: "UCtESv1e7ntJaLJYKIO1FoYw", name: "Periodic Videos", enabled: true },
    { id: "UCUHW94eEFW7hkUMVaZz4eDg", name: "MinutePhysics", enabled: true },
    { id: "UCX6b17PVsYBQ0ip5gyeme-Q", name: "CrashCourse", enabled: true },
    { id: "UCEbYH5qxN8eRx4O7hRxZdjA", name: "Practical Engineering", enabled: true },
    { id: "UChzLnWVsl3puKQwc5PoO2gQ", name: "History Matters", enabled: true },
];

// Previously shown videos
let shownVideos = new Set();

// Render channel options
function renderChannels() {
    channelOptionsContainer.innerHTML = "";
    channels.forEach((channel, index) => {
        const option = document.createElement("div");
        option.className = "channel-option";
        option.innerHTML = `
            <label>${channel.name}</label>
            <input type="checkbox" ${channel.enabled ? "checked" : ""} data-index="${index}">
        `;
        channelOptionsContainer.appendChild(option);
    });

    document.querySelectorAll("#channel-options input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
            const index = e.target.dataset.index;
            channels[index].enabled = e.target.checked;
            saveChannels();
        });
    });
}

// Save channels
function saveChannels() {
    localStorage.setItem("channels", JSON.stringify(channels));
}

// Fetch random video
async function getRandomVideo() {
    const enabledChannels = channels.filter((channel) => channel.enabled);
    if (enabledChannels.length === 0) {
        alert("No channels enabled. Please enable at least one channel.");
        return;
    }

    const randomChannel = enabledChannels[Math.floor(Math.random() * enabledChannels.length)];

    try {
        // Step 1: Get the uploads playlist ID for the channel
        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${randomChannel.id}&key=${apiKey}`
        );
        const channelData = await channelResponse.json();
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // Step 2: Fetch videos from the uploads playlist
        const playlistResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
        );
        const playlistData = await playlistResponse.json();

        const videos = playlistData.items.filter((item) => !shownVideos.has(item.snippet.resourceId.videoId));
        if (videos.length === 0) {
            alert("No new videos available. Try enabling more channels.");
            return;
        }

        const video = videos[Math.floor(Math.random() * videos.length)];
        shownVideos.add(video.snippet.resourceId.videoId);
        videoPlayer.src = `https://www.youtube.com/embed/${video.snippet.resourceId.videoId}`;
    } catch (error) {
        console.error("Error fetching video:", error);
    }
}

// Sidebar toggle
toggleSidebar.addEventListener("click", () => {
    const isOpen = sidebar.style.left === "0px";
    sidebar.style.left = isOpen ? "-350px" : "0px";
    overlay.style.visibility = isOpen ? "hidden" : "visible";
    overlay.style.opacity = isOpen ? "0" : "1";
    toggleSidebar.style.transform = isOpen ? "translateX(0)" : "translateX(350px)";
    document.getElementById("main-content").style.filter = isOpen ? "none" : "blur(5px)";
});

// Add new channel
addChannelButton.addEventListener("click", () => {
    const channelId = newChannelInput.value.trim();
    if (channelId) {
        channels.push({ id: channelId, name: `Channel ${channels.length + 1}`, enabled: true });
        saveChannels();
        renderChannels();
        newChannelInput.value = "";
    }
});

// Enable/Disable all channels
enableAllButton.addEventListener("click", () => {
    channels.forEach((channel) => (channel.enabled = true));
    saveChannels();
    renderChannels();
});

disableAllButton.addEventListener("click", () => {
    channels.forEach((channel) => (channel.enabled = false));
    saveChannels();
    renderChannels();
});

// Initial render and video fetch
renderChannels();
getRandomVideo();
randomButton.addEventListener("click", getRandomVideo);
