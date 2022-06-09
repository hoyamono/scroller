/*!
 * Sequence Player JavaScript Library v1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-24
 */

var SEQUENCEPLAYER = (function () {
    var init = function (opts) {
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
    };

    var fn = init.prototype;

    fn.setCanvas = function () {
        var self = this;

        var _checkElement = function (element) {
            if (element.tagName == 'CANVAS') {
                this.canvas = element;
            } else {
                this.canvas = document.createElement('CANVAS');

                if (this.opts.addType == 'append') {
                    this.targetElement.appendChild(this.canvas);
                } else {
                    var firstChild = this.targetElement.firstElementChild;

                    if (!!!firstChild) {
                        this.targetElement.appendChild(this.canvas);
                    } else {
                        firstChild.parentNode.insertBefore(this.canvas, firstChild);
                    }
                }
            }
        };

        if (this.targetElement.jquery) {
            _checkElement.call(this, this.targetElement[0]);
        } else {
            _checkElement.call(this, this.targetElement);
        }

        this.context = this.canvas.getContext('2d');

        var firstImage = new Image();
            
        firstImage.src = this.opts.path + this.opts.name + 0 + '.' + this.opts.extension;
        if (!!!self.opts.width || !!!self.opts.height) {
            firstImage.addEventListener('load', function(){
                self.canvas.width = firstImage.naturalWidth;
                self.canvas.height = firstImage.naturalHeight;
                self.opts.width = self.canvas.width;
                self.opts.height = self.canvas.height;
            });    
        } else {
            self.canvas.width = self.opts.width;
            self.canvas.height = self.opts.height;
        }
    };

    fn.loadImages = function () {
        var self = this,
            isImage,
            windowTopOffset,
            windowBottomOffset,
            targetTopOffset,
            targetBottomOffset;

        var bindEvent = function(){
            scrollHandler();
            window.addEventListener('scroll', scrollHandler);
        };

        var scrollHandler = function(){
            windowTopOffset = window.pageYOffset - (window.innerHeight*self.imageLoadOffset);
            windowBottomOffset = window.pageYOffset + window.innerHeight + (window.innerHeight*self.imageLoadOffset);
            getCanvasOffset();

            if (windowBottomOffset > targetTopOffset && windowTopOffset < targetTopOffset ||
                windowTopOffset < targetBottomOffset && windowBottomOffset > targetBottomOffset ||
                windowTopOffset < targetTopOffset && windowBottomOffset > targetBottomOffset ||
                windowTopOffset > targetTopOffset && windowBottomOffset < targetBottomOffset) {
                startLoadImages();

                window.removeEventListener('scroll', scrollHandler);
            }
        };

        var getCanvasOffset = function(){
            targetTopOffset = self.targetElement.getBoundingClientRect().top + window.pageYOffset;
            targetBottomOffset = self.targetElement.getBoundingClientRect().bottom + window.pageYOffset;
        };

        var startLoadImages = function(){
            if (!self.opts.autoPlay && !self.defaultImage) {
                self.setDefaultImage(0);
            }

            for (var i = self.opts.startNum; i <= self.opts.endNum; i++) {
                isImage = new Image();
                isImage.src = self.opts.path + self.opts.name + i + '.' + self.opts.extension;
   
                (function (idx, imgElement) {
                    var imageLoadEvent = function () {
                        self.imageList[idx] = this;

                        if (self.loadCount < self.opts.endNum) {
                            self.loadCount++;

                            this.removeEventListener('load', imageLoadEvent);
                        } else if (self.opts.autoPlay && self.loadCount == self.opts.endNum) {
                            setTimeout(function() {
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

    fn.sequenceLoadCheck = function (type) {
        var self = this,
            intervalTimer = null;
        intervalTimer = setInterval(function () {
            if (self.loadCount == self.opts.endNum) {
                self.activeSequence(type);
                clearInterval(intervalTimer);
                intervalTimer = null;
            }
        }, 100);
    };

    fn.setDefaultImage = function(idx) {
        var self = this;

        this.defaultImage = new Image();
        this.defaultImage.src = this.opts.path + this.opts.name + idx + '.' + this.opts.extension;

        this.defaultImageEvent = function(){
            self.context.drawImage(self.defaultImage, 0, 0, self.opts.width, self.opts.height);
        };

        this.defaultImage.addEventListener('load', this.defaultImageEvent);
    };

    fn.play = function (opts) {
        opts = opts || {};

        if (this.isPlay) return;

        var idx = opts.index > this.opts.endNum ? this.opts.endNum : opts.index;

        this.activeCallback = opts.activeCallback || function () { };
        this.endCallback = opts.endCallback || function () { };
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

    fn.reverse = function () {
        if (this.isPlay) return;

        if (this.loadCount !== this.opts.endNum) {
            this.sequenceLoadCheck('reverse');
        } else {
            this.activeSequence('reverse');
        }
    };

    fn.pause = function () {
        if (!this.isPlay) return;

        if (this.useReverse && this.usePlayIng) {
            this.useReverse = false;
        }

        window.cancelAnimationFrame(this.playAnimation);
        this.isPlay = false;
        this.pausePlayingTime = this.playingTime;
    };

    fn.stop = function () {
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

    fn.drawCanvas = function (index) {
        if (this.playIndex != null && this.oldPlayIndex == index) return;
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        if (this.imageList[index >= 0 ? index : this.playIndex] && this.imageList[index >= 0 ? index : this.playIndex].complete) {
            this.context.drawImage(this.imageList[index >= 0 ? index : this.playIndex], 0, 0, this.opts.width, this.opts.height);
        }
        this.oldPlayIndex = this.playIndex;

        if (index) {
            this.playIndex = index;
        }
    };

    fn.activeSequence = function (type) {
        var self = this,
            playInterval = this.opts.endNum / this.opts.playTime,
            startTime = null,
            progress;

        this.activeCallback();
        this.isPlay = true;

        var _setIndex = function (timestemp) {
            if (timestemp && startTime == null) {
                startTime = Math.ceil(timestemp);
            }

            if (self.playIndex == null && type !== 'reverse') {
                self.playIndex = self.opts.startNum;
            } else if (self.playIndex == null && type == 'reverse') {
                self.playIndex = self.opts.endNum;
            }
        };

        var _resetStatus = function () {
            self.playingTime = 0;
            self.pausePlayingTime = 0;
            self.playIndex = null;
            self.pause();
            self.isPlay = false;
            self.usePlay = false;
            self.usePlayIng = false;
            self.useReverse = false;
            self.useReverseIng = false;
            if (self.opts.loop) {
                self.play();
            }
        };

        var _animation = {
            default: function () {
                _setIndex();

                if (type == 'reverse' && self.playIndex >= self.opts.startNum || !!!type && self.playIndex <= self.opts.endNum) {
                    self.drawCanvas();

                    if (!!!type) {
                        self.playIndex++;
                    } else {
                        self.playIndex--;
                    }

                    self.playAnimation = window.requestAnimationFrame(_animation.default);
                } else {
                    self.playIndex = null;
                    self.isPlay = false;
                    self.pause();
                }
            },
            timeControll: function (timestemp) {
                _setIndex(timestemp);

                progress = Math.ceil(timestemp) - startTime;

                if (!!!type && self.playIndex <= self.opts.endNum || type == 'reverse' && self.playIndex >= self.opts.startNum) {
                    self.drawCanvas();
                }

                switch (type) {
                    case undefined:
                        if (self.useReverse && !self.useReverseIng) {
                            self.usePlayIng = true;
                            var corrTime = self.opts.playTime - self.pausePlayingTime;
                            self.playIndex = Math.ceil((progress + corrTime) * playInterval);
                            self.playingTime = progress + corrTime;

                            if (self.playingTime > self.opts.playTime - self.beforeTime) self.endCallback();
                            if (self.playingTime > self.opts.playTime) {
                                _resetStatus();
                                return;
                            }
                        } else {
                            self.usePlay = true;
                            self.playIndex = Math.ceil((progress + self.pausePlayingTime) * playInterval);
                            self.playingTime = progress + self.pausePlayingTime;

                            if (self.playingTime > self.opts.playTime - self.beforeTime) self.endCallback();
                            if (self.playingTime > self.opts.playTime) {
                                _resetStatus();
                                return;
                            }
                        }

                        break;

                    case 'reverse':
                        if (self.usePlay || self.usePlayIng && self.useReverse) {
                            self.useReverseIng = true;
                            var corrTime = self.pausePlayingTime - self.opts.playTime;
                            self.playIndex = Math.floor((self.opts.playTime + corrTime - progress) * playInterval);
                            self.playingTime = self.opts.playTime + corrTime - progress;

                            if (self.playingTime < self.beforeTime) self.endCallback();
                            if (self.playingTime > self.opts.playTime || self.playIndex <= 0) {
                                _resetStatus();
                                return;
                            }
                        } else {
                            self.useReverse = true;
                            self.playIndex = Math.floor((self.opts.playTime - (progress + self.pausePlayingTime)) * playInterval);
                            self.playingTime = progress + self.pausePlayingTime;

                            if (self.playingTime > self.opts.playTime - self.beforeTime) self.endCallback();
                            if (self.playingTime > self.opts.playTime) {
                                _resetStatus();
                                return;
                            }
                        }

                        break;
                }
                self.playAnimation = window.requestAnimationFrame(_animation.timeControll);
            }
        };
        this.playAnimation = window.requestAnimationFrame(this.opts.playTime ? _animation.timeControll : _animation.default);
    };

    return function (opts) {
        return new init(opts);
    };
})();