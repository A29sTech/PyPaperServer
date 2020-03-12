
const $ = ( cs )=>{
    const fchar = cs[0];
    switch( fchar ){
        case '#':
            return document.getElementById(cs.slice(1));
        case '.':
            return document.getElementsByClassName(cs.slice(1));
        default:
            document.getElementsByTagName(cs);
    }
}

class Router{

    routes = []

    handle( route, id ) {
        this.routes.push( { route, id } );
    }

    route( route ) {
        this.routes.forEach(ele => {
            if ( ele.route == route ) {
                document.getElementById( ele.id ).style.display = 'block';
            } else {
                document.getElementById( ele.id ).style.display = 'none';
            }
        });
    }

}


class PostForm {

    data = new FormData();

    // Add Form Data
    append( name, value ) {
        this.data.append( name, value );
    }

    // Post Method To Send Request.
    post( endPoint ) {
        return fetch( endPoint, {
            method: 'POST',
            body: this.data
        });
    }

}

////////////////////// GLOBAL //////////////////////
$('#choose-ui').value = 'add';
let UPLODED = [];
let LAYERS_INFO = [];


/******************* Logics ***********************/
const router = new Router();
router.handle( 'add', 'layer-form' );
router.handle( 'paper', 'paper-form' );
router.handle( 'layer', 'layer-edit' );
router.handle( 'loading', 'loading' );
router.route('add'); // By Default Route To Add Layer


/////////////////////////////  Handler Functions  /////////////////////////////

const showTotalNoc = () => {
    let total = 0;
    LAYERS_INFO.forEach( layer => {
        total += layer.noc;
    });
    $('#total-noc').innerText = total;
}


const addToTotal = ( n )=> {
    let noc = parseInt( $('#total-noc').innerText );
    $('#total-noc').innerText = noc + parseInt( n );
}


const displayLayer = (e) => {
    LAYERS_INFO.forEach( layer => {
        if ( $('#layers-name').value == layer.name ) {

            $('#noc-layer').value = layer.noc;

            fetch('/layers/' + layer.name).then( r => r.blob() ).then( r=> {
                $('#img-view').src = URL.createObjectURL( r );
            });

        }
    });
}

const changeLayer = (e) => {
    e.preventDefault();
    
    const postForm = new PostForm();
    // Add All Text Input To PostForm
    let form2send_id = ['noc-layer', 'layers-name'];
    form2send_id.forEach( id => {
        let ele = $('#' + id );
        let name = ele.getAttribute('name');
        postForm.append( name, ele.value );
    });

    postForm.post('/change').then( r => r.text()).then( r => {
        console.log( r );
    });
}

const removeLayer = (e) => {
    e.preventDefault();

    fetch('/remove/' + $('#layers-name').value).then( r => {
        load_layers_info();
    });
}

// Load Layers From Server
const load_layers_info = () => {
    $('#layers-name').innerHTML = '';
    fetch('layers').then(r => r.json()).then( res=> {
        LAYERS_INFO = res;
        res.forEach(element => {
            let new_ele = document.createElement( 'option' )
            new_ele.value = element.name;
            new_ele.innerText = element.name;
            $('#layers-name').appendChild(new_ele);
        });
        router.route( 'layer' );
        // Display Current Layer
        displayLayer();
        showTotalNoc();

    });
}

// Upload Layer And Add To Paper.
const addLayer = (e) => {
    e.preventDefault();

    let img_name = $('#img-file').getAttribute('name');
    let img_file = $('#img-file').files[0];

    // Check For Exsistence //
    if (UPLODED.includes( img_file.name )) {
        alert( 'this file already exist.' );
        return;
    }

    let postForm = new PostForm();
    postForm.append( img_name, img_file );

    // Add All Text Input To PostForm
    let form2send_id = [ 'width-l', 'height-l', 'noc' ];
    form2send_id.forEach( id => {
        let ele = $('#' + id );
        let name = ele.getAttribute('name');
        postForm.append( name, ele.value );
    });

    
    postForm.post('/add').then(r => r.text()).then( r => {
        if ( r == 'OK' ) {


            UPLODED.push( img_file.name );
            $('#img-view').src = URL.createObjectURL( img_file );

            addToTotal( $('#noc').value );


        } else alert('Layer Upload ERROR!')
    });

}

const renderPaper =(e) => {
    if ( $('#render-type').value == 'thum' || 
         $('#render-type').value == 'prev' )
    {
        e.preventDefault();
    } else return;
    

    const postForm = new PostForm();

    // Add All Text Input To PostForm
    let form2send_id = ['width', 'height', 'spacing', 'axis', 'render-type'];
    form2send_id.forEach( id => {
        let ele = $('#' + id );
        let name = ele.getAttribute('name');
        postForm.append( name, ele.value );
    });

    postForm.post('/render').then( r => r.blob() ).then( r=> {
        $('#img-view').src = URL.createObjectURL(r);
    });

}

const uiRenderer = (e) => {
    route_to = e.target.value;
    if ( route_to == 'layer' ){

        router.route( 'loading' );
        load_layers_info();

    } else {
        router.route( route_to );
    }
}


// Litchen To Event And Call Func.
$('#choose-ui').addEventListener( 'change', uiRenderer);
$('#submit-layer').addEventListener('click', addLayer);
$('#submit-paper').addEventListener('click', renderPaper);
$('#layers-name').addEventListener('change', displayLayer);
$('#change-layer').addEventListener('click', changeLayer);
$('#delete-layer').addEventListener('click', removeLayer);