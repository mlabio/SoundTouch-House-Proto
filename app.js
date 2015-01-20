var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080); //local test
//app.listen(); //remote deploy

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
};

//properties
var clients = new Array();
var sID = 0;

io.sockets.on('connection', function (socket) {
	//declare socket handlers?
  	add_new_user(socket);
	remove_user(socket);
	move_object(socket);
	house_control(socket);
	
});

var lastItem = 'house_img';
function house_control(socket){
	socket.on('house_handler', function(currentItem){
		console.log('=================================' + currentItem + '===================');
		io.sockets.emit('animate_house', lastItem, currentItem );
		lastItem = currentItem;
		
	});
}

function add_new_user(socket){	
	socket.on('new_user', function(){
			//set usercount and client list
			clients[sID] = socket.id;
			io.sockets.emit('update_user_count', clients.length, clients);
			
			//update_accelerometer_data(socket);
			
			//set userid
			socket.emit('update_user_id', socket.id);
			sID++;
	});
};



function remove_user(socket){
	socket.on('disconnect', function(){
		if(sID > 0){sID--;};
		var index = clients.indexOf(socket.id);

		clients.splice(index,1);

		io.sockets.emit('update_user_count', clients.length, clients);
		
	});
	socket.on('connect_failed', function () {
	   /* Insert code to reestablish connection. */
		// test this with console
		console.log("============socket.id================" + socket.id);
	});
};
var moveNum = 0;
function move_object(socket){
	moveNum++;
	socket.on('moveMe', function(direction){
		//direction
		switch(direction)
		{
		case "right":
		  io.sockets.emit('mobile_broadcast', "right", moveNum, socket.id);
		  break;
		case "left":
		  io.sockets.emit('mobile_broadcast', "left", moveNum, socket.id);
		  break;
		case "wait":
		  io.sockets.emit('mobile_broadcast', "wait", moveNum, socket.id);
		  break;
		case "steady":
		  io.sockets.emit('mobile_broadcast', "steady", moveNum, socket.id);
		  break;
		default:
		}
	    io.sockets.emit('update_user_count', clients.length, clients);
	});
	
};
