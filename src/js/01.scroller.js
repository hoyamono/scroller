/*!
 * Scrolle JavaScript Library v1.0.2
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-09
 */

'use strict'

var SCROLLER = (function(){
	var init = function(opts){
		this.initialize = true;
		this.opts = opts;
		this.correction = (!!!opts.correction ? 0 : opts.correction);
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
			visibleTyle = this.activeVisibility,
			removeType = this.activePlay,
			corrHeight = this.windowHeight / 2;

		var addActiveClass = function(){
			if (typeof(self.activeClass) == 'object') {
				var classLength = self.activeClass.length;

				for (var i = 0; i < classLength; i++) {
					if (!self.activeElement.classList.contains(self.activeClass[i])) {
						self.activeElement.classList.add(self.activeClass[i]);
					}
				};
			} else {
				if (!self.activeElement.classList.contains(self.activeClass)) {
					self.activeElement.classList.add(self.activeClass);
				}
			}
			
		};

		var removeActiveClass = function(){
			if (typeof(self.activeClass) == 'object') {
				var classLength = self.activeClass.length;

				for (var i = 0; i < classLength; i++) {
					if (self.activeElement.classList.contains(self.activeClass[i])) {
						self.activeElement.classList.remove(self.activeClass[i]);
					}
				};
			} else {
				if (self.activeElement.classList.contains(self.activeClass)) {
					self.activeElement.classList.remove(self.activeClass);
				}
			}

			if (self.activeElement.classList.contains(self.activeCallbackClass)) {
				self.activeElement.classList.remove(self.activeCallbackClass);
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
			activeCallback();
			addActiveClass();
		};

		var removeHandler = function(){
			endCallback();
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