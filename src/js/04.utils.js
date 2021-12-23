/*!
 * ANI-Util JavaScript Library v1.0
 *
 * Copyright 2021. Yoon jae-ho
 * Released under the MIT license
 *
 * Date: 2021-02-09
 */

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
			this.resizeTiming = opts.resizeTiming ? opts.resizeTiming : 100;
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
			}, this.resizeTiming);
		};

		return new init(opts);
	}

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

			window.addEventListener('load', function() {
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

		fn.checkCompleteImage = function(){
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

		fn.setResponsiveImage = function () {
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
							var imageLoadEvent = function() {
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

	var addClass = function(opts){
		var classLength = opts.classList.length;

		for (var i = 0; i < classLength; i++) {
			opts.targetElement.classList.add(opts.classList[i]);
		};
	};

	var removeClass = function(opts){
		var classLength = opts.classList.length;

		for (var i = 0; i < classLength; i++) {
			opts.targetElement.classList.remove(opts.classList[i]);
		};
	};

	var scrollController = function (opt) {
		var opt = opt ? opt : {},
			agent = navigator.userAgent.toLowerCase(),
			targetElement = document.scrollingElement || document.documentElement || document.body.parentNode || document.body,
			speed = !!!opt.speed ? 120 : opt.speed ,
			duration = opt.duration >= 0 ? opt.duration : 1,
			scrollSize = targetElement.scrollTop,
			maxScrollSize,
			frameElement = targetElement === document.body && document.documentElement ? document.documentElement : targetElement, // safari is the new IE
			moveState = false,
			scrollTiming = null;

		var init = function(){
			if (agent.indexOf("chrome") == -1 && agent.indexOf("safari") != -1) return;
	
			bindEvent.wheel();
			bindEvent.scroll();
		};
	
		var bindEvent = {
			wheel: function(){
				if ((navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
					document.addEventListener('mousewheel', function (e) {
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
				};
	
	
			},
			scroll: function(){
				window.addEventListener('scroll', function () {
					if (!moveState) {
						scrollSize = targetElement.scrollTop;
					}
	
				});
			}
		};
	
		var eventList = {
			scrollEvent : function (e) {
				e.preventDefault();

				var fixedMoveSpeed = document.body.getAttribute('data-scroll-speed');

				var delta = this.normalizeWheelDelta(e),
					moveSpeed = opt.currDelta && fixedMoveSpeed ? fixedMoveSpeed : !!!fixedMoveSpeed && !!!speed ? 120 : speed;
	
				scrollSize = scrollSize + (-delta * moveSpeed); //현재까지 스크롤한 사이즈
				maxScrollSize = Math.max(0, Math.min(scrollSize, targetElement.scrollHeight - frameElement.clientHeight)); //최대 스크롤 사이즈
	
				this.update();
			},
			normalizeWheelDelta : function (e) {
				if (e.detail) {
					if (e.wheelDelta) {
						return e.wheelDelta / e.detail / 40 * (e.detail > 0 ? 1 : -1) // Opera
					} else {
						return -e.detail / 3 // Firefox
					}
				} else {
					return e.wheelDelta / 120 // IE,Safari,Chrome
				}
			},
			update : function () {
				var moveRange = (maxScrollSize - targetElement.scrollTop),
					moveSize = 0 >= Math.ceil(targetElement.scrollTop + moveRange) ? 0 : scrollSize > maxScrollSize ? maxScrollSize : Math.ceil(targetElement.scrollTop + moveRange); //한번 스크롤시 이동할 거리
	
				moveState = true;

				TweenMax.to(targetElement, duration, { ease: "power1.out", scrollTop: moveSize, onComplete: function(){
					clearTimeout(scrollTiming);
						scrollTiming = null;
						scrollTiming = setTimeout(function(){
							moveState = false;
							scrollSize = targetElement.scrollTop;
						}, 500)
					} 
				});
				
				if (scrollSize <= 0) {
					scrollSize = 0;
				} else if (scrollSize >= maxScrollSize) {
					scrollSize = maxScrollSize;
				}
			}
		}
	
		var requestAnimationFrame = (function () { // requestAnimationFrame cross browser
			return (
				window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (func) {
					window.setTimeout(func, 1000 / 50);
				}
			);
		})();
		
		return init();
	};

	var resizeScrollOffset = function(opt){
		var scrollProgress = null,
			correctionTiming = null,
			resizeTiming = !!!opt ? 200 : opt + 200;

		var scrollElement, scrollElementHeight, winScrollTop, scrollProgress;

		var init = function(){
			bindEvent();
		};

		var getScrollProgerss = function(){
			if (scrollProgress == null) {
				scrollElement = document.scrollingElement || document.documentElement || document.body.parentNode || document.body;
				scrollElementHeight = document.body.clientHeight;
				winScrollTop = window.pageYOffset + scrollElement.clientHeight;
				scrollProgress = (winScrollTop / scrollElementHeight);
			} else {
				scrollElementHeight = document.body.clientHeight;
			};
		};

		var setCorrScroll = function(){
			clearTimeout(correctionTiming)
			correctionTiming = setTimeout(function(){
				window.scrollTo(0, scrollElementHeight * scrollProgress - window.innerHeight);
				scrollProgress = null;
			}, resizeTiming);
		};
		
		var bindEvent = function(){
			window.addEventListener('resize', function(){
				getScrollProgerss();
				setCorrScroll();
			});
		};

		return init();

	};

	return {
		calRange: function(values){
			return calRange(values);
		},
		videoObjectFit: function(opts){
			videoObjectFit(opts);
		},
		imageLoader: function(opts){
			imageLoader(opts);
		},
		addClass: function(opts) {
			addClass(opts);
		},
		removeClass: function(opts) {
			removeClass(opts);
		},
		scrollController: function(opt) {
			scrollController(opt);
		},
		resizeScrollOffset: function(opt){
			resizeScrollOffset(opt);
		}
	}
})();