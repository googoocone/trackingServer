(function () {
  const SERVER_URL = "https://marketflowlab.com/api/save-data"; // 데이터 전송 서버

  let sendNumber = 0;

  // // 유틸리티: 쿠키 설정
  // function setCookie(name, value, days) {
  //   const expires = new Date();
  //   expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  //   document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}`;
  // }

  // // 유틸리티: 쿠키 읽기
  // function getCookie(name) {
  //   const cookieArr = document.cookie.split("; ");
  //   for (let cookie of cookieArr) {
  //     const [key, value] = cookie.split("=");
  //     if (key === name) return value;
  //   }
  //   return null;
  // }

  // // 방문자 ID, 쿠키 관리

  // let visitorId = getCookie("myVisitorId");
  // if (!visitorId) {
  //   visitorId = "visitor-" + Math.random().toString(36).substr(2, 9);
  //   setCookie("myVisitorId", visitorId, 30); // 30일 유지
  //   sessionStorage.setItem("visitorId", visitorId);
  //   console.log("New visitor ID:", visitorId);
  // } else {
  //   console.log("Returning visitor ID:", visitorId);
  // }

  //방문자 기기 추적

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

  console.log("Device type:", getDeviceType());

  // 이벤트 트래킹 함수
  const event = { eventType: [], eventData: [], page: [] }; // 객체로 event 관리

  function trackEvent(eventType, eventData = {}) {
    // eventType과 eventData를 각각 배열에 추가
    event.eventType.push(eventType);
    event.eventData.push(eventData);
    event.page.push(window.location.href);
    const data = {
      event, // 누적된 eventType과 eventData 포함
      page: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }

  /* 여기 까지 사용자 기본 정보 확보  */

  // 페이지뷰 트래킹 (최초 로드 시)
  trackEvent("pageview");

  // 클릭 이벤트 트래킹
  document.addEventListener("click", (event) => {
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
      e.preventDefault();
      sendData();

      setTimeout(() => {
        window.location.href = target.closest("a").href;
      }, 300);
    }
  });

  // 스크롤 이벤트 트래킹 (최적화 추가)
  let scrollTimeout = null;
  window.addEventListener("scroll", () => {
    if (scrollTimeout) return; // 스크롤 이벤트가 자주 발생하지 않도록 제한
    scrollTimeout = setTimeout(() => {
      trackEvent("scroll", { scrollY: window.scrollY });
      scrollTimeout = null;
    }, 200); // 200ms마다 실행
  });

  const FixedData = {
    sendNumber,
    event,
    visitorId,
    device,
    referrer: document.referrer || "Direct", // 직전 URL이 없으면 "Direct"로 처리
    userAgent: navigator.userAgent, // 사용자의 브라우저 정보 추가
  };

  //서버로 데이터 전송

  setInterval(() => {
    if (FixedData.sendNumber >= 0) {
      console.log("저장합니다");
      FixedData.sendNumber++;
      sendData();
    }
  }, 5000); // 5초 간격

  // 데이터 전송
  function sendData() {
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
  }

  //브라우저 종료 혹은 다른 페이지로 이동시 데이터 전송
  window.addEventListener("beforeunload", () => {
    console.log(" 데이터 전송");
    sendData(); // 마지막 데이터를 서버로 전송
  });

  console.log("Tracker initialized and running!");
})();
