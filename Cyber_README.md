# CyberNexus

<p align="center">
  <img src="https://img.shields.io/badge/CYBER-NEXUS-000000?style=for-the-badge&logo=shield&logoColor=white" alt="CyberNexus">
</p>

<h3 align="center">
  Web-Based Cybersecurity Assessment & Utility Platform
</h3>

<p align="center">
  A centralized security platform for threat intelligence, security assessment,
  and defensive cybersecurity analysis.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind_CSS-UI-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
</p>

---

## Overview

**CyberNexus** is a modern web-based cybersecurity assessment and utility platform designed to bring multiple security analysis tools together into one centralized interface.

The platform is designed for:

- Cybersecurity students
- Security researchers
- Developers
- IT professionals
- SOC and Blue Team learners
- General users interested in cybersecurity

CyberNexus provides security-focused utilities for analyzing:

- URLs
- Files
- IP addresses
- Domains
- Email headers
- HTTP security headers
- SSL/TLS configurations
- Password strength

The platform can also provide an **AI Security Assistant** for explaining security findings and cybersecurity concepts.

---

# Features

## 1. URL Scanner

Analyze URLs for potentially malicious or suspicious activity.

### Capabilities

- URL threat analysis
- Malicious URL detection
- Threat intelligence
- Detection statistics
- Security status
- VirusTotal integration

---

## 2. File Scanner

Analyze uploaded files for potential malware and security threats.

### Capabilities

- Secure file upload
- Malware detection
- Threat detection statistics
- Scan results
- VirusTotal integration

---

## 3. IP Intelligence

Investigate IPv4 and IPv6 addresses using threat intelligence data.

### Capabilities

- IP reputation
- Abuse confidence score
- Malicious activity information
- Country information
- ISP information
- Network information
- AbuseIPDB integration

---

## 4. Domain Intelligence

Perform security-focused analysis of domains.

### Capabilities

- Domain reputation
- Threat intelligence
- Security indicators
- Domain information
- Security assessment

---

## 5. Email Header Analyzer

Analyze email headers to identify important routing and security information.

### Capabilities

- Header parsing
- Sender information
- Routing analysis
- Authentication indicators
- Suspicious header detection

---

## 6. Security Headers Checker

Check whether a website implements recommended HTTP security headers.

### Capabilities

- HTTP security header analysis
- Missing header detection
- Security configuration analysis
- Risk identification
- Security recommendations

---

## 7. SSL/TLS Checker

Analyze SSL/TLS configuration and certificate information.

### Capabilities

- SSL/TLS analysis
- Certificate information
- Protocol information
- Security configuration
- Configuration status
- SSL Labs integration

---

## 8. Password Security Checker

Evaluate password strength and identify common weaknesses.

### Capabilities

- Password strength analysis
- Entropy estimation
- Common weakness detection
- Security recommendations

> Passwords should never be stored unnecessarily.

---

# AI Security Assistant

CyberNexus can optionally provide an **AI-powered Security Assistant**.

The assistant can help users:

- Understand scan results
- Explain security findings
- Understand cybersecurity concepts
- Interpret security indicators
- Learn defensive security practices
- Ask cybersecurity-related questions

The AI layer is intended for security education and defensive analysis.

---

# Technology Stack

## Frontend

- Next.js 14
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Recharts

## Backend

- Python
- FastAPI
- Pydantic
- JWT Authentication

## Database

- MongoDB

## Security Intelligence

- VirusTotal API
- AbuseIPDB API
- SSL Labs API

## AI

- Google Gemini API

---

# System Architecture

```text
                         ┌─────────────────────┐
                         │        USER         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │       NEXT.JS FRONTEND      │
                    │                             │
                    │  Dashboard                  │
                    │  Security Tools             │
                    │  Authentication             │
                    │  History & Reports          │
                    └──────────────┬──────────────┘
                                   │
                              REST API
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       FASTAPI BACKEND       │
                    │                             │
                    │  Authentication             │
                    │  Validation                 │
                    │  Security Services          │
                    │  Scan Processing             │
                    │  API Integrations            │
                    └───────┬───────────┬─────────┘
                            │           │
                ┌───────────┘           └──────────────┐
                ▼                                      ▼
       ┌─────────────────┐                   ┌──────────────────┐
       │     MongoDB     │                   │  External APIs   │
       │                 │                   │                  │
       │ Users           │                   │ VirusTotal       │
       │ Scan History    │                   │ AbuseIPDB        │
       │ Reports         │                   │ SSL Labs         │
       │ Notifications   │                   │ Gemini           │
       └─────────────────┘                   └──────────────────┘
```

---

# Security Architecture

The frontend never directly communicates with MongoDB or external security APIs.

All sensitive operations are handled through the FastAPI backend.

```text
Frontend
   │
   ▼
FastAPI Backend
   │
   ├── Authentication
   ├── Validation
   ├── MongoDB
   ├── VirusTotal
   ├── AbuseIPDB
   ├── SSL Labs
   └── Gemini
```

This architecture helps protect:

- API keys
- Database credentials
- Authentication secrets
- Backend business logic
- External API integrations

---

# Project Structure

```text
CyberNexus/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── history/
│   │   │   │   ├── reports/
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── ui/
│   │   │   └── logo.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── services.ts
│   │   │   ├── severity.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── mock/
│   │
│   ├── public/
│   ├── .env.local.example
│   ├── .gitignore
│   ├── next.config.mjs
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── database.py
│   │   ├── indexes.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── scanner.py
│   │   │       ├── intelligence.py
│   │   │       └── reports.py
│   │   │
│   │   ├── services/
│   │   │   ├── url_scanner.py
│   │   │   ├── file_scanner.py
│   │   │   ├── ip_intelligence.py
│   │   │   ├── domain_intelligence.py
│   │   │   ├── email_analyzer.py
│   │   │   ├── headers_checker.py
│   │   │   ├── ssl_checker.py
│   │   │   └── password_checker.py
│   │   │
│   │   ├── integrations/
│   │   │   ├── virustotal_client.py
│   │   │   ├── abuseipdb_client.py
│   │   │   ├── ssl_labs_client.py
│   │   │   └── gemini_client.py
│   │   │
│   │   └── utils/
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure you have installed:

- Node.js 18+
- npm
- Python 3.10+
- MongoDB

---

# Frontend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/alaminmahmud202/CyberNexus.git
```

### 2. Navigate to the Project

```bash
cd CyberNexus
```

### 3. Navigate to Frontend

```bash
cd frontend
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Create Environment File

Windows CMD:

```cmd
copy .env.local.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Linux / macOS:

```bash
cp .env.local.example .env.local
```

### 6. Start Development Server

```bash
npm run dev
```

Frontend will be available at:

```text
http://localhost:3000
```

---

# Backend Setup

Open a new terminal.

### 1. Navigate to Backend

```bash
cd CyberNexus/backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Virtual Environment

Windows CMD:

```cmd
venv\Scripts\activate
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Linux / macOS:

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Create Environment File

Windows CMD:

```cmd
copy .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux / macOS:

```bash
cp .env.example .env
```

### 6. Start FastAPI Server

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://localhost:8000
```

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
```

ReDoc:

```text
http://localhost:8000/redoc
```

---

# Environment Variables

Never commit real API keys or secrets to GitHub.

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend

```env
MONGODB_URI=

JWT_SECRET=

VIRUSTOTAL_API_KEY=

ABUSEIPDB_API_KEY=

SSL_LABS_API_KEY=

GEMINI_API_KEY=
```

Keep real credentials only inside the local environment file.

---

# API Structure

The backend follows a REST API architecture.

```text
/api/v1/auth
/api/v1/scanner
/api/v1/intelligence
/api/v1/reports
```

Example endpoints:

```text
POST /api/v1/scanner/url

POST /api/v1/scanner/file

GET /api/v1/intelligence/ip/{ip}

GET /api/v1/intelligence/domain/{domain}

POST /api/v1/analyzer/email-header

POST /api/v1/security/headers

POST /api/v1/security/ssl

POST /api/v1/security/password
```

Endpoint names may evolve as backend development progresses.

---

# Security Principles

CyberNexus follows a security-first development approach.

## API Key Protection

External API credentials must remain on the backend.

The frontend must never contain:

```text
VIRUSTOTAL_API_KEY
ABUSEIPDB_API_KEY
SSL_LABS_API_KEY
GEMINI_API_KEY
MONGODB_URI
JWT_SECRET
```

---

## Authentication

The platform uses:

- JWT authentication
- Secure password hashing
- Token validation
- Protected API routes

---

## Input Validation

All user-provided input should be validated before processing.

Examples:

```text
URLs
IP Addresses
Domains
Email Headers
Uploaded Files
Passwords
```

---

## Environment Protection

Never commit:

```text
.env
.env.local
.env.production
```

Make sure these files are included in `.gitignore`.

---

# Development Roadmap

## Phase 1 — Frontend

- [x] Project setup
- [x] Dark cybersecurity UI
- [x] Navigation
- [x] Dashboard
- [x] Authentication UI
- [x] Core service interfaces

## Phase 2 — Security Tools

- [x] URL Scanner UI
- [x] File Scanner UI
- [x] IP Intelligence UI
- [x] Domain Intelligence UI
- [x] Email Header Analyzer UI
- [x] Security Headers Checker UI
- [x] SSL/TLS Checker UI
- [x] Password Security Checker UI

## Phase 3 — Backend

- [ ] FastAPI setup
- [ ] MongoDB integration
- [ ] Database models
- [ ] API schemas
- [ ] Authentication
- [ ] JWT implementation
- [ ] Service layer
- [ ] Error handling
- [ ] Rate limiting

## Phase 4 — External Integrations

- [ ] VirusTotal integration
- [ ] AbuseIPDB integration
- [ ] SSL Labs integration
- [ ] Gemini integration

## Phase 5 — Platform Features

- [ ] Scan history
- [ ] Security reports
- [ ] Notifications
- [ ] User profile
- [ ] Advanced analytics
- [ ] Production deployment

---

# Design Philosophy

CyberNexus follows a professional cybersecurity-focused design system.

### UI Principles

- Dark professional interface
- Clean information hierarchy
- Minimal visual noise
- Responsive design
- Accessible components
- Clear severity indicators
- Data-focused dashboards
- Consistent typography
- Professional cybersecurity aesthetic

The interface avoids excessive animations, unnecessary gradients, and overly decorative elements.

---

# Intended Use

CyberNexus is intended for:

- Cybersecurity education
- Defensive security analysis
- Security research
- Threat intelligence learning
- Website security assessment
- Malware analysis
- University projects
- Cybersecurity training
- Security awareness

Only analyze systems, websites, domains, IP addresses, files, or infrastructure that you own or have explicit permission to assess.

---

# Disclaimer

CyberNexus is developed for educational, research, and authorized defensive security purposes.

Users are responsible for ensuring that they have proper authorization before scanning or analyzing any system, website, IP address, domain, or file.

The developers are not responsible for unauthorized or malicious use of this platform.

---

# Author

**Al Amin Mahmud**

Computer Science & Engineering

Cybersecurity & Blue Team Enthusiast

GitHub:

https://github.com/alaminmahmud202

---

# License

This project is currently intended for educational and academic purposes.

A formal open-source license may be added in a future release.

---

<p align="center">
  <strong>CyberNexus</strong>
  <br>
  Web-Based Cybersecurity Assessment & Utility Platform
</p>
