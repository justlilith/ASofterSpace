let sketch = function(p) {
  
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
    p.createCanvas(WIDTH, HEIGHT);
    p.frameRate(60)
    p.angleMode(p.DEGREES)
    p.blendMode(p.SCREEN)
    // loop()
    
    circle1 = new circleSpinner(0,5,DIAMETER,color1,1.2)
    circle2 = new circleSpinner(5,0,DIAMETER + 0,color2,2)
    circle3 = new circleSpinner(-5,5,DIAMETER,color3,3)
  }
  
  p.draw = () => {
    p.clear()
    p.background(0);
    p.noStroke();
    spin = (spin + .2)
    circle1.display()
    circle2.display()
    circle3.display()
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