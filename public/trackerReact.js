import { useEffect } from "react";

const useTracker = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SERVER_URL = "http://15.164.131.108:4000/api/save-data";
    let sendNumber = 0;

    // Utility functions
    const setCookie = (name, value, days) => {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}`;
    };

    const getCookie = (name) => {
      const cookieArr = document.cookie.split("; ");
      for (let cookie of cookieArr) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
      }
      return null;
    };

    // Visitor ID
    let visitorId = getCookie("myVisitorId");
    if (!visitorId) {
      visitorId = "visitor-" + Math.random().toString(36).substr(2, 9);
      setCookie("myVisitorId", visitorId, 30); // 30 days
      sessionStorage.setItem("visitorId", visitorId);
    }

    // Tracking logic
    const FixedData = {
      sendNumber,
      visitorId,
      referrer: document.referrer || "Direct",
      userAgent: navigator.userAgent,
    };

    const sendData = () => {
      try {
        const payload = { ...FixedData, currentTime: Date.now() };
        fetch(SERVER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((data) => {
          console.log("Data sent successfully:", data);
        });
      } catch (error) {
        console.error("Error sending data:", error);
      }
    };

    // Event listeners
    window.addEventListener("beforeunload", sendData);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", sendData);
    };
  }, []);
};

export default useTracker;
