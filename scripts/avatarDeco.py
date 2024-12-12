import requests
from PIL import Image, ImageOps, ImageDraw, ImageSequence
from io import BytesIO
import sys
import os

def fetch_image(url):
    response = requests.get(url)
    response.raise_for_status()
    return Image.open(BytesIO(response.content))

def make_round(image, scale_factor=0.95):
    size = int(min(image.size) * scale_factor)
    rounded_image = ImageOps.fit(image, (size, size), centering=(0.5, 0.5))
    mask = Image.new("L", rounded_image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, size, size), fill=255)
    rounded_image.putalpha(mask)
    return rounded_image

def process_gif(avatar, decoration=None, scale_factor=0.95):
    frames = []
    for frame in ImageSequence.Iterator(avatar):
        frame = frame.convert("RGBA")
        rounded_frame = make_round(frame, scale_factor)
        
        if decoration:
            avatar_size = (int(decoration.size[0] * 0.85), int(decoration.size[1] * 0.85))
            rounded_frame = rounded_frame.resize(avatar_size, Image.LANCZOS)
            
            base_image = Image.new("RGBA", decoration.size, (0, 0, 0, 0))
            x_offset = (decoration.size[0] - rounded_frame.size[0]) // 2
            y_offset = (decoration.size[1] - rounded_frame.size[1]) // 2
            base_image.paste(rounded_frame, (x_offset, y_offset), rounded_frame)
            
            combined_frame = Image.alpha_composite(base_image, decoration)
            frames.append(combined_frame)
        else:
            frames.append(rounded_frame)
    
    return frames

def align_and_overlay(avatar_url, decoration_url=None, scale_factor=0.95):
    avatar = fetch_image(avatar_url)
    decoration = fetch_image(decoration_url).convert("RGBA") if decoration_url else None

    if avatar.format == "GIF":
        frames = process_gif(avatar, decoration, scale_factor)
        output_path = "output.gif"
        frames[0].save(output_path, save_all=True, append_images=frames[1:], loop=0, duration=avatar.info['duration'])
    else:
        avatar = avatar.convert("RGBA")
        rounded_avatar = make_round(avatar, scale_factor)
        
        if decoration:
            avatar_size = (int(decoration.size[0] * 0.85), int(decoration.size[1] * 0.85))
            rounded_avatar = rounded_avatar.resize(avatar_size, Image.LANCZOS)
            
            base_image = Image.new("RGBA", decoration.size, (0, 0, 0, 0))
            x_offset = (decoration.size[0] - rounded_avatar.size[0]) // 2
            y_offset = (decoration.size[1] - rounded_avatar.size[1]) // 2
            base_image.paste(rounded_avatar, (x_offset, y_offset), rounded_avatar)
            
            combined_image = Image.alpha_composite(base_image, decoration)
            output_path = "output.png"
            combined_image.save(output_path, format="PNG")
        else:
            output_path = "output.png"
            rounded_avatar.save(output_path, format="PNG")

    return output_path

def upload_image_to_imgur(image_path, access_token):
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    with open(image_path, "rb") as file:
        response = requests.post("https://api.imgur.com/3/upload", headers=headers, files={"image": file})
    response.raise_for_status()
    data = response.json()
    return data["data"]["link"]

def main(avatar_url, decoration_url=None):
    access_token = "3d35d5c7e53616332c65a4fccf6bfb12a69769eb"

    if decoration_url:
        output_path = align_and_overlay(avatar_url, decoration_url, scale_factor=0.95)
    else:
        avatar = fetch_image(avatar_url)
        if avatar.format == "GIF":
            frames = process_gif(avatar, scale_factor=0.95)
            output_path = "output.gif"
            frames[0].save(output_path, save_all=True, append_images=frames[1:], loop=0, duration=avatar.info['duration'])
        else:
            avatar = avatar.convert("RGBA")
            combined_image = make_round(avatar)
            output_path = "output.png"
            combined_image.save(output_path, format="PNG")
  
    imgur_link = upload_image_to_imgur(output_path, access_token)
    os.remove(output_path)
    
    return imgur_link

if __name__ == "__main__":
    avatar_url = sys.argv[1]
    decoration_url = sys.argv[2] if len(sys.argv) > 2 else None
    imgur_image_url = main(avatar_url, decoration_url)
    print(imgur_image_url)