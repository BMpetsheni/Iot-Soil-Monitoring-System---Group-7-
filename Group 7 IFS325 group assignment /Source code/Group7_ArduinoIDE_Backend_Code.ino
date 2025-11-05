/* Ultra Low-Energy Soil Sensor + I2C LCD
   Reads soil data every 10 seconds
   LCD backlight is on while displaying
   Includes Nitrogen (N), Phosphorus (P), Potassium (K) and EC
   Display turns off for 10 seconds between readings, ESP stays awake
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <ModbusMaster.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ==================== WiFi CREDENTIALS ====================
const char* ssid = "Wifi";  // Replace with your WiFi name
const char* password = "password";         // Replace with your WiFi password

// ==================== MQTT BROKER SETTINGS ====================
const char* mqtt_server = "10.124.122.189";
const int mqtt_port = 1883;
const char* MQTT_TOPIC = "arc/soil-monitoring/group7/soil-sensor";

// ----------------- LCD Setup -----------------
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C address 0x27, 16x2 LCD

// ----------------- Modbus Setup -----------------
#define MODBUS_BAUD 4800
#define MODBUS_SLAVE_ID 1

const int RX_PIN = 16;
const int TX_PIN = 17;
const int DE_PIN = 5;
const int RE_PIN = 4;

ModbusMaster node;

// ----------------- Transmission Helpers -----------------
void preTransmission() {
    digitalWrite(DE_PIN, HIGH);
    digitalWrite(RE_PIN, HIGH);
    delayMicroseconds(120);
}

void postTransmission() {
    digitalWrite(DE_PIN, LOW);
    digitalWrite(RE_PIN, LOW);
    delayMicroseconds(120);
}

// ----------------- Modbus Registers -----------------
const uint16_t startReg = 0x0000;
const uint16_t regCount = 7; // 7 registers: moisture, temp, EC, pH, N, P, K

// ----------------- Sensor Data Structure -----------------
struct SoilData {
    float moisture;
    float temperature;
    float ec;
    float ph;
    float nitrogen;
    float phosphorus;
    float potassium;
    bool valid;
};

SoilData currentReading;

// ----------------- Calibration factors -----------------
const float MOISTURE_CAL = 1.0;
const float TEMP_CAL = 1.0;
const float PH_CAL = 1.0;
const float EC_CAL = 0.1;
const float N_CAL = 1.0;
const float P_CAL = 1.0;
const float K_CAL = 1.0;

// ----------------- WiFi + MQTT -----------------
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Forward declarations
void setupWiFi();
void setupMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void reconnectMQTT();
void publishSoilData(const SoilData &d);

// ----------------- Setup -----------------
void setup() {
    Serial.begin(115200);
    while (!Serial) { ; }
    Serial.println("\n=== Ultra Low-Energy Soil Sensor ===");

    // Setup DE/RE pins
    pinMode(DE_PIN, OUTPUT);
    pinMode(RE_PIN, OUTPUT);
    digitalWrite(DE_PIN, LOW);
    digitalWrite(RE_PIN, LOW);

    // Start Serial2 for Modbus RTU
    Serial2.begin(MODBUS_BAUD, SERIAL_8N1, RX_PIN, TX_PIN);
    delay(200);

    // Modbus node
    node.begin(MODBUS_SLAVE_ID, Serial2);
    node.preTransmission(preTransmission);
    node.postTransmission(postTransmission);

    // LCD initialization
    Wire.begin(21, 22); // SDA=D21, SCL=D22
    lcd.init();
    lcd.backlight();
    lcd.print("Soil Sensor Init");
    delay(1500);
    lcd.clear();

    // WiFi + MQTT init
    setupWiFi();
    setupMQTT();
}

// ==================== WIFI SETUP ====================
void setupWiFi() {
    Serial.print("\nConnecting to WiFi ");
    Serial.print(ssid);
    Serial.print(" … ");
    WiFi.begin(ssid, password);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" ✅");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println(" ❌ Failed");
    }
}

// ==================== MQTT SETUP ====================
void setupMQTT() {
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("📩 MQTT message arrived [");
    Serial.print(topic);
    Serial.print("]: ");
    for (unsigned int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}

void reconnectMQTT() {
    unsigned long retryStart = millis();
    while (!mqttClient.connected()) {
        Serial.print("🔄 Attempting MQTT connection … ");
        String mac = WiFi.macAddress();
        String clientId = "esp32-soil-" + mac;
        if (mqttClient.connect(clientId.c_str())) {
            Serial.println("✅ connected");
        } else {
            Serial.print("❌ failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" — retrying in 5s");
            delay(5000);
            if ((millis() - retryStart) > 60000) break;
        }
    }
}

void publishSoilData(const SoilData &d) {
    char payload[384];
    int len = snprintf(payload, sizeof(payload),
                       "{\"group_ID\":7,\"moisture\":%.2f,\"temperature\":%.2f,\"ph\":%.2f,"
                       "\"ec\":%.2f,\"nitrogen\":%.2f,\"phosphorus\":%.2f,\"potassium\":%.2f}",
                       d.moisture,
                       d.temperature,
                       d.ph,
                       d.ec,
                       d.nitrogen,
                       d.phosphorus,
                       d.potassium);

    if (len > 0 && mqttClient.connected()) {
        bool ok = mqttClient.publish(MQTT_TOPIC, payload);
        Serial.print("Published to ");
        Serial.print(MQTT_TOPIC);
        Serial.print(" -> ");
        Serial.println(payload);
        if (!ok) Serial.println("⚠ MQTT publish failed");
    } else {
        Serial.println("⚠ MQTT not connected - skipping publish");
    }
}

// ----------------- Main Loop -----------------
void loop() {
    // Ensure WiFi is connected
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected, trying to reconnect...");
        setupWiFi();
    }

    // Ensure MQTT is connected
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop();

    // Read modbus registers
    uint8_t result = node.readHoldingRegisters(startReg, regCount);

    if (result == node.ku8MBSuccess) {
        // Convert returned registers to floats (apply scaling & calibration)
        currentReading.moisture = (float)node.getResponseBuffer(0) * 0.1f * MOISTURE_CAL;
        currentReading.temperature = (float)node.getResponseBuffer(1) * 0.1f * TEMP_CAL;
        currentReading.ec = (float)node.getResponseBuffer(2) * EC_CAL; // EC_CAL already 0.1
        currentReading.ph = (float)node.getResponseBuffer(3) * 0.1f * PH_CAL;
        currentReading.nitrogen = (float)node.getResponseBuffer(4) ;
        currentReading.phosphorus = (float)node.getResponseBuffer(5) ;
        currentReading.potassium = (float)node.getResponseBuffer(6) ;
        currentReading.valid = true;

        // Serial output
        Serial.println("--------------------------------------------------");
        Serial.print("Moisture: "); Serial.print(currentReading.moisture,2); Serial.println(" %");
        Serial.print("Temperature: "); Serial.print(currentReading.temperature,2); Serial.println(" °C");
        Serial.print("PH: "); Serial.println(currentReading.ph,2);
        Serial.print("Electrical Conductivity (EC): "); Serial.print(currentReading.ec,2); Serial.println(" uS/cm");
        Serial.print("Nitrogen (N): "); Serial.print(currentReading.nitrogen,2); Serial.println(" mg/kg");
        Serial.print("Phosphorus (P): "); Serial.print(currentReading.phosphorus,2); Serial.println(" mg/kg");
        Serial.print("Potassium (K): "); Serial.print(currentReading.potassium,2); Serial.println(" mg/kg");
        Serial.println("--------------------------------------------------");

        // --- LCD Screen 1 ---
        lcd.backlight();
        lcd.clear();
        lcd.setCursor(0,0);
        lcd.print("M:");
        lcd.print(currentReading.moisture,1);
        lcd.print("% T:");
        lcd.print(currentReading.temperature,1);
        lcd.print("C");
        lcd.setCursor(0,1);
        lcd.print("pH:");
        lcd.print(currentReading.ph,2);
        delay(5000);

        // --- LCD Screen 2 ---
        lcd.clear();
        lcd.setCursor(0,0);
        lcd.print("EC:");
        lcd.print(currentReading.ec,1);
        lcd.print(" N:");
        lcd.print(currentReading.nitrogen,0);
        lcd.setCursor(0,1);
        lcd.print("P:");
        lcd.print(currentReading.phosphorus,0);
        lcd.print(" K:");
        lcd.print(currentReading.potassium,0);
        delay(5000);

        // --- Publish MQTT ---
        if (mqttClient.connected()) publishSoilData(currentReading);
        else Serial.println("Skipping publish — MQTT disconnected.");

    } else {
        lcd.backlight();
        lcd.clear();
        lcd.print("Read Error!");
        Serial.print("Modbus read failed. Error code: ");
        Serial.println(result);
        delay(2000);
    }

    // --- Turn off LCD backlight for 10s while keeping ESP awake ---
    lcd.noBacklight();
    Serial.println("Display off for 10s while ESP runs...");
    unsigned long offStart = millis();
    const unsigned long displayOffMs = 10UL * 1000UL;
    while (millis() - offStart < displayOffMs) {
        // Keep checking network activities during the 10-second wait
        if (WiFi.status() == WL_CONNECTED && mqttClient.connected()) {
            mqttClient.loop();
        } else {
            if (WiFi.status() != WL_CONNECTED) setupWiFi();
            if (!mqttClient.connected() && WiFi.status() == WL_CONNECTED) reconnectMQTT();
        }
        delay(100); // prevent busy loop
    }

    // Turn LCD back on for next cycle
    lcd.backlight();
}