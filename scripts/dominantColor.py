import sys
import requests
from PIL import Image
from io import BytesIO
import numpy as np
from collections import Counter

def get_dominant_color_from_url(image_url):
    response = requests.get(image_url)
    if image_url == 'https://cdn.discordapp.com/embed/avatars/0.png':
        return '#5865f2'
    img = Image.open(BytesIO(response.content))

    if img.format == 'GIF':
        img.seek(0)  # Vai para o primeiro frame do GIF

    if img.mode == 'RGBA':
        img = img.convert('RGB')

    img = img.resize((img.width // 10, img.height // 10))
    img_np = np.array(img)

    pixels = img_np.reshape(-1, 3)

    color_counts = Counter(map(tuple, pixels))
    dominant_color = color_counts.most_common(1)[0][0]

    if dominant_color == (0, 0, 0):
        return '#000000'

    dominant_color_hex = rgb_to_hex(dominant_color)
    return dominant_color_hex

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

if __name__ == "__main__":
    image_url = sys.argv[1]
    dominant_color = get_dominant_color_from_url(image_url)
    print(dominant_color)