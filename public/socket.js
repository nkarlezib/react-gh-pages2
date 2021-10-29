
var socket = io("wss://tarea-3-websocket.2021-2.tallerdeintegracion.cl", { 
    path: "/trucks",
    transports: ["websocket"]
});
var form = document.getElementById('form');
var username = document.getElementById('username');
var message = document.getElementById('message');
var messages = document.getElementById('messages');
var camiones = document.getElementById('info');

var trucks = {};

const mymap = L.map('mapid').setView([-22.451851, -69.38074], 8);
var camion1;

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mymap);



form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (message.value) {
        if (username.value){
            socket.emit('CHAT',{
                message: message.value,
                name: username.value
            });
            message.value = '';
            username.value = '';
        }
    }
  });

socket.on('CHAT', function(msg) {
    var item = document.createElement('li');
    var date = new Date;
    var minutes = date.getMinutes();
    var hour = date.getHours();
    var today = hour + ':' + minutes;
    item.innerHTML = `<strong> ${msg.name} </strong> : ${msg.message} <small> ${today} </small>`;
    messages.appendChild(item);
});

socket.on("POSITION", function(msg) {
    var id = msg.code;
    var position = msg.position;
    trucks[id].setLatLng(position);
    
});

socket.emit('TRUCKS',{
    code: String,
    origin: [] ,
    destination: [],
    driver_name: String,
    status: String
}
);

socket.on('TRUCKS', function(msg) {
    msg.forEach((element) =>{
        var l = 0;
        var latlngs = Array();
        var id = element.code;
        var origin = element.origin;
        var destination = element.destination;
        var driver_name = element.driver_name;
        var status = element.status;
        var start = L.marker(origin);
        trucks[id] = L.marker(origin);
        var finish = L.marker(destination);
        latlngs.push(start.getLatLng());
        latlngs.push(finish.getLatLng());
        mymap.addLayer(trucks[id]);
        trucks[id].bindPopup(id);
        start.bindPopup("Start");
        finish.bindPopup("Finish");
        mymap.addLayer(start);
        mymap.addLayer(finish);
        var polyline = L.polyline(latlngs, {color: 'blue'});
        mymap.addLayer(polyline);

        var item = document.createElement('li');
        if (status == "Error"){
            item.innerHTML = `<strong> ${id} </strong> : ${origin} -> ${destination} <small style="background-color:red;"> ERROR </small>`;
            item.id = id;

        }
        else{
            item.innerHTML = `<strong> ${id} </strong> : <small style="background-color:green;"> OK </small>`;
            item.id = id;
        }
        camiones.appendChild(item);
    })

});

socket.on('FAILURE', function(mng) {
    var code = mng.code;
    var source = mng.source;
    var linea = document.getElementById(code);
    linea.innerHTML = `<strong> ${code} </strong> :<strong style="background-color:RED;"> FAILURE </strong>: ${source} <button id = fix${code}> FIX </button>`;
    document.getElementById(`fix${code}`).addEventListener("click", function() {
        socket.emit('FIX',{
            code: code
        });
    });
})

socket.on('FIX', function(msg){
    var linea = document.getElementById(msg.code);
    linea.innerHTML = `<strong> ${msg.code} </strong> :  ->  <small style="background-color:green;"> OK </small> `;
})

//Hacer seccion fix y estados y cuando se apreta el boton fix, enviamos la señak FIX AL SERVIDOR con el ID 