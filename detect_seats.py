import json
from PIL import Image

im = Image.open('assets/floorplan.png').convert('RGB')
w, h = im.size
pixels = im.load()

visited = [[False]*w for _ in range(h)]
circles = []

for y in range(h):
    for x in range(w):
        r, g, b = pixels[x, y]
        if r > 160 and g < 50 and b < 50 and not visited[y][x]:
            q = [(x, y)]
            visited[y][x] = True
            pts = []
            while q:
                cx, cy = q.pop()
                pts.append((cx, cy))
                for dx, dy in ((-1,0),(1,0),(0,-1),(0,1)):
                    nx, ny = cx+dx, cy+dy
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                        nr, ng, nb = pixels[nx, ny]
                        if nr > 160 and ng < 50 and nb < 50:
                            visited[ny][nx] = True
                            q.append((nx, ny))
            
            if len(pts) > 60:
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                box_w = max(xs) - min(xs) + 1
                box_h = max(ys) - min(ys) + 1
                aspect = box_w / max(1, box_h)
                # Lingkaran peserta: aspect ratio ~ 1.0 (0.7 s/d 1.4)
                if 0.7 <= aspect <= 1.4:
                    mean_x = sum(xs) / len(pts)
                    mean_y = sum(ys) / len(pts)
                    circles.append({
                        'x': round(mean_x / w * 100, 2),
                        'y': round(mean_y / h * 100, 2),
                        'box_w': box_w,
                        'box_h': box_h,
                        'count': len(pts)
                    })

print(f"Detected CIRCULAR spots: {len(circles)}")
# Sort seats logically
# Let's group them by visual layout or standard ordering
circles.sort(key=lambda c: (round(c['y'] / 15) * 15, c['x']))
for idx, c in enumerate(circles, 1):
    c['id'] = f"S{idx:02d}"
    c['label'] = f"Meja {idx:02d}"
    print(f"{c['id']}: x={c['x']}%, y={c['y']}%")

with open('assets/seats.json', 'w') as f:
    json.dump(circles, f, indent=2)
