"""Vercel Python Serverless Function entry point for the CyberNexus FastAPI backend.

This file wraps the FastAPI application using Mangum so it can run as an
AWS Lambda / Vercel Python serverless function.
"""
import os
import sys

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from mangum import Mangum  # noqa: E402
from app.main import app  # noqa: E402, E401

handler = Mangum(app, lifespan="off")
