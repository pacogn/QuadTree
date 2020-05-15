import { QtPoint, QtRectangle, QtCircle } from './index';

export class QuadTree {
    public points: QtPoint[] = [];

    public nw: QtPoint;
    public ne: QtPoint;
    public sw: QtPoint;
    public se: QtPoint;

    public nChecks: Number = 0;

    private _divided: Boolean = false;

    constructor(public boundary: QtRectangle, private capacity: Number) {}

    insert(point: QtPoint) {
        if (!this.boundary.contains(point)) return false;

        if (this.points.length < this.capacity) {
            this.points.push(point);

            return true;
        } else {
            !this._divided && this._subdivide();

            return (
                this.nw.insert(point) ||
                this.ne.insert(point) ||
                this.sw.insert(point) ||
                this.se.insert(point)
            );
        }
    }

    query(range: qtCircle, found: QtPoint[] = []): QtPoint[] {
        if (!range.intersects(this.boundary)) return [];

        if (!this.isLeaf()) {
            this.nw.query(range, found);
            this.ne.query(range, found);
            this.sw.query(range, found);
            this.se.query(range, found);
        }

        this.points.forEach(p => range.contains(p) && found.push(p));

        return found;
    }

    traverse(fn: (node: QuadTree) => {}) {
        if (!this.isLeaf()) {
            this.nw.traverse(fn);
            this.ne.traverse(fn);
            this.sw.traverse(fn);
            this.se.traverse(fn);
        }

        fn(this);
    }

    hasChilds(): Boolean {
        return !!this._divided;
    }

    isLeaf(): Boolean {
        return !this._divided;
    }

    private _subdivide() {
        const c = this.capacity;

        const p1x = this.boundary.x - this.boundary.wD2;
        const p1y = this.boundary.y + this.boundary.hD2;

        const p2x = this.boundary.x + this.boundary.wD2;
        const p2y = this.boundary.y - this.boundary.hD2;

        const wD2 = this.boundary.wD2;
        const hD2 = this.boundary.hD2;

        const nw = new QtRectangle(p1x, p1y, wD2, hD2);
        const ne = new QtRectangle(p2x, p1y, wD2, hD2);
        const sw = new QtRectangle(p1x, p2y, wD2, hD2);
        const se = new QtRectangle(p2x, p2y, wD2, hD2);

        this.nw = new QuadTree(nw, c);
        this.ne = new QuadTree(ne, c);
        this.sw = new QuadTree(sw, c);
        this.se = new QuadTree(se, c);

        this._divided = true;
    }
}
