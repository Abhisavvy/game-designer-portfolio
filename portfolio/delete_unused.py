import os

unused = [
    "/assets/ai-innovation/ai-banner-simple.html",
    "/assets/ai-innovation/screenshot-2026-04-13-at-12-19-31-am-1776019801523.png",
    "/assets/ai-innovation/generated-banner.html",
    "/assets/ai-innovation/orange-banner-template.html",
    "/assets/ticket-mania/screenshot-2026-04-12-at-11-26-35-pm-1776016900937.png",
    "/assets/ticket-mania/screenshot-2026-04-12-at-11-26-35-pm-1776016716376.png",
    "/assets/word-roll/gallery-rewards.svg",
    "/assets/word-roll/gallery-machinations.svg",
    "/assets/tiles/screenshot-2026-04-12-at-10-50-46-pm-1776014484957.png",
    "/assets/tiles/screenshot-2026-04-12-at-10-50-46-pm-1776014526927.png",
    "/assets/bon-voyage/screenshot-2026-04-12-17-03-22-856-in-playsimple-wordbingo-1776011094490.jpg",
    "/assets/bon-voyage/screenshot-2026-04-12-17-03-22-856-in-playsimple-wordbingo-1776013078085.jpg",
    "/assets/bon-voyage/gallery-progression.svg",
    "/assets/bon-voyage/gallery-economy.svg",
    "/assets/bon-voyage/showcase-poster.svg",
    "/assets/food-fiesta/gallery-ui.svg",
    "/assets/food-fiesta/poster.svg",
    "/assets/food-fiesta/screenshot-2026-04-12-at-10-37-41-pm-1776013716174.png",
    "/assets/food-fiesta/gallery-analytics.svg",
    "/assets/food-fiesta/gallery-wireframe.svg"
]

for path in unused:
    full_path = "public" + path
    if os.path.exists(full_path):
        os.remove(full_path)
        print(f"Deleted {full_path}")
    else:
        print(f"Not found: {full_path}")
