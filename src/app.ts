import P5 from 'p5';
import { Key } from 'ts-keycode-enum';
import 'p5/lib/addons/p5.dom';
import './styles.scss';

import { QuadTree, QtPoint, QtRectangle, QtCircle } from './QuadTree/';

let qtree: QuadTree;

const rangeStart: QtPoint = new QtPoint(255, 255);

// prettier-ignore
const options = {
    drawBorders : false,
    drawPoints  : true,
    pointSize   : 4,
    capacity    : 2,
    stop        : false,
    moveMode    : true,
    queryMode   : false,
    filterType  : 1,
};

// prettier-ignore
const palette = {
    borderLines    : '#444444',
    movingRegion   : '#2D74DE',
    selectedDots   : '#2D74DE',
    lockedRegion   : '#95D84A',
    dot            : '#F5F5F5',
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
            p5.rectMode(p5.CENTER);
            p5.noFill();

            // drawing borders of the sections
            if (options.drawBorders) {
                p5.stroke(palette.borderLines);
                p5.strokeWeight(1);
                node.isLeaf() && node.boundary.draw(p5);
            }

            if (options.drawPoints) {
                node.points.forEach(point => {
                    p5.stroke(palette.dot);
                    p5.strokeWeight(1);
                    p5.point(point.x, point.y);
                });
            }
        });

        if (options.queryMode) {
            // moving region
            if (options.moveMode) {
                p5.stroke(palette.movingRegion);
                rangeStart.x = p5.mouseX;
                rangeStart.y = p5.mouseY;
            }
            // locked
            else {
                p5.stroke(palette.lockedRegion);
                p5.stroke(0, 255, 0);
            }

            p5.strokeWeight(1);

            const createFilter = (primitiveType: number = 0, x: Number, y: Number) => {
                switch (primitiveType) {
                    case 0:
                        return new QtRectangle(x, y, 107, 75);
                        break;
                    case 1:
                        return new QtCircle(x, y, 100);
                        break;
                }
            };

            const range = createFilter(options.filterType, rangeStart.x, rangeStart.y);
            if (typeof range === 'undefined') debugger;
            // const range = new QtRectangle(rangeStart.x, rangeStart.y, );

            range.draw(p5);

            let points = qtree.query(range);

            points.forEach(p => {
                p5.stroke(palette.selectedDots);
                p5.strokeWeight(4);
                p5.point(p.x, p.y);
            });
        }
    };

    p5.keyPressed = () => {
        const keyboardActions = [
            {
                key: Key.One,
                desc: 'Toggle Drawing Borders',
                execute: _ => options.drawBorders = !options.drawBorders,
            },
            {
                key: Key.Two,
                desc: 'Toggle Drawing points',
                execute: _ => options.drawPoints = !options.drawPoints,
            },
            {
                key: Key.R,
                desc: 'Reset Board',
                execute: _ => {
                    const boundary = new QtRectangle(
                        p5.width / 2,
                        p5.height / 2,
                        p5.width / 2,
                        p5.height / 2
                    );
                    qtree = new QuadTree(boundary, 5);
                },
            },
            {
                key: Key.S,
                desc: 'Halt',
                execute: _ => options.stop = !options.stop,
                hidden: true,
            },
            {
                key: Key.Q,
                desc: 'Show Filter',
                execute: _ => options.queryMode = !options.queryMode,
            },
            {
                key: Key.L,
                desc: 'Lock Range',
                execute: _ => options.moveMode = !options.moveMode,
            },
            {
                key: Key.T,
                desc: 'Toggle Filter Area',
                execute: _ => options.filterType = (options.filterType + 1) % 2,
            },
            {
                key: Key.F,
                desc: 'Console log Framerate',
                execute: _ => console.log(p5.frameRate()),
            },
            {
                key: Key.H,
                desc: 'Show Help',
                hidden: true,
                execute: _ => keyboardActions.forEach(action => !action.hidden && console.log(`Key ${String.fromCharCode(action.key)}: ${action.desc}`));
            },
        ];

        keyboardActions.forEach(action => p5.keyCode == action.key && action.execute())

    };
};

const addRandomPoints = (nPoints: Number, p5: P5) => {
    const t0 = performance.now();
    for (let i = 0; i < nPoints; i++) {
        const x = p5.randomGaussian(p5.width / 2, p5.width / 6);
        const y = p5.randomGaussian(p5.height / 2, p5.height / 6);

        qtree.insert(new QtPoint(x, y));
    }
    const t1 = performance.now();
    console.log(`insert ${nPoints} took ${t1 - t0} milliseconds.`);
};

new P5(sketch);
