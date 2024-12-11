const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Supabase 클라이언트 설정
const supabase = createClient(
  "https://lngbivsneaznqybzmcso.supabase.co", // Supabase 프로젝트 URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ2JpdnNuZWF6bnF5YnptY3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MzY0MzgsImV4cCI6MjA0OTIxMjQzOH0.INcp9TP3oW0KX0i3SdJ2uCDUr2EQIYwQKuw2mOivwrE" // Supabase 서비스 키 (서버 전용)
);

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  console.log("hello world");
  res.status(200).send("server is running");
});

// 데이터 수신 및 저장 엔드포인트
app.post("/track", (req, res) => {
  console.log("Tracking data received:", req.body);
  // 데이터 저장 로직 추가 (DB에 저장하거나 분석 서버로 전달)
  res.status(200).send("Data received");
});

app.post("/api/save-data", async (req, res) => {
  const payload = req.body;

  // 방문자의 IP 추출
  const visitorIp =
    req.headers["x-forwarded-for"] || // 프록시 또는 로드밸런서를 통한 IP
    req.socket.remoteAddress; // 직접 연결된 클라이언트 IP

  // IP 주소를 payload에 추가
  const enrichedPayload = {
    ...payload,
    ip: visitorIp,
  };

  console.log(enrichedPayload);

  try {
    // Supabase에 데이터 저장
    const { data, error } = await supabase
      .from("TrackingData")
      .insert([enrichedPayload]); // IP가 추가된 데이터를 저장
    if (error) throw error;

    res.status(200).json({ message: "Data saved successfully", data });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ message: "Error saving data", error: err.message });
  }
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
