class ImgAnime extends HTMLElement {
    static get observedAttributes() { return ['fps']; }

    constructor() {
        super();

        let shadow = this.attachShadow({mode: 'open'});

        this.frames = [];
        
        let maxWidth = 0;
        let maxHeight = 0;

        let images = Array.prototype.slice.call(this.getElementsByTagName('img'));
        for (let image of images) {
            if (maxWidth < image.width)
                maxWidth = image.width;
            if (maxHeight < image.height)
                maxHeight = image.height;

            this.frames.push(image);
            if (+image.dataset.span > 0) {
                Array.prototype.push.apply(this.frames, new Array(+image.dataset.span));
            }
            
            image.style.display = 'none';
        }
        this._frameCount = this.frames.length;

        let canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        shadow.appendChild(canvas);
        this._canvas = canvas;

        this._handler = null;
        this._currentFrame = 0;
        this._fps = 30;
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
            this._fps = +newValue;
            this.seek(this._currentFrame);
        }
    }

    play() {
        if (!this._handler) {
            this._startTime = new Date().getTime() - this._currentFrame * 1000 / this._fps;
            this._handler = requestAnimationFrame(this._render.bind(this));
        }
    }

    pause() {
        if (this._handler) {
            cancelAnimationFrame(this._handler);
            this._handler = null;
        }
    }

    reset() {
        this._currentFrame = 0;
        this.seek(0);
    }

    seek(frame) {
        this._currentFrame = frame % this._frameCount;
        this._startTime = new Date().getTime() - frame * 1000 / this._fps;
    }

    _render() {
        let timeDelta = new Date().getTime() - this._startTime;
        let _currentFrame = timeDelta * this._fps / 1000 % this._frameCount | 0;

        if (this._currentFrame !== _currentFrame && this.frames[_currentFrame] != null) {
            this._currentFrame = _currentFrame;
            let ctx = this._canvas.getContext('2d');
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            ctx.drawImage(this.frames[_currentFrame], 0, 0);
        }
        
        this._handler = requestAnimationFrame(this._render.bind(this));
    }
}

customElements.define('img-anime', ImgAnime);
