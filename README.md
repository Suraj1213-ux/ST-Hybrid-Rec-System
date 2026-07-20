# 📍 ST-HybridRec: Spatial-Temporal Hybrid Location Recommendation System

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat&logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-Deep%20Learning-ee4c2c?style=flat&logo=pytorch)
![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-009688?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat&logo=tailwindcss)

An advanced, context-aware Location Recommendation System engineered for smart urban mobility. **ST-HybridRec** fuses **Graph Convolutional Networks (GCN)** for spatial topology modeling with **Long Short-Term Memory (LSTM)** networks for temporal sequence tracking. The system integrates real-time time-of-day logic to deliver dynamic point-of-interest (POI) predictions.

---

## 🌟 Key Features

* **Dual-Stream Deep Learning Engine**: Combines spatial node connections (GCN) with sequential visit history (LSTM).
* **Real-Time Context Reasoning**: Dynamically updates recommendations based on the live system clock (e.g., Morning workout/breakfast vs. Evening social hubs).
* **Interactive GCN Topology Visualizer**: Real-time interactive SVG graph rendering active user traces and predicted destination nodes.
* **Performance Matrix Dashboard**: Evaluates model reliability using real-time **Accuracy, Precision, Recall, and F1-Score** calculations.
* **Modern Web Interface**: Fully responsive UI built with React, Tailwind CSS, Lucide Icons, and local storage trace logging.
* **Institutional Gateway Authentication**: Simulated secure user session gateway for departmental and research access.

---

## 🏗️ System Architecture

![architecture](image.png)

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS, Lucide React Icons
* **Backend**: FastAPI, Uvicorn, Pydantic
* **Machine Learning / Deep Learning**: PyTorch, PyTorch Geometric, Scikit-Learn, Pandas, NumPy
* **Dataset Support**: Foursquare NYC (TSMC2014) & Localized Regional POI Vectors

---

## 🚀 Getting Started

Follow these steps to clone, set up, and run the project locally.

### 📋 Prerequisites

Ensure you have the following installed on your machine:
* [Python 3.10+](https://www.python.org/downloads/)
* [Node.js (v16+) & npm](https://nodejs.org/)
* [Git](https://git-scm.com/)

---

### 📥 1. Clone the Repository

Open your terminal or command prompt and run:

```bash
git clone ( https://github.com/Suraj1213-ux/ST-Hybrid-Rec-System.git )
cd ST-HybridRec



⚙️ 2. Backend Setup & Model Training

# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install torch torch-geometric pandas numpy scikit-learn fastapi uvicorn pydantic

# Run the training script to process the dataset and generate 'st_model.pth' & 'model_metrics.json'
python train.py

# Start the FastAPI backend server
python app.py

💻 3. Frontend Setup & Launch

# Navigate to the frontend directory
cd F:\ST_HybridRec\frontend

# Install Node dependencies
npm install

# Launch the React development server
npm start

🔐 Credentials for Login

To access the dashboard gateway, use the default institutional credentials:

Email: admin@mmit.edu.in

Password: password123

📂 Project Structure

![project structure](image-1.png)