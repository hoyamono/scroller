/*!
* ANI-Util JavaScript Library v1.0
*
* Copyright 2021. Yoon jae-ho
* Released under the MIT license
*
* Date: 2023-04-15
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
	
	var percentToPixel = function(opts){
		var targetValue = opts.targetValue,
		progress = opts.progress;
		
		return targetValue * (progress/100);
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
	
	var mediaLoader = function (opts) {
		var init = function () {
			this.opts = opts;
			this.mediaType = !!!opts.type ? 'image' : opts.type ;
			this.lazyCompleteClass = 
				this.mediaType === 'image' ? 'img-load-complete' : 
				this.mediaType === 'bgImage' ? 'bg-load-compaete' :
				this.mediaType === 'video' ? 'video-load-compaete' :
				this.mediaType === 'mp4Video' ? 'mp4video-load-compaete':
				this.mediaType === 'svgImage' ? 'svg-load-compaete': opts.complatClass;
			this.lazyClass = opts.lazyClass;
			this.responsiveClass = opts.responsiveClass;
			this.loadOption = opts.loadOption;
			this.targetAttr = opts.loadOption[0].attribute;
			this.bgOpts = opts.loadOption[0].bgOpts;
			this.visiblePoint = !!!opts.visiblePoint ? 0 : opts.visiblePoint;
			this.useDefaultImg = opts.useDefaultImg;

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
			var lazyMediaList = document.querySelectorAll(this.lazyClass);
			console.log(lazyMediaList, lazyMediaList.length)
			this.lazyMedias = lazyMediaList;
			this.lazyLength = lazyMediaList.length;
		};

		fn.checkCompleteMedia = function () {
			var lazyCompleteList = document.querySelectorAll('.' + this.lazyCompleteClass);
	
			this.lazyCompleteLength = lazyCompleteList.length;
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
		
		fn.setResponsiveMedia = function (targetMedia) {
			if (targetMedia) {
				for (var i = 0; i < targetMedia.length; i++) {
					var targetMedia = targetMedia[i],
						mediaSrc = targetMedia[i].getAttribute(this.targetAttr),
						bgOpts = targetMedia[i].getAttribute(this.bgOpts);
					
					if (!!!mediaSrc) {
						mediaSrc = this.findMediaHandler(targetMedia);
					}
					
					
					if (!targetMedia[i].classList.contains(this.lazyCompleteClass)) {
						targetMedia[i].setAttribute(this.property, mediaSrc);
						targetMedia[i].classList.add(this.lazyCompleteClass);
					}
				}
			} else {
				for (var i = 0; i < this.responsiveLength; i++) {
					var targetMedia = this.responsiveMedias[i],
					mediaSrc = targetMedia.getAttribute(this.targetAttr);
			
					if (!!!mediaSrc) {
						mediaSrc = this.findMediaHandler(targetMedia);
					}
					
					if (targetMedia.classList.contains(this.lazyCompleteClass)) {
						if (this.mediaType === 'image' || this.mediaType === 'svgImage') {
							targetMedia.setAttribute(this.property, mediaSrc);
						} else if (this.mediaType === 'video' || this.mediaType === 'mp4Video') {
							var isSource = targetMedia.querySelectorAll('source');

							for (var j = 0; j < isSource.length; j++) {
								if (isSource[j].type === 'video/webm') {
									isSource[j].src = mediaSrc + '.webm';
									targetMedia.load();
								} else if (isSource[j].type === 'video/mp4') {
									if (this.mediaType === 'mp4Video') {
										isSource[j].src = mediaSrc + '.mp4?imbypass=true';
									} else {
										isSource[j].src = mediaSrc + '.mp4';
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
		
		fn.setLazyMedia = function () {
			var self = this;
			this.windowHeight = window.innerHeight;
			
			var _createSourceElement = function (src){
				var sourceEl = [];
				
				sourceEl.push(document.createElement('source'));
				sourceEl.push(document.createElement('source'));
				
				if (self.mediaType === 'mp4Video') {
					sourceEl[0].type = 'video/mp4';
					sourceEl[0].src = src + '.mp4?imbypass=true';
				} else {
					sourceEl[0].type = 'video/webm';
					sourceEl[0].src = src + '.webm';
					
					sourceEl[1].type = 'video/mp4';
					sourceEl[1].src = src + '.mp4';
				}
				
				return sourceEl;
			}

			var _setLazySrc = function(targetElement){
				switch (self.mediaType) {
					case 'image':
						targetElement.setAttribute(self.property, mediaSrc);
						break;

					case 'svgImage':
						targetElement.setAttribute(self.property, mediaSrc);
						break;

					case 'bgImage':
						targetElement.classList.add(self.lazyCompleteClass)
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
						break;

					case 'mp4Video':
						var isSource = _createSourceElement(mediaSrc);
						targetElement.append(isSource[0]);
			
						if (!targetElement.muted) {
							targetElement.muted = true;
						}
						break;
				};
			};

			var _setComplateStatus = function(targetElement){
				(function (mediaElement) {
					var imageLoadEvent = function () {
						if (self.opts.lazyClass.split(' ').length == 1) mediaElement.classList.remove(removeClass);

						self.checkCompleteMedia();
						if (self.mediaType === 'image') {
							mediaElement.removeEventListener('load', imageLoadEvent);
						} else if(self.mediaType === 'video') {
							mediaElement.removeEventListener('loadedmetadata', imageLoadEvent);
						}	
					};
					
					switch (self.mediaType) {
						case 'image':
							mediaElement.addEventListener('load', imageLoadEvent);
							mediaElement.classList.add(self.lazyCompleteClass);
							break;
						
						case 'video':
							mediaElement.addEventListener('loadedmetadata', imageLoadEvent);
							mediaElement.classList.add(self.lazyCompleteClass);
							// mediaElement.parentNode.classList.add('loaded');//TO-DO
							break;

						case 'mp4Video':
							mediaElement.addEventListener('loadedmetadata', imageLoadEvent);
							mediaElement.classList.add(self.lazyCompleteClass);
							break;

						default:
							mediaElement.classList.add(self.lazyCompleteClass);
							self.checkCompleteMedia();
							break;
					};
				})(targetElement);
			};

			for (var i = 0; i < this.lazyLength; i++) {
				var targetElement = this.lazyMedias[i],
					corrHeight = this.windowHeight * ((window.pageYOffset != 0) ? this.visiblePoint : 0),
					scrollTop = this.utilList.getScroll.call(this).top - corrHeight,
					scrollBottom = this.utilList.getScroll.call(this).bottom + corrHeight,
					targetOffsetTop = this.utilList.getOffset.call(this, targetElement).top,
					targetOffsetBottom = this.utilList.getOffset.call(this, targetElement).bottom,
					lazyClass = this.lazyClass.split('.'),
					removeClass = lazyClass[lazyClass.length - 1];

				if (!this.mediaType === 'svgImage' && targetElement.offsetParent == null) return;
				
				if ((scrollBottom > targetOffsetTop && scrollTop <= targetOffsetTop || 
					scrollTop < targetOffsetBottom && scrollBottom > targetOffsetBottom || 
					scrollTop < targetOffsetTop && scrollBottom > targetOffsetBottom || 
					scrollTop > targetOffsetTop && scrollBottom < targetOffsetBottom)) {

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
			frameElement = targetElement === document.body && document.documentElement ? document.documentElement : targetElement, // safari is the new IE
			moveState = false,
			scrollTiming = null,
			tweenObject = null;
		var init = function(opt){
			// if (agent.indexOf("chrome") == -1 && agent.indexOf("safari") != -1) return;
			setOpts(opt);
			bindEvent.wheel();
			bindEvent.scroll();
			
			return this.opt = opt;
		};
		
		var destroy = function(remove){
			document.removeEventListener('mousewheel', eventList.scrollEvent);
			document.removeEventListener('wheel', eventList.scrollEvent);

			if(remove) {
				opt = {};
			}
		}

		var setOpts = function(opt){
			speed = !!!opt.speed ? defaultSpeed : macOs ? opt.speed / 2 : opt.speed;
			duration = !!!opt.duration ? 0.6 : opt.duration;
			scrollSize = targetElement.scrollTop;

			opt = opt;
		}

		var bindEvent = {
			wheel: function(){
				if ((navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
					document.documentElement.addEventListener('mousewheel', eventList.scrollEvent, {
						passive: false
					});
				} else {
					document.documentElement.addEventListener('wheel', eventList.scrollEvent, {
						passive: false
					});
				};
			},
			scroll: function(){
				window.addEventListener('scroll', function () {
					if (document.documentElement.style.overflow == 'hidden' || document.body.style.overflow == 'hidden') return;
					
					if (!moveState) {
						scrollSize = targetElement.scrollTop;
					}
					
				});
			}
		};
		
		var eventList = {
			scrollEvent : function (e) {
				if (document.documentElement.style.overflow == 'hidden' || document.body.style.overflow == 'hidden') return;
				e.preventDefault();
				
				var fixedMoveSpeed = document.body.getAttribute('data-scroll-speed');
				
				var delta = eventList.normalizeWheelDelta(e),
				moveSpeed = opt.currDelta && fixedMoveSpeed ? fixedMoveSpeed : !!!fixedMoveSpeed && !!!speed ? 120 : speed;

				scrollSize = scrollSize + (-delta * moveSpeed); //현재까지 스크롤한 사이즈
				maxScrollSize = Math.max(0, Math.min(scrollSize, targetElement.scrollHeight - frameElement.clientHeight)); //최대 스크롤 사이즈
				
				eventList.update();
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
				
				TweenMax.to(targetElement, duration, { ease: "circ.out", scrollTop: moveSize, onComplete: function(){
					clearTimeout(scrollTiming);
					scrollTiming = null;
					scrollTiming = setTimeout(function(){
						moveState = false;
						scrollSize = targetElement.scrollTop;
					}, 500)
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
		}
		
		return {
			init: init,
			destroy: destroy
		} 
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
	
	var checkTouchDevice = function(){
		if (navigator.userAgent.indexOf('Windows') > -1 || navigator.userAgent.indexOf('Macintosh') > -1) {
			return false;
		} else if ('ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch)) {
			return true;
		}
	};
	
	var deviceConsole = function(value, visible){
		var consoleElement,
		consoleValueElement;
		
		if (!document.querySelector('.console-layer')) {
			consoleElement = document.createElement('div');
			
			consoleElement.classList.add('console-layer');
			consoleElement.setAttribute('style', 'position: fixed; left: 0; top: 0; padding: 20px; z-index:1000000000; background: #fff;')
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
	
	var responsiveHandler = function(opts){
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
		}
		
		var checkResolution = function(){
			windowWidth = window.innerWidth;
			for (var i = 0; i < opts.resolution.length; i++) {
				
				var currentSize = opts.resolution[i],
				nextSize = !!!opts.resolution[i+1]? 0 : opts.resolution[i+1];
				
				if (windowWidth <= currentSize && windowWidth > nextSize && isResolution != opts.statusName[i] ||
					windowWidth <= currentSize && windowWidth > nextSize && isActiveIndex != i) {
					document.documentElement.classList.remove(isResolution);
					isResolution = opts.statusName[i] || i;
					isActiveIndex = i;
					document.documentElement.classList.add(isResolution);
				} else if (windowWidth >= opts.resolution[0] && isResolution != opts.statusName[0] || 
					windowWidth >= opts.resolution[0] && !!!isActiveIndex) {
					document.documentElement.classList.remove(isResolution);
					isResolution = opts.statusName[0] || i;
					isActiveIndex = i;
					document.documentElement.classList.add(isResolution);
				}
			}
		};
		
		var activeCallbacks = function(){
			clearTimeout(callbackTiming);
			if (oldActiveIndex == isActiveIndex) return;
			if (!!!opts.callback[isActiveIndex]) return;
			callbackTiming = setTimeout(function(){
				opts.callback[isActiveIndex]();
				callbackTiming = null;
				oldActiveIndex = isActiveIndex;
			}, opts.activeTiming);
		};
		
		var bindEvent = function(){
			window.addEventListener('DOMContentLoaded', function(){
				checkResolution();
				oldActiveIndex = isActiveIndex;
				
			});
			
			window.addEventListener('resize', function(){
				checkResolution();
				activeCallbacks();
			});
		};
		
		var init = function(){
			bindEvent();
			
			return this;
		};
		
		return init(opts);
	};
	
	var videoHandler = function(opts){
		var init = function(opts){
			this.video = opts.video;
			this.wrap = !!!opts.wrap ? video : opts.wrap,
			this.playType = !!!opts.playType ? 'scrollPlay' : opts.playType;
			this.playClass = !!!opts.playClass ? 'is-playing' : opts.playClass;
			this.pauseClass = !!!opts.pauseClass ? 'is-paused' :opts.pauseClass;
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
			play: function(){
				if (!!this.playCallback) this.playCallback()
				this.wrap.classList.remove(this.endedClass);
				this.wrap.classList.remove(this.pauseClass);
				this.wrap.classList.add(this.playClass);
			},
			ended: function(){
				if (!!this.endCallback) this.endCallback();
				this.wrap.classList.remove(this.playClass);
				this.wrap.classList.add(this.pauseClass)
				this.wrap.classList.add(this.endedClass)
			},
			pause: function(){
				if (!!this.pauseCallback) this.pauseCallback();
				this.wrap.classList.remove(this.playClass);
				this.wrap.classList.add(this.pauseClass);
			},
			reset: function(){
				if (!!this.resetCallback) this.resetCallback();
	
				this.video.pause();
				this.video.currentTime = 0;
	
				var self = this;
				
				var _removeClass = function(){
					self.wrap.classList.remove(self.playClass);
					self.wrap.classList.remove(self.pauseClass);
					self.wrap.classList.remove(self.endedClass);
				}
	
				clearTimeout(_removeClass);
				setTimeout(_removeClass, 50);
				
			}
		};

		fn.activeList = {
			scrollPlay: function(progress){
				if (progress > 0 && 
					progress < 100 && 
					this.video.paused && 
					!this.wrap.classList.contains(this.endedClass) && 
					!this.wrap.classList.contains(this.pauseClass)) {
					if (this.video.readyState == 4 && this.video.paused) {
						this.video.play();
					} else {
						this.video.addEventListener('loadeddata', this.video.play);
					};
				};
				
				if (this.video.readyState == 4 && progress === 100 || this.video.readyState == 4 && progress === 0) {
					this.eventList.reset.call(this);
				};
			},
			sequencePlay: function(progress, corrProgress, scrollDuration){
				this.corrProgress = !!!corrProgress ? 100 : corrProgress;
				this.scrollDuration = !!!scrollDuration ? 0.6 : scrollDuration;

				if (this.video.readyState == 4 && this.video.paused) {
					this.videoDuration = this.video.duration;
					this.playCurrentTime = this.videoDuration * (progress/this.corrProgress);
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
					};

				};
			}
		}

		fn.bindEvents = function(){
			var self = this;

			this.video.addEventListener('play', function(){
				self.eventList.play.call(self);
			});

			this.video.addEventListener('pause', function(){
				self.eventList.pause.call(self)
			});
			
			this.video.addEventListener('ended', function(){
				self.eventList.ended.call(self);
			});
		};

		fn.scrollActive = function(progress, corrProgress, scrollDuration){
			switch (this.playType) {
				case 'scrollPlay':
					this.activeList.scrollPlay.call(this, progress);
					break;
			
				case 'sequencePlay':
					this.activeList.sequencePlay.call(this, progress, corrProgress, scrollDuration);
					break;
			}
		};

		return new init(opts);
	};

	return {
		calRange: function(values){
			return calRange(values);
		},
		videoObjectFit: function(opts){
			videoObjectFit(opts);
		},
		videoHandler: function(opts){
			return videoHandler(opts)
		},
		imageLoader: function(opts){
			mediaLoader(opts);
		},
		mediaLoader: function(opts){
			mediaLoader(opts);
		},
		addClass: function(opts) {
			addClass(opts);
		},
		removeClass: function(opts) {
			removeClass(opts);
		},
		scrollController: scrollController,
		resizeScrollOffset: function(opt){
			resizeScrollOffset(opt);
		},
		checkTouchDevice: checkTouchDevice,
		deviceConsole: deviceConsole,
		percentToPixel: percentToPixel,
		responsiveHandler: responsiveHandler,
	}
})();
