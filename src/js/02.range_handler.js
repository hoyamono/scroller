/*!
 * Range-Handler JavaScript Library v1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-10
 */

var RANGEHANDLER = (function(){
	var init = function(opts){
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
	}

	var fn = init.prototype;

	fn.calValue = function(progress){
		if (this.startPoint > 0) {
			var endPoint = this.endPoint - this.startPoint > 0 ? this.endPoint - this.startPoint : this.endPoint;
		}
	
		var returnValue = this.targetValue * (progress - this.startPoint) / endPoint;
	
		if (returnValue > this.targetValue) {
			returnValue = this.targetValue;
		}
	
		if (returnValue < 0) {
			returnValue = 0;
		}

		return returnValue;
	};

	fn.checkWheelDirection = function(){
		this.windowScroll = window.pageYOffset;
		if (this.oldScroll < this.windowScroll) {
			this.oldScroll = this.windowScroll;
			return 'down';
		} else {
			this.oldScroll = this.windowScroll;
			return 'up';
		}
	}

	fn.callBackList = {
		onStart: function(){
			if (this.onStart) {
				this.onStart();
			}

			this.activeOnStart = true;
		},
		onComplate: function(){
			if (this.onComplate){
				this.onComplate();
			}

			this.activeOnComplate = true;
			this.complateOnCallback = true;

			this.activeReverseStart = false;
			this.activeReverseComplate = false;
			this.complateReverseCallback = false;
		},
		reverseStart: function(){
			if (this.reverseStart) {
				this.reverseStart();
			}

			this.activeReverseStart = true;
		},
		reverseComplate: function(){
			if (this.reverseComplate) {
				this.reverseComplate();
			}

			this.activeReverseComplate = true;
			this.complateReverseCallback = true;

			this.activeOnStart = false;
			this.activeOnComplate = false;
			this.complateOnCallback = false;
		},
		onUpdate: function(){
			if (this.onUpdate) {
				this.onUpdate();
			}
		}
	}

	fn.checkScrollType = function(progress){
		if (progress > this.activeStartPoint && progress < this.activeEndPoint && !this.complateOnCallback && !this.activeOnStart && this.isDirection == 'down') {
			return 'onStart';
		} else if (progress > this.activeEndPoint && !this.complateOnCallback && !this.activeOnComplate && this.isDirection == 'down') {
			return 'onComplate';
		} else if (progress < this.activeEndPoint && this.complateOnCallback && !this.activeReverseStart && this.isDirection == 'up') {
			return 'reverseStart';
		} else if (progress < this.activeStartPoint && this.complateOnCallback && !this.activeReverseComplate && this.isDirection == 'up') {
			return 'reverseComplate';
		} else if (this.activeOnStart && !this.activeOnComplate && this.isDirection == 'down' ||
			this.activeOnStart && !this.activeOnComplate && this.isDirection == 'up' ||
			this.activeReverseStart && !this.activeReverseComplate && this.isDirection == 'down'||
			this.activeReverseStart && !this.activeReverseComplate && this.isDirection == 'up') {
			return 'onUpdate';
		}
	};

	fn.activeAnimation = function(progress) {
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
				if (progress > this.activeStartPoint &&
					!this.activeReverseStart &&
					!this.activeReverseComplate &&
					!this.complateReverseCallback &&
					!this.activeOnStart &&
					!this.activeOnComplate &&
					!this.complateOnCallback) {
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

	return function(opts){
		return new init(opts);
	}
})();