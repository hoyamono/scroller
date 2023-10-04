/*!
 * Scrolle JavaScript Library v1.1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2023-09-27
 */

'use strict'

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
	};

	static getOffset(element) {
		let top = element.getBoundingClientRect().top + window.pageYOffset,
			bottom = element.getBoundingClientRect().bottom + window.pageYOffset;
		return {
			top: top,
			bottom: bottom
		};
	};

	static IEScrollHandler() {
		if (navigator.userAgent.match(/Trident\/7\./)){
			this.body.addEventListener('mousewheel', (e)=>{
				e.preventDefault();
				let wheelDelta = e.wheelDelta,
					currentScrollPosition = window.pageYOffset;
				window.scrollTo(0, currentScrollPosition - wheelDelta);
			});
			this.body.addEventListener('keydown', (e)=>{
				let currentScrollPosition = window.pageYOffset;

				switch (e.which){
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
	};

	bindEvent() {
		let setTimeing = null;

		this.elementHandler();

		if (this.resize){
			this.addEventList = ()=>{
				if (!this.resizeTiming){
					this.windowHeight = window.innerHeight;
					this.elementHandler();
				} else {
					clearTimeout(setTimeing);
					setTimeing = setTimeout(()=>{
						this.windowHeight = window.innerHeight;
						this.elementHandler();
					}, this.resizeTiming);
				}
			};
			window.addEventListener('resize', this.addEventList);
		}
		
		if (this.opts.IEScroll){
			Scroller.IEScrollHandler();
		}

		if (this.opts.trackElement !== undefined) {
			this.trackElement.scroller = this;
		}
	};

	elementHandler() {
		this.setTrackStyle.call(this);
		this.getFixedState();

		if (this.trackHeight > 1){
			this.setTrackHeigh.call(this);
		}

		if (this.useFixed && this.useFixedStyle){
			this.setFixedStyle.call(this);
		}

		return this;
	};

	checkTouchDevice() {
		if (navigator.userAgent.indexOf('Windows') > -1 || navigator.userAgent.indexOf('Macintosh') > -1) {
			return this.checkTouchDevice = false;
		} else if ('ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch)) {
			return this.checkTouchDevice = true;
		}
	};

	setElement() {
		this.body = document.querySelector('body');

		if (this.opts.trackElement !== undefined){
			this.trackElement = this.opts.trackElement.jquery ? this.opts.trackElement[0] : this.opts.trackElement;
		}

		if (this.opts.fixedElement !== undefined){
			this.fixedElement = this.opts.fixedElement.jquery ? this.opts.fixedElement[0] : this.opts.fixedElement;
		}

		if (this.opts.activeElement !== undefined){
			this.activeElement = this.opts.activeElement.jquery ? this.opts.activeElement[0] : this.opts.activeElement;
		}
	};

	setTrackHeigh() {
		if (this.trackHeight <= 1) return;

		this.trackElement.style.height = '';

		let checkTrackHeight = this.trackElement.clientHeight == 0;
		let isTrackHeight = this.windowHeight;

		let calTrackHeight = isTrackHeight * this.trackHeight;

		if (checkTrackHeight){
			this.trackElement.style.height = this.windowHeight + 'px';
		}

		this.trackElement.style.height = calTrackHeight + 'px';
	};

	setTrackStyle() {
		if (!!!this.trackElement) return;

		if (this.useFixed && window.getComputedStyle(this.trackElement).position == 'static'){
			this.trackElement.style.position = 'relative';
		}
	};

	setFixedStyle() {
		if (!this.isFixedArea) {
			this.fixedElement.style.height = '';
			this.fixedElement.style.top = '';
			this.fixedElement.style.position = 'absolute';
		}

		if (this.fixedElement.clientWidth == 0){
			this.fixedElement.style.width = '100%';
		}

		if (this.autoHeight) {
			if (typeof this.offsetY == 'string'){
				this.fixedElement.style.height = 'calc(' + this.windowHeight + 'px - ' + this.offsetY + ')';
				this.fixedElement.style.top = this.offsetY;
			} else {
				this.fixedElement.style.height = (this.windowHeight - this.offsetY) + 'px';
				this.fixedElement.style.top = this.offsetY + 'px';
			}
		}
	};

	setFixedElement() {
		this.diffHeight = this.windowHeight - this.fixedElement.clientHeight;
		this.trackTopOffset = Scroller.getOffset(this.trackElement).top;
		this.trackBottomOffset = Scroller.getOffset(this.trackElement).bottom;

		if (this.winScrollTop <= this.trackTopOffset){
			this.fixedElement.style.position = 'absolute';

			if (typeof this.offsetY == 'string'){
				this.fixedElement.style.top = this.offsetY;
			} else {
				this.fixedElement.style.top = this.offsetY + 'px';
			}

			this.fixedElement.style.bottom = '';
		} else if (this.winScrollBottom >= this.trackBottomOffset){
			this.fixedElement.style.position = 'absolute';
			this.fixedElement.style.top = this.trackElement.clientHeight - this.fixedElement.clientHeight + 'px';
		} else {
			if (!this.isFixedArea) {
				this.fixedElement.style.position = 'fixed';
				this.fixedElement.style.top = '0';
			}
		};
	};

	getWheelDirection() {
		if (this.winScrollTop >= this.oldWinScrollTop){
			this.wheelDirection = 'down';
		} else {
			this.wheelDirection = 'up';
		}

		this.oldWinScrollTop = this.winScrollTop;
	};

	getProgress() {
		let trackTopOffset = Scroller.getOffset(this.trackElement).top - this.windowHeight * this.correction,
			trackHeight = this.useFixed ? Math.abs(this.trackElement.clientHeight - this.windowHeight) : this.useViewportOver ? this.trackElement.clientHeight + this.windowHeight : this.trackElement.clientHeight,
			scrollTop = this.winScrollTop - trackTopOffset,
			scrollBottom = this.winScrollBottom - trackTopOffset,
			calProgress = this.useFixed ? scrollTop / trackHeight * 100 : scrollBottom / trackHeight * 100;

		if (this.useStrictMode){
			this.progress = Math.floor(calProgress) < 0 ? 0 : Math.floor(calProgress) > 100 ? 100 : Math.floor(calProgress);
		} else {
			this.progress = calProgress;
		};

		this.getWheelDirection();

		return this.progress;
	};

	getFixedState() {
		if(this.progress > 0 && this.progress < 100) {
			this.isFixedArea = true;
		} else {
			this.isFixedArea = false;
		}
	};

	trackAnimation(callback) {
		if (!this.initialize) return;
		this.winScrollTop = Scroller.getScroll(this.windowHeight).top;
		this.winScrollBottom = Scroller.getScroll(this.windowHeight).bottom;

		if (this.useFixed){
			this.setFixedElement.call(this);
		};

		this.getProgress();
		this.getFixedState();

		if (callback){
			if (this.oldPregress !== this.progress){
				callback.call(this);
			};
			this.oldPregress = this.progress;
		};
	};

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

		const addActiveClass = ()=>{
			if (!!!this.activeClass) return;

			if (typeof this.activeClass == 'object'){
				let classLength = this.activeClass.length;

				for (let i = 0; i < classLength; i++){
					if (!this.activeElement.classList.contains(this.activeClass[i])){
						this.activeElement.classList.add(this.activeClass[i]);
					}
				}
			} else {
				if (!this.activeElement.classList.contains(this.activeClass)){
					this.activeElement.classList.add(this.activeClass);
				}
			}
		};

		const removeActiveClass = ()=>{
			if (typeof this.activeClass == 'object'){
				let classLength = this.activeClass.length;

				for (let i = 0; i < classLength; i++){
					if (this.activeElement.classList.contains(this.activeClass[i])){
						this.activeElement.classList.remove(this.activeClass[i]);
					}
				}
			} else {
				if (this.activeElement.classList.contains(this.activeClass)){
					this.activeElement.classList.remove(this.activeClass);
				}
			}

			if (this.activeElement.classList.contains(this.activeCallbackClass)){
				this.activeElement.classList.remove(this.activeCallbackClass);
			}
		};

		const activeCallback = ()=>{
			if (!this.activeElement.classList.contains(this.activeCallbackClass)){
				if (!!!this.opts.activeCallback) return;
				this.opts.activeCallback.call(self);
				this.activeElement.classList.add(this.activeCallbackClass);
			}
		};

		const endCallback = ()=>{
			if (this.activeElement.classList.contains(this.activeCallbackClass)){
				if (!!!this.opts.endCallback) return;
				this.opts.endCallback.call(self);
			}
		};

		const activeHandler = ()=>{
			activeCallback();
			addActiveClass();
		};

		const removeHandler = ()=>{
			endCallback();
			removeActiveClass();
		};

		this.getWheelDirection();

		switch (visibleType){
			case 'before':
				if (this.wheelDirection == 'down' && this.downScrollBottom >= this.elementOffsetTop && this.downScrollTop <= this.elementOffsetTop ||
					this.wheelDirection == 'up' && this.upScrollTop <= this.elementOffsetBottom && this.upScrollBottom >= this.elementOffsetBottom ||
					this.activeType == 'oneWay' && this.downScrollBottom >= this.elementOffsetTop){
					activeHandler();
					this.activeStatus = true;
				}

				break;

			case 'visible':
				if (this.wheelDirection == 'down' && this.downScrollBottom >= this.elementOffsetTop + corrHeight && this.downScrollTop <= this.elementOffsetTop ||
					this.wheelDirection == 'up' && this.upScrollTop <= this.elementOffsetBottom - corrHeight && this.upScrollBottom >= this.elementOffsetBottom ||
					this.activeType == 'oneWay' && this.downScrollBottom >= this.elementOffsetTop + corrHeight){
					activeHandler();
					this.activeStatus = true;
				}

				break;
		}

		switch (removeType){
			case 'reverse':
				if (visibleType == 'visible'){
					if (this.activeStatus && this.wheelDirection == 'down' && this.winScrollTop > this.elementOffsetBottom ||
						this.activeStatus && this.wheelDirection == 'up' && this.winScrollBottom < this.elementOffsetTop){
						removeHandler();
						this.activeStatus = false;
					}
				} else {
					if (this.activeStatus && this.winScrollTop < this.elementOffsetTop && this.winScrollBottom < this.elementOffsetTop ||
						this.activeStatus && this.winScrollTop > this.elementOffsetBottom && this.winScrollBottom > this.elementOffsetBottom){
						removeHandler();
						this.activeStatus = false;
					}
				}

				break;

			case 'oneWay':
				if (visibleType == 'visible'){
					if (this.activeStatus && this.winScrollBottom < this.elementOffsetTop){
						removeHandler();
						this.activeStatus = false;
					}
				} else {
					if (this.activeStatus && this.winScrollTop < this.elementOffsetTop && this.winScrollBottom < this.elementOffsetTop){
						removeHandler();
						this.activeStatus = false;
					}
				}

				break;
		}
	};

	getElementInformation() {
		if (this.trackElement){
			this.elementInformation.trackElement = {
				element: this.trackElement,
				width: this.trackElement.clientWidth,
				height: this.trackElement.clientHeight,
				topOffset: Scroller.getOffset(this.trackElement).top,
				bottomOffset: Scroller.getOffset(this.trackElement).bottom
			}
		};

		if (this.activeElement){
			this.elementInformation.activeElement = {
				element: this.activeElement,
				width: this.activeElement.clientWidth,
				height: this.activeElement.clientHeight,
				topOffset: Scroller.getOffset(this.activeElement).top,
				bottomOffset: Scroller.getOffset(this.activeElement).bottom
			}
		};

		return this.elementInformation;
	}

	destroy() {
		if (!!this.trackElement){
			this.trackElement.style.position = '';
			this.trackElement.style.height = '';
		}
		if (!!this.fixedElement){
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
}

const SCROLLER = function(opts){
	return new Scroller(opts)
};