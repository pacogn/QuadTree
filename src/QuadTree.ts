export class QtPoint {
	constructor(private x: Number, private y: Number) {}
}

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

		const w = range.w;
		const h = range.h;

		if (dx > R + w || dy > R + h) return false;
		if (dx <= w || dy < h) return true;

		const edges = Math.pow(dx - w, 2) + Math.pow(dy, 2);

		return edges <= this.rSquared;
	}

	draw(p5: P5) {
		p5.circle(this.x, this.y, this.r);
	}
}

export class QtRectangle {
	public hD2: Number;
	public wD2: Number;

	public p1: QtPoint;
	public p2: QtPoint;

	constructor(private x: Number, private y: Number, private width: Number, private height: Number) {
		this.wD2 = this.width / 2;
		this.hD2 = this.height / 2;
		this.p1 = new QtPoint(this.x - this.width, this.y + this.height);
		this.p2 = new QtPoint(this.x + this.width, this.y - this.height);
	}

	contains(point: QtPoint) {
		return point.x >= this.p1.x && point.x <= this.p2.x && point.y <= this.p1.y && point.y > this.p2.y;
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
			return this.nw.insert(point) || this.ne.insert(point) || this.sw.insert(point) || this.se.insert(point);
		}
	}

	query(range: QtRectangle, found: QtPoint[] = []): QtPoint[] {
		if (!this.boundary.intersects(range)) return [];

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

	hasChilds() {
		return !!this._divided;
	}

	isLeaf() {
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
