const TOPIC = "lockingamoungusirlyeah";
const SITE_URL = "https://blueowl-studios.github.io/Amoung-us-IRL/";

const notifyBtn = document.getElementById("notify-btn");
const statusText = document.getElementById("status-text");
const logList = document.getElementById("log-list");

// 1. Request Permission
notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        notifyBtn.innerText = "Notifications Enabled ✓";
        notifyBtn.style.background = "#28a745";
    }
});

// 2. Connect to ntfy.sh
const eventSource = new EventSource(`https://ntfy.sh/${TOPIC}/sse`);

eventSource.onopen = () => {
    statusText.innerText = "Connected & Listening for Among Us IRL triggers...";
    statusText.className = "status connected";
};

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.event === "message") {
        // A. Create Clickable Desktop/Mobile Notification
        if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("Among Us IRL Alert!", {
                body: data.message,
                icon: "https://ntfy.sh/static/images/badge.png"
            });

            // Focus or open your GitHub Pages website when clicked
            notification.onclick = (e) => {
                e.preventDefault();
                window.open(SITE_URL, "_blank");
            };
        }

        // B. Dynamically Update the Page (Live Feed)
        addLogEntry(data.message);
    }
};

eventSource.onerror = () => {
    statusText.innerText = "Disconnected. Trying to reconnect...";
    statusText.className = "status disconnected";
};

// Function to add dynamic live updates to the UI
function addLogEntry(text) {
    const li = document.createElement("li");
    const timestamp = new Date().toLocaleTimeString();
    li.innerHTML = `<span>[${timestamp}]</span> ${text}`;
    logList.prepend(li); // Show newest messages at the top
}