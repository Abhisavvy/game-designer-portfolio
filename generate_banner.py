import os
import time
from google import genai
from google.genai import types
from PIL import Image

# Initialize client with the provided API key
client = genai.Client(api_key="AIzaSyDj5eJmbzrG5CXwDPPymNE7BtZvMPumWOY")

prompt = """A high-end, modern dark-mode technology banner representing AI innovation. 
Color palette: Deep charcoal/black background with vibrant glowing orange accents.
Visual concept: A left-to-right workflow. On the left, chaotic floating documents representing 'Raw Meeting Notes'. In the center, a glowing, futuristic AI core or processor made of glass and light. On the right, clean, organized, structured data blocks representing 'Specifications'.
Style: 3D rendered abstract tech scene, glassmorphism UI elements, sleek SaaS product aesthetic, highly detailed, cinematic lighting, 8k resolution."""

print("Waiting 30 seconds for rate limit to reset...")
time.sleep(30)

print("Generating image with Gemini...")
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[prompt],
    config=types.GenerateContentConfig(
        response_modalities=['IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio="16:9"
        ),
    )
)

output_path = "/Users/abhishekdutta/project1/career-workspace/portfolio/public/assets/ai-innovation/generated-ai-banner.png"

for part in response.parts:
    if part.inline_data:
        img = part.as_image()
        # Convert to PNG by saving with explicit format
        img.save(output_path, format="PNG")
        print(f"Successfully generated and saved to {output_path}")
        break
