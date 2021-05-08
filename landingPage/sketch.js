let sketch = function(p) {

  let capturer = new CCapture( {
    name: 'ASofterSpace-preview',
    format: 'gif',
    workersPath: './',
    framerate: 30,
    verbose: true,
    // timeLimit: 5,
  } );
  let canvas
    
  let WIDTH = 800
  let HEIGHT = 600
  
  let origin = [WIDTH/2, HEIGHT/2]
  
  console.log(origin)
  
  let spin = 0
  
  let circle1, circle2, circle3
  let DIAMETER = HEIGHT/2
  
  let color1 = 'hsl(60, 100%, 50%)'
  let color2 = 'hsl(180, 100%, 50%)' //blue
  let color3 = 'hsl(300, 100%, 50%)'
  
  p.setup = () => {
    let p5canvas = p.createCanvas(WIDTH, HEIGHT);
    canvas = p5canvas.canvas

    p.frameRate(120)
    p.angleMode(p.DEGREES)
    p.blendMode(p.SCREEN)
    p.loop()
    
    circle1 = new circleSpinner(0,5,DIAMETER,color1,1.2)
    circle2 = new circleSpinner(5,0,DIAMETER + 10,color2,4)
    circle3 = new circleSpinner(-5,0,DIAMETER,color3,3)
  }
  
  // MASSIVE THANKS to @pbesh (https://github.com/pbeshai/p5js-ccapture)

  let startMillis
  p.draw = () => {
    if (p.frameCount === 1) {
      // start the recording on the first frame
      // this avoids the code freeze which occurs if capturer.start is called
      // in the setup, since v0.9 of p5.js
      capturer.start();
    }
  
    if (startMillis == null) {
      startMillis = p.millis();
    }
  
    // duration in milliseconds
    var duration = 8000;
  
    // compute how far we are through the animation as a value between 0 and 1.
    var elapsed = p.millis() - startMillis;
    var t = p.map(elapsed, 0, duration, 0, 1);
  
    // if we have passed t=1 then end the animation.
    if (t > 1) {
      p.noLoop();
      console.log('finished recording.');
      capturer.stop();
      capturer.save();
      return;
    }

    p.clear()
    p.background(0);
    p.noStroke();
    spin = (spin + .2)
    circle1.display()
    circle2.display()
    circle3.display()
    capturer.capture(canvas)
  }
  
  class circleSpinner {
    constructor(offsetX, offsetY, size, color, speed) {
      this.object = p.circle(offsetX, offsetY, size)
      this.offsetX = offsetX
      this.offsetY = offsetY
      this.size = size
      this.color = color
      this.speed = speed
      // return this.object
    }
    
    display(){
      // this.object
      p.noFill()
      p.resetMatrix()
      this.translate(...origin)
      this.rotate(spin, this.speed)
      p.fill(this.color)
      p.circle(this.offsetX, this.offsetY, this.size)
    }
    
    translate(x, y) {
      p.translate(x, y)
      // return this.object
    }
    rotate(amount, speed) {
      p.rotate(amount * speed)
      // return this.object
    }
  }
}
new p5(sketch, 'p5Sketch');