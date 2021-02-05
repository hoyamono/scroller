/*!
 * Scrolle JavaScript Library v1.0.1
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-04
 */

'use strict'

var SCROLLER = (function(){
	var init = function(opts){
		this.initialize = true;
		this.opts = opts;
		this.correction = (!!!opts.correction ? 0 : opts.correction);
		this.trackHeight = !!!opts.trackHeight ? 0 : opts.trackHeight;
		this.activeCallbackClass = !!!opts.activeCallbackClass ? 'callback-active' : opts.activeCallbackClass;
		this.useFixed = !!!opts.useFixed ? false : opts.useFixed;
		this.activeVisibility = !!!opts.activeVisibility ? 'before' : opts.activeVisibility;
		this.activePlay = !!!opts.activePlay ? 'reverse' : this.opts.activePlay;
		this.offsetY = !!!opts.offsetY ? 0 : opts.offsetY;
		this.resize = !!!opts.resize ? false : opts.resize;
		this.resizeTiming = !!!opts.resizeTiming ? false : opts.resizeTiming;
		this.windowHeight = window.innerHeight;
		this.setElement();
		this.bindEvent();
	};

	var fn = init.prototype;

	fn.bindEvent = function(){
		var self = this,
			setTimeing = null;

		this.elementHandler();
		if (this.resize) {
			this.addEventList = function(){
				if (!self.resizeTiming) {
					self.windowHeight = window.innerHeight;
					self.elementHandler();
				} else {
					clearTimeout(setTimeing);

					setTimeing = setTimeout(function(){
						self.windowHeight = window.innerHeight;
						self.elementHandler();
					}, self.resizeTiming);
				}
			};
			window.addEventListener('load', this.addEventList);
			window.addEventListener('resize', this.addEventList);
		}
		if (this.opts.IEScroll) {
			this.IEScrollHandler();
		}

	};

	fn.elementHandler = function(){
		this.setTrackStyle();

		if (this.trackHeight > 1) {
			this.setTrackHeigh();
		}
		if (this.useFixed) {
			this.setFixedStyle();
		}

		return this;
	};

	fn.setElement = function(){
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
	};

	fn.IEScrollHandler = function(){
		if(navigator.userAgent.match(/Trident\/7\./)) {
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
		
					default: return;
				} 
			});
		}
	};

	fn.getScroll = function(){
		var top = window.pageYOffset,
			bottom =  top + this.windowHeight;

		return {
			top: top,
			bottom: bottom
		}
	};

	fn.getOffset = function(element){
		var top = element.getBoundingClientRect().top + window.pageYOffset,
			bottom = element.getBoundingClientRect().bottom + window.pageYOffset;

		return {
			top: top,
			bottom: bottom
		}
	};

	fn.setTrackHeigh = function(){
		this.trackElement.style.paddingTop = '',
		this.trackElement.style.paddingBottom = '';

		var isTrackHeight = this.trackElement.clientHeight,
			calTrackHeight = (isTrackHeight * this.trackHeight) - isTrackHeight;
		
		this.trackElement.style.paddingTop = (calTrackHeight / 2) +'px';
		this.trackElement.style.paddingBottom = (calTrackHeight / 2) +'px';
	};

	fn.setTrackStyle = function(){
		if (!!!this.trackElement) return;
		if (window.getComputedStyle(this.trackElement).position == 'static') {
			this.trackElement.style.position = 'relative'
		}
	};

	fn.setFixedStyle = function(){
		this.fixedElement.style.height = '';
		this.fixedElement.style.top = '';
		this.fixedElement.style.position = 'absolute';

		if (this.fixedElement.clientWidth == 0) {
			this.fixedElement.style.width = '100%';
		}

		if (typeof(this.offsetY) == 'string') {
			this.fixedElement.style.height = 'calc('+ this.windowHeight +'px - '+ this.offsetY +')';
			this.fixedElement.style.top = this.offsetY;
		} else {
			this.fixedElement.style.height = (this.windowHeight - this.offsetY) + 'px';
			this.fixedElement.style.top = this.offsetY + 'px';
		}
	}

	fn.setFixedElement = function(){
		this.diffHeight = this.windowHeight - this.fixedElement.clientHeight;
		this.trackTopOffset = this.getOffset(this.trackElement).top;
		this.trackBottomOffset = this.getOffset(this.trackElement).bottom;

		if (this.winScrollTop <= this.trackTopOffset) {
			this.fixedElement.style.position = 'absolute';
			if (typeof(this.offsetY) == 'string') {
				this.fixedElement.style.top = this.offsetY;
			} else {
				this.fixedElement.style.top = this.offsetY + 'px';
			}
			this.fixedElement.style.bottom = '';
		} else if(this.winScrollTop >= this.trackTopOffset && this.winScrollbottom <= this.trackBottomOffset) {
			this.fixedElement.style.position = 'fixed';
		} else if (this.winScrollbottom >= this.trackBottomOffset) {
			this.fixedElement.style.position = 'absolute';
			this.fixedElement.style.top = 'auto';
			this.fixedElement.style.bottom = '0px';
		}
	};

	fn.getProgress = function(){
		var trackTopOffset = this.getOffset(this.trackElement).top - (this.windowHeight * this.correction),
			trackHeight = this.trackElement.clientHeight - this.windowHeight,
			scrollTop = this.winScrollTop - trackTopOffset;
		
		this.progress = (scrollTop / trackHeight) * 100;

		if (this.progress < 0) {
			return this.progress = 0;
		} else if (this.progress > 100) {
			return this.progress = 100;
		} else {
			return this.progress;
		}
	};

	fn.trackAnimation = function(callback){
		if (!this.initialize) return;

		this.winScrollTop = this.getScroll().top;
		this.winScrollbottom = this.getScroll().bottom;

		if (this.useFixed) {
			this.setFixedElement();
		}
		
		this.getProgress();
		callback.call(this);					
	};

	fn.activeAnimation = function(){
		if (!this.initialize) return;

		this.winScrollTop = this.getScroll().top;
		this.winScrollBottom = this.getScroll().bottom;
		this.activeElementHeight = this.activeElement.clientHeight;
		this.correctionValue = this.activeElementHeight * this.correction;
		this.corScrollTop = this.winScrollTop + this.correctionValue;
		this.corScrollBottom = this.winScrollBottom - this.correctionValue;
		this.elementOffsetTop = this.getOffset(this.activeElement).top;
		this.elementOffsetBottom = this.getOffset(this.activeElement).bottom;

		var self = this,
			activeType = this.opts.activeClass ? 'addClass' : 'callback',
			visibleTyle = this.activeVisibility,
			removeType = this.activePlay,
			corrHeight = this.windowHeight / 2;

		var addActiveClass = function(){
			if (!self.activeElement.classList.contains(self.opts.activeClass)) {
				self.activeElement.classList.add(self.opts.activeClass);
			}
		};

		var removeActiveClass = function(){
			if (activeType == 'addClass') {
				if (self.activeElement.classList.contains(self.opts.activeClass)) {
					self.activeElement.classList.remove(self.opts.activeClass);
				}
			} else {
				if (self.activeElement.classList.contains(self.activeCallbackClass)) {
					self.activeElement.classList.remove(self.activeCallbackClass);
				}
			}
		};

		var activeCallback = function(){
			if (!self.activeElement.classList.contains(self.activeCallbackClass)) {
				if (!!!self.opts.activeCallback) return;
				self.opts.activeCallback.call(self);
				self.activeElement.classList.add(self.activeCallbackClass);
			}
		};

		var endCallback = function(){
			if (self.activeElement.classList.contains(self.activeCallbackClass)) {
				if (!!!self.opts.endCallback) return;
				self.opts.endCallback.call(self);
			}
		};

		var activeHandler = function(){
			switch (activeType) {
				case 'addClass' :
					addActiveClass();
				break;

				case 'callback' : 
					activeCallback();
				break;
			}
		};

		var removeHandler = function(){
			switch (activeType) {
				case 'callback' : 
					endCallback();
				break;
			}
			removeActiveClass();
		};

		switch (visibleTyle) {
			case 'before':
				if (self.corScrollBottom < self.elementOffsetBottom && self.corScrollBottom >= self.elementOffsetTop ||
					self.corScrollBottom < self.elementOffsetBottom && self.corScrollBottom >= self.elementOffsetBottom) {
					activeHandler();
				}
			break;

			case 'visible':
				if (self.corScrollBottom >= self.elementOffsetTop + corrHeight && self.corScrollTop  < self.elementOffsetTop) {
					activeHandler();
				}
			break;
		}

		switch (removeType) {
			case 'reverse':
				if (self.winScrollTop > self.elementOffsetBottom || self.winScrollBottom < self.elementOffsetTop ) {
					removeHandler();
				}
			break;

			case 'oneWay':
				if (self.winScrollBottom < self.elementOffsetTop ) {
					removeHandler();
				}
			break;
		}
	};

	fn.destroy = function(e){
		this.trackElement.style.position = '';
		this.trackElement.style.height = '',
		this.trackElement.style.paddingTop = '',
		this.trackElement.style.paddingBottom = '';

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

	return function(opts){
		return new init(opts);
	}
})();

var ANIUTIL = (function(){
	var calRange = function(values){
		var values = {
			targetValue: values.targetValue,
			progress: values.progress,
			startPoint: !!!values.startPoint ? 0 : values.startPoint,
			endPoint: !!!values.endPoint ? 100 : values.endPoint
		}
	
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
	}

	var videoObjectFit = function(opts){
		var init = function(opts){
			this.opts = opts;
			this.setElement();
			this.setVideoStyle();
			this.bindEvent();
		};

		var fn = init.prototype;

		fn.setElement = function(){
			if (this.opts.wrapElement !== undefined) {
				this.wrapElement = this.opts.wrapElement.jquery ? this.opts.wrapElement[0] : this.opts.wrapElement;
			}
	
			if (this.opts.targetVideo !== undefined) {
				this.targetVideo = this.opts.targetVideo.jquery ? this.opts.targetVideo[0] : this.opts.targetVideo;
			}
		};

		fn.setVideoStyle = function(){
			this.wrapElement.style.overflow = 'hidden';
			this.targetVideo.style.position = 'absolute';
			this.targetVideo.style.top = '50%';
			this.targetVideo.style.left = '50%';
			this.targetVideo.style.transform = 'translate(-50%, -50%)';
		}

		fn.bindEvent = function(){
			var self = this;

			window.addEventListener('load', function(){
				self.setVideoSize();

			});

			window.addEventListener('resize', function(){
				self.setVideoSize();
			});
		};

		fn.getVideoInfo = function(){
			this.wrapWidth = this.wrapElement.clientWidth;
			this.wrapHeight = this.wrapElement.clientHeight;
			this.videoWidth = this.targetVideo.clientWidth;
			this.videoHeight = this.targetVideo.clientHeight;
			this.wrapRatio = this.wrapHeight / this.wrapWidth;
			this.videoRatio = this.videoHeight / this.videoWidth;
		};

		fn.setVideoSize = function(){
			var self = this,
				timer = null;			

			clearTimeout(timer);

			timer = setTimeout(function(){
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
	}

	var imageLoader = function(opts){
		var init = function(){
			this.opts = opts;
			this.lazyClass = opts.lazyClass;
			this.responsiveClass = opts.responsiveClass;
			this.responsiveSize = opts.responsiveSize;
			this.targetAttr = opts.targetAttr;
			this.visiblePoint = !!!opts.visiblePoint ? 0 : opts.visiblePoint;
			this.useDefaultImg = opts.useDefaultImg;
			this.getLazyImage();
			this.getResponsiveImage();
			this.bindEvent();
		};

		var fn = init.prototype;

		fn.bindEvent = function(){
			var self = this,
				responsiveCheck = typeof(this.responsiveSize) == 'object' && typeof(this.targetAttr) == 'object';

			this.lazyEvent = function(){
				self.setLazyImage();
				if (self.lazyLength == 0) {
					window.removeEventListener('scroll', self.lazyEvent);
				}
			}

			window.addEventListener('DOMContentLoaded', function(){
				if (self.useDefaultImg) {
					self.setDefaultImage();
				}
				if (responsiveCheck) {
					self.setResponsiveInfo();
				}
				self.setLazyImage();
			});

			window.addEventListener('scroll', this.lazyEvent);

			if (responsiveCheck) {
				window.addEventListener('resize', function(){
					self.setResponsiveInfo();
				});	
			}
		};

		fn.getLazyImage = function(){
			var lazyImageList = document.querySelectorAll(this.lazyClass);

			this.lazyImages = lazyImageList;
			this.lazyLength = lazyImageList.length;
		};

		fn.getResponsiveImage = function(){
			var responsiveImageList = document.querySelectorAll(this.responsiveClass);

			this.responsiveImages = responsiveImageList;
			this.responsiveLength = responsiveImageList.length;
		};

		fn.setDefaultImage = function(){
			for (var i = 0; i < this.lazyLength; i++) {
				this.lazyImages[i].setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAh+QQFAAAAACwAAAAAAQABAAACAkQBADs=')
			};
		};

		fn.setResponsiveInfo = function(){
			this.windowWidth = window.innerWidth;

			for (var i = 0; i < this.responsiveSize.length; i++) {
				var nextIndex = i + 1,
					nextPoint = !!!this.responsiveSize[nextIndex] ? 0 : this.responsiveSize[nextIndex],
					checkPoint = false;
				if (i == 0) {
					checkPoint = this.windowWidth > nextPoint;
				} else {
					checkPoint = this.windowWidth <= this.responsiveSize[i] && this.windowWidth > nextPoint;
				}
				if (checkPoint) {
					if (this.opts.targetAttr[i] !== this.oldAttr) {
						this.targetAttr = this.opts.targetAttr[i];
						this.oldAttr = this.targetAttr;
						this.attrIndex = i;
						this.setResponsiveImage();
					}
				}
			}
		};

		fn.getOffset = function(element){
			var top = element.getBoundingClientRect().top + window.pageYOffset,
				bottom = element.getBoundingClientRect().bottom + window.pageYOffset;
	
			return {
				top: top,
				bottom: bottom
			}
		};

		fn.getScroll = function(){
			var top = window.pageYOffset,
				bottom =  top + this.windowHeight;
	
			return {
				top: top,
				bottom: bottom
			}
		};

		fn.setResponsiveImage = function(){
			for (var i = 0; i < this.responsiveLength; i++) {
				var targetImage = this.responsiveImages[i],
					imgSrc = targetImage.getAttribute(this.targetAttr);

				if (!!!imgSrc) {
					imgSrc = targetImage.getAttribute(this.opts.targetAttr[this.attrIndex - 1]);
				}

				if (targetImage.classList.contains('load-complete')) {
					targetImage.setAttribute('src', imgSrc);
				}
			}
		};

		fn.setLazyImage = function(){
			this.windowHeight = window.innerHeight;

			for (var i = 0; i < this.lazyLength; i++) {
				var targetElement = this.lazyImages[i],
					targetElementHeight = null,
					targetElementHeight = targetElement.clientHeight,
					corrHeight = this.windowHeight * this.visiblePoint,
					scrollTop = this.getScroll().top - corrHeight,
					scrollBottom = this.getScroll().bottom + corrHeight,
					targetOffsetTop = this.getOffset(targetElement).top,
					targetOffsetBottom = this.getOffset(targetElement).bottom,
					lazyClass = this.lazyClass.split('.'),
					removeClass = lazyClass[lazyClass.length-1];

				if (scrollBottom > targetOffsetTop && scrollTop <= targetOffsetTop ||
					scrollTop < targetOffsetBottom && scrollBottom > targetOffsetBottom||
					scrollTop < targetOffsetTop && scrollBottom > targetOffsetBottom ||
					scrollTop > targetOffsetTop && scrollBottom < targetOffsetBottom) {

					var imgSrc = targetElement.getAttribute(this.targetAttr);

					if (!!!imgSrc) {
						imgSrc = targetImage.getAttribute(this.opts.targetAttr[this.attrIndex - 1]);
					}

					targetElement.setAttribute('src', imgSrc);
					if (this.opts.lazyClass.split(' ').length == 1) {
						targetElement.classList.remove(removeClass);
					}
					targetElement.classList.add('load-complete')
					
					this.getLazyImage();
				}
			}
		};

		return new init(opts);
	}

	return {
		calRange: function(values){
			return calRange(values);
		},
		videoObjectFit: function(opts){
			videoObjectFit(opts);
		},
		imageLoader: function(opts){
			imageLoader(opts);
		}
	}
})();
