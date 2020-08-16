import { setTransform } from './utils.js';

export class Drag {
    constructor(props) {
        Object.assign(this, props);
        this.pointers = [];
        this.initialZoom = 0;
        this.pointerup = this.pointerup.bind(this);
        this.pointerdown = this.pointerdown.bind(this);
        this.pointermove = this.pointermove.bind(this);
        this.preventClick = this.preventClick.bind(this);
    }
    attach() {
        document.body.onpointerdown = this.pointerdown;
        document.body.onpointerup = this.pointerup;
        document.body.onpointercancel =this.pointerup;
    }
    pointerup({ clientX, clientY }) {
        this.notAClick !== true && this.pointers.length && this.clickBuilding(clientX, clientY);
        this.pointers = [];
        document.body.onpointermove = null;
        this.notAClick = this.hypo = this.x2 = this.y2 = 0;
        clearTimeout(this.clickTime);
    }
    preventClick() {
        this.notAClick = true;
    }
    pointerdown(e) {
        if(['INPUT', 'BUTTON', 'A'].includes(e.target.tagName)) {
            return;
        }
        const $area = e.target.closest('[data-drag-area]');
        if(this.pointers.length === 0 && $area) {
            this.$area = $area.dataset.dragArea ? e.target.closest($area.dataset.dragArea) : { dataset: {} };
            const $target = e.target.closest('.draggable');
            this.$target = $target;
            const { x = 0, y = 0 } = $target.dataset;
            const { clientX, clientY } = e;
            this.x1 = clientX - x;
            this.y1 = clientY - y;
            this.initialZoom = + this.$zoomSlider.value;
            document.body.onpointermove = this.pointermove;
            this.clickTime = setTimeout(this.preventClick, 600);
        }
        this.pointers.push(e);
    }
    pointermove(e) {
        e.preventDefault();
        const [ e1, e2, e3 ] = this.pointers;
        const { $target } = this;
        if(e3) {
            return;
        }
        if(e2 && $target.classList.contains('pinchable')) {
            let e4;
            if (e.pointerId === e1.pointerId) {
                e4 = e2;
                this.pointers[0] = e;
            }
            else {
                e4 = e1;
                this.pointers[1] = e;
            }
            const hypo1 = Math.hypot(e4.clientX - e.clientX, e4.clientY - e.clientY);
            this.hypo = this.hypo || hypo1;
            this.$zoomSlider.value = this.initialZoom + Math.min(1, hypo1 / this.hypo - 1) * 100;
            return this.zoom();
        }
        const { clientX, clientY } = e;
        this.x2 = this.x1 - clientX;
        this.y2 = this.y1 - clientY;
        $target.dataset.x = - this.x2;
        $target.dataset.y = -this.y2;
        setTransform($target);
        if(Math.abs(this.x2) > 2 || Math.abs(this.y2) > 2) {
            this.notAClick = true;
        }
    }
}