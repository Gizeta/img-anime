const $$canvas       = Symbol('$$canvas');
const $$currentFrame = Symbol('$$currentFrame');
const $$fps          = Symbol('$$fps');
const $$frameCount   = Symbol('$$frameCount');
const $$frames       = Symbol('$$frames');
const $$handler      = Symbol('$$handler');
const $$render       = Symbol('$$render');
const $$startTime    = Symbol('$$startTime');

class ImgAnime extends HTMLElement {
    static get observedAttributes() { return ['fps']; }

    constructor() {
        super();

        let shadow = this.attachShadow({mode: 'open'});

        this[$$frames] = [];
        
        let maxWidth = 0;
        let maxHeight = 0;

        let images = Array.prototype.slice.call(this.getElementsByTagName('img'));
        for (let image of images) {
            if (maxWidth < image.width)
                maxWidth = image.width;
            if (maxHeight < image.height)
                maxHeight = image.height;

            this[$$frames].push(image);
            if (+image.dataset.span > 0) {
                Array.prototype.push.apply(this[$$frames], new Array(+image.dataset.span));
            }
            
            image.style.display = 'none';
        }
        this[$$frameCount] = this[$$frames].length;

        let canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        shadow.appendChild(canvas);
        this[$$canvas] = canvas;

        this[$$handler] = null;
        this[$$currentFrame] = 0;
        this[$$fps] = 30;
    }

    connectedCallback() {
        this.play();
    }

    disconnectedCallback() {
        this.pause();
        this.reset();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'fps') {
            this.fps = +newValue;
        }
    }

    play() {
        if (!this[$$handler]) {
            this[$$startTime] = new Date().getTime() - this[$$currentFrame] * 1000 / this[$$fps];
            this[$$handler] = requestAnimationFrame(this[$$render].bind(this));
        }
    }

    pause() {
        if (this[$$handler]) {
            cancelAnimationFrame(this[$$handler]);
            this[$$handler] = null;
        }
    }

    reset() {
        this[$$currentFrame] = 0;
        this.seek(0);
    }

    seek(frame) {
        this[$$currentFrame] = frame % this[$$frameCount];
        this[$$startTime] = new Date().getTime() - frame * 1000 / this[$$fps];
    }

    get fps() { return this[$$fps]; }
    set fps(value) {
        this[$$fps] = value;
        this.seek(this[$$currentFrame]);
    }

    [$$render]() {
        let timeDelta = new Date().getTime() - this[$$startTime];
        let currentFrame = timeDelta * this[$$fps] / 1000 % this[$$frameCount] | 0;

        if (this[$$currentFrame] !== currentFrame && this[$$frames][currentFrame] != null) {
            this[$$currentFrame] = currentFrame;
            let ctx = this[$$canvas].getContext('2d');
            ctx.clearRect(0, 0, this[$$canvas].width, this[$$canvas].height);
            ctx.drawImage(this[$$frames][currentFrame], 0, 0);
        }
        
        this[$$handler] = requestAnimationFrame(this[$$render].bind(this));
    }
}

customElements.define('img-anime', ImgAnime);
