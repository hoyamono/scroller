# SCROLLER
스크롤 인터렉션 페이지 제작을 위한 라이브러리입니다.


## Example Code
---
### 1. SCROLLER 객체 생성 (https://hoyamono.github.io/scroller/)
스크롤러 객체는 되도록 변수에 담아 사용하고 resize 또는 scroll 이벤트와 같은 이벤트에 포함하여 사용하는것을 지양해야함.
``` javascript
var scene1 = SCROLLER({
	trackElement: document.querySelector('.track'), //DOM node or jQuery object
	fixedElement: document.querySelector('.fixed'), //DOM node or jQuery object
	useFixed: 'true',
	trackHeight: 2.2, // trackElement height 값 * 2.2
	correction: 2, // window height을 기준으로 offsetTop 값이 더해진다.
	resize: 'true'
});

var scene2 = SCROLLER({
	activeElement: trackElement2,
	correction: 2, //노출위치 보정 (배율값) - ex) activeElement의 높이가 400이라면 offsetTop의 값이 400이 더해진다.
	activeVisibility: 'visible', //visible: element가 화면 중앙에 위치할 경우 노출, before: window scroll bottom이 element의 offset top과 맞닿을경우 노출
	activePlay: 'reverse', //reversee: 역방향 재생, oneWay: 재생 완료 후 scrollTop이 0이될 경우 인터랙션 초기화
	activeClass: 'active', //activeClass와 activeCallback 둘중 하나만 사용 가능
	resize: true
});
```
---
### 2. Option List
|Option|Type|Default|Description|
|------|---|---|-----|
|trackElement|DOM|-|fixed 대상 요소를 감싸는 Dom요소로 trackElement의 height값에따라 animation의 duration 값이 달라진다.(trackHeight을 통해 height값 조절 가능)|
|fixedElement|DOM|-|trackElement 내 스크롤시 fixed될 DOM요소|
|useFixed|boolean|false|fixed 기능 on/off|
|trackHeight|number|0|trackHeight의 height값을 보정하는 옵션으로 배율로 입력한다 ex) 2 = 높이값의 2배|
|offsetY|string, number|0|화면 내 fixedElement의 top offset 보정값(보정값에 맞춰 height 값도 보정됨)|
|resize|boolean|false|리사이즈시 trackHeight 등 관련 설정들을 업데이트한다|
|resizeTiming|number|-|리사이즈 이벤트 발생시점 제어(리사이즈시마다 이벤트가 발생하지 않고 설정한 시간에 따라 한번 발생)|
|activeElement|DOM|-|activeClass 또는 activeCallback을 실행할 분기점이되는 DOM요소|
|activeVisibility|string|before|activeClass 및 activeCallback의 동작방식 **visivle**(화면 중간에 구조 위치시 동작**window height값보다 작은 Element만 지원**) / **before**(scrollBottom과 대상 DOM의 offsetTop이 맞닿으면 동작)|
|activePlay|string|reversee|activeClass / activeCallback 실행방식 **reversee**(순방향/역방향 스크롤시 모두 재실행) / **oneWay**(1회 실행 후 스크롤이 화면 최상단에 다시 원위치해야 초기화 및 재실행)|
|activeClass|string|-|activeVisibility 타입에 맞춰 activeElement에 add될 class|
|activeCallback|function|-|activeVisibility 타입에 맞춰 실행될 함수|
|endCallback|function|-|activeVisibility 타입에 맞춰 초기화시 실행될 함수|
|activeCallbackClass|string|activeCallbackClass|activeCallback 실행 후 activeElement에 add될 class|
|correction|number|0|add class 또는 callback 실행 시점을 보정하는 값으로 대상 구조(activeElement 또는 window)의 height 값을 전달받은 값으로 계산하여 off값을 - +한다.|
|IEScroll|boolean|false|css transition 사용시 IE에서 발생하는 떨림현상을 제어하기위한 옵션으로 사용시 스크롤이 상당히 부자연스러워진다.(한페이지 한번만 실행)|
---
### 3. Methods
- trackAnimation : fixed animation 구현시 사용하는 Method로 설정된 trackElement구간에서 scroll시 progress 정보를 제공하고 callback 함수를 실행한다.
	|property|Type|Description|
	|------|---|-----|
	|this.progress|number|trackElement구간의 scroll 진행상황 0 ~ 100까지의 value제공|
	|this.wheelDirection|string|현재 스크롤 방향 표시 'up, down' string으로 제공|
	---
	``` javascript
	window.addEventListener('scroll', function () {
		scene1.trackAnimation(function () {
			var progress = this.progress; //trackElement구간의 scroll 진행상황 0 ~ 100까지의 value제공

			var wheelDirection = this.wheelDirection; //현재 스크롤 방향 표시 'up, down' string으로 제공

			var motionValue1 = ANIUTIL.calRange({
					targetValue: 1,
					progress: progress,
					startPoint: 20,
					endPoint: 50
				}),
				value1Curr = 1 - motionValue1;
			motionValue2 = ANIUTIL.calRange({
				targetValue: 1,
				progress: progress,
				startPoint: 50,
				endPoint: 60
			});

			if (value1Curr >= 0) {
				aniTarget1_1.style.opacity = value1Curr;
			}

			if (motionValue2 >= 0) {
				aniTarget1_2.style.opacity = motionValue2;
			}
		});
	});
	```
- activeAnimation : activeElement로 지정한 대상에게 클래스를 부여하거나 해당 대상에 스크롤이 도달할 경우 callback 함수를 실행한다.
	``` javascript
	window.addEventListener('scroll', function () {
		scene2.activeAnimation();
	});
	```
- destroy : 모든 설정값을 초기화하고 동작을 비활성화한다.
	``` javascript
	scene1.destroy();
	```
---
### 4. Utils
- ANIUTIL.calRange : trackAnimation에서 제공하는 progress의 값이 0~100%까지 도달할때까지 진행상황에 맞춰 value 값을 계산해주는 함수.
	``` javascript
	ANIUTIL.calRange({
		targetValue: 1,
		progress: progress,
		startPoint: 20,
		endPoint: 60
	});
	//progress 20%에서 0으로 시작해서 60%에 1이된다.
	```
	|Option|Type|Description|
	|------|---|-----|
	|targetValue|number|progress가 100이됐을때 도달할 value값|
	|progress|number|현재 progress값|
	|startPoint|number|0~100까지의 progress중 target value값 계산을 시작할 위치 지정|
	|endPoint|number|0~100까지의 progress중 target value값 계산을 중단할 위치 지정|

- ANIUTIL.imageLoader : Lazy-load 및 responsive image 제어 함수 (https://hoyamono.github.io/scroller/image-loader.html)
	``` javascript
	ANIUTIL.imageLoader({
		lazyClass: '.img-box img',
		responsiveClass: '.res-img',
		loadOption: [{
            resolution: 1920,
            attribute: 'data-img-pc'
        },{
            resolution: 1024,
            attribute: 'data-img-tb'
        },{
            resolution: 768,
            attribute: 'data-img-mo'
        }],
		visiblePoint: 1,
		useDefaultImg: true,
	});
	```
	|Option|Type|Description|
	|------|---|-----|
	|lazyClass|string|lazy-load를 적용할 대상 class|
	|responsiveClass|string|responsive image적용할 대상 class|
	|loadOption|array(object)|resolution : responsive image 분기점,높은해상도(lazy-load만 사용시 resolution 표기 제외) => 낮은해상로 순으로 표기 / attribute : 해당 분기점에서 치환할 이미지 경로를 담고있는 attribute 표기|
	|visiblePoint|number|이미지 로드시점 설정 ex) 1 = 한화면 전|
	|useDefaultImg|boolean|이미지 로드 전 src에 더미이미지 할당|
- ANIUTIL.videoObjectFit : wrap 요소에 맞춰 video를 full size로 유지하도록 제어하는 함수
	``` javascript
	ANIUTIL.videoObjectFit({
	wrapElement: fixedElement3,
	targetVideo: video1
	});
	```
	|Option|Type|Description|
	|------|---|-----|
	|wrapElement|DOM|video가 노출될 video의 상위구조|
	|targetVideo|DOM|video Element|
