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

	var fn = init.prototype;

	fn.calValue = function(progress){
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
		onComplete: function(){
			if (this.onComplete){
				this.onComplete();
			}

			this.activeonComplete = true;
			this.completeOnCallback = true;

			this.activeonReverseStart = false;
			this.activeonReverseComplete = false;
			this.completeReverseCallback = false;
		},
		onReverseStart: function(){
			if (this.onReverseStart) {
				this.onReverseStart();
			}

			this.activeonReverseStart = true;
		},
		onReverseComplete: function(){
			if (this.onReverseComplete) {
				this.onReverseComplete();
			}

			this.activeonReverseComplete = true;
			this.completeReverseCallback = true;

			this.activeOnStart = false;
			this.activeonComplete = false;
			this.completeOnCallback = false;
		},
		onUpdate: function(){
			if (this.onUpdate) {
				this.onUpdate();
			}
		}
	}

	fn.checkScrollType = function(progress){
		if (progress > this.activeStartPoint && progress < this.activeEndPoint && !this.completeOnCallback && !this.activeOnStart && this.isDirection == 'down') {
			return 'onStart';
		} else if (progress > this.activeEndPoint && !this.completeOnCallback && !this.activeonComplete && this.isDirection == 'down') {
			return 'onComplete';
		} else if (progress < this.activeEndPoint && this.completeOnCallback && !this.activeonReverseStart && this.isDirection == 'up') {
			return 'onReverseStart';
		} else if (progress < this.activeStartPoint && this.completeOnCallback && !this.activeonReverseComplete && this.isDirection == 'up') {
			return 'onReverseComplete';
		} else if (this.activeOnStart && !this.activeonComplete && this.isDirection == 'down' ||
			this.activeOnStart && !this.activeonComplete && this.isDirection == 'up' ||
			this.activeonReverseStart && !this.activeonReverseComplete && this.isDirection == 'down'||
			this.activeonReverseStart && !this.activeonReverseComplete && this.isDirection == 'up') {
			return 'onUpdate';
		}
	};

	fn.activeAnimation = function(progress) {
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
				if (progress > this.activeStartPoint &&
					!this.activeonReverseStart &&
					!this.activeonReverseComplete &&
					!this.completeReverseCallback &&
					!this.activeOnStart &&
					!this.activeonComplete &&
					!this.completeOnCallback) {
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

	return function(opts){
		return new init(opts);
	}
})();