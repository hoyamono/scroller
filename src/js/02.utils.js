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
			this.loadOption = opts.loadOption;
			this.targetAttr = opts.loadOption[0].attribute;
			this.visiblePoint = !!!opts.visiblePoint ? 0 : opts.visiblePoint;
			this.useDefaultImg = opts.useDefaultImg;
			this.getLazyImage();
			this.getResponsiveImage();
			this.bindEvent();
		};

		var fn = init.prototype;

		fn.bindEvent = function(){
			var self = this,
				resizeTiming = null,
				responsiveCheck = this.loadOption;

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
					clearTimeout(resizeTiming);

					resizeTiming = setTimeout(function(){
						self.setResponsiveInfo();
					}, 80);
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
					imgSrc = targetImage.getAttribute(this.loadOption[this.attrIndex - 1].attribute);
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
						imgSrc = targetElement.getAttribute(this.loadOption[this.attrIndex - 1].attribute);
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
		}
	}
})();
