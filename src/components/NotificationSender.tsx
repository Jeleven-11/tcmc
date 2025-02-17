import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NotificationSender() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    const handleSendNotification = async () =>
    {
        try {
            const res = await axios.post("/api/sendPush", { title, desc });

            if (res.status === 200) {
                toast.success("📢 Notification sent successfully!");
            } else {
                toast.error("⚠️ Failed to send notification!");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("❌ Error sending notification");
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Enter Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
            />
            <button onClick={handleSendNotification}>Send Notification</button>
        </div>
    );
}