/*
  CarePulse AI — ESP32 Wokwi Firmware
  Sensors: DHT22, MPU6050, SOS Push Button, OLED SSD1306, Simulated HeartRate & SpO2
  Communication: WiFi + HTTPClient REST API update to Firebase
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// WiFi Configuration (Wokwi Virtual Router)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Firebase Realtime REST Endpoint
const char* firebaseURL = "https://elderly-care-assistant-default-rtdb.firebaseio.com/patients/patient001.json";

// Hardware Pin Definitions
#define OLED_WIDTH 128
#define OLED_HEIGHT 64
#define OLED_RESET -1
#define DHTPIN 4
#define DHTTYPE DHT22

#define SOS_PIN 14
#define BUZZER_PIN 25
#define RED_LED_PIN 12
#define GREEN_LED_PIN 13

#define HR_POT_PIN 36   // VP
#define SPO2_POT_PIN 39 // VN

// Drivers
Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET);
DHT dht(DHTPIN, DHTTYPE);
Adafruit_MPU6050 mpu;

bool emergencyActive = false;
String emergencyReason = "NORMAL";
unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(115200);

  pinMode(SOS_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, LOW);

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

  // Initialize Sensors
  dht.begin();
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

  // Read sensors every 2 seconds
  if (currentMillis - lastUpdate >= 2000) {
    lastUpdate = currentMillis;

    // Read DHT22 Temperature
    float temp = dht.readTemperature();
    if (isnan(temp)) temp = 36.8;

    // Read Potentiometers for Heart Rate (40-160 BPM) & SpO2 (80-100%)
    int rawHR = analogRead(HR_POT_PIN);
    int heartRate = map(rawHR, 0, 4095, 45, 150);

    int rawSpO2 = analogRead(SPO2_POT_PIN);
    int spo2 = map(rawSpO2, 0, 4095, 80, 100);

    // Read MPU6050 Fall Acceleration
    sensors_event_t a, g, temp_mpu;
    bool fallDetected = false;
    if (mpu.getEvent(&a, &g, &temp_mpu)) {
      float accelMag = sqrt(a.acceleration.x * a.acceleration.x + 
                            a.acceleration.y * a.acceleration.y + 
                            a.acceleration.z * a.acceleration.z);
      // Fall threshold shock detection (> 25 m/s^2)
      if (accelMag > 25.0) {
        fallDetected = true;
      }
    }

    // Read SOS Button (Active LOW)
    bool sosPressed = (digitalRead(SOS_PIN) == LOW);

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

    // Update OLED Display & Actuators
    updateHardwareFeedback(heartRate, spo2, temp);

    // Send Telemetry to Firebase via HTTP REST
    sendFirebaseTelemetry(heartRate, spo2, temp, fallDetected, sosPressed);
  }
}

void updateHardwareFeedback(int hr, int spo2, float temp) {
  display.clearDisplay();

  if (emergencyActive) {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
    tone(BUZZER_PIN, 1000, 300);

    display.setCursor(0, 0);
    display.setTextSize(2);
    display.println("EMERGENCY!");
    display.setTextSize(1);
    display.print("Reason: "); display.println(emergencyReason);
    display.print("HR: "); display.print(hr); display.println(" BPM");
    display.print("SpO2: "); display.print(spo2); display.println("%");
    display.print("Temp: "); display.print(temp); display.println(" C");
  } else {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH);
    noTone(BUZZER_PIN);

    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("CarePulse AI -- OK");
    display.println("--------------------");
    display.print("Heart Rate: "); display.print(hr); display.println(" BPM");
    display.print("SpO2 Level: "); display.print(spo2); display.println(" %");
    display.print("Temp:       "); display.print(temp, 1); display.println(" C");
    display.println("Status: Patient Stable");
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
    Serial.print("Firebase REST update response: ");
    Serial.println(httpResponseCode);
    http.end();
  }
}
