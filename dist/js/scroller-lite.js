/*!
 * Scrolle JavaScript Library v1.0.4
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
    this.removeCorrection = !!!opts.removeCorrection ? 0 : opts.removeCorrection;
    this.trackHeight = !!!opts.trackHeight ? 0 : opts.trackHeight;
    this.activeClass = opts.activeClass;
    this.activeCallbackClass = !!!opts.activeCallbackClass ? 'callback-active' : opts.activeCallbackClass;
    this.useStrictMode = opts.useStrictMode == undefined ? true : opts.useStrictMode;
    this.useFixed = !!!opts.useFixed ? false : opts.useFixed;
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
    this.elementEventList.setElement.call(this);
    this.bindEvent();
  };

  var fn = init.prototype;

  fn.bindEvent = function () {
    var self = this;
    var setTimeing = null;
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

      window.addEventListener('resize', this.addEventList);
    }

    if (this.opts.IEScroll) {
      this.utilList.IEScrollHandler.call(this);
    }
  };

  fn.elementHandler = function () {
    this.elementEventList.setTrackStyle.call(this);
    this.getFixedState();

    if (this.trackHeight > 1) {
      this.elementEventList.setTrackHeigh.call(this);
    }

    if (this.useFixed) {
      this.elementEventList.setFixedStyle.call(this);
    }

    return this;
  };

  fn.utilList = {
    checkTouchDevice: function () {
      if (navigator.userAgent.indexOf('Windows') > -1 || navigator.userAgent.indexOf('Macintosh') > -1) {
        return this.checkTouchDevice = false;
      } else if ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch) {
        return this.checkTouchDevice = true;
      }
    },
    IEScrollHandler: function () {
      if (navigator.userAgent.match(/Trident\/7\./)) {
        this.body.addEventListener('mousewheel', function (e) {
          e.preventDefault();
          var wheelDelta = e.wheelDelta,
              currentScrollPosition = window.pageYOffset;
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
    },
    getUserAgent: function () {
      return navigator.userAgent;
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
      if (this.trackHeight <= 1) return;
      this.trackElement.style.height = '';
      var checkTrackHeight = this.trackElement.clientHeight == 0;
      var isTrackHeight = this.windowHeight;
      var calTrackHeight = isTrackHeight * this.trackHeight;

      if (checkTrackHeight) {
        this.trackElement.style.height = this.windowHeight + 'px';
      }

      this.trackElement.style.height = calTrackHeight + 'px';
    },
    setTrackStyle: function () {
      if (!!!this.trackElement) return;

      if (this.useFixed && window.getComputedStyle(this.trackElement).position == 'static') {
        this.trackElement.style.position = 'relative';
      }
    },
    setFixedStyle: function () {
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
      } else if (this.winScrollTop >= this.trackTopOffset && this.winScrollBottom <= this.trackBottomOffset) {
        this.fixedElement.style.position = 'fixed';
        this.fixedElement.style.top = '0';
      } else if (this.winScrollBottom >= this.trackBottomOffset) {
        this.fixedElement.style.position = 'absolute';
        this.fixedElement.style.top = this.trackElement.clientHeight - this.fixedElement.clientHeight + 'px';
      }

      ;
    }
  };

  fn.getWheelDirection = function () {
    if (this.winScrollTop >= this.oldWinScrollTop) {
      this.wheelDirection = 'down';
    } else {
      this.wheelDirection = 'up';
    }

    this.oldWinScrollTop = this.winScrollTop;
  };

  fn.getProgress = function () {
    var trackTopOffset = this.utilList.getOffset.call(this, this.trackElement).top - this.windowHeight * this.correction,
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
  };

  fn.getFixedState = function () {
    if (this.progress > 0 && this.progress < 100) {
      this.isFixedArea = true;
    } else {
      this.isFixedArea = false;
    }
  };

  fn.trackAnimation = function (callback) {
    if (!this.initialize) return;
    this.winScrollTop = this.utilList.getScroll.call(this).top;
    this.winScrollBottom = this.utilList.getScroll.call(this).bottom;

    if (this.useFixed) {
      this.elementEventList.setFixedElement.call(this);
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
  };

  fn.activeAnimation = function () {
    if (!this.initialize) return;
    this.winScrollTop = this.utilList.getScroll.call(this).top;
    this.winScrollBottom = this.utilList.getScroll.call(this).bottom;
    this.trackElementHeight = this.trackElement.clientHeight;
    this.correctionValue = this.trackElementHeight * this.correction;
    this.removeCorrectionValue = this.trackElementHeight * this.removeCorrection;
    this.elementOffsetTop = this.utilList.getOffset.call(this, this.trackElement).top;
    this.elementOffsetBottom = this.utilList.getOffset.call(this, this.trackElement).bottom;
    this.downScrollTop = this.winScrollTop - this.correctionValue;
    this.downScrollBottom = this.winScrollBottom - this.correctionValue;
    this.upScrollTop = this.winScrollTop + this.correctionValue;
    this.upScrollBottom = this.winScrollBottom + this.correctionValue;
    var self = this;
    var visibleType = this.activeVisibility,
        removeType = this.activeType,
        corrHeight = this.windowHeight / 2;

    var addActiveClass = function () {
      if (!!!self.activeClass) return;

      if (typeof self.activeClass == 'object') {
        var classLength = self.activeClass.length;

        for (var i = 0; i < classLength; i++) {
          if (!self.activeElement.classList.contains(self.activeClass[i])) {
            self.activeElement.classList.add(self.activeClass[i]);
          }
        }
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
  }; //TO-DO: 네이밍 변경


  fn.getElementInformation = function () {
    if (this.trackElement) {
      this.elementInformation.trackElement = {
        element: this.trackElement,
        width: this.trackElement.clientWidth,
        height: this.trackElement.clientHeight,
        topOffset: this.utilList.getOffset.call(this, this.trackElement).top,
        bottomOffset: this.utilList.getOffset.call(this, this.trackElement).bottom
      };
    }

    ;

    if (this.activeElement) {
      this.elementInformation.activeElement = {
        element: this.activeElement,
        width: this.activeElement.clientWidth,
        height: this.activeElement.clientHeight,
        topOffset: this.utilList.getOffset.call(this, this.activeElement).top,
        bottomOffset: this.utilList.getOffset.call(this, this.activeElement).bottom
      };
    }

    ;
    return this.elementInformation;
  };

  fn.destroy = function (e) {
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

  var imageLoader = function (opts) {
    var init = function () {
      this.opts = opts;
      this.lazyCompleteClass = 'load-complete';
      this.lazyClass = opts.lazyClass;
      this.responsiveClass = opts.responsiveClass;
      this.loadOption = opts.loadOption;
      this.targetAttr = opts.loadOption[0].attribute;
      this.visiblePoint = !!!opts.visiblePoint ? 0 : opts.visiblePoint;
      this.useDefaultImg = opts.useDefaultImg;
      this.getLazyImage();
      this.getResponsiveImage();
      this.bindEvent();
      return window.imageLoader = this;
    };

    var fn = init.prototype;

    fn.bindEvent = function () {
      var self = this,
          resizeTiming = null,
          responsiveCheck = this.loadOption;

      var lazyEvent = function () {
        self.setLazyImage();

        if (self.lazyLength == self.lazyCompleteLength) {
          window.removeEventListener('scroll', lazyEvent);
        }
      };

      if (this.useDefaultImg) {
        this.setDefaultImage();
      }

      window.addEventListener('load', function () {
        self.responsiveHandler();
        lazyEvent();
      });
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

    fn.getLazyImage = function () {
      var lazyImageList = document.querySelectorAll(this.lazyClass);
      this.lazyImages = lazyImageList;
      this.lazyLength = lazyImageList.length;
    };

    fn.checkCompleteImage = function () {
      var lazyCompleteList = document.querySelectorAll('.' + this.lazyCompleteClass);
      this.lazyCompleteLength = lazyCompleteList.length;
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

    fn.setResponsiveImage = function (imageTarget) {
      if (imageTarget) {
        for (var i = 0; i < imageTarget.length; i++) {
          var targetImage = imageTarget[i],
              imgSrc = imageTarget[i].getAttribute(this.targetAttr);

          if (!imageTarget[i].classList.contains(this.lazyCompleteClass)) {
            imageTarget[i].setAttribute('src', imgSrc);
            imageTarget[i].classList.add(this.lazyCompleteClass);
          }
        }
      } else {
        for (var i = 0; i < this.responsiveLength; i++) {
          var targetImage = this.responsiveImages[i],
              imgSrc = targetImage.getAttribute(this.targetAttr);

          if (!!!imgSrc) {
            imgSrc = this.findImageHandler(targetImage);
          }

          if (targetImage.classList.contains(this.lazyCompleteClass)) {
            targetImage.setAttribute('src', imgSrc);
          }
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
    };

    fn.findImageHandler = function (element) {
      if (this.attrIndex !== 0) {
        return this.findNextImageAttr(element);
      } else {
        return this.findRemainingImageAttr(element);
      }
    };

    fn.setLazyImage = function () {
      var self = this;
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

        if ((scrollBottom > targetOffsetTop && scrollTop <= targetOffsetTop || scrollTop < targetOffsetBottom && scrollBottom > targetOffsetBottom || scrollTop < targetOffsetTop && scrollBottom > targetOffsetBottom || scrollTop > targetOffsetTop && scrollBottom < targetOffsetBottom) && targetElement.offsetParent != null) {
          var imgSrc = targetElement.getAttribute(this.targetAttr);

          if (!!!imgSrc) {
            imgSrc = this.findImageHandler(targetElement);
          }

          if (!targetElement.classList.contains(this.lazyCompleteClass)) {
            targetElement.setAttribute('src', imgSrc);

            (function (imgElement) {
              var imageLoadEvent = function () {
                if (self.opts.lazyClass.split(' ').length == 1) imgElement.classList.remove(removeClass);
                imgElement.classList.add(self.lazyCompleteClass);
                self.checkCompleteImage();
                imgElement.removeEventListener('load', imageLoadEvent);
              };

              imgElement.addEventListener('load', imageLoadEvent);
            })(targetElement);
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

  var scrollController = function (opt) {
    var opt = opt ? opt : {},
        agent = navigator.userAgent.toLowerCase(),
        targetElement = document.scrollingElement || document.documentElement || document.body.parentNode || document.body,
        speed = !!!opt.speed ? 120 : opt.speed,
        duration = opt.duration >= 0 ? opt.duration : 1,
        scrollSize = targetElement.scrollTop,
        maxScrollSize,
        frameElement = targetElement === document.body && document.documentElement ? document.documentElement : targetElement,
        // safari is the new IE
    moveState = false,
        scrollTiming = null;

    var init = function () {
      if (agent.indexOf("chrome") == -1 && agent.indexOf("safari") != -1) return;
      bindEvent.wheel();
      bindEvent.scroll();
    };

    var bindEvent = {
      wheel: function () {
        if (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1 || agent.indexOf("msie") != -1) {
          document.addEventListener('mousewheel', function (e) {
            if (document.documentElement.style.overflow == 'hidden') return;
            eventList.scrollEvent(e);
          }, {
            passive: false
          });
        } else {
          document.addEventListener('wheel', function (e) {
            eventList.scrollEvent(e);
          }, {
            passive: false
          });
        }

        ;
      },
      scroll: function () {
        window.addEventListener('scroll', function () {
          if (document.documentElement.style.overflow == 'hidden') return;

          if (!moveState) {
            scrollSize = targetElement.scrollTop;
          }
        });
      }
    };
    var eventList = {
      scrollEvent: function (e) {
        e.preventDefault();
        var fixedMoveSpeed = document.body.getAttribute('data-scroll-speed');
        var delta = this.normalizeWheelDelta(e),
            moveSpeed = opt.currDelta && fixedMoveSpeed ? fixedMoveSpeed : !!!fixedMoveSpeed && !!!speed ? 120 : speed;
        scrollSize = scrollSize + -delta * moveSpeed; //현재까지 스크롤한 사이즈

        maxScrollSize = Math.max(0, Math.min(scrollSize, targetElement.scrollHeight - frameElement.clientHeight)); //최대 스크롤 사이즈

        this.update();
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
          ease: "power1.out",
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

        if (scrollSize <= 0) {
          scrollSize = 0;
        } else if (scrollSize >= maxScrollSize) {
          scrollSize = maxScrollSize;
        }
      }
    };

    var requestAnimationFrame = function () {
      // requestAnimationFrame cross browser
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (func) {
        window.setTimeout(func, 1000 / 50);
      };
    }();

    return init();
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

  var checkFold = function () {
    var foldState;
    var screenRatio = screen.width / screen.height;
    var isFold = checkTouchDevice() && screenRatio > 0.7137 && screenRatio < 0.80 && document.getElementsByName('viewport')[0].content == 'width=768';
    var isFoldLatest = checkTouchDevice() && screenRatio > 0.80 && screenRatio < 0.95 && document.getElementsByName('viewport')[0].content == 'width=768';

    if (isFold) {
      foldState = 'isFold';
    } else if (isFoldLatest) {
      foldState = 'isFoldLatest';
    }

    return foldState;
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
    },
    scrollController: function (opt) {
      scrollController(opt);
    },
    resizeScrollOffset: function (opt) {
      resizeScrollOffset(opt);
    },
    checkTouchDevice: checkTouchDevice,
    checkFold: checkFold,
    deviceConsole: deviceConsole,
    percentToPixel: percentToPixel
  };
}();