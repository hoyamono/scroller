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
		this.opts = opts;
		this.correction = (!!!opts.correction ? 0 : opts.correction);
		this.trackHeight = !!!opts.trackHeight ? 0 : opts.trackHeight;
		this.activeCallbackClass = !!!opts.activeCallbackClass ? 'callback-active' : opts.activeCallbackClass;
		this.useFixed = !!!opts.useFixed ? false : opts.useFixed;
		this.activeVisibility = !!!opts.activeVisibility ? 'before' : opts.activeVisibility;
		this.activePlay = !!!opts.activePlay ? 'revers' : this.opts.activePlay;
		console.log(this.activePlay)
		this.resize = !!!opts.resize ? false : opts.resize;
		this.windowHeight = window.innerHeight;
		this.setElement();
		this.bindEvent();
	};

	var fn = init.prototype;

	fn.bindEvent = function(){
		var self = this;

		if (!this.resize) {
			this.elementHandler();
		} else {
			window.addEventListener('load', function(){
				self.windowHeight = window.innerHeight;
				self.elementHandler();
			});
	
			window.addEventListener('resize', function(){
				self.windowHeight = window.innerHeight;
				self.elementHandler();
			});
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
		
				var wheelDelta = e.wheelDelta / 3;

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
		this.fixedElement.style.height = this.windowHeight + 'px';
		this.fixedElement.style.position = 'absolute';
		this.fixedElement.style.top = '0';
	}

	fn.setFixedElement = function(){
		this.diffHeight = this.windowHeight - this.fixedElement.clientHeight;
		this.trackTopOffset = this.getOffset(this.trackElement).top;
		this.trackBottomOffset = this.getOffset(this.trackElement).bottom;

		if (this.winScrollTop <= this.trackTopOffset) {
			this.fixedElement.style.position = 'absolute';
			this.fixedElement.style.top = '0';
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
		this.winScrollTop = this.getScroll().top;
		this.winScrollbottom = this.getScroll().bottom;

		if (this.opts.useFixed) {
			this.setFixedElement();
		}
		
		this.getProgress();
		callback.call(this);					
	}

	fn.activeAnimation = function(){
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
	}

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

	return {
		calRange: function(values){
			return calRange(values);
		}
	}
})();
