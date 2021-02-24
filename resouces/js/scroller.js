/*!
 * Scrolle JavaScript Library v1.0.2
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-09
 */
'use strict';

var SCROLLER = function () {
  var init = function (opts) {
    this.initialize = true;
    this.opts = opts;
    this.correction = !!!opts.correction ? 0 : opts.correction;
    this.trackHeight = !!!opts.trackHeight ? 0 : opts.trackHeight;
    this.activeClass = opts.activeClass;
    this.activeCallbackClass = !!!opts.activeCallbackClass ? 'callback-active' : opts.activeCallbackClass;
    this.useFixed = !!!opts.useFixed ? false : opts.useFixed;
    this.activeVisibility = !!!opts.activeVisibility ? 'before' : opts.activeVisibility;
    this.activePlay = !!!opts.activePlay ? 'reverse' : this.opts.activePlay;
    this.offsetY = !!!opts.offsetY ? 0 : opts.offsetY;
    this.resize = !!!opts.resize ? false : opts.resize;
    this.resizeTiming = !!!opts.resizeTiming ? false : opts.resizeTiming;
    this.windowHeight = window.innerHeight;
    this.elementEventList.setElement.call(this);
    this.bindEvent();
  };

  var fn = init.prototype;

  fn.bindEvent = function () {
    var self = this,
        setTimeing = null;
    this.elementHandler();

    if (this.resize) {
      this.addEventList = function () {
        if (!self.resizeTiming) {
          self.windowHeight = window.innerHeight;
          self.elementHandler();
        } else {
          clearTimeout(setTimeing);
          setTimeing = setTimeout(function () {
            self.windowHeight = window.innerHeight;
            self.elementHandler();
          }, self.resizeTiming);
        }
      };

      window.addEventListener('load', this.addEventList);
      window.addEventListener('resize', this.addEventList);
    }

    if (this.opts.IEScroll) {
      this.utilList.IEScrollHandler();
    }
  };

  fn.elementHandler = function () {
    this.elementEventList.setTrackStyle.call(this);

    if (this.trackHeight > 1) {
      this.elementEventList.setTrackHeigh.call(this);
    }

    if (this.useFixed) {
      this.elementEventList.setFixedStyle.call(this);
    }

    return this;
  };

  fn.utilList = {
    IEScrollHandler: function () {
      if (navigator.userAgent.match(/Trident\/7\./)) {
        this.body.addEventListener('mousewheel', function (e) {
          e.preventDefault();
          var wheelDelta = e.wheelDelta;
          var currentScrollPosition = window.pageYOffset;
          window.scrollTo(0, currentScrollPosition - wheelDelta);
        });
        this.body.addEventListener('keydown', function (e) {
          var currentScrollPosition = window.pageYOffset;

          switch (e.which) {
            case 38:
              e.preventDefault();
              window.scrollTo(0, currentScrollPosition - 40);
              break;

            case 40:
              e.preventDefault();
              window.scrollTo(0, currentScrollPosition + 40);
              break;

            default:
              return;
          }
        });
      }
    },
    getScroll: function () {
      var top = window.pageYOffset,
          bottom = top + this.windowHeight;
      return {
        top: top,
        bottom: bottom
      };
    },
    getOffset: function (element) {
      var top = element.getBoundingClientRect().top + window.pageYOffset,
          bottom = element.getBoundingClientRect().bottom + window.pageYOffset;
      return {
        top: top,
        bottom: bottom
      };
    }
  };
  fn.elementEventList = {
    setElement: function () {
      this.body = document.querySelector('body');

      if (this.opts.trackElement !== undefined) {
        this.trackElement = this.opts.trackElement.jquery ? this.opts.trackElement[0] : this.opts.trackElement;
      }

      if (this.opts.fixedElement !== undefined) {
        this.fixedElement = this.opts.fixedElement.jquery ? this.opts.fixedElement[0] : this.opts.fixedElement;
      }

      if (this.opts.activeElement !== undefined) {
        this.activeElement = this.opts.activeElement.jquery ? this.opts.activeElement[0] : this.opts.activeElement;
      }
    },
    setTrackHeigh: function () {
      this.trackElement.style.height = '';
      this.trackElement.style.paddingTop = '', this.trackElement.style.paddingBottom = '';
      var checkTrackHeight = this.trackElement.clientHeight == 0,
          isTrackHeight = checkTrackHeight ? this.windowHeight : this.trackElement.clientHeight,
          calTrackHeight = isTrackHeight * this.trackHeight - isTrackHeight;

      if (checkTrackHeight) {
        this.trackElement.style.height = this.windowHeight + 'px';
      }

      this.trackElement.style.boxSizing = 'content-box';
      this.trackElement.style.paddingTop = calTrackHeight / 2 + 'px';
      this.trackElement.style.paddingBottom = calTrackHeight / 2 + 'px';
    },
    setTrackStyle: function () {
      if (!!!this.trackElement) return;

      if (window.getComputedStyle(this.trackElement).position == 'static') {
        this.trackElement.style.position = 'relative';
      }
    },
    setFixedStyle: function () {
      this.fixedElement.style.height = '';
      this.fixedElement.style.top = '';
      this.fixedElement.style.position = 'absolute';

      if (this.fixedElement.clientWidth == 0) {
        this.fixedElement.style.width = '100%';
      }

      if (typeof this.offsetY == 'string') {
        this.fixedElement.style.height = 'calc(' + this.windowHeight + 'px - ' + this.offsetY + ')';
        this.fixedElement.style.top = this.offsetY;
      } else {
        this.fixedElement.style.height = this.windowHeight - this.offsetY + 'px';
        this.fixedElement.style.top = this.offsetY + 'px';
      }
    },
    setFixedElement: function () {
      this.diffHeight = this.windowHeight - this.fixedElement.clientHeight;
      this.trackTopOffset = this.utilList.getOffset.call(this, this.trackElement).top;
      this.trackBottomOffset = this.utilList.getOffset.call(this, this.trackElement).bottom;

      if (this.winScrollTop <= this.trackTopOffset) {
        this.fixedElement.style.position = 'absolute';

        if (typeof this.offsetY == 'string') {
          this.fixedElement.style.top = this.offsetY;
        } else {
          this.fixedElement.style.top = this.offsetY + 'px';
        }

        this.fixedElement.style.bottom = '';
      } else if (this.winScrollTop >= this.trackTopOffset && this.winScrollbottom <= this.trackBottomOffset) {
        this.fixedElement.style.position = 'fixed';
      } else if (this.winScrollbottom >= this.trackBottomOffset) {
        this.fixedElement.style.position = 'absolute';
        this.fixedElement.style.top = 'auto';
        this.fixedElement.style.bottom = '0px';
      }
    }
  };

  fn.getProgress = function () {
    var trackTopOffset = this.utilList.getOffset.call(this, this.trackElement).top - this.windowHeight * this.correction,
        trackHeight = this.trackElement.clientHeight - this.windowHeight,
        scrollTop = this.winScrollTop - trackTopOffset;
    this.progress = scrollTop / trackHeight * 100;

    var getWheelDirection = function () {
      if (this.progress > this.oldProgress) {
        this.wheelDirection = 'down';
      } else {
        this.wheelDirection = 'up';
      }
    };

    if (this.progress < 0) {
      getWheelDirection.call(this);
      this.progress = 0;
      this.oldProgress = 0;
    } else if (this.progress > 100) {
      getWheelDirection.call(this);
      this.progress = 100;
      this.oldProgress = 100;
    } else {
      getWheelDirection.call(this);
      this.progress = this.progress;
      this.oldProgress = this.progress;
    }

    return this.progress;
  };

  fn.trackAnimation = function (callback) {
    if (!this.initialize) return;
    this.winScrollTop = this.utilList.getScroll.call(this).top;
    this.winScrollbottom = this.utilList.getScroll.call(this).bottom;

    if (this.useFixed) {
      this.elementEventList.setFixedElement.call(this);
    }

    this.getProgress();

    if (callback) {
      callback.call(this);
    }
  };

  fn.activeAnimation = function () {
    if (!this.initialize) return;
    this.winScrollTop = this.utilList.getScroll.call(this).top;
    this.winScrollBottom = this.utilList.getScroll.call(this).bottom;
    this.activeElementHeight = this.activeElement.clientHeight;
    this.correctionValue = this.activeElementHeight * this.correction;
    this.activeScrollTop = this.winScrollTop + this.correctionValue;
    this.activeScrollBottom = this.winScrollBottom - this.correctionValue;
    this.removeScrollTop = this.winScrollTop - this.correctionValue;
    this.removeScrollBottom = this.winScrollBottom + this.correctionValue;
    this.elementOffsetTop = this.utilList.getOffset.call(this, this.activeElement).top;
    this.elementOffsetBottom = this.utilList.getOffset.call(this, this.activeElement).bottom;
    var self = this,
        visibleTyle = this.activeVisibility,
        removeType = this.activePlay,
        corrHeight = this.windowHeight / 2;

    var addActiveClass = function () {
      if (typeof self.activeClass == 'object') {
        var classLength = self.activeClass.length;

        for (var i = 0; i < classLength; i++) {
          if (!self.activeElement.classList.contains(self.activeClass[i])) {
            self.activeElement.classList.add(self.activeClass[i]);
          }
        }

        ;
      } else {
        if (!self.activeElement.classList.contains(self.activeClass)) {
          self.activeElement.classList.add(self.activeClass);
        }
      }
    };

    var removeActiveClass = function () {
      if (typeof self.activeClass == 'object') {
        var classLength = self.activeClass.length;

        for (var i = 0; i < classLength; i++) {
          if (self.activeElement.classList.contains(self.activeClass[i])) {
            self.activeElement.classList.remove(self.activeClass[i]);
          }
        }

        ;
      } else {
        if (self.activeElement.classList.contains(self.activeClass)) {
          self.activeElement.classList.remove(self.activeClass);
        }
      }

      if (self.activeElement.classList.contains(self.activeCallbackClass)) {
        self.activeElement.classList.remove(self.activeCallbackClass);
      }
    };

    var activeCallback = function () {
      if (!self.activeElement.classList.contains(self.activeCallbackClass)) {
        if (!!!self.opts.activeCallback) return;
        self.opts.activeCallback.call(self);
        self.activeElement.classList.add(self.activeCallbackClass);
      }
    };

    var endCallback = function () {
      if (self.activeElement.classList.contains(self.activeCallbackClass)) {
        if (!!!self.opts.endCallback) return;
        self.opts.endCallback.call(self);
      }
    };

    var activeHandler = function () {
      activeCallback();
      addActiveClass();
    };

    var removeHandler = function () {
      endCallback();
      removeActiveClass();
    };

    switch (visibleTyle) {
      case 'before':
        if (self.activeScrollBottom < self.elementOffsetBottom && self.activeScrollBottom >= self.elementOffsetTop || self.activeScrollBottom < self.elementOffsetBottom && self.activeScrollBottom >= self.elementOffsetBottom || this.activePlay == 'oneWay' && self.activeScrollBottom >= self.elementOffsetTop) {
          activeHandler();
        }

        break;

      case 'visible':
        if (self.activeScrollBottom >= self.elementOffsetTop + corrHeight && self.activeScrollTop < self.elementOffsetTop || this.activePlay == 'oneWay' && self.activeScrollBottom >= self.elementOffsetTop + corrHeight) {
          activeHandler();
        }

        break;
    }

    switch (removeType) {
      case 'reverse':
        if (self.removeScrollTop > self.elementOffsetBottom || self.removeScrollBottom < self.elementOffsetTop) {
          removeHandler();
        }

        break;

      case 'oneWay':
        if (self.removeScrollBottom < self.elementOffsetTop) {
          removeHandler();
        }

        break;
    }
  };

  fn.destroy = function (e) {
    this.trackElement.style.position = '';
    this.trackElement.style.height = '', this.trackElement.style.paddingTop = '', this.trackElement.style.paddingBottom = '';
    this.fixedElement.style.position = '';
    this.fixedElement.style.top = '';
    this.fixedElement.style.height = '';
    this.trackElement = '';
    this.fixedElement = '';
    this.activeElement = '';
    this.correction = '';
    this.trackHeight = '';
    this.activeCallbackClass = '';
    this.useFixed = '';
    this.activeVisibility = '';
    this.activePlay = '';
    this.offsetY = '';
    this.resize = '';
    this.windowHeight = '';
    window.removeEventListener('load', this.addEventList);
    window.removeEventListener('resize', this.addEventList);
    this.initialize = false;
  };

  return function (opts) {
    return new init(opts);
  };
}();
/*!
 * Range-Handler JavaScript Library v1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-10
 */
var RANGEHANDLER = function () {
  var init = function (opts) {
    this.opts = opts;
    this.targetValue = opts.targetValue;
    this.startPoint = !!!opts.startPoint ? 0 : opts.startPoint;
    this.endPoint = !!!opts.endPoint ? 100 : opts.endPoint;
    this.activeStartPoint = this.startPoint + 1;
    this.activeEndPoint = this.endPoint - 1;
    this.onStart = opts.onStart;
    this.onUpdate = opts.onUpdate;
    this.onComplate = opts.onComplate;
    this.reverseStart = opts.reverseStart;
    this.reverseComplate = opts.reverseComplate;
    this.oldScroll = 0;
    this.activeOnStart = false;
    this.activeOnComplate = false;
    this.complateOnCallback = false;
    this.activeReverseStart = false;
    this.activeReverseComplate = false;
    this.complateReverseCallback = false;
    return this;
  };

  var fn = init.prototype;

  fn.calValue = function (progress) {
    if (this.startPoint > 0) {
      this.endPoint = this.endPoint - this.startPoint > 0 ? this.endPoint - this.startPoint : this.endPoint;
    }

    var returnValue = this.targetValue * (progress - this.startPoint) / this.endPoint;

    if (returnValue > this.targetValue) {
      returnValue = this.targetValue;
    }

    if (returnValue < 0) {
      returnValue = 0;
    }

    return returnValue;
  };

  fn.checkWheelDirection = function () {
    this.windowScroll = window.pageYOffset;

    if (this.oldScroll < this.windowScroll) {
      this.oldScroll = this.windowScroll;
      return 'down';
    } else {
      this.oldScroll = this.windowScroll;
      return 'up';
    }
  };

  fn.callBackList = {
    onStart: function () {
      if (this.onStart) {
        this.onStart();
      }

      this.activeOnStart = true;
    },
    onComplate: function () {
      if (this.onComplate) {
        this.onComplate();
      }

      this.activeOnComplate = true;
      this.complateOnCallback = true;
      this.activeReverseStart = false;
      this.activeReverseComplate = false;
      this.complateReverseCallback = false;
    },
    reverseStart: function () {
      if (this.reverseStart) {
        this.reverseStart();
      }

      this.activeReverseStart = true;
    },
    reverseComplate: function () {
      if (this.reverseComplate) {
        this.reverseComplate();
      }

      this.activeReverseComplate = true;
      this.complateReverseCallback = true;
      this.activeOnStart = false;
      this.activeOnComplate = false;
      this.complateOnCallback = false;
    },
    onUpdate: function () {
      if (this.onUpdate) {
        this.onUpdate();
      }
    }
  };

  fn.checkScrollType = function (progress) {
    if (progress > this.activeStartPoint && progress < this.activeEndPoint && !this.complateOnCallback && !this.activeOnStart && this.isDirection == 'down') {
      return 'onStart';
    } else if (progress > this.activeEndPoint && !this.complateOnCallback && !this.activeOnComplate && this.isDirection == 'down') {
      return 'onComplate';
    } else if (progress < this.activeEndPoint && this.complateOnCallback && !this.activeReverseStart && this.isDirection == 'up') {
      return 'reverseStart';
    } else if (progress < this.activeStartPoint && this.complateOnCallback && !this.activeReverseComplate && this.isDirection == 'up') {
      return 'reverseComplate';
    } else if (this.activeOnStart && !this.activeOnComplate && this.isDirection == 'down' || this.activeOnStart && !this.activeOnComplate && this.isDirection == 'up' || this.activeReverseStart && !this.activeReverseComplate && this.isDirection == 'down' || this.activeReverseStart && !this.activeReverseComplate && this.isDirection == 'up') {
      return 'onUpdate';
    }
  };

  fn.activeAnimation = function (progress) {
    this.isValue = this.calValue(progress);
    this.isDirection = this.checkWheelDirection();

    switch (this.checkScrollType(progress)) {
      case 'onUpdate':
        if (this.activeReverseStart && progress > this.activeEndPoint && this.isDirection == 'down') {
          this.callBackList.onComplate.call(this);
        } else if (this.activeOnStart && progress < this.activeStartPoint && this.isDirection == 'up') {
          this.callBackList.reverseComplate.call(this);
        } else {
          this.callBackList.onUpdate.call(this);
        }

        break;

      case 'onStart':
        this.callBackList.onStart.call(this);
        break;

      case 'onComplate':
        if (progress > this.activeStartPoint && !this.activeReverseStart && !this.activeReverseComplate && !this.complateReverseCallback && !this.activeOnStart && !this.activeOnComplate && !this.complateOnCallback) {
          this.callBackList.onStart.call(this);
          this.callBackList.onUpdate.call(this);
        }

        this.callBackList.onComplate.call(this);
        break;

      case 'reverseStart':
        this.callBackList.reverseStart.call(this);
        break;

      case 'reverseComplate':
        this.callBackList.reverseComplate.call(this);
        break;
    }
  };

  return function (opts) {
    return new init(opts);
  };
}();
var SEQUENCEPLAYER = function () {
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
    this.setCanvas();
    this.loadImages();
    return this;
  };

  var fn = init.prototype;

  fn.setCanvas = function () {
    var _checkElement = function (element) {
      if (element.tagName == 'CANVAS') {
        this.canvas = element;
      } else {
        this.canvas = document.createElement('CANVAS');

        if (this.opts.addType == 'append') {
          this.targetElement.append(this.canvas);
        } else {
          this.targetElement.prepend(this.canvas);
        }
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

  fn.loadImages = function () {
    var self = this;

    for (var i = this.opts.startNum; i <= this.opts.endNum; i++) {
      var isImage = new Image();
      isImage.src = this.opts.path + this.opts.name + i + '.' + this.opts.extension;

      (function (idx) {
        isImage.addEventListener('load', function () {
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

  fn.play = function (index) {
    if (this.isPlay) return;
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
    if (!!!index && this.oldPlayIndex == this.playIndex) return;
    this.context.clearRect(0, 0, this.opts.width, this.opts.height);
    this.context.drawImage(this.imageList[index >= 0 ? index : this.playIndex], 0, 0, this.opts.width, this.opts.height);
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

        if (self.playIndex <= self.opts.endNum || type == 'reverse' && self.playIndex >= self.opts.startNum) {
          self.drawCanvas();
        }

        switch (type) {
          case undefined:
            if (self.useReverse && !self.useReverseIng) {
              self.usePlayIng = true;
              var corrTime = self.opts.playTime - self.pausePlayingTime;
              self.playIndex = Math.ceil((progress + corrTime) * playInterval);
              self.playingTime = progress + corrTime;

              if (self.playingTime > self.opts.playTime) {
                _resetStatus();

                return;
              }

              ;
            } else {
              self.usePlay = true;
              self.playIndex = Math.ceil((progress + self.pausePlayingTime) * playInterval);
              self.playingTime = progress + self.pausePlayingTime;

              if (self.playingTime > self.opts.playTime) {
                _resetStatus();

                return;
              }

              ;
            }

            break;

          case 'reverse':
            if (self.usePlay || self.usePlayIng && self.useReverse) {
              self.useReverseIng = true;
              var corrTime = self.pausePlayingTime - self.opts.playTime;
              self.playIndex = Math.floor((self.opts.playTime + corrTime - progress) * playInterval);
              self.playingTime = self.opts.playTime + corrTime - progress;

              if (self.playingTime < 0) {
                _resetStatus();

                return;
              }

              ;
            } else {
              self.useReverse = true;
              self.playIndex = Math.floor((self.opts.playTime - (progress + self.pausePlayingTime)) * playInterval);
              self.playingTime = progress + self.pausePlayingTime;

              if (self.playingTime > self.opts.playTime) {
                _resetStatus();

                return;
              }

              ;
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
}();
/*!
 * ANI-Util JavaScript Library v1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-09
 */
var ANIUTIL = function () {
  var calRange = function (values) {
    var values = {
      targetValue: values.targetValue,
      progress: values.progress,
      startPoint: !!!values.startPoint ? 0 : values.startPoint,
      endPoint: !!!values.endPoint ? 100 : values.endPoint
    };

    if (values.startPoint > 0) {
      values.endPoint = values.endPoint - values.startPoint > 0 ? values.endPoint - values.startPoint : values.endPoint;
    }

    var returnValue = values.targetValue * (values.progress - values.startPoint) / values.endPoint;

    if (returnValue > values.targetValue) {
      returnValue = values.targetValue;
    }

    if (returnValue < 0) {
      returnValue = 0;
    }

    return returnValue;
  };

  var videoObjectFit = function (opts) {
    var init = function (opts) {
      this.opts = opts;
      this.setElement();
      this.setVideoStyle();
      this.bindEvent();
    };

    var fn = init.prototype;

    fn.setElement = function () {
      if (this.opts.wrapElement !== undefined) {
        this.wrapElement = this.opts.wrapElement.jquery ? this.opts.wrapElement[0] : this.opts.wrapElement;
      }

      if (this.opts.targetVideo !== undefined) {
        this.targetVideo = this.opts.targetVideo.jquery ? this.opts.targetVideo[0] : this.opts.targetVideo;
      }
    };

    fn.setVideoStyle = function () {
      this.wrapElement.style.overflow = 'hidden';
      this.targetVideo.style.position = 'absolute';
      this.targetVideo.style.top = '50%';
      this.targetVideo.style.left = '50%';
      this.targetVideo.style.transform = 'translate(-50%, -50%)';
    };

    fn.bindEvent = function () {
      var self = this;
      window.addEventListener('load', function () {
        self.setVideoSize();
      });
      window.addEventListener('resize', function () {
        self.setVideoSize();
      });
    };

    fn.getVideoInfo = function () {
      this.wrapWidth = this.wrapElement.clientWidth;
      this.wrapHeight = this.wrapElement.clientHeight;
      this.videoWidth = this.targetVideo.clientWidth;
      this.videoHeight = this.targetVideo.clientHeight;
      this.wrapRatio = this.wrapHeight / this.wrapWidth;
      this.videoRatio = this.videoHeight / this.videoWidth;
    };

    fn.setVideoSize = function () {
      var self = this,
          timer = null;
      clearTimeout(timer);
      timer = setTimeout(function () {
        self.getVideoInfo();

        if (self.wrapRatio < self.videoRatio) {
          self.targetVideo.style.width = '100%';
          self.targetVideo.style.height = 'auto';
        } else {
          self.targetVideo.style.width = 'auto';
          self.targetVideo.style.height = '100%';
        }
      }, 100);
    };

    return new init(opts);
  };

  var imageLoader = function (opts) {
    var init = function () {
      this.opts = opts;
      this.lazyComplateClass = 'load-complete';
      this.lazyClass = opts.lazyClass;
      this.responsiveClass = opts.responsiveClass;
      this.loadOption = opts.loadOption;
      this.targetAttr = opts.loadOption[0].attribute;
      this.visiblePoint = !!!opts.visiblePoint ? 0 : opts.visiblePoint;
      this.useDefaultImg = opts.useDefaultImg;
      this.getLazyImage();
      this.getResponsiveImage();
      this.bindEvent();
    };

    var fn = init.prototype;

    fn.bindEvent = function () {
      var self = this,
          resizeTiming = null,
          responsiveCheck = this.loadOption;

      this.lazyEvent = function () {
        self.setLazyImage();

        if (self.lazyCompleteLength == self.lazyLength) {
          window.removeEventListener('scroll', self.lazyEvent);
        }
      };

      window.addEventListener('DOMContentLoaded', function () {
        if (self.useDefaultImg) {
          self.setDefaultImage();
        }

        if (responsiveCheck) {
          self.responsiveHandler();
        }

        self.setLazyImage();
      });
      window.addEventListener('scroll', this.lazyEvent);

      if (responsiveCheck) {
        window.addEventListener('resize', function () {
          clearTimeout(resizeTiming);
          resizeTiming = setTimeout(function () {
            self.responsiveHandler();
          }, 80);
        });
      }
    };

    fn.utilList = {
      getOffset: function (element) {
        var top = element.getBoundingClientRect().top + window.pageYOffset,
            bottom = element.getBoundingClientRect().bottom + window.pageYOffset;
        return {
          top: top,
          bottom: bottom
        };
      },
      getScroll: function () {
        var top = window.pageYOffset,
            bottom = top + this.windowHeight;
        return {
          top: top,
          bottom: bottom
        };
      }
    };

    fn.getLazyImage = function () {
      var lazyImageList = document.querySelectorAll(this.lazyClass),
          lazyCompleteList = document.querySelectorAll('.' + this.lazyComplateClass);
      this.lazyImages = lazyImageList;
      this.lazyLength = lazyImageList.length, this.lazyCompleteLength = lazyCompleteList.length;
    };

    fn.getResponsiveImage = function () {
      var responsiveImageList = document.querySelectorAll(this.responsiveClass);
      this.responsiveImages = responsiveImageList;
      this.responsiveLength = responsiveImageList.length;
    };

    fn.setDefaultImage = function () {
      for (var i = 0; i < this.lazyLength; i++) {
        this.lazyImages[i].setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAh+QQFAAAAACwAAAAAAQABAAACAkQBADs=');
      }

      ;
    };

    fn.responsiveHandler = function () {
      this.windowWidth = window.innerWidth;
      var resolutionLength = this.loadOption.length;

      for (var i = 0; i < resolutionLength; i++) {
        var nextIndex = i + 1,
            nextPoint = nextIndex == resolutionLength ? 0 : this.loadOption[nextIndex].resolution,
            checkPoint = false;

        if (i == 0) {
          checkPoint = this.windowWidth > nextPoint;
        } else {
          checkPoint = this.windowWidth <= this.loadOption[i].resolution && this.windowWidth > nextPoint;
        }

        if (checkPoint) {
          if (this.loadOption[i].attribute !== this.oldAttr) {
            this.targetAttr = this.loadOption[i].attribute;
            this.oldAttr = this.targetAttr;
            this.attrIndex = i;
            this.setResponsiveImage();
          }
        }
      }
    };

    fn.setResponsiveImage = function () {
      for (var i = 0; i < this.responsiveLength; i++) {
        var targetImage = this.responsiveImages[i],
            imgSrc = targetImage.getAttribute(this.targetAttr);

        if (!!!imgSrc) {
          imgSrc = this.findImageHandler(targetImage);
        }

        if (targetImage.classList.contains(this.lazyComplateClass)) {
          targetImage.setAttribute('src', imgSrc);
        }
      }
    };

    fn.findRemainingImageAttr = function (element) {
      var attrLength = this.loadOption.length;

      for (var i = 0; i < attrLength; i++) {
        var getAttr = element.getAttribute(this.loadOption[i].attribute);

        if (getAttr) {
          return getAttr;
          break;
        }
      }
    };

    fn.findNextImageAttr = function (element) {
      var isIndex = this.attrIndex;

      for (var i = isIndex; i >= 0; i--) {
        var getAttr = element.getAttribute(this.loadOption[i].attribute);

        if (getAttr) {
          return getAttr;
          break;
        }

        if (i == 0 && getAttr == undefined) {
          return this.findRemainingImageAttr(element);
        }
      }

      ;
    };

    fn.findImageHandler = function (element) {
      if (this.attrIndex !== 0) {
        return this.findNextImageAttr(element);
      } else {
        return this.findRemainingImageAttr(element);
      }
    };

    fn.setLazyImage = function () {
      this.windowHeight = window.innerHeight;

      for (var i = 0; i < this.lazyLength; i++) {
        var targetElement = this.lazyImages[i],
            corrHeight = this.windowHeight * this.visiblePoint,
            scrollTop = this.utilList.getScroll.call(this).top - corrHeight,
            scrollBottom = this.utilList.getScroll.call(this).bottom + corrHeight,
            targetOffsetTop = this.utilList.getOffset.call(this, targetElement).top,
            targetOffsetBottom = this.utilList.getOffset.call(this, targetElement).bottom,
            lazyClass = this.lazyClass.split('.'),
            removeClass = lazyClass[lazyClass.length - 1];

        if (scrollBottom > targetOffsetTop && scrollTop <= targetOffsetTop || scrollTop < targetOffsetBottom && scrollBottom > targetOffsetBottom || scrollTop < targetOffsetTop && scrollBottom > targetOffsetBottom || scrollTop > targetOffsetTop && scrollBottom < targetOffsetBottom) {
          var imgSrc = targetElement.getAttribute(this.targetAttr);

          if (!!!imgSrc) {
            imgSrc = this.findImageHandler(targetElement);
          }

          targetElement.setAttribute('src', imgSrc);

          if (this.opts.lazyClass.split(' ').length == 1) {
            targetElement.classList.remove(removeClass);
          }

          targetElement.classList.add('load-complete');
          this.getLazyImage();
        }
      }
    };

    return new init(opts);
  };

  var addClass = function (opts) {
    var classLength = opts.classList.length;

    for (var i = 0; i < classLength; i++) {
      opts.targetElement.classList.add(opts.classList[i]);
    }

    ;
  };

  var removeClass = function (opts) {
    var classLength = opts.classList.length;

    for (var i = 0; i < classLength; i++) {
      opts.targetElement.classList.remove(opts.classList[i]);
    }

    ;
  };

  return {
    calRange: function (values) {
      return calRange(values);
    },
    videoObjectFit: function (opts) {
      videoObjectFit(opts);
    },
    imageLoader: function (opts) {
      imageLoader(opts);
    },
    addClass: function (opts) {
      addClass(opts);
    },
    removeClass: function (opts) {
      removeClass(opts);
    }
  };
}();