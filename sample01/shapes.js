var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');
   
context.font = '22pt Arial';
context.fillStyle = 'red';
context.strokeStyle = 'blue';

context.fillText("Hello Worlds", 100,100);

context.strokeText("Hello World", 100,100);
