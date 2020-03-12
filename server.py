from flask import Flask, render_template, request, send_file, send_from_directory
from utils import *
from paper import *
import os # For Delete Temp Image
import json


#-------------------  Paper -------------------#

# New Paper Instent
paper = Paper(mm2px(210), mm2px(297))


#--------------- Server Spacific --------------#

# New App Instent
app = Flask(
    __name__, 
    static_url_path='/public', 
    static_folder='public', 
    template_folder='templates'
)



# Home Page Handler
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/render', methods=['POST'])
def render():
    try:
        spacing = float(request.form.get('spacing')) # spacing from reqest body
        width = float(request.form.get('width')) # width from reqest body
        height =float( request.form.get('height')) # height from reqest body
        axis = request.form.get('axis') # axis from reqest body

        rendered_paper = paper.render(
            mm2px(spacing), mm2px(width), mm2px(height), axis
        )

        if ( request.form.get('render-type') == 'thum' ):
            MAX_WIDTH = 300

            ratio = mm2px(height) / mm2px(width)
            MAX_SIZE = (MAX_WIDTH, int(MAX_WIDTH * ratio)) # Thumbnail Max Size
            rendered_paper = rendered_paper.resize(MAX_SIZE, Image.ANTIALIAS)
        return serve_pil_image(rendered_paper)
    
    except Exception as err:
        print( err )
        return 'ERROR!'


@app.route('/add', methods=['POST'])
def add_image():
    try:
        noc = int(request.form.get('noc')) # noc from request body
        width = float(request.form.get('width')) # width from request body
        height = float(request.form.get('height')) # height from request body
        # get Uploaded Image
        img = request.files['img']

        if filter_image(img):
            path = save_upload( img, 'uploads' )
            layer = Layer( Image.open( path ), img.filename )
            layer.resize(mm2px( width ), mm2px( height ))
            layer.border( 3 )
            paper.add( layer, noc )
            os.remove( path )
            
        return "OK"

    except Exception as err:
        print( err )
        return "ERROR!"


@app.route('/layers')
def get_layers():
    return json.dumps(paper.layers_info)


@app.route('/layers/<fileName>')
def get_layer_img(fileName):
    return serve_pil_image(paper.get_layers( fileName )[0].layer.img)


@app.route('/change', methods=['POST'])
def change_layer():
    try:
        noc = int(request.form.get('noc')) # noc from request body
        layersName = request.form.get('layers-name')
        res = paper.update_noc( layersName, noc )
        return str( res )
    except Exception as _:
        return str( False )


@app.route('/remove/<fileName>')
def remove_layer(fileName):
    return str(len( paper.remove(fileName) ))


if __name__ == '__main__':
    # Run Application
    app.run(port=4000)









