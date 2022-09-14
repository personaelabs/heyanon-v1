from PIL import Image, ImageDraw
import glob

names = ["Apprentice", "Sorcerer", "Grand-wizard", "Wizard"]

heyanonim = Image.open("logo_nobgd.png");
newsize = (145, 145)
heyanonim = heyanonim.resize(newsize)

for name in names:
    pdf_path = f'{name}.pdf'
    images = []
    letim = None

    for i, filename in enumerate(glob.glob(f'{name}*.png')):
        if i % 8 == 0:
            if i != 0:
                letim1 = ImageDraw.Draw(letim)  
                letim1.line([(425, 0), (425, 1100)], fill ="black", width = 0)
                letim1.line([(0, 275), (850, 275)], fill="black", width=0)
                letim1.line([(0, 550), (850, 550)], fill="black", width=0)
                letim1.line([(0, 825), (850, 825)], fill="black", width=0)
                images.append(letim)
            letim = Image.new('RGB',
                    (850, 1100),
                    (255, 255, 255))
        im=Image.open(filename)
        im.load()
        im.split()

        if i%8<4:
            letim.paste(heyanonim, (60, 65+(i%8)*275, ), mask=heyanonim)  # Not centered, top-left corner
            letim.paste(im, (220, 65+(i%8)*275,))
        else:
            letim.paste(heyanonim, (475, 65+((i%8)-4)*275, ), mask=heyanonim)  # Not centered, top-left corner
            letim.paste(im, (630, 65+((i%8)-4)*275,))

    letim1 = ImageDraw.Draw(letim)  
    letim1.line([(425, 0), (425, 1100)], fill ="black", width = 0)
    letim1.line([(0, 275), (850, 275)], fill="black", width=0)
    letim1.line([(0, 550), (850, 550)], fill="black", width=0)
    letim1.line([(0, 825), (850, 825)], fill="black", width=0)
    images.append(letim)
    images[0].save(
        pdf_path, "PDF" ,resolution=100.0, save_all=True, append_images=images[1:]
    )

    
