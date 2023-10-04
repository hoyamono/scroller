/*!
 * Scrolle JavaScript Library v1.1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2023-09-27
 */

'use strict';

class Scroller {
  constructor(opts) {
    this.initialize = true;
    this.opts = opts;
    this.correction = !!!opts.correction ? 0 : opts.correction;
    this.removeCorrection = !!!opts.removeCorrection ? 0 : opts.removeCorrection;
    this.trackHeight = !!!opts.trackHeight ? 0 : opts.trackHeight;
    this.activeClass = opts.activeClass;
    this.activeCallbackClass = !!!opts.activeCallbackClass ? 'callback-active' : opts.activeCallbackClass;
    this.useStrictMode = opts.useStrictMode == undefined ? true : opts.useStrictMode;
    this.useFixed = !!!opts.useFixed ? false : opts.useFixed;
    this.useFixedStyle = opts.useFixedStyle == undefined ? true : opts.useFixedStyle;
    this.useViewportOver = !!!opts.useViewportOver ? true : opts.useViewportOver;
    this.activeVisibility = !!!opts.activeVisibility ? 'before' : opts.activeVisibility;
    this.activeType = !!!opts.activeType ? 'reverse' : this.opts.activeType;
    this.autoHeight = opts.autoHeight == undefined ? true : opts.autoHeight;
    this.offsetY = !!!opts.offsetY ? 0 : opts.offsetY;
    this.resize = opts.resize == undefined ? true : opts.resize;
    this.resizeTiming = opts.resizeTiming == undefined ? false : opts.resizeTiming;
    this.windowHeight = window.innerHeight;
    this.oldPregress = 0;
    this.oldWinScrollTop = 0;
    this.elementInformation = {};
    this.isFixedArea = false;
    this.checkTouchDevice = false;
    this.setElement();
    this.bindEvent();
  }
  static getScroll(windowHeight) {
    let top = window.pageYOffset,
      bottom = top + windowHeight;
    return {
      top: top,
      bottom: bottom
    };
  }
  static getOffset(element) {
    let top = element.getBoundingClientRect().top + window.pageYOffset,
      bottom = element.getBoundingClientRect().bottom + window.pageYOffset;
    return {
      top: top,
      bottom: bottom
    };
  }
  static IEScrollHandler() {
    if (navigator.userAgent.match(/Trident\/7\./)) {
      this.body.addEventListener('mousewheel', e => {
        e.preventDefault();
        let wheelDelta = e.wheelDelta,
          currentScrollPosition = window.pageYOffset;
        window.scrollTo(0, currentScrollPosition - wheelDelta);
      });
      this.body.addEventListener('keydown', e => {
        let currentScrollPosition = window.pageYOffset;
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
  }
  bindEvent() {
    let setTimeing = null;
    this.elementHandler();
    if (this.resize) {
      this.addEventList = () => {
        if (!this.resizeTiming) {
          this.windowHeight = window.innerHeight;
          this.elementHandler();
        } else {
          clearTimeout(setTimeing);
          setTimeing = setTimeout(() => {
            this.windowHeight = window.innerHeight;
            this.elementHandler();
          }, this.resizeTiming);
        }
      };
      window.addEventListener('resize', this.addEventList);
    }
    if (this.opts.IEScroll) {
      Scroller.IEScrollHandler();
    }
    if (this.opts.trackElement !== undefined) {
      this.trackElement.scroller = this;
    }
  }
  elementHandler() {
    this.setTrackStyle.call(this);
    this.getFixedState();
    if (this.trackHeight > 1) {
      this.setTrackHeigh.call(this);
    }
    if (this.useFixed && this.useFixedStyle) {
      this.setFixedStyle.call(this);
    }
    return this;
  }
  checkTouchDevice() {
    if (navigator.userAgent.indexOf('Windows') > -1 || navigator.userAgent.indexOf('Macintosh') > -1) {
      return this.checkTouchDevice = false;
    } else if ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch) {
      return this.checkTouchDevice = true;
    }
  }
  setElement() {
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
  }
  setTrackHeigh() {
    if (this.trackHeight <= 1) return;
    this.trackElement.style.height = '';
    let checkTrackHeight = this.trackElement.clientHeight == 0;
    let isTrackHeight = this.windowHeight;
    let calTrackHeight = isTrackHeight * this.trackHeight;
    if (checkTrackHeight) {
      this.trackElement.style.height = this.windowHeight + 'px';
    }
    this.trackElement.style.height = calTrackHeight + 'px';
  }
  setTrackStyle() {
    if (!!!this.trackElement) return;
    if (this.useFixed && window.getComputedStyle(this.trackElement).position == 'static') {
      this.trackElement.style.position = 'relative';
    }
  }
  setFixedStyle() {
    if (!this.isFixedArea) {
      this.fixedElement.style.height = '';
      this.fixedElement.style.top = '';
      this.fixedElement.style.position = 'absolute';
    }
    if (this.fixedElement.clientWidth == 0) {
      this.fixedElement.style.width = '100%';
    }
    if (this.autoHeight) {
      if (typeof this.offsetY == 'string') {
        this.fixedElement.style.height = 'calc(' + this.windowHeight + 'px - ' + this.offsetY + ')';
        this.fixedElement.style.top = this.offsetY;
      } else {
        this.fixedElement.style.height = this.windowHeight - this.offsetY + 'px';
        this.fixedElement.style.top = this.offsetY + 'px';
      }
    }
  }
  setFixedElement() {
    this.diffHeight = this.windowHeight - this.fixedElement.clientHeight;
    this.trackTopOffset = Scroller.getOffset(this.trackElement).top;
    this.trackBottomOffset = Scroller.getOffset(this.trackElement).bottom;
    if (this.winScrollTop <= this.trackTopOffset) {
      this.fixedElement.style.position = 'absolute';
      if (typeof this.offsetY == 'string') {
        this.fixedElement.style.top = this.offsetY;
      } else {
        this.fixedElement.style.top = this.offsetY + 'px';
      }
      this.fixedElement.style.bottom = '';
    } else if (this.winScrollBottom >= this.trackBottomOffset) {
      this.fixedElement.style.position = 'absolute';
      this.fixedElement.style.top = this.trackElement.clientHeight - this.fixedElement.clientHeight + 'px';
    } else {
      if (!this.isFixedArea) {
        this.fixedElement.style.position = 'fixed';
        this.fixedElement.style.top = '0';
      }
    }
    ;
  }
  getWheelDirection() {
    if (this.winScrollTop >= this.oldWinScrollTop) {
      this.wheelDirection = 'down';
    } else {
      this.wheelDirection = 'up';
    }
    this.oldWinScrollTop = this.winScrollTop;
  }
  getProgress() {
    let trackTopOffset = Scroller.getOffset(this.trackElement).top - this.windowHeight * this.correction,
      trackHeight = this.useFixed ? Math.abs(this.trackElement.clientHeight - this.windowHeight) : this.useViewportOver ? this.trackElement.clientHeight + this.windowHeight : this.trackElement.clientHeight,
      scrollTop = this.winScrollTop - trackTopOffset,
      scrollBottom = this.winScrollBottom - trackTopOffset,
      calProgress = this.useFixed ? scrollTop / trackHeight * 100 : scrollBottom / trackHeight * 100;
    if (this.useStrictMode) {
      this.progress = Math.floor(calProgress) < 0 ? 0 : Math.floor(calProgress) > 100 ? 100 : Math.floor(calProgress);
    } else {
      this.progress = calProgress;
    }
    ;
    this.getWheelDirection();
    return this.progress;
  }
  getFixedState() {
    if (this.progress > 0 && this.progress < 100) {
      this.isFixedArea = true;
    } else {
      this.isFixedArea = false;
    }
  }
  trackAnimation(callback) {
    if (!this.initialize) return;
    this.winScrollTop = Scroller.getScroll(this.windowHeight).top;
    this.winScrollBottom = Scroller.getScroll(this.windowHeight).bottom;
    if (this.useFixed) {
      this.setFixedElement.call(this);
    }
    ;
    this.getProgress();
    this.getFixedState();
    if (callback) {
      if (this.oldPregress !== this.progress) {
        callback.call(this);
      }
      ;
      this.oldPregress = this.progress;
    }
    ;
  }
  activeAnimation() {
    if (!this.initialize) return;
    this.winScrollTop = Scroller.getScroll(this.windowHeight).top;
    this.winScrollBottom = Scroller.getScroll(this.windowHeight).bottom;
    this.trackElementHeight = this.trackElement.clientHeight;
    this.correctionValue = this.trackElementHeight * this.correction;
    this.removeCorrectionValue = this.trackElementHeight * this.removeCorrection;
    this.elementOffsetTop = Scroller.getOffset(this.trackElement).top;
    this.elementOffsetBottom = Scroller.getOffset(this.trackElement).bottom;
    this.downScrollTop = this.winScrollTop - this.correctionValue;
    this.downScrollBottom = this.winScrollBottom - this.correctionValue;
    this.upScrollTop = this.winScrollTop + this.correctionValue;
    this.upScrollBottom = this.winScrollBottom + this.correctionValue;
    let visibleType = this.activeVisibility,
      removeType = this.activeType,
      corrHeight = this.windowHeight / 2;
    const addActiveClass = () => {
      if (!!!this.activeClass) return;
      if (typeof this.activeClass == 'object') {
        let classLength = this.activeClass.length;
        for (let i = 0; i < classLength; i++) {
          if (!this.activeElement.classList.contains(this.activeClass[i])) {
            this.activeElement.classList.add(this.activeClass[i]);
          }
        }
      } else {
        if (!this.activeElement.classList.contains(this.activeClass)) {
          this.activeElement.classList.add(this.activeClass);
        }
      }
    };
    const removeActiveClass = () => {
      if (typeof this.activeClass == 'object') {
        let classLength = this.activeClass.length;
        for (let i = 0; i < classLength; i++) {
          if (this.activeElement.classList.contains(this.activeClass[i])) {
            this.activeElement.classList.remove(this.activeClass[i]);
          }
        }
      } else {
        if (this.activeElement.classList.contains(this.activeClass)) {
          this.activeElement.classList.remove(this.activeClass);
        }
      }
      if (this.activeElement.classList.contains(this.activeCallbackClass)) {
        this.activeElement.classList.remove(this.activeCallbackClass);
      }
    };
    const activeCallback = () => {
      if (!this.activeElement.classList.contains(this.activeCallbackClass)) {
        if (!!!this.opts.activeCallback) return;
        this.opts.activeCallback.call(self);
        this.activeElement.classList.add(this.activeCallbackClass);
      }
    };
    const endCallback = () => {
      if (this.activeElement.classList.contains(this.activeCallbackClass)) {
        if (!!!this.opts.endCallback) return;
        this.opts.endCallback.call(self);
      }
    };
    const activeHandler = () => {
      activeCallback();
      addActiveClass();
    };
    const removeHandler = () => {
      endCallback();
      removeActiveClass();
    };
    this.getWheelDirection();
    switch (visibleType) {
      case 'before':
        if (this.wheelDirection == 'down' && this.downScrollBottom >= this.elementOffsetTop && this.downScrollTop <= this.elementOffsetTop || this.wheelDirection == 'up' && this.upScrollTop <= this.elementOffsetBottom && this.upScrollBottom >= this.elementOffsetBottom || this.activeType == 'oneWay' && this.downScrollBottom >= this.elementOffsetTop) {
          activeHandler();
          this.activeStatus = true;
        }
        break;
      case 'visible':
        if (this.wheelDirection == 'down' && this.downScrollBottom >= this.elementOffsetTop + corrHeight && this.downScrollTop <= this.elementOffsetTop || this.wheelDirection == 'up' && this.upScrollTop <= this.elementOffsetBottom - corrHeight && this.upScrollBottom >= this.elementOffsetBottom || this.activeType == 'oneWay' && this.downScrollBottom >= this.elementOffsetTop + corrHeight) {
          activeHandler();
          this.activeStatus = true;
        }
        break;
    }
    switch (removeType) {
      case 'reverse':
        if (visibleType == 'visible') {
          if (this.activeStatus && this.wheelDirection == 'down' && this.winScrollTop > this.elementOffsetBottom || this.activeStatus && this.wheelDirection == 'up' && this.winScrollBottom < this.elementOffsetTop) {
            removeHandler();
            this.activeStatus = false;
          }
        } else {
          if (this.activeStatus && this.winScrollTop < this.elementOffsetTop && this.winScrollBottom < this.elementOffsetTop || this.activeStatus && this.winScrollTop > this.elementOffsetBottom && this.winScrollBottom > this.elementOffsetBottom) {
            removeHandler();
            this.activeStatus = false;
          }
        }
        break;
      case 'oneWay':
        if (visibleType == 'visible') {
          if (this.activeStatus && this.winScrollBottom < this.elementOffsetTop) {
            removeHandler();
            this.activeStatus = false;
          }
        } else {
          if (this.activeStatus && this.winScrollTop < this.elementOffsetTop && this.winScrollBottom < this.elementOffsetTop) {
            removeHandler();
            this.activeStatus = false;
          }
        }
        break;
    }
  }
  getElementInformation() {
    if (this.trackElement) {
      this.elementInformation.trackElement = {
        element: this.trackElement,
        width: this.trackElement.clientWidth,
        height: this.trackElement.clientHeight,
        topOffset: Scroller.getOffset(this.trackElement).top,
        bottomOffset: Scroller.getOffset(this.trackElement).bottom
      };
    }
    ;
    if (this.activeElement) {
      this.elementInformation.activeElement = {
        element: this.activeElement,
        width: this.activeElement.clientWidth,
        height: this.activeElement.clientHeight,
        topOffset: Scroller.getOffset(this.activeElement).top,
        bottomOffset: Scroller.getOffset(this.activeElement).bottom
      };
    }
    ;
    return this.elementInformation;
  }
  destroy() {
    if (!!this.trackElement) {
      this.trackElement.style.position = '';
      this.trackElement.style.height = '';
    }
    if (!!this.fixedElement) {
      this.fixedElement.style.position = '';
      this.fixedElement.style.top = '';
      this.fixedElement.style.height = '';
    }
    this.trackElement = '';
    this.fixedElement = '';
    this.activeElement = '';
    this.correction = '';
    this.trackHeight = '';
    this.activeCallbackClass = '';
    this.useFixed = '';
    this.activeVisibility = '';
    this.activeType = '';
    this.offsetY = '';
    this.resize = '';
    this.windowHeight = '';
    this.elementInformation = '';
    window.removeEventListener('load', this.addEventList);
    window.removeEventListener('resize', this.addEventList);
    this.initialize = false;
  }
}
const SCROLLER = function (opts) {
  return new Scroller(opts);
};
/*!
 * Range-Handler JavaScript Library v1.1
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2022-10-04
 */

class RangeHandler {
  constructor(opts) {
    this.opts = opts;
    this.targetValue = opts.targetValue;
    this.startPoint = !!!opts.startPoint ? 0 : opts.startPoint;
    this.endPoint = !!!opts.endPoint ? 100 : opts.endPoint;
    this.activeStartPoint = this.startPoint + 1;
    this.activeEndPoint = this.endPoint - 1;
    this.onStart = opts.onStart;
    this.onUpdate = opts.onUpdate;
    this.onComplete = opts.onComplete;
    this.onReverseStart = opts.onReverseStart;
    this.onReverseComplete = opts.onReverseComplete;
    this.oldScroll = 0;
    this.activeOnStart = false;
    this.activeonComplete = false;
    this.completeOnCallback = false;
    this.activeonReverseStart = false;
    this.activeonReverseComplete = false;
    this.completeReverseCallback = false;
    return this;
  }
  calValue = progress => {
    if (this.startPoint >= 0) {
      let endPoint = this.endPoint - this.startPoint > 0 ? this.endPoint - this.startPoint : this.endPoint;
    }
    let returnValue = this.targetValue * (progress - this.startPoint) / endPoint;
    if (returnValue > this.targetValue) {
      returnValue = this.targetValue;
    }
    if (returnValue < 0) {
      returnValue = 0;
    }
    return returnValue;
  };
  checkWheelDirection = () => {
    this.windowScroll = window.pageYOffset;
    if (this.oldScroll < this.windowScroll) {
      this.oldScroll = this.windowScroll;
      return 'down';
    } else {
      this.oldScroll = this.windowScroll;
      return 'up';
    }
  };
  callBackList = {
    onStart: () => {
      if (this.onStart) {
        this.onStart();
      }
      this.activeOnStart = true;
    },
    onComplete: () => {
      if (this.onComplete) {
        this.onComplete();
      }
      this.activeonComplete = true;
      this.completeOnCallback = true;
      this.activeonReverseStart = false;
      this.activeonReverseComplete = false;
      this.completeReverseCallback = false;
    },
    onReverseStart: () => {
      if (this.onReverseStart) {
        this.onReverseStart();
      }
      this.activeonReverseStart = true;
    },
    onReverseComplete: () => {
      if (this.onReverseComplete) {
        this.onReverseComplete();
      }
      this.activeonReverseComplete = true;
      this.completeReverseCallback = true;
      this.activeOnStart = false;
      this.activeonComplete = false;
      this.completeOnCallback = false;
    },
    onUpdate: () => {
      if (this.onUpdate) {
        this.onUpdate();
      }
    }
  };
  checkScrollType = progress => {
    if (progress > this.activeStartPoint && progress < this.activeEndPoint && !this.completeOnCallback && !this.activeOnStart && this.isDirection == 'down') {
      return 'onStart';
    } else if (progress > this.activeEndPoint && !this.completeOnCallback && !this.activeonComplete && this.isDirection == 'down') {
      return 'onComplete';
    } else if (progress < this.activeEndPoint && this.completeOnCallback && !this.activeonReverseStart && this.isDirection == 'up') {
      return 'onReverseStart';
    } else if (progress < this.activeStartPoint && this.completeOnCallback && !this.activeonReverseComplete && this.isDirection == 'up') {
      return 'onReverseComplete';
    } else if (this.activeOnStart && !this.activeonComplete && this.isDirection == 'down' || this.activeOnStart && !this.activeonComplete && this.isDirection == 'up' || this.activeonReverseStart && !this.activeonReverseComplete && this.isDirection == 'down' || this.activeonReverseStart && !this.activeonReverseComplete && this.isDirection == 'up') {
      return 'onUpdate';
    }
  };
  activeAnimation = progress => {
    this.isValue = this.calValue(progress);
    this.isDirection = this.checkWheelDirection();
    switch (this.checkScrollType(progress)) {
      case 'onUpdate':
        if (this.activeonReverseStart && progress > this.activeEndPoint && this.isDirection == 'down') {
          this.callBackList.onComplete.call(this);
        } else if (this.activeOnStart && progress < this.activeStartPoint && this.isDirection == 'up') {
          this.callBackList.onReverseComplete.call(this);
        } else {
          this.callBackList.onUpdate.call(this);
        }
        break;
      case 'onStart':
        this.callBackList.onStart.call(this);
        break;
      case 'onComplete':
        if (progress > this.activeStartPoint && !this.activeonReverseStart && !this.activeonReverseComplete && !this.completeReverseCallback && !this.activeOnStart && !this.activeonComplete && !this.completeOnCallback) {
          this.callBackList.onStart.call(this);
          this.callBackList.onUpdate.call(this);
        }
        this.callBackList.onComplete.call(this);
        break;
      case 'onReverseStart':
        this.callBackList.onReverseStart.call(this);
        break;
      case 'onReverseComplete':
        this.callBackList.onReverseComplete.call(this);
        break;
    }
  };
}
const RANGEHANDLER = function (opts) {
  return new RangeHandler(opts);
};
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
    const _checkElement = element => {
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
      firstImage.addEventListener('load', () => {
        this.canvas.width = firstImage.naturalWidth;
        this.canvas.height = firstImage.naturalHeight;
        this.opts.width = this.canvas.width;
        this.opts.height = this.canvas.height;
      });
    } else {
      this.canvas.width = this.opts.width;
      this.canvas.height = this.opts.height;
    }
  }
  loadImages() {
    let isImage, windowTopOffset, windowBottomOffset, targetTopOffset, targetBottomOffset;
    const bindEvent = () => {
      scrollHandler();
      window.addEventListener('scroll', scrollHandler);
    };
    const scrollHandler = () => {
      windowTopOffset = window.pageYOffset - window.innerHeight * this.imageLoadOffset;
      windowBottomOffset = window.pageYOffset + window.innerHeight + window.innerHeight * this.imageLoadOffset;
      getCanvasOffset();
      if (windowBottomOffset > targetTopOffset && windowTopOffset < targetTopOffset || windowTopOffset < targetBottomOffset && windowBottomOffset > targetBottomOffset || windowTopOffset < targetTopOffset && windowBottomOffset > targetBottomOffset || windowTopOffset > targetTopOffset && windowBottomOffset < targetBottomOffset) {
        startLoadImages();
        window.removeEventListener('scroll', scrollHandler);
      }
    };
    const getCanvasOffset = () => {
      targetTopOffset = this.targetElement.getBoundingClientRect().top + window.pageYOffset;
      targetBottomOffset = this.targetElement.getBoundingClientRect().bottom + window.pageYOffset;
    };
    const startLoadImages = () => {
      let self = this;
      if (!this.opts.autoPlay && !this.defaultImage) {
        this.setDefaultImage(0);
      }
      for (let i = this.opts.startNum; i <= this.opts.endNum; i++) {
        isImage = new Image();
        isImage.src = this.opts.path + this.opts.name + i + '.' + this.opts.extension;
        ((idx, imgElement) => {
          let imageLoadEvent = function () {
            self.imageList[idx] = this;
            if (self.loadCount < self.opts.endNum) {
              self.loadCount++;
              self.imageList[idx].removeEventListener('load', imageLoadEvent);
            } else if (self.opts.autoPlay && self.loadCount == self.opts.endNum) {
              setTimeout(() => {
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
  }
  sequenceLoadCheck(type) {
    let intervalTimer = null;
    intervalTimer = setInterval(() => {
      if (this.loadCount == this.opts.endNum) {
        this.activeSequence(type);
        clearInterval(intervalTimer);
        intervalTimer = null;
      }
    }, 100);
  }
  setDefaultImage(idx) {
    this.defaultImage = new Image();
    this.defaultImage.src = this.opts.path + this.opts.name + idx + '.' + this.opts.extension;
    this.defaultImageEvent = () => {
      this.context.drawImage(this.defaultImage, 0, 0, this.opts.width, this.opts.height);
    };
    this.defaultImage.addEventListener('load', this.defaultImageEvent);
  }
  play(opts) {
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
  }
  reverse() {
    if (this.isPlay) return;
    if (this.loadCount !== this.opts.endNum) {
      this.sequenceLoadCheck('reverse');
    } else {
      this.activeSequence('reverse');
    }
  }
  pause() {
    if (!this.isPlay) return;
    if (this.useReverse && this.usePlayIng) {
      this.useReverse = false;
    }
    window.cancelAnimationFrame(this.playAnimation);
    this.isPlay = false;
    this.pausePlayingTime = this.playingTime;
  }
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
  }
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
  }
  activeSequence(type) {
    let playInterval = this.opts.endNum / this.opts.playTime,
      startTime = null,
      progress;
    this.activeCallback();
    this.isPlay = true;
    const _setIndex = timestemp => {
      if (timestemp && startTime == null) {
        startTime = Math.ceil(timestemp);
      }
      if (this.playIndex == null && type !== 'reverse') {
        this.playIndex = this.opts.startNum;
      } else if (this.playIndex == null && type == 'reverse') {
        console.log(2222);
        this.playIndex = this.opts.endNum;
      }
    };
    const _resetStatus = () => {
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
      default: () => {
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
      timeControll: timestemp => {
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
  }
}
const SEQUENCEPLAYER = function (opts) {
  return new SequencePlayer(opts);
};
/*!
* ANI-Util JavaScript Library v1.0
*
* Copyright 2021. Yoon jae-ho
* Released under the MIT license
*
* Date: 2023-04-15
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
  var percentToPixel = function (opts) {
    var targetValue = opts.targetValue,
      progress = opts.progress;
    return targetValue * (progress / 100);
  };
  var videoObjectFit = function (opts) {
    var init = function (opts) {
      this.opts = opts;
      this.resizeTiming = opts.resizeTiming ? opts.resizeTiming : 100;
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
      }, this.resizeTiming);
    };
    return new init(opts);
  };
  var mediaLoader = function (opts) {
    var init = function () {
      this.opts = opts;
      this.mediaType = !!!opts.type ? 'image' : opts.type;
      this.lazyCompleteClass = this.mediaType === 'image' ? 'is-img-load-complete' : this.mediaType === 'bgImage' ? 'is-bg-load-complete' : this.mediaType === 'video' ? 'is-video-load-complete' : this.mediaType === 'mp4Video' ? 'is-mp4video-load-complete' : this.mediaType === 'svgImage' ? 'is-svg-load-complete' : opts.complatClass;
      this.lazyClass = opts.lazyClass;
      this.responsiveClass = opts.responsiveClass;
      this.loadOption = opts.loadOption;
      this.targetAttr = opts.loadOption[0].attribute;
      this.bgOpts = opts.loadOption[0].bgOpts;
      this.visiblePoint = !!!opts.visiblePoint ? 0 : opts.visiblePoint;
      this.useDefaultImg = opts.useDefaultImg;
      this.endCallback = opts.endCallback;
      this.preset = !!!opts.preset ? '' : opts.preset;
      this.lazyCompleteLength = 0;
      this.property = this.mediaType === 'image' ? 'src' : 'href';
      this.getLazyMedia();
      this.getResponsiveMedia();
      this.bindEvent();
      return window[this.mediaType] = this;
    };
    var fn = init.prototype;
    fn.bindEvent = function () {
      var self = this,
        resizeTiming = null,
        responsiveCheck = this.loadOption;
      var lazyEvent = function () {
        self.setLazyMedia();
        if (self.lazyLength == self.lazyCompleteLength) {
          window.removeEventListener('scroll', lazyEvent);
        }
      };
      if (this.useDefaultImg) {
        this.setDefaultImage();
      }
      self.responsiveHandler();
      lazyEvent();
      window.addEventListener('scroll', lazyEvent);
      if (responsiveCheck) {
        window.addEventListener('resize', function () {
          clearTimeout(resizeTiming);
          resizeTiming = setTimeout(function () {
            self.responsiveHandler();
            lazyEvent();
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
    fn.getLazyMedia = function () {
      var lazyMediaList = document.querySelectorAll(this.lazyClass),
        showLazyMediaList = [];
      for (var i = 0; i < lazyMediaList.length; i++) {
        if (lazyMediaList[i].offsetParent != null) {
          showLazyMediaList.push(lazyMediaList[i]);
        }
        if (i == lazyMediaList.length - 1) {
          this.lazyMedias = showLazyMediaList;
          this.lazyLength = showLazyMediaList.length;
        }
      }
    };
    fn.checkCompleteMedia = function () {
      var completeList = [];
      for (let i = 0; i < this.lazyMedias.length; i++) {
        if (this.lazyMedias[i].classList.contains(this.lazyCompleteClass)) {
          completeList.push(this.lazyMedias[i]);
          this.lazyCompleteLength = completeList.length;
        }
      }
    };
    fn.getResponsiveMedia = function () {
      var responsiveMediaList = document.querySelectorAll(this.responsiveClass);
      this.responsiveMedias = responsiveMediaList;
      this.responsiveLength = responsiveMediaList.length;
    };
    fn.setDefaultImage = function () {
      if (this.mediaType === 'video' || this.mediaType === 'mp4Video') return;
      for (var i = 0; i < this.lazyLength; i++) {
        this.lazyMedias[i].setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAh+QQFAAAAACwAAAAAAQABAAACAkQBADs=');
      }
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
            this.bgOpts = this.loadOption[i].bgOpts;
            this.oldOpts = this.bgOpts;
            this.attrIndex = i;
            this.setResponsiveMedia();
          }
        }
      }
    };
    fn.setResponsiveMedia = function (otherMedia, endCallback) {
      if (!!otherMedia) {
        this.setLazyMedia(otherMedia, endCallback);
        this.getResponsiveMedia();
      } else {
        for (var i = 0; i < this.responsiveLength; i++) {
          var targetMedia = this.responsiveMedias[i],
            mediaSrc = targetMedia.getAttribute(this.targetAttr);
          if (!!!mediaSrc) {
            mediaSrc = this.findMediaHandler(targetMedia);
          }
          if (targetMedia.classList.contains(this.lazyCompleteClass)) {
            if (this.mediaType === 'image' || this.mediaType === 'svgImage') {
              if (this.mediaType === 'image') {
                targetMedia.setAttribute(this.property, mediaSrc + this.preset);
              } else {
                targetMedia.setAttribute(this.property, mediaSrc);
              }
            } else if (this.mediaType === 'video' || this.mediaType === 'mp4Video') {
              var isSource = targetMedia.querySelectorAll('source');
              for (var j = 0; j < isSource.length; j++) {
                if (isSource[j].type === 'video/webm') {
                  isSource[j].src = mediaSrc + '.webm' + this.preset;
                  targetMedia.load();
                } else if (isSource[j].type === 'video/mp4') {
                  if (this.mediaType === 'mp4Video') {
                    isSource[j].src = mediaSrc + '.mp4?imbypass=true';
                  } else {
                    isSource[j].src = mediaSrc + '.mp4' + this.preset;
                  }
                  targetMedia.load();
                }
              }
            }
          }
        }
      }
    };
    fn.findRemainingMediaAttr = function (element) {
      var attrLength = this.loadOption.length;
      for (var i = 0; i < attrLength; i++) {
        var getAttr = element.getAttribute(this.loadOption[i].attribute);
        if (getAttr) {
          return getAttr;
          break;
        }
      }
    };
    fn.findNextMediaAttr = function (element) {
      var isIndex = this.attrIndex;
      for (var i = isIndex; i >= 0; i--) {
        var getAttr = element.getAttribute(this.loadOption[i].attribute);
        if (getAttr) {
          return getAttr;
          break;
        }
        if (i == 0 && getAttr == undefined) {
          return this.findRemainingMediaAttr(element);
        }
      }
    };
    fn.findMediaHandler = function (element) {
      if (this.attrIndex !== 0) {
        return this.findNextMediaAttr(element);
      } else {
        return this.findRemainingMediaAttr(element);
      }
    };
    fn.setLazyMedia = function (targetMedia, endCallback) {
      var self = this;
      this.windowHeight = window.innerHeight;
      var _createSourceElement = function (src) {
        var sourceEl = [];
        sourceEl.push(document.createElement('source'));
        sourceEl.push(document.createElement('source'));
        if (self.mediaType === 'mp4Video') {
          sourceEl[0].type = 'video/mp4';
          sourceEl[0].src = src + '.mp4?imbypass=true';
        } else {
          sourceEl[0].type = 'video/webm';
          sourceEl[0].src = src + '.webm' + self.preset;
          sourceEl[1].type = 'video/mp4';
          sourceEl[1].src = src + '.mp4' + self.preset;
        }
        return sourceEl;
      };
      var _setLazySrc = function (targetElement) {
        switch (self.mediaType) {
          case 'image':
            targetElement.setAttribute(self.property, mediaSrc + self.preset);
            break;
          case 'svgImage':
            targetElement.setAttribute(self.property, mediaSrc);
            break;
          case 'bgImage':
            targetElement.classList.add(self.lazyCompleteClass);
            if (!!mediaSrc) {
              targetElement.style.background = this.bgOpts + ' url(' + mediaSrc + ')';
            }
            break;
          case 'video':
            var isSource = _createSourceElement(mediaSrc);
            targetElement.append(isSource[0]);
            targetElement.append(isSource[1]);
            if (!targetElement.muted) {
              targetElement.muted = true;
            }
            if (!targetElement.playsInline) {
              targetElement.playsInline = true;
            }
            targetElement.load();
            break;
          case 'mp4Video':
            var isSource = _createSourceElement(mediaSrc);
            targetElement.append(isSource[0]);
            if (!targetElement.muted) {
              targetElement.muted = true;
            }
            if (!targetElement.playsInline) {
              targetElement.playsInline = true;
            }
            targetElement.load();
            break;
        }
        ;
      };
      var _setComplateStatus = function (targetElement) {
        (function (mediaElement) {
          var mediaLoadEvent = function () {
            if (self.mediaType === 'image') {
              mediaElement.removeEventListener('load', mediaLoadEvent);
            } else if (self.mediaType === 'video') {
              if (!!endCallback) {
                endCallback(targetElement);
              }
              if (!!self.endCallback) {
                self.endCallback(targetElement);
              }
              mediaElement.removeEventListener('loadedmetadata', mediaLoadEvent);
            }
          };
          switch (self.mediaType) {
            case 'image':
              mediaElement.addEventListener('load', mediaLoadEvent);
              mediaElement.classList.add(self.lazyCompleteClass);
              if (self.opts.lazyClass.split(' ').length == 1) mediaElement.classList.remove(removeClass);
              clearTimeout(self.checkCompleteTiming);
              self.checkCompleteTiming = setTimeout(function () {
                self.checkCompleteMedia();
              }, 1000);
              break;
            case 'video':
              mediaElement.addEventListener('loadedmetadata', mediaLoadEvent);
              mediaElement.classList.add(self.lazyCompleteClass);
              mediaElement.parentNode.classList.add('loaded'); //TO-DO
              if (self.opts.lazyClass.split(' ').length == 1) mediaElement.classList.remove(removeClass);
              clearTimeout(self.checkCompleteTiming);
              self.checkCompleteTiming = setTimeout(function () {
                self.checkCompleteMedia();
              }, 1000);
              break;
            case 'mp4Video':
              mediaElement.addEventListener('loadedmetadata', mediaLoadEvent);
              mediaElement.classList.add(self.lazyCompleteClass);
              if (self.opts.lazyClass.split(' ').length == 1) mediaElement.classList.remove(removeClass);
              clearTimeout(self.checkCompleteTiming);
              self.checkCompleteTiming = setTimeout(function () {
                self.checkCompleteMedia();
              }, 1000);
              break;
            default:
              mediaElement.classList.add(self.lazyCompleteClass);
              if (self.opts.lazyClass.split(' ').length == 1) mediaElement.classList.remove(removeClass);
              clearTimeout(self.checkCompleteTiming);
              self.checkCompleteTiming = setTimeout(function () {
                self.checkCompleteMedia();
              }, 1000);
              break;
          }
          ;
        })(targetElement);
      };
      if (!!!targetMedia) {
        for (var i = 0; i < this.lazyLength; i++) {
          var targetElement = this.lazyMedias[i],
            corrHeight = this.windowHeight * (window.pageYOffset != 0 ? this.visiblePoint : 0),
            scrollTop = this.utilList.getScroll.call(this).top - corrHeight,
            scrollBottom = this.utilList.getScroll.call(this).bottom + corrHeight,
            targetOffsetTop = this.utilList.getOffset.call(this, targetElement).top,
            targetOffsetBottom = this.utilList.getOffset.call(this, targetElement).bottom,
            lazyClass = this.lazyClass.split('.'),
            removeClass = lazyClass[lazyClass.length - 1];

          // if (!this.mediaType === 'svgImage' && targetElement.offsetParent == null) return;
          if (targetElement.offsetParent != null) {
            if (scrollBottom > targetOffsetTop && scrollTop <= targetOffsetTop || scrollTop < targetOffsetBottom && scrollBottom > targetOffsetBottom || scrollTop < targetOffsetTop && scrollBottom > targetOffsetBottom || scrollTop > targetOffsetTop && scrollBottom < targetOffsetBottom) {
              var mediaSrc = targetElement.getAttribute(this.targetAttr);
              if (!!!mediaSrc) {
                mediaSrc = this.findMediaHandler(targetElement);
              }
              if (!targetElement.classList.contains(this.lazyCompleteClass)) {
                _setLazySrc(targetElement);
                _setComplateStatus(targetElement);
              }
            }
          }
        }
      } else {
        for (var i = 0; i < targetMedia.length; i++) {
          var mediaSrc = targetMedia[i].getAttribute(this.targetAttr);
          if (!!!mediaSrc) {
            mediaSrc = this.findMediaHandler(targetMedia[i]);
          }
          if (!targetMedia[i].classList.contains(this.lazyCompleteClass)) {
            _setLazySrc(targetMedia[i]);
            _setComplateStatus(targetMedia[i]);
          }
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
  var scrollController = function () {
    var opt = opt ? opt : {},
      agent = navigator.userAgent.toLowerCase(),
      macOs = agent.indexOf("mac os") > -1,
      targetElement = document.scrollingElement || document.documentElement || document.body.parentNode || document.body,
      defaultSpeed = macOs ? 60 : 120,
      speed,
      duration,
      scrollSize,
      maxScrollSize,
      frameElement = targetElement === document.body && document.documentElement ? document.documentElement : targetElement,
      // safari is the new IE
      moveState = false,
      scrollTiming = null,
      tweenObject = null;
    var init = function (opt) {
      // if (agent.indexOf("chrome") == -1 && agent.indexOf("safari") != -1) return;
      setOpts(opt);
      bindEvent.wheel();
      bindEvent.scroll();
      return this.opt = opt;
    };
    var destroy = function (remove) {
      document.documentElement.removeEventListener('mousewheel', eventList.scrollEvent);
      document.documentElement.removeEventListener('wheel', eventList.scrollEvent);
      if (remove) {
        opt = {};
      }
    };
    var setOpts = function (opt) {
      speed = !!!opt.speed ? defaultSpeed : macOs ? opt.speed / 2 : opt.speed;
      duration = !!!opt.duration ? 0.6 : opt.duration;
      scrollSize = targetElement.scrollTop;
      opt = opt;
    };
    var bindEvent = {
      wheel: function () {
        if (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1 || agent.indexOf("msie") != -1) {
          document.documentElement.addEventListener('mousewheel', eventList.scrollEvent, {
            passive: false
          });
        } else {
          document.documentElement.addEventListener('wheel', eventList.scrollEvent, {
            passive: false
          });
        }
        ;
      },
      scroll: function () {
        window.addEventListener('scroll', function () {
          if (document.documentElement.style.overflow == 'hidden' || document.body.style.overflow == 'hidden') return;
          if (!moveState) {
            scrollSize = targetElement.scrollTop;
          }
        });
      }
    };
    var eventList = {
      scrollEvent: function (e) {
        if (document.documentElement.style.overflow == 'hidden' || document.body.style.overflow == 'hidden') return;
        e.preventDefault();
        var fixedMoveSpeed = document.body.getAttribute('data-scroll-speed');
        var delta = eventList.normalizeWheelDelta(e),
          moveSpeed = opt.currDelta && fixedMoveSpeed ? fixedMoveSpeed : !!!fixedMoveSpeed && !!!speed ? 120 : speed;
        scrollSize = scrollSize + -delta * moveSpeed; //현재까지 스크롤한 사이즈
        maxScrollSize = Math.max(0, Math.min(scrollSize, targetElement.scrollHeight - frameElement.clientHeight)); //최대 스크롤 사이즈

        eventList.update();
      },
      normalizeWheelDelta: function (e) {
        if (e.detail) {
          if (e.wheelDelta) {
            return e.wheelDelta / e.detail / 40 * (e.detail > 0 ? 1 : -1); // Opera
          } else {
            return -e.detail / 3; // Firefox
          }
        } else {
          return e.wheelDelta / 120; // IE,Safari,Chrome
        }
      },

      update: function () {
        var moveRange = maxScrollSize - targetElement.scrollTop,
          moveSize = 0 >= Math.ceil(targetElement.scrollTop + moveRange) ? 0 : scrollSize > maxScrollSize ? maxScrollSize : Math.ceil(targetElement.scrollTop + moveRange); //한번 스크롤시 이동할 거리

        moveState = true;
        TweenMax.to(targetElement, duration, {
          ease: "circ.out",
          scrollTop: moveSize,
          onComplete: function () {
            clearTimeout(scrollTiming);
            scrollTiming = null;
            scrollTiming = setTimeout(function () {
              moveState = false;
              scrollSize = targetElement.scrollTop;
            }, 500);
          }
        });

        // if (tweenObject === null) {
        // 	tweenObject = new TweenMax.to(targetElement, duration, { ease: "circ.out", scrollTop: moveSize, onComplete: function(){
        // 			clearTimeout(scrollTiming);
        // 			scrollTiming = null;
        // 			scrollTiming = setTimeout(function(){
        // 				moveState = false;
        // 				scrollSize = targetElement.scrollTop;
        // 			}, 500)
        // 		}
        // 	});	
        // };

        // tweenObject.updateTo({scrollTop: moveSize}, true);
        if (scrollSize <= 0) {
          scrollSize = 0;
        } else if (scrollSize >= maxScrollSize) {
          scrollSize = maxScrollSize;
        }
      }
    };
    return {
      init: init,
      destroy: destroy
    };
  };
  var resizeScrollOffset = function (opt) {
    var scrollProgress = null,
      correctionTiming = null,
      resizeTiming = !!!opt ? 200 : opt + 200;
    var scrollElement, scrollElementHeight, winScrollTop, scrollProgress;
    var init = function () {
      bindEvent();
    };
    var getScrollProgerss = function () {
      if (scrollProgress == null) {
        scrollElement = document.scrollingElement || document.documentElement || document.body.parentNode || document.body;
        scrollElementHeight = document.body.clientHeight;
        winScrollTop = window.pageYOffset + scrollElement.clientHeight;
        scrollProgress = winScrollTop / scrollElementHeight;
      } else {
        scrollElementHeight = document.body.clientHeight;
      }
      ;
    };
    var setCorrScroll = function () {
      clearTimeout(correctionTiming);
      correctionTiming = setTimeout(function () {
        window.scrollTo(0, scrollElementHeight * scrollProgress - window.innerHeight);
        scrollProgress = null;
      }, resizeTiming);
    };
    var bindEvent = function () {
      window.addEventListener('resize', function () {
        getScrollProgerss();
        setCorrScroll();
      });
    };
    return init();
  };
  var checkTouchDevice = function () {
    if (navigator.userAgent.indexOf('Windows') > -1 || navigator.userAgent.indexOf('Macintosh') > -1) {
      return false;
    } else if ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch) {
      return true;
    }
  };
  var deviceConsole = function (value, visible) {
    var consoleElement, consoleValueElement;
    if (!document.querySelector('.console-layer')) {
      consoleElement = document.createElement('div');
      consoleElement.classList.add('console-layer');
      consoleElement.setAttribute('style', 'position: fixed; left: 0; top: 0; padding: 20px; z-index:1000000000; background: #fff;');
      document.querySelector('body').append(consoleElement);
    }
    if (visible == 'multi') {
      consoleElement = document.querySelector('.console-layer');
      consoleValueElement = document.createElement('div');
      consoleValueElement.classList.add('console-value');
      consoleValueElement.setAttribute('style', 'border: 1px #ddd solid; float: left; padding: 10px;');
      consoleElement.append(consoleValueElement);
    } else {
      if (!document.querySelector('.console-value')) {
        consoleValueElement = document.createElement('div');
        consoleValueElement.classList.add('console-value');
        consoleValueElement.setAttribute('style', 'border: 1px #ddd solid; float: left; padding: 10px;');
        consoleElement.append(consoleValueElement);
        consoleValueElement = document.querySelector('.console-value');
      } else {
        consoleValueElement = document.querySelector('.console-value');
      }
    }
    consoleValueElement.innerHTML = value;
  };
  var responsiveHandler = function (opts) {
    window.resolutionStatus = null;
    var isResolution,
      oldActiveIndex,
      isActiveIndex,
      callbackTiming = null;
    var windowWidth = window.innerWidth;
    var opts = {
      resolution: opts.resolution,
      statusName: opts.statusName || [],
      callback: opts.callback || [],
      activeTiming: !!!opts.activeTiming ? 100 : opts.activeTiming
    };
    var checkResolution = function () {
      windowWidth = window.innerWidth;
      for (var i = 0; i < opts.resolution.length; i++) {
        var currentSize = opts.resolution[i],
          nextSize = !!!opts.resolution[i + 1] ? 0 : opts.resolution[i + 1];
        if (windowWidth <= currentSize && windowWidth > nextSize && isResolution != opts.statusName[i] || windowWidth <= currentSize && windowWidth > nextSize && isActiveIndex != i) {
          document.documentElement.classList.remove(isResolution);
          isResolution = opts.statusName[i] || i;
          isActiveIndex = i;
          document.documentElement.classList.add(isResolution);
        } else if (windowWidth >= opts.resolution[0] && isResolution != opts.statusName[0] || windowWidth >= opts.resolution[0] && !!!isActiveIndex) {
          document.documentElement.classList.remove(isResolution);
          isResolution = opts.statusName[0] || i;
          isActiveIndex = i;
          document.documentElement.classList.add(isResolution);
        }
      }
    };
    var activeCallbacks = function () {
      clearTimeout(callbackTiming);
      if (oldActiveIndex == isActiveIndex) return;
      if (!!!opts.callback[isActiveIndex]) return;
      callbackTiming = setTimeout(function () {
        opts.callback[isActiveIndex]();
        callbackTiming = null;
        oldActiveIndex = isActiveIndex;
      }, opts.activeTiming);
    };
    var bindEvent = function () {
      window.addEventListener('DOMContentLoaded', function () {
        checkResolution();
        oldActiveIndex = isActiveIndex;
      });
      window.addEventListener('resize', function () {
        checkResolution();
        activeCallbacks();
      });
    };
    var init = function () {
      bindEvent();
      return this;
    };
    return init(opts);
  };
  var videoHandler = function (opts) {
    var init = function (opts) {
      this.video = opts.video;
      this.wrap = !!!opts.wrap ? video : opts.wrap;
      this.playType = opts.playType;
      this.startPoint = !!!opts.startPoint ? 0 : opts.startPoint;
      this.reversePoint = !!!opts.reversePoint ? 100 : opts.reversePoint;
      this.playClass = !!!opts.playClass ? 'is-playing' : opts.playClass;
      this.pauseClass = !!!opts.pauseClass ? 'is-paused' : opts.pauseClass;
      this.endedClass = !!!opts.endedClass ? 'is-ended' : opts.endedClass;
      this.resetCallback = opts.resetCallback;
      this.playCallback = opts.playCallback;
      this.pauseCallback = opts.pauseCallback;
      this.endCallback = opts.endCallback;
      this.tweenObject = null;
      this.agent = navigator.userAgent;
      this.isMacintosh = this.agent.indexOf('Macintosh');
      this.isChrome = this.agent.indexOf('Chrome');
      this.bindEvents();
      this.video.videoHandler = this;
      return this;
    };
    var fn = init.prototype;
    fn.eventList = {
      play: function () {
        if (!!this.playCallback) this.playCallback();
        if (!this.wrap.length) {
          this.wrap.classList.remove(this.endedClass);
          this.wrap.classList.remove(this.pauseClass);
          this.wrap.classList.add(this.playClass);
        } else {
          for (var i = 0; i < this.wrap.length; i++) {
            this.wrap[i].classList.remove(this.endedClass);
            this.wrap[i].classList.remove(this.pauseClass);
            this.wrap[i].classList.add(this.playClass);
          }
        }
      },
      ended: function () {
        if (!!this.endCallback) this.endCallback();
        if (!this.wrap.length) {
          this.wrap.classList.remove(this.playClass);
          this.wrap.classList.add(this.pauseClass);
          this.wrap.classList.add(this.endedClass);
        } else {
          for (var i = 0; i < this.wrap.length; i++) {
            this.wrap[i].classList.remove(this.playClass);
            this.wrap[i].classList.add(this.pauseClass);
            this.wrap[i].classList.add(this.endedClass);
          }
        }
      },
      pause: function () {
        if (!!this.pauseCallback) this.pauseCallback();
        if (!this.wrap.length) {
          this.wrap.classList.remove(this.playClass);
          this.wrap.classList.add(this.pauseClass);
        } else {
          for (var i = 0; i < this.wrap.length; i++) {
            this.wrap[i].classList.remove(this.playClass);
            this.wrap[i].classList.add(this.pauseClass);
          }
        }
      },
      reset: function () {
        if (!!this.resetCallback) this.resetCallback();
        this.video.pause();
        this.video.currentTime = 0;
        var self = this;
        var _removeClass = function () {
          if (!self.wrap.length) {
            self.wrap.classList.remove(self.playClass);
            self.wrap.classList.remove(self.pauseClass);
            self.wrap.classList.remove(self.endedClass);
          } else {
            for (var i = 0; i < self.wrap.length; i++) {
              self.wrap[i].classList.remove(self.playClass);
              self.wrap[i].classList.remove(self.pauseClass);
              self.wrap[i].classList.remove(self.endedClass);
            }
          }
        };
        clearTimeout(_removeClass);
        setTimeout(_removeClass, 50);
      }
    };
    fn.activeList = {
      scrollPlay: function (progress) {
        if (!document.documentElement.classList.contains('low_network') && progress > this.startPoint && progress < this.reversePoint && this.video.paused && !this.wrap.classList.contains(this.endedClass) && !this.wrap.classList.contains(this.pauseClass)) {
          if (this.video.readyState == 4 && this.video.paused) {
            this.video.play();
          } else {
            this.video.addEventListener('loadeddata', this.video.play);
          }
          ;
        }
        ;
        if (this.video.readyState == 4) {
          if (progress === 100 || progress === 0) {
            this.eventList.reset.call(this);
          }
        }
      },
      sequencePlay: function (progress, corrProgress, scrollDuration) {
        this.corrProgress = !!!corrProgress ? 100 : corrProgress;
        this.scrollDuration = !!!scrollDuration ? 0.6 : scrollDuration;
        if (this.video.readyState == 4 && this.video.paused) {
          this.videoDuration = this.video.duration;
          this.playCurrentTime = this.videoDuration * (progress / this.corrProgress);
          this.playRange = this.playCurrentTime < this.videoDuration ? this.playCurrentTime : this.videoDuration;
          // if (this.isMacintosh > 0 && this.isChrome > 0) {
          // 	this.video.currentTime = this.playRange;
          // } else {
          // 	if (this.tweenObject === null) {
          // 		this.tweenObject = new TweenMax.to(this.video, this.scrollDuration, {
          // 			currentTime: this.playRange, 
          // 			ease: 'Circ.out'
          // 		});
          // 	};
          // 	this.tweenObject.updateTo({currentTime: this.playRange}, true);
          // }
          if (this.playCurrentTime < this.videoDuration) {
            this.video.currentTime = this.playRange;
          }
          ;
        }
        ;
      }
    };
    fn.bindEvents = function () {
      var self = this;
      this.playEvent = function () {
        self.eventList.play.call(self);
      };
      this.pauseEvent = function () {
        self.eventList.pause.call(self);
      };
      this.endedEvent = function () {
        self.eventList.ended.call(self);
      };
      this.video.addEventListener('play', this.playEvent);
      this.video.addEventListener('pause', this.pauseEvent);
      this.video.addEventListener('ended', this.endedEvent);
    };
    fn.scrollActive = function (progress, corrProgress, scrollDuration) {
      switch (this.playType) {
        case 'scrollPlay':
          this.activeList.scrollPlay.call(this, progress);
          break;
        case 'sequencePlay':
          this.activeList.sequencePlay.call(this, progress, corrProgress, scrollDuration);
          break;
      }
    };
    fn.destroy = function () {
      this.video.removeEventListener('play', this.playEvent);
      this.video.removeEventListener('pause', this.pauseEvent);
      this.video.removeEventListener('ended', this.endedEvent);
      this.video.videoHandler = null;
    };
    return new init(opts);
  };
  return {
    calRange: function (values) {
      return calRange(values);
    },
    videoObjectFit: function (opts) {
      videoObjectFit(opts);
    },
    videoHandler: function (opts) {
      return videoHandler(opts);
    },
    imageLoader: function (opts) {
      return mediaLoader(opts);
    },
    mediaLoader: function (opts) {
      return mediaLoader(opts);
    },
    addClass: function (opts) {
      addClass(opts);
    },
    removeClass: function (opts) {
      removeClass(opts);
    },
    scrollController: scrollController,
    resizeScrollOffset: function (opt) {
      resizeScrollOffset(opt);
    },
    checkTouchDevice: checkTouchDevice,
    deviceConsole: deviceConsole,
    percentToPixel: percentToPixel,
    responsiveHandler: responsiveHandler
  };
}();