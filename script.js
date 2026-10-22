const topic = "lockingamoungusirlyeah";

const enableBtn = document.getElementById("enable-btn");
const statusText = document.getElementById("status");

// 1. Request notification permission on button click
enableBtn.addEventListener("click", () => {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            alert("Notifications enabled!");
        } else {
            alert("Notification permission denied.");
        }
    });
});

// 2. Connect to ntfy.sh EventSource (Server-Sent Events)
const eventSource = new EventSource(`https://ntfy.sh/${topic}/sse`);

eventSource.onopen = () => {
    statusText.innerText = "Status: Connected and listening for Python alerts!";
};

// 3. Listen for incoming messages from Python
eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Only process actual message events
    if (data.event === "message") {
        console.log("New Python message received:", data.message);

        // Display browser desktop notification if permission was granted
        if (Notification.permission === "granted") {
            new Notification("Python Alert", {
                body: data.message
            });
        } else {
            // Fallback if browser notifications aren't enabled
            alert("New Alert: " + data.message);
        }
    }
};

eventSource.onerror = () => {
    statusText.innerText = "Status: Disconnected / Reconnecting...";
};