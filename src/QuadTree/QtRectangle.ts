import P5 from 'p5';
import { QtPoint } from './QtPoint';

export class QtRectangle {
    public hD2: Number;
    public wD2: Number;

    public p1: QtPoint;
    public p2: QtPoint;

    constructor(
        private x: Number,
        private y: Number,
        private width: Number,
        private height: Number
    ) {
        this.wD2 = this.width / 2;
        this.hD2 = this.height / 2;
        this.p1 = new QtPoint(this.x - this.width, this.y + this.height);
        this.p2 = new QtPoint(this.x + this.width, this.y - this.height);
    }

    contains(point: QtPoint) {
        return (
            point.x >= this.p1.x &&
            point.x <= this.p2.x &&
            point.y <= this.p1.y &&
            point.y > this.p2.y
        );
    }

    intersects(range: QtRectangle) {
        const l1 = this.p1;
        const r1 = this.p2;

        const l2 = range.p1;
        const r2 = range.p2;

        // If one rectangle is on left side of other
        if (l1.x >= r2.x || l2.x >= r1.x) return false;

        // If one rectangle is above other
        if (l1.y <= r2.y || l2.y <= r1.y) return false;

        return true;
    }

    draw(p5: P5) {
        p5.rectMode(p5.CENTER);
        p5.rect(this.x, this.y, this.width * 2, this.height * 2);
    }
}
