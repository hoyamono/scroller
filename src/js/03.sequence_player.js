var SEQUENCEPLAYER = (function(opts){
    var init = function(opts){
        this.opts = opts;
        this.targetElement = opts.targetElement;
        this.imageList = [];
        this.loadCount = 0;
        this.playIndex = null;
        this.setCanvas();
        this.loadImages();

        return this;
    };

    var fn = init.prototype;

    fn.setCanvas = function(){
        this.canvas = document.createElement('CANVAS');
        this.context = this.canvas.getContext('2d');
        this.targetElement.append(this.canvas);
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

    fn.play = function(index){
        var self = this,
            intervalTimer = null,
            idx = index > this.opts.endNum ? this.opts.endNum : index;

        this.pause();

        if (index == undefined) {
            if (this.loadCount !== this.opts.endNum) {
                intervalTimer = setInterval(function(){
                    if (self.loadCount == self.opts.endNum) {
                        self.activeSequence();
                        clearInterval(intervalTimer)
                        intervalTimer = null;
                    }

                },100)
            } else {
                this.activeSequence();
            }
        } else {
            if (this.loadCount == this.opts.endNum) {
                this.drawCanvas(idx);
            }
        }
    };

    fn.reverse = function(){
       var self = this,
            intervalTimer = null;
        
        this.pause();

        if (this.loadCount !== this.opts.endNum) {
            intervalTimer = setInterval(function(){
                if (self.loadCount == self.opts.endNum) {
                    self.activeSequence('reverse');
                    clearInterval(intervalTimer)
                    intervalTimer = null;
                }

            },100)
        } else {
            this.activeSequence('reverse');
        }
    }

    fn.pause = function(){
        window.cancelAnimationFrame(this.playAnimation);
        this.playIndex = null;
    }

    fn.drawCanvas = function(index){
        this.context.clearRect(0, 0, this.opts.width, this.opts.height);
        this.context.drawImage(this.imageList[index], 0, 0, this.opts.width, this.opts.height);
    };

    fn.activeSequence = function(type){
        var self = this,
            playInterval = this.opts.endNum / this.opts.playTime,
            startTime, progress;

        var animation = {
            default: function(){
                if (self.playIndex == null && type == 'reverse') {
                    self.playIndex = self.opts.endNum;
                } else if (self.playIndex == null) {
                    self.playIndex = 0;
                }
    
         
                if (type == 'reverse' && self.playIndex >= self.opts.startNum || !!!type && self.playIndex <= self.opts.endNum) {
                    self.drawCanvas(self.playIndex);

                    if (!!!type) {
                        self.playIndex++;
                    } else {
                        self.playIndex--;
                    }
    
                    self.playAnimation = window.requestAnimationFrame(animation.default);		
                } else {
                    self.pause();
                }
            },
            timeControll: function(timestemp){
                if (!!!startTime) {
                    startTime = parseInt(timestemp);
                }
    
                progress = parseInt(timestemp) - startTime;
    
                if (progress <= self.opts.playTime) {
                    if (!!!type) {
                        self.drawCanvas(parseInt(progress*playInterval));
                    } else {
                        self.drawCanvas(parseInt((self.opts.playTime - progress) * playInterval));                        
                    }
                    
                    self.playAnimation = window.requestAnimationFrame(animation.timeControll);
                } else {
                    self.pause();
                };
            }
        };
      
        this.playAnimation = window.requestAnimationFrame(this.opts.playTime ? animation.timeControll : animation.default);
    };

    return function(opts){
        return new init(opts);
    }
})();
