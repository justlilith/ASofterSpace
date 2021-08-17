let sketch = function(p) {
  let DIAMETER = Math.min(p.windowWidth/3, p.windowHeight/3)
  
  let origin = [p.windowWidth/4, p.windowHeight/4]
  
  console.log(origin)
  
  let spin = 0
  
  let circle1, circle2, circle3
  
  let color1 = 'hsl(60, 100%, 50%)'
  let color2 = 'hsl(180, 100%, 50%)' //blue
  let color3 = 'hsl(300, 100%, 50%)'
  
  p.setup = () => {
    p.createCanvas(p.windowWidth/2, p.windowHeight/2);
    p.frameRate(60)
    p.angleMode(p.DEGREES)
    p.blendMode(p.MULTIPLY)
    p.blendMode(p.SCREEN)
    // p.loop()
    
    circle1 = new circleSpinner(0,5,DIAMETER,color1,1.2)
    circle2 = new circleSpinner(5,0,DIAMETER + 0,color2,2)
    circle3 = new circleSpinner(-5,5,DIAMETER,color3,3)
  }
  
  p.draw = () => {
    p.clear()
    // p.background(220,160,200);
    // p.background(0);
    // p.background(255);
    p.noStroke();
    spin = (spin + .8)
    circle1.display()
    circle2.display()
    circle3.display()
    // p.filter(p.BLUR, 1)
  }

  p.windowResized = () => {
    DIAMETER = Math.min(p.windowWidth/3, p.windowHeight/3)
    origin = [p.windowWidth/4, p.windowHeight/4]
    p.resizeCanvas(p.windowWidth/2, p.windowHeight/2)

    
    circle1.size = DIAMETER
    circle2.size = DIAMETER
    circle3.size = DIAMETER
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