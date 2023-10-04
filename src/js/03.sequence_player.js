/*!
 * Sequence Player JavaScript Library v1.1
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2023-10-04
 */

class SequencePlayer {
    constructor(opts) {
        this.opts = opts;
        this.targetElement = opts.targetElement;
        this.imageList = [];
        this.loadCount = 0;
        this.playIndex = null;
        this.playingTime = 0;
        this.pausePlayingTime = 0;
        this.usePlay = false;
        this.useReverse = false;
        this.imageLoadOffset = !!!this.opts.imageLoadOffset ? 0 : this.opts.imageLoadOffset;
        this.setCanvas();
        this.loadImages();
        return this;
    }

    setCanvas() {
        const _checkElement = (element)=>{
            if (element.tagName == 'CANVAS') {
                this.canvas = element;
            } else {
                this.canvas = document.createElement('CANVAS');

                if (this.opts.addType == 'append') {
                    this.targetElement.appendChild(this.canvas);
                } else {
                    let firstChild = this.targetElement.firstElementChild;

                    if (!!!firstChild) {
                        this.targetElement.appendChild(this.canvas);
                    } else {
                        firstChild.parentNode.insertBefore(this.canvas, firstChild);
                    }
                }
            }
        };

        if (this.targetElement.jquery) {
            _checkElement(this.targetElement[0]);
        } else {
            _checkElement(this.targetElement);
        }

        this.context = this.canvas.getContext('2d');

        let firstImage = new Image();
            
        firstImage.src = this.opts.path + this.opts.name + 0 + '.' + this.opts.extension;
        if (!!!this.opts.width || !!!this.opts.height) {
            firstImage.addEventListener('load', ()=>{
                this.canvas.width = firstImage.naturalWidth;
                this.canvas.height = firstImage.naturalHeight;
                this.opts.width = this.canvas.width;
                this.opts.height = this.canvas.height;
            });    
        } else {
            this.canvas.width = this.opts.width;
            this.canvas.height = this.opts.height;
        }
    };

    loadImages() {
        let isImage,
            windowTopOffset,
            windowBottomOffset,
            targetTopOffset,
            targetBottomOffset;

        const bindEvent = ()=>{
            scrollHandler();
            window.addEventListener('scroll', scrollHandler);
        };

        const scrollHandler = ()=>{
            windowTopOffset = window.pageYOffset - (window.innerHeight*this.imageLoadOffset);
            windowBottomOffset = window.pageYOffset + window.innerHeight + (window.innerHeight*this.imageLoadOffset);
            getCanvasOffset();

            if (windowBottomOffset > targetTopOffset && windowTopOffset < targetTopOffset ||
                windowTopOffset < targetBottomOffset && windowBottomOffset > targetBottomOffset ||
                windowTopOffset < targetTopOffset && windowBottomOffset > targetBottomOffset ||
                windowTopOffset > targetTopOffset && windowBottomOffset < targetBottomOffset) {
                startLoadImages();

                window.removeEventListener('scroll', scrollHandler);
            }
        };

        const getCanvasOffset = ()=>{
            targetTopOffset = this.targetElement.getBoundingClientRect().top + window.pageYOffset;
            targetBottomOffset = this.targetElement.getBoundingClientRect().bottom + window.pageYOffset;
        };

        const startLoadImages = ()=>{
            let self = this;
            if (!this.opts.autoPlay && !this.defaultImage) {
                this.setDefaultImage(0);
            }

            for (let i = this.opts.startNum; i <= this.opts.endNum; i++) {
                isImage = new Image();
                isImage.src = this.opts.path + this.opts.name + i + '.' + this.opts.extension;
   
                ((idx, imgElement)=>{
                    let imageLoadEvent = function (){
                        self.imageList[idx] = this;

                        if (self.loadCount < self.opts.endNum) {
                            self.loadCount++;
                            self.imageList[idx].removeEventListener('load', imageLoadEvent);
                        } else if (self.opts.autoPlay && self.loadCount == self.opts.endNum) {
                            setTimeout(()=>{
                                self.play();
                            }, 100);
                            return;
                        }
                    };
    
                    imgElement.addEventListener('load', imageLoadEvent);
                })(i, isImage);
    
                isImage = null;
            }  
        };

        return bindEvent();
    };

    sequenceLoadCheck(type) {
        let intervalTimer = null;
        intervalTimer = setInterval(()=>{
            if (this.loadCount == this.opts.endNum) {
                this.activeSequence(type);
                clearInterval(intervalTimer);
                intervalTimer = null;
            }
        }, 100);
    };

    setDefaultImage(idx) {
        this.defaultImage = new Image();
        this.defaultImage.src = this.opts.path + this.opts.name + idx + '.' + this.opts.extension;

        this.defaultImageEvent = ()=>{
            this.context.drawImage(this.defaultImage, 0, 0, this.opts.width, this.opts.height);
        };

        this.defaultImage.addEventListener('load', this.defaultImageEvent);
    };

    play (opts) {
        opts = opts || {};

        if (this.isPlay) return;

        let idx = opts.index > this.opts.endNum ? this.opts.endNum : opts.index;

        this.activeCallback = opts.activeCallback || function () {};
        this.endCallback = opts.endCallback || function () {};
        this.beforeTime = opts.beforeTime || 0;

        if (typeof opts.index == 'number') {
            if (this.loadCount == this.opts.endNum) {
                if (this.defaultImage) {
                    this.defaultImage.removeEventListener('load', this.defaultImageEvent);
                }

                this.drawCanvas(idx);
            } else {
                if (this.defaultImage) {
                    this.defaultImage.removeEventListener('load', this.defaultImageEvent);
                }

                this.setDefaultImage(idx);
            }
        } else {
            if (this.loadCount !== this.opts.endNum) {
                this.sequenceLoadCheck();
            } else {
                this.activeSequence();
            }
        }
    };

    reverse() {
        if (this.isPlay) return;

        if (this.loadCount !== this.opts.endNum) {
            this.sequenceLoadCheck('reverse');
        } else {
            this.activeSequence('reverse');
        }
    };

    pause() {
        if (!this.isPlay) return;

        if (this.useReverse && this.usePlayIng) {
            this.useReverse = false;
        }

        window.cancelAnimationFrame(this.playAnimation);
        this.isPlay = false;
        this.pausePlayingTime = this.playingTime;
    };

    stop() {
        this.pause();
        this.playIndex = null;
        this.playingTime = 0;
        this.pausePlayingTime = 0;
        this.usePlay = false;
        this.usePlayIng = false;
        this.useReverse = false;
        this.useReverseIng = false;
        this.drawCanvas(this.opts.startNum);
    };

    drawCanvas(index) {
        if (this.playIndex == null && this.oldPlayIndex == index) return;
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);

        if (this.imageList[index >= 0 ? index : this.playIndex] && this.imageList[index >= 0 ? index : this.playIndex].complete) {
            this.context.drawImage(this.imageList[index >= 0 ? index : this.playIndex], 0, 0, this.opts.width, this.opts.height);
        }
        this.oldPlayIndex = this.playIndex;

        if (index) {
            this.playIndex = index;
        }
    };

    activeSequence(type) {
        let playInterval = this.opts.endNum / this.opts.playTime,
            startTime = null,
            progress;

        this.activeCallback();
        this.isPlay = true;

        const _setIndex = (timestemp)=>{
            if (timestemp && startTime == null) {
                startTime = Math.ceil(timestemp);
            }

            if (this.playIndex == null && type !== 'reverse') {
                this.playIndex = this.opts.startNum;
            } else if (this.playIndex == null && type == 'reverse') {
                console.log(2222)
                this.playIndex = this.opts.endNum;
            }
        };

        const _resetStatus = ()=>{
            this.playingTime = 0;
            this.pausePlayingTime = 0;
            this.playIndex = null;
            this.pause();
            this.isPlay = false;
            this.usePlay = false;
            this.usePlayIng = false;
            this.useReverse = false;
            this.useReverseIng = false;
            if (this.opts.loop) {
                this.play();
            }
        };

        let _animation = {
            default: ()=>{
                _setIndex();

                if (type == 'reverse' && this.playIndex >= this.opts.startNum || !!!type && this.playIndex <= this.opts.endNum) {
                    this.drawCanvas();

                    if (!!!type) {
                        this.playIndex++;
                    } else {
                        this.playIndex--;
                    }

                    this.playAnimation = window.requestAnimationFrame(_animation.default);
                } else {
                    this.playIndex = null;
                    this.isPlay = false;
                    this.pause();
                }
            },
            timeControll: (timestemp)=>{
                _setIndex(timestemp);

                progress = Math.ceil(timestemp) - startTime;

                if (!!!type && this.playIndex <= this.opts.endNum || type == 'reverse' && this.playIndex >= this.opts.startNum) {
                    this.drawCanvas();
                }

                 switch (type) {
                    case undefined:
                        if (this.useReverse && !this.useReverseIng) {
                            this.usePlayIng = true;
                            let corrTime = this.opts.playTime - this.pausePlayingTime;
                            this.playIndex = Math.ceil((progress + corrTime) * playInterval);
                            this.playingTime = progress + corrTime;

                            if (this.playingTime > this.opts.playTime - this.beforeTime) this.endCallback();
                            if (this.playingTime > this.opts.playTime) {
                                _resetStatus();
                                return;
                            }
                        } else {
                            this.usePlay = true;
                            this.playIndex = Math.ceil((progress + this.pausePlayingTime) * playInterval);
                            this.playingTime = progress + this.pausePlayingTime;

                            if (this.playingTime > this.opts.playTime - this.beforeTime) this.endCallback();
                            if (this.playingTime > this.opts.playTime) {
                                _resetStatus();
                                return;
                            }
                        }

                        break;

                    case 'reverse':
                        if (this.usePlay || this.usePlayIng && this.useReverse) {
                            this.useReverseIng = true;
                            let corrTime = this.pausePlayingTime - this.opts.playTime;
                            this.playIndex = Math.floor((this.opts.playTime + corrTime - progress) * playInterval);
                            this.playingTime = this.opts.playTime + corrTime - progress;

                            if (this.playingTime < this.beforeTime) this.endCallback();
                            if (this.playingTime > this.opts.playTime || this.playIndex <= 0) {
                                _resetStatus();
                                return;
                            }
                        } else {
                            this.useReverse = true;
                            this.playIndex = Math.floor((this.opts.playTime - (progress + this.pausePlayingTime)) * playInterval);
                            this.playingTime = progress + this.pausePlayingTime;

                            if (this.playingTime > this.opts.playTime - this.beforeTime) this.endCallback();
                            if (this.playingTime > this.opts.playTime) {
                                _resetStatus();
                                return;
                            }
                        }

                        break;
                }
                this.playAnimation = window.requestAnimationFrame(_animation.timeControll);
            }
        };
        this.playAnimation = window.requestAnimationFrame(this.opts.playTime ? _animation.timeControll : _animation.default);
    };
}

const SEQUENCEPLAYER = function(opts){
	return new SequencePlayer(opts)
};