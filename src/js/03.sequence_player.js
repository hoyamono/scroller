var SEQUENCEPLAYER = (function(){
    var init = function(opts){
        this.opts = opts;
        this.targetElement = opts.targetElement;
        this.imageList = [];
        this.loadCount = 0;
        this.playIndex = null;
        this.playingTime = 0;
        this.pausePlayingTime = 0;
        this.setCanvas();
        this.loadImages();

        return this;
    };

    var fn = init.prototype;

    fn.setCanvas = function(){

        var _checkElement = function(element){
            if (element.tagName == 'CANVAS') {
                this.canvas = element;
            } else {
                this.canvas = document.createElement('CANVAS');
                this.targetElement.append(this.canvas);
            }
        };

        if (this.targetElement.jquery) {
            _checkElement.call(this, this.targetElement[0]);
        } else {
            _checkElement.call(this, this.targetElement);
        }

        this.context = this.canvas.getContext('2d');
        this.canvas.width = this.opts.width;
        this.canvas.height = this.opts.height;
    };

    fn.loadImages = function(){
        var self = this;

        for(var i = this.opts.startNum; i <= this.opts.endNum; i++) {
            var isImage = new Image();

            isImage.src = this.opts.path + this.opts.name + i + '.' + this.opts.extension;

            (function(idx){
                isImage.addEventListener('load', function(){
                    self.imageList[idx] = this;

                    if (self.loadCount < self.opts.endNum) {
                        self.loadCount++;
                    } else if (self.opts.autoPlay && self.loadCount == self.opts.endNum) {
                        self.play();
                        return;
                    }
                });
            })(i);
        }
    };

    fn.sequenceLoadCheck = function(type){
        var self = this,
            intervalTimer = null

        intervalTimer = setInterval(function(){
            if (self.loadCount == self.opts.endNum) {
                self.activeSequence(type);
                clearInterval(intervalTimer)
                intervalTimer = null;
            }
        },100);
    };

    fn.play = function(index){
        if (this.isPlay) return;
        console.log('play')
        var idx = index > this.opts.endNum ? this.opts.endNum : index;

        if (index == undefined) {
            if (this.loadCount !== this.opts.endNum) {
                this.sequenceLoadCheck();
            } else {
                this.activeSequence();
            }
        } else {
            if (this.loadCount == this.opts.endNum) {
                this.drawCanvas(idx);
            }
        }

        this.usePlay = true;
    };

    fn.reverse = function(){
        if (this.isPlay) return
        console.log('reverse')

        if (this.loadCount !== this.opts.endNum) {
            this.sequenceLoadCheck('reverse');
        } else {
            this.activeSequence('reverse');
        }

        this.useReverse = true;
    }

    fn.pause = function(){
        if (!this.isPlay) return;

        console.log('pause')
        window.cancelAnimationFrame(this.playAnimation);
        this.isPlay = false;
        this.pausePlayingTime = this.playingTime;
        console.log('pause : ', this.playIndex)
    }

    fn.drawCanvas = function(index){
        if (this.oldPlayIndex == this.playIndex) return;
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        this.context.drawImage(this.imageList[index >= 0 ? index : this.playIndex], 0, 0, this.opts.width, this.opts.height);
        this.oldPlayIndex = this.playIndex;
        if (index) {
            this.playIndex = index;
        }
    };

    fn.activeSequence = function(type){
        var self = this,
            playInterval = this.opts.endNum / this.opts.playTime,
            startTime = null,
            progress;

        this.isPlay = true;

        var _setIndex = function(timestemp){
            if (timestemp && startTime == null) {
                startTime = Math.ceil(timestemp);
            }

            if (self.playIndex == null && type !== 'reverse') {
                self.playIndex = self.opts.startNum;
            } else if (self.playIndex == null && type == 'reverse') {
                self.playIndex = self.opts.endNum;
            }
        };

        var _resetStatus = function(){
            self.playingTime = 0;
            self.pausePlayingTime = 0;
            self.playIndex = null;

            self.pause();

            self.isPlay = false;
            if (self.usePlay) {
                self.usePlay = false;
            } else if (self.useReverse) {
                self.useReverse = false;
            }
        };

        var _animation = {
            default: function(){
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
            timeControll: function(timestemp){
                _setIndex(timestemp);

                progress = Math.ceil(timestemp) - startTime;

                if (self.playIndex <= self.opts.endNum || type == 'reverse' && self.playIndex >= self.opts.startNum) {
                    self.drawCanvas();
                }

                switch(type) {
                    case undefined:
                        if (self.usePlay && self.useReverse) {
                            var corrTime = self.opts.playTime - self.pausePlayingTime;

                            self.playIndex = Math.ceil((progress + corrTime) * playInterval);
                            console.log('timeControll_2 : ', self.playIndex, progress, self.pausePlayingTime, playInterval, startTime,)
                            self.playingTime = progress + corrTime;

                            if (self.playingTime > self.opts.playTime) {
                                _resetStatus();

                                return;
                            };
                        } else {
                            self.playIndex = Math.ceil((progress + self.pausePlayingTime) * playInterval);
                            self.playingTime = progress + self.pausePlayingTime;

                            if (self.playingTime > self.opts.playTime) {
                                _resetStatus();

                                return;
                            };
                        }
                    break;

                    case 'reverse':
                        if (self.usePlay) {
                            console.log(1)
                            var corrTime = self.pausePlayingTime - self.opts.playTime;

                            self.playIndex = Math.floor(((self.opts.playTime + corrTime) - progress) * playInterval);
                            self.playingTime = (self.opts.playTime + corrTime) - progress;

                            if (self.playingTime < 0) {
                                _resetStatus();

                                return;
                            };
                        } else {
                            console.log(2)
                            self.playIndex = Math.floor((self.opts.playTime - (progress + self.pausePlayingTime)) * playInterval);
                            self.playingTime = progress + self.pausePlayingTime;


                            if (self.playingTime > self.opts.playTime) {
                                _resetStatus();
                    
                                return;
                            };
                        }
                    break;
                }

                self.playAnimation = window.requestAnimationFrame(_animation.timeControll);
            }
        };
      
        this.playAnimation = window.requestAnimationFrame(this.opts.playTime ? _animation.timeControll : _animation.default);
    };

    return function(opts){
        return new init(opts);
    }
})();