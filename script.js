const TOPIC = "lockingamoungusirlyeah";
const SITE_URL = "https://blueowl-studios.github.io/Amoung-us-IRL/";

const notifyBtn = document.getElementById("notify-btn");
const statusText = document.getElementById("status-text");
const logList = document.getElementById("log-list");

// 1. Request Permission & Register Service Worker properly
notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
    }

    // Request permissions first
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
        notifyBtn.innerText = "Notifications Enabled ✓";
        notifyBtn.style.background = "#28a745";

        // Register service worker if supported
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log("Service Worker Registered successfully:", registration);
            } catch (error) {
                console.error("Service Worker registration failed:", error);
            }
        }
    }
});

// 2. Connect to ntfy.sh
const eventSource = new EventSource(`https://ntfy.sh/${TOPIC}/sse`);

eventSource.onopen = () => {
    statusText.innerText = "Connected & Listening for Among Us IRL triggers...";
    statusText.className = "status connected";
};

eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.event === "message") {
        // A. Background-Safe Notification via Service Worker
        if (Notification.permission === "granted" && 'serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            
            // This is the specific method required for Android to show notifications out-of-app
            registration.showNotification("Among Us IRL Alert!", {
                body: data.message,
                icon: "https://ntfy.sh/static/images/badge.png",
                badge: "https://ntfy.sh/static/images/badge.png",
                vibrate: ,
                data: { url: SITE_URL } // Pass URL data to the service worker click handler
            });
        }

        // B. Dynamically Update the Page (Live Feed)
        addLogEntry(data.message);
    }
};

eventSource.onerror = () => {
    statusText.innerText = "Disconnected. Trying to reconnect...";
    statusText.className = "status disconnected";
};

function addLogEntry(text) {
    const li = document.createElement("li");
    const timestamp = new Date().toLocaleTimeString();
    li.innerHTML = `<span>[${timestamp}]</span> ${text}`;
    logList.prepend(li);
}
