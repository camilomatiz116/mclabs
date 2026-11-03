import os
import time
from playwright.sync_api import sync_playwright
from PIL import Image

def generate_pdf():
    output_dir = r"E:\softeware copias funcionales\mclabs\assets\docs"
    os.makedirs(output_dir, exist_ok=True)
    temp_dir = os.path.join(output_dir, "temp_slides")
    os.makedirs(temp_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, "presentacion-emci-labs.pdf")

    print("Iniciando Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 16:9 ratio viewport @ 2x device scale for high resolution
        context = browser.new_context(
            viewport={'width': 1600, 'height': 900},
            device_scale_factor=2
        )
        page = context.new_page()
        print("Cargando presentacion.html...")
        page.goto("http://localhost:3000/presentacion.html", wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        time.sleep(1)

        # Style tweaks for clean PDF presentation export
        page.evaluate("""
            () => {
                // Hide header outside deck
                const header = document.querySelector('.fullscreen-nav-header');
                if (header) header.style.display = 'none';

                const wrapper = document.querySelector('.fullscreen-deck-wrapper');
                if (wrapper) {
                    wrapper.style.padding = '0';
                    wrapper.style.margin = '0';
                    wrapper.style.maxWidth = '100%';
                    wrapper.style.width = '100vw';
                    wrapper.style.height = '100vh';
                    wrapper.style.justifyContent = 'center';
                }

                // Hide interactive buttons on the deck for clean PDF
                const autoplayBtn = document.getElementById('btnAutoPlayDeckFs');
                if (autoplayBtn) autoplayBtn.style.display = 'none';

                const prevBtn = document.getElementById('btnDeckPrevFs');
                if (prevBtn) prevBtn.style.display = 'none';

                const nextBtn = document.getElementById('btnDeckNextFs');
                if (nextBtn) nextBtn.style.display = 'none';

                const navBtns = document.querySelector('.deck-nav-btns');
                if (navBtns) {
                    navBtns.innerHTML = '<span style="color: rgba(255,255,255,0.7); font-size: 0.85rem; font-weight: 600; letter-spacing: 0.05em;">eMCi labs • Ingeniería de Software Boutique & Misión Crítica</span>';
                }

                // Ensure slide container fits 16:9
                const deck = document.getElementById('interactiveDeckFullscreen');
                if (deck) {
                    deck.style.borderRadius = '0';
                    deck.style.border = 'none';
                    deck.style.width = '100vw';
                    deck.style.height = '100vh';
                    deck.style.display = 'flex';
                    deck.style.flexDirection = 'column';
                    deck.style.justifyContent = 'space-between';
                }
            }
        """)

        slide_images = []
        for idx in range(7):
            print(f"Capturando diapositiva {idx + 1} de 7...")
            page.evaluate(f"updateSlide({idx})")
            time.sleep(0.6)  # allow transitions
            slide_file = os.path.join(temp_dir, f"slide_{idx + 1}.png")
            deck_el = page.query_selector("#interactiveDeckFullscreen")
            if deck_el:
                deck_el.screenshot(path=slide_file)
            else:
                page.screenshot(path=slide_file)
            slide_images.append(slide_file)

        browser.close()

    print("Compilando PDF de alta calidad con Pillow...")
    pil_images = []
    for img_path in slide_images:
        img = Image.open(img_path).convert('RGB')
        pil_images.append(img)

    if pil_images:
        first_img = pil_images[0]
        first_img.save(
            pdf_path,
            save_all=True,
            append_images=pil_images[1:],
            quality=95,
            resolution=150.0
        )
        print(f"PDF generado con éxito en: {pdf_path}")
        print(f"Tamaño: {os.path.getsize(pdf_path) / (1024*1024):.2f} MB")

    # Cleanup temporary images
    for img_path in slide_images:
        try:
            os.remove(img_path)
        except Exception:
            pass
    try:
        os.rmdir(temp_dir)
    except Exception:
        pass

if __name__ == "__main__":
    generate_pdf()
