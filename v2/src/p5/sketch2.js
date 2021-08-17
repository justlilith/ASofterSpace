let sketch2 = function(p) {
	let DIAMETER = Math.min(p.windowWidth/5, p.windowHeight/5)
	
	let origin = [p.windowWidth/4, p.windowHeight/4]
	
	let box1, box2, box3, box4, box5
	let spin
	let color1 = 'hsl(60, 100%, 50%)'
	let color2 = 'hsl(180, 100%, 50%)' //blue
	let color3 = 'hsl(300, 100%, 50%)'
	let color4 = 'hsl(300, 100%, 100%)'
	let color5 = 'hsla(300, 100%, 0%, 0.5)'
	
	p.setup = () => {
		p.createCanvas(p.windowWidth/2, p.windowHeight/2, p.WEBGL);
		p.frameRate(60)
		p.angleMode(p.DEGREES)
		// p.blendMode(p.MULTIPLY)
		p.blendMode(p.SCREEN)
		// p.loop()
		
		box1 = new spinBox(0, 0, DIAMETER, color2, 5)
		box2 = new spinBox(0, 5, DIAMETER, color3, 1.5)
		box3 = new spinBox(0, -5, DIAMETER, color1, 3)
		box4 = new spinBox(0, 2.5, DIAMETER, color4, 1)
		box5 = new spinBox(0, 2.5, DIAMETER - 10, color5, 1, 'solid')
	}
	
	p.draw = () => {
		spin = spin + .8
		p.clear()
		// background(0)
		// blendMode(MULTIPLY)
		
		box1.display()
		box2.display()
		box3.display()
		box4.display()
		box5.display()
	}
	
	p.windowResized = () => {
		DIAMETER = Math.min(p.windowWidth/5, p.windowHeight/5)
		origin = [p.windowWidth/4, p.windowHeight/4]
		p.resizeCanvas(p.windowWidth/2, p.windowHeight/2)
	}

	class spinBox{
		constructor(offsetX, offsetY, size, color, speed, mode){
			this.object = p.box(size, size, size)
			this.offsetX = offsetX
			this.offsetY = offsetY
			this.size = size
			this.color = color
			this.speed = speed
			this.mode = mode
		}
		
		display(){
			// this.object
			// noFill()
			// resetMatrix()
			this.speed2 = p.sin(p.frameCount % 360)
			this.translate(this.offsetX, this.offsetY)
			p.rotateY(this.speed2 * 2 * this.speed2)
			p.strokeWeight(3)
			p.stroke(this.color)
			p.push()
			p.noFill()
			if (this.mode == 'solid') {
				p.fill(this.color)
			}
			p.rotateY((p.frameCount  * 0.6) % 360)
			p.rotateX(45)
			p.rotateZ(45)
			p.box(this.size, this.size, this.size)
			p.pop()
			// this.speed += 2
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
new p5(sketch2, 'p5Sketch2');