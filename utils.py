from flask import send_file
from io import BytesIO


# Serve Pil Image 
def serve_pil_image(pil_img):
    img_io = BytesIO()
    pil_img.save(img_io, 'JPEG', quality=100)
    img_io.seek(0)
    return send_file(img_io, mimetype='image/jpeg')

# Save Uploaded Image Require OS
def save_upload(file, path):
    full_path = path + '/'+ file.filename
    file.save( full_path )
    return full_path

# Filter Image Extention
def filter_image(file, accept = [ 'JPG', 'JPEG', 'PNG' ]):
    filename = file.filename.rsplit('.', 1)
    if len(filename) == 2:
        if filename[1].upper() in accept:
            return True
    return False