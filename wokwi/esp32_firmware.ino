/*
  CarePulse AI — ESP32 Wokwi Firmware (Connected to Wokwi Project 471587035595461633)
  GPIO Pin Mapping:
    - HEART_PIN: 34 (Potentiometer)
    - SPO2_PIN:  35 (Potentiometer)
    - TEMP_PIN:  32 (Potentiometer / DHT22)
    - BUTTON_PIN:18 (SOS Push Button)
    - BUZZER_PIN:19 (Active Piezo Buzzer)
    - GREEN_LED: 25 (Normal LED)
    - RED_LED:   26 (Alert LED)
  Communication: WiFi (Wokwi-GUEST) + HTTPClient REST API update to Firebase
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// WiFi Configuration (Wokwi Virtual Router)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Firebase Realtime REST Endpoint
const char* firebaseURL = "https://elderly-care-assistant-default-rtdb.firebaseio.com/patients/patient001.json";

// Hardware Pin Definitions (Matching Wokwi Project #471587035595461633)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

#define HEART_PIN 34
#define SPO2_PIN 35
#define TEMP_PIN 32

#define BUTTON_PIN 18
#define BUZZER_PIN 19

#define GREEN_LED 25
#define RED_LED 26

// Drivers
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_MPU6050 mpu;

bool emergencyActive = false;
String emergencyReason = "NORMAL";
unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(115200);

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);

  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 10);
    display.println("CarePulse AI IoT");
    display.println("Connecting WiFi...");
    display.display();
  }

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("MPU6050 init warning");
  }

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
}

void loop() {
  unsigned long currentMillis = millis();

  // Read sensors every 1 second for instant sync
  if (currentMillis - lastUpdate >= 1000) {
    lastUpdate = currentMillis;

    // Read Analog Potentiometers mapped to match Wokwi project
    int rawHR = analogRead(HEART_PIN);
    int heartRate = map(rawHR, 0, 4095, 45, 160);

    int rawSpO2 = analogRead(SPO2_PIN);
    int spo2 = map(rawSpO2, 0, 4095, 70, 100);

    int rawTemp = analogRead(TEMP_PIN);
    float temp = 35.0 + (rawTemp / 4095.0) * 6.0; // 35.0°C to 41.0°C range

    // Read MPU6050 Fall Acceleration
    sensors_event_t a, g, temp_mpu;
    bool fallDetected = false;
    if (mpu.getEvent(&a, &g, &temp_mpu)) {
      float accelMag = sqrt(a.acceleration.x * a.acceleration.x + 
                            a.acceleration.y * a.acceleration.y + 
                            a.acceleration.z * a.acceleration.z);
      if (accelMag > 25.0) {
        fallDetected = true;
      }
    }

    // Read SOS Button (Active LOW)
    bool sosPressed = (digitalRead(BUTTON_PIN) == LOW);

    // Check Emergency Conditions
    emergencyActive = false;
    emergencyReason = "NORMAL";

    if (sosPressed) {
      emergencyActive = true;
      emergencyReason = "SOS_PRESSED";
    } else if (fallDetected) {
      emergencyActive = true;
      emergencyReason = "FALL_DETECTED";
    } else if (heartRate > 120) {
      emergencyActive = true;
      emergencyReason = "HIGH_HEART_RATE";
    } else if (heartRate < 45) {
      emergencyActive = true;
      emergencyReason = "LOW_HEART_RATE";
    } else if (spo2 < 90) {
      emergencyActive = true;
      emergencyReason = "LOW_SPO2";
    } else if (temp > 38.0) {
      emergencyActive = true;
      emergencyReason = "HIGH_TEMP";
    }

    // Serial Print Status matching Wokwi console
    Serial.print("HR="); Serial.print(heartRate);
    Serial.print(" SPO2="); Serial.print(spo2);
    Serial.print(" TEMP="); Serial.println(temp, 2);

    // Update OLED Display & Actuators
    updateHardwareFeedback(heartRate, spo2, temp);

    // Send Telemetry to Firebase via HTTP REST
    sendFirebaseTelemetry(heartRate, spo2, temp, fallDetected, sosPressed);
  }
}

void updateHardwareFeedback(int hr, int spo2, float temp) {
  display.clearDisplay();

  if (emergencyActive) {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    tone(BUZZER_PIN, 1000, 300);

    display.setCursor(0, 0);
    display.setTextSize(2);
    display.println("EMERGENCY!");
    display.setTextSize(1);
    display.print("Reason: "); display.println(emergencyReason);
    display.print("HR: "); display.print(hr); display.println(" BPM");
    display.print("SpO2: "); display.print(spo2); display.println("%");
    display.print("Temp: "); display.print(temp, 1); display.println(" C");
  } else {
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
    noTone(BUZZER_PIN);

    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("CarePulse AI -- OK");
    display.println("--------------------");
    display.print("HR : "); display.print(hr); display.println(" BPM");
    display.print("SpO2: "); display.print(spo2); display.println("%");
    display.print("Temp: "); display.print(temp, 1); display.println(" C");
    display.println("Status: STABLE");
  }
  display.display();
}

void sendFirebaseTelemetry(int hr, int spo2, float temp, bool fall, bool sos) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(firebaseURL);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"heartRate\":" + String(hr) + ",";
    jsonPayload += "\"spo2\":" + String(spo2) + ",";
    jsonPayload += "\"temperature\":" + String(temp, 1) + ",";
    jsonPayload += "\"fallDetected\":" + String(fall ? "true" : "false") + ",";
    jsonPayload += "\"sosPressed\":" + String(sos ? "true" : "false") + ",";
    jsonPayload += "\"emergency\":" + String(emergencyActive ? "true" : "false") + ",";
    jsonPayload += "\"emergencyType\":\"" + emergencyReason + "\",";
    jsonPayload += "\"latitude\":37.774929,";
    jsonPayload += "\"longitude\":-122.419416,";
    jsonPayload += "\"status\":\"" + String(emergencyActive ? "CRITICAL ALERT" : "Stable") + "\",";
    jsonPayload += "\"timestamp\":\"" + String(millis()) + "\"";
    jsonPayload += "}";

    int httpResponseCode = http.PUT(jsonPayload);
    http.end();
  }
}
