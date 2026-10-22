const topic = "lockingamoungusirlyeah";

const notifyBtn = document.getElementById("notify-btn");
const statusText = document.getElementById("status-text");

// 1. Cross-device Notification Permission Request
notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            alert("Notifications Enabled successfully!");
            statusText.innerText = "Status: Notifications Active";
        } else {
            alert("Notification permission was denied.");
        }
    } catch (err) {
        console.error("Error requesting permission:", err);
    }
});

// 2. Real-time ntfy.sh Listener (Works on Desktop + Android + iOS Home Screen)
const eventSource = new EventSource(`https://ntfy.sh/${TOPIC}/sse`);

eventSource.onopen = () => {
    statusText.innerText = "Status: Connected and listening for Python alerts...";
};

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.event === "message") {
        console.log("New Alert Received:", data.message);

        // Send System Notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Raspberry Pi Alert", {
                body: data.message,
                icon: "https://ntfy.sh/static/images/badge.png"
            });
        } else {
            // Fallback alert for browsers without permission
            alert("Pi Alert: " + data.message);
        }
    }
};

eventSource.onerror = () => {
    statusText.innerText = "Status: Connection lost. Reconnecting...";
};