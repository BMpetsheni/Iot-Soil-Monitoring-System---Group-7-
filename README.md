Soil Monitoring System

📖 Project Overview
The Soil Monitoring System is an IoT-based solution designed to collect, process, and visualize real-time soil condition data to support smart agriculture initiatives.  
This system continuously measures soil moisture, temperature, electrical conductivity (EC), nitrogen (N), phosphorus (P), and potassium (K) levels, helping farmers make informed decisions for efficient crop growth and resource management.


System Architecture
Hardware Components
- Soil Multi-Parameter Sensor – collects soil metrics (NPK, EC, temperature, moisture)  
- ESP32 Microcontroller– processes and transmits sensor data  
- RS485 to TTL Converter – enables Modbus communication between ESP32 and sensor  
- 12V Power Supply – powers the system  
- I2C LCD Display (16x2) – shows live sensor readings  
- 3D Printed Enclosure – houses and protects all hardware components  

Software Components
- Arduino IDE – used to program the ESP32 microcontroller  
- Oracle APEX – stores and visualizes soil data in real-time  
- Frontend Dashboard(Built using )– retrieves data from Oracle APEX via API for user visualization  

---

## ⚙️ Libraries Used
The following libraries were installed in the Arduino IDE:
- `ArduinoJson` – for structuring data into JSON format  
- `LiquidCrystal_I2C` – for controlling the LCD display  
- `ModbusMaster` – for communication with the RS485 soil sensor  
- `PubSubClient` – for MQTT communication (if connected to Wi-Fi)  
- `NTPClient` – for real-time timestamp synchronization  
- `Wire` – for I2C communication  

---

## 🤝 Collaboration with Data Management Team
Our collaboration followed a structured workflow:
1. **Data Structure Definition:**  
   We provided our **data schema and data types** to the Data Management Team so they could set up the appropriate **Oracle APEX database table**.  

2. **Data Transmission Testing:**  
   We tested that soil readings captured in the **Arduino IDE** were correctly received by the **Data Team’s Oracle APEX database**.

3. **API Development:**  
   The Data Team created and shared **REST APIs** that allowed our frontend to request and visualize real-time soil data.

4. **Frontend Validation:**  
   We integrated the given APIs and validated that the dashboard displayed accurate and updated readings.

---

3D Printing Documentation
We designed and 3D printed a small container to securely house our hardware components.  
- Purpose: Protect the ESP32, RS485 module, and wiring connections from dust and moisture during testing.  
- Design: Compact rectangular enclosure with ventilation holes and cable ports.      
- Outcome: Provided both physical protection and a professional aesthetic for demonstration.


Frontend Dashboard
- Displays live and historical soil parameter data.
- Visualizes trends using charts and color indicators.
- Allows filtering and comparison between multiple readings.



## 🚀 Scalability Improvements (High-Level)
1. **Hardware Scaling:**  
   Use modular sensor nodes connected via LoRa or Zigbee networks to cover larger areas.  

2. **Data Architecture:**  
   Implement a cloud-based database to handle large-scale, real-time data ingestion and storage.  

3. **API Scaling:**  
   Deploy load-balanced REST APIs or use serverless architectures (e.g., AWS Lambda) for efficient handling of concurrent data requests.


 Future Improvements

- Implement machine learning models for automated irrigation decisions.  
- Develop a mobile-friendly dashboard for farmers.  
- Enable remote firmware updates for sensor nodes.  


Project Demo
Webiste URL: https://agrisense-v2-avfr.vercel.app/#/login 
Email: farmer@agrisense.com
Password: AgriSenseDemo123!
Test collabaration
<img width="1863" height="863" alt="image" src="https://github.com/user-attachments/assets/8b2d9742-76e2-493b-acc3-b5fc1c074d5c" />

---
