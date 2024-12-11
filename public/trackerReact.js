import { useEffect } from "react";

const TrackingPage = () => {
  useEffect(() => {
    const SERVER_URL = "https://marketflowlab.com/api/save-data"; // 데이터 전송 서버

    let sendNumber = 0;

    // 방문자 기기 추적
    let device = "";
    function getDeviceType() {
      const width = window.innerWidth;
      if (width <= 768) {
        device = "mobile"; // 휴대폰
      } else if (width <= 1024) {
        device = "tablet"; // 태블릿
      } else {
        device = "desktop"; // 컴퓨터
      }
    }

    getDeviceType();
    console.log("Device type:", device);

    // 이벤트 트래킹 함수
    const event = { eventType: [], eventData: [], page: [] }; // 객체로 event 관리

    function trackEvent(eventType, eventData = {}) {
      event.eventType.push(eventType);
      event.eventData.push(eventData);
      event.page.push(window.location.href);
    }

    // 페이지뷰 트래킹 (최초 로드 시)
    trackEvent("pageview");

    // 클릭 이벤트 트래킹
    const handleClick = (event) => {
      const target = event.target;

      const elementInfo = {
        tagName: target.tagName,
        id: target.id || null,
        classList: [...target.classList],
        text: target.innerText || null,
      };

      trackEvent("click", elementInfo);

      if (
        target.closest("a") &&
        target.closest("a").href &&
        !target.closest("a").href.startsWith(window.location.origin)
      ) {
        trackEvent("external-link", { href: target.closest("a").href });
        event.preventDefault();
        sendData();

        setTimeout(() => {
          window.location.href = target.closest("a").href;
        }, 300);
      }
    };

    document.addEventListener("click", handleClick);

    // 스크롤 이벤트 트래킹 (최적화 추가)
    let scrollTimeout = null;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        trackEvent("scroll", { scrollY: window.scrollY });
        scrollTimeout = null;
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);

    const FixedData = {
      sendNumber,
      event,
      device,
      referrer: document.referrer || "Direct", // 직전 URL이 없으면 "Direct"로 처리
      userAgent: navigator.userAgent, // 사용자의 브라우저 정보 추가
    };

    // 데이터 전송
    const sendData = () => {
      try {
        const payload = {
          ...FixedData,
          currentTime: Date.now(),
        };
        console.log("hi");

        // sendBeacon 사용
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        const sent = navigator.sendBeacon(SERVER_URL, blob);

        if (!sent) {
          console.error("sendBeacon failed");
        } else {
          console.log("Data sent successfully via sendBeacon");
        }

        // Clear FixedData after sending
        FixedData.event.eventType = [];
        FixedData.event.eventData = [];
        FixedData.event.page = [];
      } catch (error) {
        console.error("Unexpected error in sendData:", error);
      }
    };

    // 주기적으로 데이터 전송
    const intervalId = setInterval(() => {
      if (FixedData.sendNumber >= 0) {
        FixedData.sendNumber++;
      }
    }, 5000); // 5초 간격

    // 브라우저 종료 혹은 다른 페이지로 이동시 데이터 전송
    const handleBeforeUnload = () => {
      console.log(" 데이터 전송");
      sendData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    console.log("Tracker initialized and running!");

    return () => {
      // Cleanup 이벤트 리스너와 인터벌
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(intervalId);
    };
  }, []);
};

export default TrackingPage;
