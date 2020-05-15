import P5 from 'p5';
import { QtPoint } from './QtPoint';

export class QtCircle {
    public rSquared: Number;

    constructor(public x: Number, public y: Number, public r: Number) {
        this.rSquared = r * r;
    }

    contains(point: QtPoint) {
        const dx = Math.abs(point.x - this.x);
        const dy = Math.abs(point.y - this.y);
        const R = this.r;

        if (dx > R) return false;
        if (dy > R) return false;

        if (dx + dy <= R) return true;

        return Math.pow(dx, 2) + Math.pow(dy, 2) <= this.rSquared;
    }

    intersects(range: QtRectangle) {
        const dx = Math.abs(range.x - this.x);
        const dy = Math.abs(range.y - this.y);
        const R = this.r;

        const w = range.width;
        const h = range.height;

        if (dx > R + w || dy > R + h) return false;
        if (dx <= w || dy < h) return true;

        const edges = Math.pow(dx - w, 2) + Math.pow(dy, 2);

        return edges <= this.rSquared;
    }

    draw(p5: P5) {
        p5.circle(this.x, this.y, this.r);
    }
}
