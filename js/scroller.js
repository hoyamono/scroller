/*!
 * Scrolle JavaScript Library v1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-01
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
		this.activePlay = !!!opts.activePlay ? 'revers' : this.opts.activePlay;
		this.offsetY = !!!opts.offsetY ? 0 : opts.offsetY;
		this.resize = !!!opts.resize ? false : opts.resize;
		this.windowHeight = window.innerHeight;
		this.setElement();
		this.bindEvent();
	};

	var fn = init.prototype;

	fn.bindEvent = function(){
		var self = this;

		this.elementHandler();
		if (this.resize) {
			this.addEventList = function(){
				self.windowHeight = window.innerHeight;
				self.elementHandler();
			};
			window.addEventListener('load', this.addEventList);
			window.addEventListener('resize', this.addEventList);
		}
		if (this.opts.IEScroll) {
			this.IEScrollHandler();
		}

	};

	fn.elementHandler = function(){
		if (this.trackHeight > 1) {
			this.setTrackHeigh();
		}
		if (this.useFixed) {
			this.setFixedHeight();
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

	fn.setFixedHeight = function(){
		this.fixedElement.style.height = '';
		this.fixedElement.style.top = '';
		this.fixedElement.style.position = 'absolute';

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
				self.opts.activeCallback.call(self);
				self.activeElement.classList.add(self.activeCallbackClass);
			}
		};

		var endCallback = function(){
			if (self.activeElement.classList.contains(self.activeCallbackClass)) {
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
			case 'revers':
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

	return {
		calRange: function(values){
			return calRange(values);
		},
		videoObjectFit: function(opts){
			videoObjectFit(opts);
		}
	}
})();
