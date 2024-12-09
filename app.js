const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

// Supabase 클라이언트 설정
const supabase = createClient(
  "https://lngbivsneaznqybzmcso.supabase.co", // Supabase 프로젝트 URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ2JpdnNuZWF6bnF5YnptY3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MzY0MzgsImV4cCI6MjA0OTIxMjQzOH0.INcp9TP3oW0KX0i3SdJ2uCDUr2EQIYwQKuw2mOivwrE" // Supabase 서비스 키 (서버 전용)
);

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 데이터 수신 및 저장 엔드포인트
app.post("/api/save-data", async (req, res) => {
  const payload = req.body;
  console.log(payload, "payload");

  try {
    // Supabase에 데이터 저장
    const { data, error } = await supabase
      .from("TrackingData")
      .insert([payload]);
    if (error) throw error;

    res.status(200).json({ message: "Data saved successfully", data });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ message: "Error saving data", error: err.message });
  }
});

// 서버 실행
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
