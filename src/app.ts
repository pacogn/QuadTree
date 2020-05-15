import P5 from 'p5';
import 'p5/lib/addons/p5.dom';
import './styles.scss';

import { QuadTree, QtPoint, QtRectangle } from './QuadTree';

let qtree: QuadTree;

const rangeStart: QtPoint = new QtPoint(255, 255);

const options = {
	drawBorders: false,
	drawPoints: true,
	pointSize: 4,
	capacity: 2,
	stop: false,
	moveMode: false,
	queryMode: false
};

const sketch = (p5: P5) => {
	p5.setup = () => {
		const canvas = p5.createCanvas(400, 400);
		canvas.parent('app');

		let boundary = new QtRectangle(p5.width / 2, p5.height / 2, p5.width / 2, p5.height / 2);
		qtree = new QuadTree(boundary, options.capacity);

		addRandomPoints(300, p5);
	};

	p5.draw = () => {
		if (options.stop) return;

		if (p5.mouseIsPressed) {
			qtree.insert(new QtPoint(p5.mouseX, p5.mouseY));
		}

		p5.background(51);

		qtree.traverse(node => {
			p5.stroke(255);
			p5.noFill();
			p5.rectMode(p5.CENTER);

			if (options.drawBorders) {
				p5.strokeWeight(1);
				node.isLeaf() && node.boundary.draw(p5);
				// node.boundary.draw(p5);
			}

			if (options.drawPoints) {
				node.points.forEach(point => {
					p5.strokeWeight(1);
					p5.point(point.x, point.y);
				});
			}
		});

		if (options.queryMode) {
			if (options.moveMode) {
				p5.stroke(0, 0, 255);
				p5.strokeWeight(1);
				rangeStart.x = p5.mouseX;
				rangeStart.y = p5.mouseY;
			} else {
				p5.stroke(0, 255, 0);
				p5.strokeWeight(1);
			}

			const range = new QtRectangle(rangeStart.x, rangeStart.y, 107, 75);
			range.draw(p5);

			let points = qtree.query(range);

			points.forEach(p => {
				p5.stroke(0, 0, 255);
				p5.strokeWeight(4);
				p5.point(p.x, p.y);
			});

		}
	};

	p5.keyPressed = () => {
		// r: reset
		if (p5.keyCode == 82) {
			let boundary = new QtRectangle(p5.width / 2, p5.height / 2, p5.width / 2, p5.height / 2);
			qtree = new QuadTree(boundary, 5);
		}

		// 1: toggle drawing Borders
		if (p5.keyCode == 49) options.drawBorders = !options.drawBorders;

		// 2: toggle drawing Points;
		if (p5.keyCode == 50) options.drawPoints = !options.drawPoints;

		// s: toggle stop
		if (p5.keyCode == 83) options.stop = !options.stop;

		// q: query range 
		if (p5.keyCode == 81) options.queryMode = !options.queryMode;
	
		// m: move range
		if (p5.keyCode == 77) options.moveMode = !options.moveMode;

		// f: splash frame rat
		if (p5.keyCode == 70) console.log(p5.frameRate())

		
	};
};

const addRandomPoints = (nPoints: Number, p5: P5) => {
	const t0 = performance.now();
	for (let i = 0; i < nPoints; i++) {
		const x = p5.randomGaussian(p5.width/2, p5.width/6);
		const y = p5.randomGaussian(p5.height/2, p5.height/6);

		qtree.insert(new QtPoint(x, y));
	}
	const t1 = performance.now();
	console.log(`insert ${nPoints} took ${t1 - t0} milliseconds.`);
};

new P5(sketch);
