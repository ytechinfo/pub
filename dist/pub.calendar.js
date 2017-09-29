/**
 * pubCalendar v0.0.1
 * ========================================================================
 * Copyright 2016 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
 * url : https://github.com/ytechinfo/pub
 * demo : http://pub.moaview.com/
*/ 
;(function($, window, document) {
"use strict";

var _$d = new Date();
var _initialized = false	
,_doc = $(document)
,_lunarMonthTable = {}
,_datastore ={}
,_TIME_HALF_HEIGHT=21
,_defaultOption ={
	viewMode : 'full-month'	// 달력 모드 (mini,full-month,full-week,full-day)
	,viewDateFormat : 'YYYY-MM-DD HH:mm'
	,customRangeDay : 20	// viewmode가 custom 일때 일자 범위 0 ~ 선택일까지
	,useLunar : false		// 음력 기념일 사용여부.
	,useYearInput : true //year 변경시 더블클릭하면 input 박스 나타날지 여부.
	,todayDate : _$d.getFullYear() +'-' +(_$d.getMonth() + 1)+'-'+ _$d.getDate()
	,maxEventRow : 3
	,useMemorialday : true // 기념일 보기 여부 
	,width :'100%'		// 달력 넓이
	,height:630		// 높이
	,colWidth : 25	// 달력 컬럼 넓이
	,dayViewMode : 2	// mode 1 default 양력, 2 기념일설명, 3 음력. , 4 음력/기념일. 
	,eventDisplay : true // 이벤트 표시 여부. // mini 달력일 경우만 해당
	,eventDisplayHtm : '<span>O</span>' // 이벤트 표시 html // mini 달력일 경우만 해당
	,memorialDayInfo : {}
	,eventDisplayClass:'select' // 이벤트 표시 css 클래스
	,theme :'pub-calendar-default' // 달력 테마
	,memorialDays:[]	// 기념일
	,prefixId :'pubCID_' // 내부 적으로 관리 되는 id
	,eventMoreClick : false	// 더보기 버튼 클릭 이벤트.
	,eventClick : false // 일정 클릭.
	,eventDelete : false // 일정 삭제.
	,eventDetail : false // 일정 상세보기.
	,backgroundColor :'#A6C9F5'	// 일정 바탕색
	,timeBackgroundColor : '#E4F7F8' // 시간별 일정 바탕색.
	,autoResize :false // 창 자동 조절시 
	,dayEventSize : {	// 상세창 사이즈.
		w : 300
		,h : 170
	}
	,_date :{
		yyyy:''
		,mm:''
	}
	,lang : {
		mini : {	sun:'일',mon:'월',tue:'화',wed:'수',thu:'목',fri:'금',sat:'토'
			,year :'년'	,month :'월'
		}
		,full : {	sun:'Sun',mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat'
			,year :''	,month :'' , event_date : '일시' ,delete_btn: '삭제',detail_btn : '상세', save_btn : '저장'
			,'delete.confirm.msg' : '삭제하시겠습니까?'
		}
	}
	,event: {
		type :'local' //local or ajax
		,colModel : {
			start : 'start'		// 일정 시작일자.
			,end : 'end'		// 일정 종료일자
			,title : 'title'	// 일정제목
			,repeat : 'repeat'	// (반복일정) y(년),m(월) , w(주) ,d(일)
			,repeatInfo : 'repeatInfo'	// (반복일정) 정보
			,repeatException : 'repeatException'	// (반복일정) 예외
			,startTime : 'startTime'	// (반복일정) 시작 시간
			,endTime :'endTime'	// (반복일정) 종료시간
			,days :'day'	// (반복일정) 반복일
			,cycle :'cycle'	// (반복일정) 반복 범위
			,color : 'color'	// 일정 색깔지정.
		}
	}
	,beforeCalendar :function (){} // 그리기 전 이벤트
	,afterCalendar :function (date){} // 달력 그린후 이벤트
	,dayClick : false // 달력 클릭 이벤트
	,eventWrite : false		// 일정 쓰기
	,eventWriteCallback : false		// 일정 저장 버튼 클릭시
}; 

function Plugin(element, options) {
	this._initialize(element, options);
	return this; 
}

Plugin.VERSION = '0.0.1';

Plugin.prototype ={
	/**
     * @method _initialize
     * @description 그리드 초기화.
     */
	_initialize :function(element,options){
		var _this = this ; 
		_this.selector = element;
		_this.element = $(element);
		_this._position = _this.element.offset(); 
		_this.prefix = 'pubcalendar'+new Date().getTime();
		
		_this.options=objectMerge({}, _defaultOption, options);

		_this.setMemorialDay(options.memorialDays);
		_this.setLunarMonthTable();
		
		_this.config = {beforeDate :{yyyy:'',mm:''}, dragSelect:false};

		var todayDate = makeMoment(_this.options.todayDate); // 오늘 날짜
		
		var tdate = { 
			yyyy : todayDate.format('YYYY')
			,mm : todayDate.format('MM')
			,dd : todayDate.format('DD')
			,yyyy_mm_dd : todayDate.format('YYYY-MM-DD')
		};
		
		_this.options.todayDate =tdate;

		if(_this.options.viewMode == 'full-month' && _this.options.autoResize===true){
			_this.config.monthWeekNum = todayDate.clone().endOf('month').startOf('week').diff(todayDate.clone().startOf('month').startOf('week') ,'week')+1;
			_this._setMaxRow(); 
			_this.options.height = _this.getCalendarMaxHeight();
		}
		
		_this._loadEventData(tdate.yyyy, tdate.mm, tdate.dd);
	}
	// 일정 데이타 다시 읽기.
	,reloadEvent :function (){
		var tdate = this.options._date;
		this._loadEventData(tdate.yyyy, tdate.mm, tdate.dd);
	}
	// 이벤트 데이타 로드.
	,_loadEventData : function (pYear, pMonth, pDday){
		var _this = this
			,eventObj = _this.options.event
			,_viewMode = _this.options.viewMode
			,pDday =pDday ? pDday : 1;
		
		//음력은 아래와 같이 체크 함
		if(_this.options.useLunar && (pYear < 1901 || pYear > 2100) ){
			alert('날짜 범위를 벗어났습니다.\n음력날자는 1901년부터 2100까지만 지원합니다.');
			return ; 
		}

		function goDraw(evtData , mode){
			
			_this.options._date = {
				yyyy : pYear
				,mm : pMonth
				,dd :pDday
			};

			_this._setViewDayInfo(); 
			_this._initEventData(mode , evtData);

			_this.drawCalendar(pYear, pMonth, pDday);
			
			if(_this.options.initFlag !==true){
				_this.initEvt();
				_this.options.initFlag = true; 
			}
		}
	
		var reqDt = makeMoment(pYear+'-'+day2(pMonth)+'-'+day2(pDday))
			,_mode = 'month'
			,dateInfo ={};

		if(_viewMode.indexOf('-week') > -1){
			_mode = 'week';
			dateInfo = {
				start : reqDt.clone().startOf('week').format('YYYY-MM-DD')
				,end : reqDt.clone().endOf('week').format('YYYY-MM-DD')
				,mode : _mode
				,viewRangeNum : 7
			}
			dateInfo.viewFirst = dateInfo.start;
			dateInfo.viewLast = dateInfo.end;
		}else if(_viewMode.indexOf('-day') > -1){
			_mode = 'day';

			dateInfo = {
				start : reqDt.format('YYYY-MM-DD')
				,end : reqDt.format('YYYY-MM-DD')
				,mode : _mode
				,viewRangeNum : 1
			};
			dateInfo.viewFirst = dateInfo.start;
			dateInfo.viewLast = dateInfo.end;
		}else if(_viewMode.indexOf('-custom') > -1){
			_mode = 'custom';
			var customRangeDay = _this.options.customRangeDay; 
			customRangeDay = isNaN(customRangeDay) ? 5 : customRangeDay;
			dateInfo = {
				start : reqDt.clone().format('YYYY-MM-DD')
				,end : reqDt.clone().add(customRangeDay,'day').format('YYYY-MM-DD')
				,mode : _mode
				,viewRangeNum : customRangeDay
			};
			dateInfo.viewFirst = dateInfo.start;
			dateInfo.viewLast = dateInfo.end;
		}else{
			_mode = 'month';

			dateInfo = {
				viewFirst : reqDt.clone().startOf('month').startOf('week').format('YYYY-MM-DD')
				,viewLast : reqDt.clone().startOf('month').add(5,'week').endOf('week').format('YYYY-MM-DD')
				,start : reqDt.startOf('month').format('YYYY-MM-DD')
				,end : reqDt.endOf('month').format('YYYY-MM-DD')
				,mode : _mode
				,viewRangeNum : 31
			};
		}

		// 월 정보 셋팅.
		_this.config.dateInfo = dateInfo;
	
		if(eventObj.type=='local'){
			goDraw(_this.options.event.items, _mode);
		}else{
			$.ajax($.extend({}, {
				type :'get'
				,cache: false
				,dataType: "json"
				,data: _this.config.dateInfo
				,success: function(events) {
					goDraw(events.items, _mode);
				}
				,error: function() {
					goDraw([]);
				}
			},eventObj.read));
		}
	}
	// 달력 이벤트 초기화
	,initEvt : function (){
		var _this = this
			,viewMode = _this.options.viewMode.split('-')[0];

		$('#'+_this.prefix+' .pubcalendar-move-btn').on('click',function (){
			var sEle = $(this)
				,mode = sEle.attr('_mode')
				,_vm =_this.config.dateInfo.mode;
			var sdt = makeMoment(_this.config.dateInfo.start);
			
			var addMode='day'; 
			var count = 1; 
			if(_vm =='month'){
				addMode = 'month';
			}else if(_vm =='week'){
				addMode = 'week';
			}else if(_vm =='custom'){
				count = _this.options.customRangeDay+1;
			}

			sdt.add((mode =='p'?(count*-1):(count)), addMode);
			_this._loadEventData(sdt.format('YYYY'),sdt.format('MM'),sdt.format('DD'));
		});

		_this.element.on('click.pubcdayclick','.pubcalendar-day-item',function(e){
			var sEle = $(this)
				,_day = sEle.attr('_day');
			_this.dayClick({evt:e, day:_day});
		});
		
		if(viewMode =='mini'){
			_this.initMiniCalendarEvt();
		}else{
			_this.initFullCalendarEvt();
		}
	}
	// 소형 캘린더 
	,initMiniCalendarEvt: function (){
		var _this = this
		
	}
	// full calendar
	,initFullCalendarEvt : function (){
		var _this = this; 

		_this.setViewModeBtnEvent();

		_this.setTimeCalendarEvent();

		_this.element.on('click.pubcwritebtn','.pubc-write-btn', function (e){
			var sObj = $(this);

			var _idx = sObj.closest('[_idx]').attr('_idx');
			e.stopPropagation();

			var sdt= _this.options.viewDateArr[_idx]; 

			_this.eventWrite({start :sdt, end : sdt	,mode:'m'});
			
		});

		$('#'+_this.prefix+' .pubcalendar_year_select').on('change.pubcyearselect',function (e){
			var sEle = $(this);
			_this._loadEventData(sEle.val(),_this.options._date.mm,1);
		});

		$('#'+_this.prefix+' .pubcalendar_month_select').on('change.pubcmonthselect',function (e){
			var sEle = $(this);
			_this._loadEventData(_this.options._date.yyyy , sEle.val(),1);
		});
		
		_this._dragDaySelect();

		_this._calenderEventCRUD();

		_this.timeAllDayAreaScroll();
		
		_this._windowResize();
		
		_this.eventMoreClick()			
	}
	// calendar 보기 , 삭제 , 더보기 등 이벤트 레이어 처리.
	,_calenderEventCRUD : function (){
		var _this = this; 

		_this.element.on('click.pubcalendardim','.pubc-bg-dim',function (e){
			_this._layerClose(e);
		});

		var layerEle = $('#'+_this.prefix+' .pubc-dim-layer-area');
	
		layerEle.find('.close-btn').on('click',function (e){
			_this._layerClose(e);
		});
		
		// 저장
		layerEle.find('.write_btn').on('click',function (e){
			var writeInfo = { title: $('#'+_this.prefix+' #pubc_title').val()
				,startDay : $('#'+_this.prefix+' #pubc_start_dt').val()
				, endDay : $('#'+_this.prefix+' #pubc_end_dt').val()
			};
							
			if($.isFunction (_this.options.eventWriteCallback)){
				_this.options.eventWriteCallback.call( $(this) , writeInfo);
			}	
			_this._layerClose(e);
		});
		
		// 삭제
		layerEle.find('.del_btn').on('click',function (e){
			if(!confirm(_this.getLang('full')['delete.confirm.msg'])) return ; 
			$(document).trigger('click.bs.pubc.data-api');

			_this.eventDelete({evt :e, item:_this.config.detailItem});
		});

		// 상세
		layerEle.find('.detail_btn').on('click',function (e){
			$(document).trigger('click.bs.pubc.data-api');
			_this.eventDetail({evt :e, item:_this.config.detailItem});
		});
		
		_this.element.on('click.pubcalendardim','.pub_calendar_evt_item',function (e){
			var pubc_key = $(this).attr('pubc_key').split(',');
				
			var clickItem = _this.config.eventSources[pubc_key[0]];

			if('t'==pubc_key[3]){
				clickItem._range = _this.config.dayEventInfo[pubc_key[1]][pubc_key[2]];
			}else{
				clickItem._range =_this.config.eventRangeArrInfo[pubc_key[1]][pubc_key[2]];
			}
			
			_this.eventClick({evt :e, item:clickItem});
		});
	}
	//drag day select
	,_dragDaySelect : function (){
		var _this =this; 

		function getSelectInfo (){
			var sIdx= _this.config.select.startIdx
				,eIdx = _this.config.select.endIdx;

			if(sIdx > eIdx){
				var tmp = eIdx;
				eIdx = sIdx;
				sIdx = tmp; 
			}

			return {sIdx: sIdx, eIdx : eIdx};
		}
		var isMouseDown = false; 
		var pubC = document.querySelector('#'+_this.prefix); 
		_this.element.on('mousedown.pubcalendarday','.pubc-bg',function (e){
			
			if(e.which ===3){
				return true; 
			}
			
			e.preventDefault();
			
			var sEle = $(this)
				,_idx= parseInt(sEle.attr('_idx'),10);

			var addEle = pubC.querySelector('.pubc-bg[_idx="'+_idx+'"]'); 	
			addEle.classList.add('select');
			addEle = null; 

			_this.config.select = {startIdx : _idx, endIdx: _idx};

			_this.element.find('.pubc-row-bg-table').css('z-index',5);

			isMouseDown = true; 
			
			//return true;

		}).on('mouseover.pubcalendarday','.pubc-bg',function (e) {
			if (!isMouseDown) return;

			var sEle = $(this)
				,_idx= parseInt(sEle.attr('_idx'), 10);
			
			_this.config.select.endIdx = _idx; 

			var selectInfo = getSelectInfo(); 

			var sIdx= selectInfo.sIdx
				,eIdx = selectInfo.eIdx ; 

			_this.element.find('.pubc-bg[_idx]').removeClass('select');

			for(var i = sIdx ; i <= eIdx ; i++){
				var addEle = pubC.querySelector('.pubc-bg[_idx="'+i+'"]'); 	
				addEle.classList.add('select');
				addEle = null; 
			}
		})
		
		_doc.on('mouseup.'+_this.prefix,function (e) {
					
			if(isMouseDown){
				e.preventDefault();
				e.stopPropagation();
				_this.element.find('.pubc-row-bg-table').css('z-index',1);
				_this.element.find('.pubc-bg[_idx]').removeClass('select');
				var selectInfo = getSelectInfo(); 

				var sIdx= selectInfo.sIdx 
					,eIdx = selectInfo.eIdx; 
				
				_this.eventWrite({
					start :_this.options.viewDateArr[sIdx]
					,end : _this.options.viewDateArr[eIdx]
					,mode:'m'
				});

				isMouseDown = false;
				_this.config.dragSelect = true; 

				return false; 	
			}
		}).on('click.bs.pubc.data-api',function (e){
			if(_this.config.dragSelect){
				_this.config.dragSelect = false; 
				return ; 
			}
			_this._layerClose(e);
		}).on('click.bs.pubc.data-api', '.pubc-layer-area', _this._layerActive)
		.on('click.bs.pubc.data-api', '.pub_calendar_evt_more,.pub_calendar_evt_item', _this._layerActive);
	}
	// all area scroll wheel 이벤트 처리.
	,timeAllDayAreaScroll : function (){
		var _this = this; 
		_this.element.off('mousewheel.pubcwheel DOMMouseScroll.pubcwheel');
		_this.element.on('mousewheel.pubcwheel DOMMouseScroll.pubcwheel', '.week-day-bg',function(e) {
			e.preventDefault();
			var oe = e.originalEvent;
			var delta = 0;
		
			if (oe.detail) {
				delta = oe.detail * -40;
			}else{
				delta = oe.wheelDelta;
			};

			var scrollT = _this.element.find('.pubc-time-all-day-info').scrollTop();		
			//delta > 0--up
			if(delta > 0){
				_this.element.find('.pubc-time-all-day-info').scrollTop(scrollT-5);
			}else{
				_this.element.find('.pubc-time-all-day-info').scrollTop(scrollT+5);
			}
		});
	}
	// 창 리사이즈
	,_windowResize :function (){
		var _this = this; 
		if(_this.options.viewMode != 'full-month' || _this.options.autoResize !== true) return false; 

		var _evt = $.event,
			_special,
			resizeTimeout;

		_special = _evt.special.pubcalendarResize = {
			setup: function() {
				$( this ).on( "resize", _special.handler );
			},
			teardown: function() {
				$( this ).off( "resize", _special.handler );
			},
			handler: function( event, execAsap ) {
				// Save the context
				var context = this,
					args = arguments,
					dispatch = function() {
						// set correct event type
						event.type = "pubcalendarResize";
						_evt.dispatch.apply( context, args );
					};

				if ( resizeTimeout ) {
					clearTimeout( resizeTimeout );
				}

				execAsap ?
					dispatch() :
					resizeTimeout = setTimeout( dispatch, _special.threshold );
			},
			threshold: 150
		};

		$(window).on("pubcalendarResize", function( event ) {
			_this.resizeDraw();
		});
	}
	// 달력 사이즈 조정.
	,resizeDraw :function (){
		var _this = this; 
		
		if(_this.options.viewMode != 'full-month') return ; 

		var _date = _this.options._date;
		
		_this._setMaxRow();
		_this.resizeMoreCountSetting(this.options.maxEventRow );
		_this.drawCalendar(_date.yyyy, _date.mm, _date.dd);
		_this.pubcElement.css('height',_this.getCalendarMaxHeight()); //TODO: 화면 상단 사이즈 사이즈 처리하게 처리.
	}
	// event max row setting
	,_setMaxRow :function (){
		var _h = this.getCalendarMaxHeight();

		if(_h < 345){
			this.options.maxEventRow = 1; 
		}else{
			this.options.maxEventRow = Math.floor(_h/this.config.monthWeekNum/19)-2; 
		}
	}
	// 화면 최대 사이즈.
	,getCalendarMaxHeight : function (){
		var _h = (window.innerHeight || document.documentElement.clientHeight || screen.height) - this._position.top;
		return ((_h < 345) ? 345 :_h) -62; 
	}
	// 사이즈 조정시 더보기 카운트 갱신.
	,resizeMoreCountSetting : function (maxRow){
		var _this  = this; 
		var eventRangeArrInfo = _this.config.eventRangeArrInfo
			,dayMoreCount ={};
		
		$.each(eventRangeArrInfo, function (key ,dayItem){
			$.each(dayItem,function (key2 , evtItem){
				if((parseInt(key2,10)+1) > maxRow) dayMoreCount[key]=(( dayMoreCount[key] || 0 )+1);
			});
		});
		
		_this.config.dayMoreCount =dayMoreCount;
	}
	// 일정 row , full height 구하기.
	,getRowHeight :function ( type){
		return 19* (this.options.maxEventRow+2);		
	}
	// 일정 데이타 가공.
	,_initEventData : function (mode , evtData){

		if(!evtData) evtData=[];

		var _this = this
			,colModel = _this.options.event.colModel; 
				
		var first = makeMoment(_this.config.dateInfo.viewFirst+' 00:00')
			,last = makeMoment(_this.config.dateInfo.viewLast+' 23:59')
			,viewRangeFirst = makeMoment(_this.config.dateInfo.start)
			,viewRangeLast= makeMoment(_this.config.dateInfo.end); 

		var viewFirstTime = first.toDate().getTime();
		var viewEndTime = last.toDate().getTime();

		var repeatItem = [];

		var pubcIDX = 0; 
		
		var eventSources ={}
			,eventInfoArr = [];
		evtData = evtData.filter(function (evtItem){
			var _tmpSdt = evtItem[colModel.start];
			if(!_tmpSdt) return false; 
					
			evtItem[colModel.end] = evtItem[colModel.end] || _tmpSdt;
	
			if(!isBetweenDate(makeMoment(_tmpSdt).toDate().getTime()
				,makeMoment(evtItem[colModel.end]).toDate().getTime()
				,viewFirstTime
				,viewEndTime)
				){
				return false; 
			}
			
			evtItem._pubCID = _this.options.prefixId+pubcIDX;
			eventSources[evtItem._pubCID] = evtItem;
			++pubcIDX;
			
			if(evtItem[colModel.repeat]){
				evtItem._repeatStart = evtItem[colModel.start];
				evtItem._repeatEnd = evtItem[colModel.end];

				repeatItem.push(evtItem);
				return false; 
			}
			
			eventInfoArr.push({
				pubCID	:evtItem._pubCID
				,start : evtItem[colModel.start]+(evtItem[colModel.startTime]?' '+evtItem[colModel.startTime]:'')
				,end : evtItem[colModel.end]+(evtItem[colModel.endTime]?' '+evtItem[colModel.endTime]:'')
			})

			return true;
		});

		_this.config.eventSources=eventSources;
				
		$.each(repeatItem, function (i ,item){
			var type = item[colModel.repeat]
				,repeatInfo = item[colModel.repeatInfo] ||{}
				,startDt = makeMoment(item['_repeatStart'])
				,exceptionArr= item[colModel.repeatException]
				,exceptionInfo = {};
			
			if( exceptionArr && $.isArray(exceptionArr)){
				$.each(exceptionArr, function (j,jItem){
					exceptionInfo[jItem] = true; 
				})
			}

			if(typeof repeatInfo==='string'){
				repeatInfo = $.parseJSON(repeatInfo);
			}

			if($.isArray(repeatInfo)){
				$.each(repeatInfo,function (j , jItem){
					addRepeatItem(eventInfoArr,exceptionInfo,item, makeMoment(jItem.start), makeMoment(jItem.end),viewFirstTime, viewEndTime);
				});
				return true;
			}
		
			var cycle = parseInt((repeatInfo[colModel.cycle] || 1),10)
				,days = parseInt(repeatInfo[colModel.days],10)
				,tmpStartTime = repeatInfo[colModel.startTime]
				,tmpEndTime = repeatInfo[colModel.endTime];
			
			if(cycle==0){
				return ; 
			}

			if(type=='year'){ // 년 반복일정 처리.
				var startMMDD = startDt.format('MM-DD'); 
				startDt = makeMoment((viewRangeLast.year()+(startDt.month()==11 && viewRangeLast.month()==0?-1:0))+'-'+startMMDD);
			
				addRepeatItem(eventInfoArr,exceptionInfo,item, startDt, startDt.clone().add(days,'day'),viewFirstTime, viewEndTime ,tmpStartTime , tmpEndTime);
			}else{

				var repeatStart , repeatFirst = first.clone().add((days*-1),'day')
					,len =1, flag = true;

				if(startDt.diff(first ,'day') > -1 || startDt.diff( repeatFirst,'day') > -1){
					repeatStart =startDt;
					flag = false; 
				}

				if(type=='month'){ // 월 반복일정 처리.
					var startDD= startDt.format('DD');
					
					if(flag){
						var num = repeatFirst.startOf(type).diff(startDt.clone().startOf(type) ,type);
						num += (num%cycle > 0 ? cycle -num%cycle : 0);
						repeatStart = startDt.clone().startOf(type).add(num,type);
					}

					len = last.clone().startOf(type).diff(repeatStart.startOf('month'),type);
					len = Math.ceil(len/cycle)+1;

					for (var j=0; j < len ;j++){
						var tmpStartDt = makeMoment(repeatStart.clone().add(j,'month').format('YYYY-MM')+'-'+startDD); 
						if(tmpStartDt.isValid()){ 
							var monthDiff = tmpStartDt.diff(startDt,'month');
							if(monthDiff % cycle==0){
								addRepeatItem(eventInfoArr,exceptionInfo,item, tmpStartDt, tmpStartDt.clone().add(days,'day'),viewFirstTime, viewEndTime ,tmpStartTime , tmpEndTime);
							}
						}
					}

				}else if(type=='week'){ // 주 반복일정 처리.
						
					if(flag){
						var num = repeatFirst.diff(startDt.clone().startOf('week') ,'week');
						num += (num%cycle > 0 ? cycle -num%cycle : 0);
						repeatStart = startDt.clone().startOf('week').add(num,'week');
					}
					
					len = last.diff(repeatStart,'week');
					len = Math.ceil(len/cycle)+1;
					len = len  < 1 ? 1 :len;

					var repeat_day = repeatInfo.REPEAT_DAY||'';

					var tmpRepeatDayArr= repeat_day.split(',')
						,repeatDayArr = [];
					for(var k =0 ;k <tmpRepeatDayArr.length;k++){
						var repeatDayNum = tmpRepeatDayArr[k]
						if(repeatDayNum!='' && !isNaN(repeatDayNum)){
							repeatDayArr.push(parseInt(tmpRepeatDayArr[k],10));
						}
					}
					
					var tmpStartDt, weekDayNum, repeatDayLen = repeatDayArr.length;
					for (var j=0;j <len ;j++){
						weekDayNum = repeatStart.weekday();
						
						for(var k =0 ;k <repeatDayLen;k++){
							tmpStartDt = repeatStart.clone().add(repeatDayArr[k]-weekDayNum,'day'); 
							addRepeatItem(eventInfoArr,exceptionInfo,item, tmpStartDt, tmpStartDt.clone().add(days,'day'),viewFirstTime, viewEndTime ,tmpStartTime , tmpEndTime);
						}
												
						if(weekDayNum != 0){
							repeatStart.startOf('week');
						}
						repeatStart.add(cycle,'week');
					}
				}else if(type=='day'){ // 일 반복일정 처리.


					if(flag){
						var num = repeatFirst.diff(startDt,type);
						num += (num%cycle > 0 ? cycle -num%cycle : 0);
						repeatStart = startDt.clone().add(num,'day');
					}

					len = last.clone().diff(repeatStart,type);
					len = Math.ceil(len/cycle);
										
					for (var j=0; j <= len ;j++){
						addRepeatItem(eventInfoArr,exceptionInfo,item, repeatStart, repeatStart.clone().add(days,'day'),viewFirstTime, viewEndTime ,tmpStartTime , tmpEndTime);
						repeatStart.add(cycle,'day');
					}
				}
			}
		});

		//이벤트 정보 정렬
		eventInfoArr.sort(function (a,b){
			var f1= makeMoment(a.start)
				,f2 = makeMoment(b.start)
				,e1= makeMoment(a.end)
				,e2 = makeMoment(b.end)
				,f1Ymd = f1.format('YYYYMMDD'), f2Ymd = f2.format('YYYYMMDD')
				,e1Ymd = e1.format('YYYYMMDD'), e2Ymd = e2.format('YYYYMMDD')
				,f1Hm = f1.format('HHmm') , f2Hm = f2.format('HHmm')
				,e1Hm = e1.format('HHmm') , e2Hm = e2.format('HHmm');
			
			return f1Ymd == f2Ymd 
					?(
						e1Ymd== e2Ymd 
						?(
							f1Hm==f2Hm ? (e1Hm==e2Hm ? 0 :(e1Hm > e2Hm ? -1: 1 ) ) :(f1Hm > f2Hm ? 1 : -1)
						):(
							e1Ymd > e2Ymd ? -1 : 1
						)
					):(
						f1Ymd > f2Ymd ? 1 : -1
					);
			
		});

		// 시간별 이벤트 담기위한 객체
		_this.config.dayEventInfo = {};
		// 월별 이벤트 담기 위한 객체.
		_this.config.eventRangeArrInfo = {};

		if(mode=='month'){
			_this._setMonthEventData(eventInfoArr);
		} else {
			_this._setTimeEventData(eventInfoArr);
		}
	}
	//시간별 이벤트정보 가공
	,_setTimeEventData : function (evts){
		var _this = this;

		var viewMonthDayIdx= _this.options.viewMonthDayIdx
			,dateInfo = _this.config.dateInfo
			,colModel = _this.options.event.colModel; 
				
		var firstDayObj =  new Date(dateInfo.start)
			,lastDayObj =  new Date(dateInfo.end);

		firstDayObj.setHours(0, 0, 0, 0);
		lastDayObj.setHours(23, 59, 59, 59);
		
		var monthFirstTime = firstDayObj.getTime()
			, monthLastTime = lastDayObj.getTime();
	
		var _sDt, _eDt, _sTime, _eTime;
		var dayEventInfo = {}
			, allDayEvent ={}
			, item 
			, events ={};

		// 일정 데이타 계산
		for (var i=0 ; i < evts.length ; i++){
			item = evts[i];
			
			var tmpEventStart, rangeNum , _rangeItem,tmpStart, tmpEnd;
			
			tmpStart = item.start;
			tmpEnd = item.end;

			_sDt = makeMoment(tmpStart);
			_sTime = _sDt.toDate().getTime();
			_eDt = makeMoment(tmpEnd);
			_eTime = _eDt.toDate().getTime();

			tmpEventStart = _sTime < monthFirstTime ? dateInfo.start : _sDt.format('YYYY-MM-DD');
						
			events = getAddEvt(events,tmpEventStart, item);
					
			rangeNum = _this._compareCalendarDate(tmpEventStart, (_eTime > monthLastTime? dateInfo.end :tmpEnd));
			item.realRangeNum = _this._compareCalendarDate(tmpStart, tmpEnd);
			item.rangeNum = rangeNum;
			
			if(item.realRangeNum > 1){
				allDayEvent = getAddEvt(allDayEvent, tmpEventStart, _this._setColspanNum(item,rangeNum));
			} else {
				dayEventInfo = getAddEvt(dayEventInfo,tmpEventStart, _this._setColspanNum(item,rangeNum));
			}
		}

		_this._getTimeRangeEventInfo(dayEventInfo, _this.config.eventSources, colModel);
		_this.config.dayEventInfo=dayEventInfo;
		_this.config.eventRangeArrInfo = _this._getRangeEventInfo(allDayEvent, 't');
	}
	// 일 일정 정보 구하기.
	,_getTimeRangeEventInfo : function (dayEventInfo, eventSources, colModel){
		var _this  = this;

		if(Object.keys(dayEventInfo).length > 0){
			
			var viewDateArr = _this.options.viewDateArr
				,dateLen = viewDateArr.length;

			var evtArr, _dItem, evtItem
				,dateRangeInfo=[],rangeItem;
				
			// 연속 일정 계산.
			for(var h=0; h< dateLen; h++){
				_dItem = viewDateArr[h];
				evtArr = dayEventInfo[_dItem.yyyy_mm_dd];

				if(!evtArr || evtArr.length < 1) continue; 

				dateRangeInfo = {};
				
				var tmpStartDt,tmpEndDt, stdHhmm, endHhmm;

				var timeIdxObj ={}, sequenceMap = {},evtItemArrPos = {},beforeSequenceMap = {};

				for (var j=0; j<evtArr.length; j++){
					evtItem = evtArr[j];
					
					evtItemArrPos[evtItem.pubCID] = j; 
					tmpStartDt = makeMoment(evtItem.start);
					tmpEndDt = makeMoment(evtItem.end);

					stdHhmm = parseInt(tmpStartDt.format('HHmm'),10); 
					endHhmm = parseInt(tmpEndDt.format('HHmm'),10);

					if(typeof sequenceMap[stdHhmm] === 'undefined')	sequenceMap[stdHhmm] = [];
					if(!dateRangeInfo[stdHhmm]) dateRangeInfo[stdHhmm]=[];
					
					var _rowIdx=timeIdxObj[stdHhmm]= typeof timeIdxObj[stdHhmm]==='undefined' ? 0 : timeIdxObj[stdHhmm]+1
						,dayArr = sequenceMap[stdHhmm]
						,sortFlag = false,_prevIdx =-1,_nextIdx=-1;
					
					sequenceMap[stdHhmm].sort(function(a,b) { return a - b; });

					for (var y =0; y < _rowIdx; y++){
						if(dayArr[y] > y){
							_prevIdx = y-1;
							_nextIdx = dayArr[y];
							_rowIdx = y;
							sortFlag = true; 
							break; 
						}
					}
					
					sequenceMap[stdHhmm].push(_rowIdx);
					
					//일정 중간에 사이에 들어간 데이터 처리.
					if(sortFlag){
						evtItem.isBetween = true;
						sequenceMap[stdHhmm].sort(function(a,b) { return a - b; });

						evtItem.betweenNextColIdx = beforeSequenceMap[stdHhmm+''+_nextIdx];
						(eventSources[beforeSequenceMap[stdHhmm+''+_prevIdx]]||{}).betweenNextColIdx= _rowIdx
					}
					
					evtItem.viewFlag = true;
					evtItem.colIdx = _rowIdx; 

					dateRangeInfo[stdHhmm].push(evtItem);
					beforeSequenceMap[stdHhmm+''+_rowIdx] = evtItem.pubCID;

					while(stdHhmm < endHhmm){

						if( (stdHhmm-30)%100){
							stdHhmm+=30;
						}else{
							stdHhmm+=70;
						}
						if(stdHhmm == endHhmm) break; 

						if(!dateRangeInfo[stdHhmm]){
							dateRangeInfo[stdHhmm]=[];
						}
						
						timeIdxObj[stdHhmm]= typeof timeIdxObj[stdHhmm]==='undefined' ? 0 : timeIdxObj[stdHhmm]+1;

						if(typeof sequenceMap[stdHhmm] === 'undefined'){
							sequenceMap[stdHhmm] = [];
						}

						beforeSequenceMap[stdHhmm+''+evtItem.colIdx] = evtItem.pubCID;

						sequenceMap[stdHhmm].push(evtItem.colIdx);
						dateRangeInfo[stdHhmm].push({pubCID: evtItem.pubCID ,colIdx :evtItem.colIdx});
					}
				}

				for(var key in dateRangeInfo){
					var dri = dateRangeInfo[key]
						,driLen = dri.length
						,_w = driLen == 1 ? 100 : 100/driLen+ (100/driLen)/8;
					

					var lastItem = dri[driLen-1]
						,widthFlag = (lastItem.viewFlag && lastItem.colIdx+1 == driLen? true :false)
						,tmpEvtItem;
				
					var colIdxPubMap={};
					for(var z=0; z < driLen; z++){
						tmpEvtItem = dri[z];
						var prevEvtItem ={left :0,width:_w};

						colIdxPubMap[tmpEvtItem.colIdx] = tmpEvtItem.pubCID;
						
						if(tmpEvtItem.viewFlag===true){
							if(tmpEvtItem.colIdx != 0){
								prevEvtItem = evtArr[evtItemArrPos[colIdxPubMap[tmpEvtItem.colIdx-1]]] ||{}; 	
							}

							tmpEvtItem.width = _w;
							tmpEvtItem.overNum = driLen-z-1;
							tmpEvtItem.left = tmpEvtItem.colIdx*prevEvtItem.width -(tmpEvtItem.colIdx*prevEvtItem.width/8);
							tmpEvtItem.prevLeftObj = prevEvtItem;
							tmpEvtItem.zindex = z;
							prevEvtItem.nextColIdx = tmpEvtItem.colIdx;
							prevEvtItem.overNum = tmpEvtItem.overNum+1;
						}
					}
					
					var prevObj = lastItem.prevLeftObj; 
					var idx = driLen-1; 
					// 위치값 잡기.
					while(widthFlag && prevObj){ 
						prevObj.width = _w;
						prevObj.overNum = driLen-idx;
						prevObj.left = prevObj.left == 0 ? 0 : prevObj.colIdx*prevObj.prevLeftObj.width -(prevObj.colIdx*prevObj.prevLeftObj.width/8);
						prevObj = prevObj.prevLeftObj;
						--idx;
					}
				}
			}
		}
		return dayEventInfo; 
	}
	// 연속 일정 정보 구하기. 
	,_getRangeEventInfo :function (eventRangeInfo, type){
		var _this  = this
			, eventRangeArrInfo = {}
			, maxEventCount = 0, dayMoreCount = {};

		if(Object.keys(eventRangeInfo).length > 0){
			
			var viewDateArr = _this.options.viewDateArr
				,dateLen = viewDateArr.length;
			
			var evtArr, _dItem, evtItem , _day
				,dateRangeInfo=[],rangeItem;
			
			var dayRowIdx ={}, _prevDayInfo = {}, evtArrIdx = 0 , evtArrItemMap = {};
			// 연속 일정 계산.
			for (var i=0; i < dateLen ;i++){
				// 로직 처리 할것 날짜의 대한것.
				_dItem = viewDateArr[i];
				_day = _dItem.yyyy_mm_dd; 
				evtArr = eventRangeInfo[_day];

				if(type=='m' && (i!=0 && i%7==0)) {
					dateRangeInfo = [];
					_prevDayInfo = {};
					evtArrIdx = 0; 
				}

				if(evtArr){
					for (var j=0; j<evtArr.length; j++){
						evtItem = evtArr[j];

						dateRangeInfo.push({
							evtIdx : evtArrIdx
							,range : evtItem.spanNum	//이벤트 연속 기간
							,isStart :true			// 일정 시작 여부
						});
						evtArrItemMap[evtArrIdx] = evtItem; 
						++evtArrIdx;
					}
				}

				var rangeLen = dateRangeInfo.length;
				var sequenceMap = {};
				for (var z=0; z < rangeLen; z++){
					rangeItem = dateRangeInfo[z];
					
					if(rangeItem.range < 1)	continue; 

					var isStart = rangeItem.isStart;
					var _rowIdx = 0;
					
					_rowIdx=dayRowIdx[_day]= typeof dayRowIdx[_day]==='undefined' ? 0 : dayRowIdx[_day]+1;
					if(!isStart){
						
						_rowIdx = _prevDayInfo[rangeItem.evtIdx];
						
						if(typeof sequenceMap[_day] === 'undefined'){
							sequenceMap[_day] = [];
						}
						sequenceMap[_day].push(_rowIdx);
						sequenceMap[_day].sort(function(a,b) { return a - b; });
					}else{
						if(typeof sequenceMap[_day] !== 'undefined'){
							var dayArr = sequenceMap[_day];
							var sortFlag = false;
							for (var y =0; y < _rowIdx; y++){
								if(dayArr[y] > y){
									sequenceMap[_day].push(y);
									_rowIdx = y; 
									sortFlag = true; 
									break; 
								}
							}

							if(sortFlag){
								sequenceMap[_day].sort(function(a,b) { return a - b; });
							}else{
								sequenceMap[_day].push(_rowIdx); // 맨 나중에 들어간 값 추가. 	
							}
						}
					}
					
					if(!eventRangeArrInfo[_day]){
						eventRangeArrInfo[_day] = {};
					}
					evtItem = evtArrItemMap[rangeItem.evtIdx];

					eventRangeArrInfo[_day][_rowIdx]={
						pubCID : evtItem.pubCID
						,range : evtItem.spanNum
						,realRangeNum : evtItem.realRangeNum
						,start : evtItem.start
						,end : evtItem.end
						,isStart : isStart
					}

					if(_rowIdx+1> _this.options.maxEventRow) dayMoreCount[_day]=(( dayMoreCount[_day] || 0 )+1);
									
					_prevDayInfo[rangeItem.evtIdx] = _rowIdx;
					rangeItem.isStart  = false;
					rangeItem.range = rangeItem.range == 1 ? -1 : rangeItem.range -1;
					dateRangeInfo[z] = rangeItem;
				}
			}
		}

		_this.config.dayMoreCount =dayMoreCount;
	
		return eventRangeArrInfo; 
	}
	// 일정 이벤트정보 가공
	,_setMonthEventData : function (evts){
		var _this = this;

		var viewDateArr = _this.options.viewDateArr
			,viewMonthDayIdx= _this.options.viewMonthDayIdx
			,dateInfo = _this.config.dateInfo	
			,dateLen = viewDateArr.length
			,colModel = _this.options.event.colModel; 

		var monthFirstDayObj =  new Date(dateInfo.viewFirst)
			,monthLastDayObj =new Date(dateInfo.viewLast);

		monthFirstDayObj.setHours(0, 0, 0, 0);
		monthLastDayObj.setHours(23, 59, 59, 59);
		
		var monthFirstTime = monthFirstDayObj.getTime()
			, monthLastTime = monthLastDayObj.getTime();

		var _sDt , _eDt ,_sTime,_eTime;
		var monthEventRangeInfo = {}
			, item 
			, events ={};

		// 일정 데이타 계산
		for (var i=0 ; i < evts.length ; i++){
			item = evts[i];
			
			var tmpEventStart, rangeNum , _monthDayIdx, _rangeItem
				,tmpStart, tmpEnd;
			
			tmpStart = item.start; 
			tmpEnd = item.end;

			_sDt = makeMoment(tmpStart);
			_sTime = _sDt.toDate().getTime();
			_eDt = makeMoment(tmpEnd);
			_eTime = _eDt.toDate().getTime(); 
			
			tmpEventStart = _sTime < monthFirstTime ? dateInfo.viewFirst : _sDt.format('YYYY-MM-DD');
					
			events = getAddEvt(events,tmpEventStart, item);
			
			if(tmpStart == tmpEnd){
				monthEventRangeInfo = getAddEvt(monthEventRangeInfo,tmpEventStart, _this._setColspanNum(item,1));
				continue; 
			}
		
			rangeNum = _this._compareCalendarDate(tmpEventStart, (_eTime > monthLastTime? dateInfo.viewLast :tmpEnd));
			item.realRangeNum = _this._compareCalendarDate(tmpStart, tmpEnd);
			item.rangeNum = rangeNum;

			if(rangeNum > 1){
				_monthDayIdx = viewMonthDayIdx[tmpEventStart];
				
				var _weekLastNum = ((Math.floor(_monthDayIdx/7)+1)*7); 

				if(_monthDayIdx+rangeNum < _weekLastNum) {
					monthEventRangeInfo = getAddEvt(monthEventRangeInfo,tmpEventStart, _this._setColspanNum(item,rangeNum));
					continue; 
				}

				var firstSpan = _weekLastNum-_monthDayIdx; 
				monthEventRangeInfo = getAddEvt(monthEventRangeInfo,tmpEventStart, _this._setColspanNum(item,firstSpan));
				rangeNum = rangeNum-firstSpan;
				
				if(rangeNum > 0){
					var _dayIdx = _monthDayIdx+firstSpan;
					var n = Math.floor(rangeNum/7);
					
					if(n > 0){
						for (var l =0; l < n ;l++){
							monthEventRangeInfo = getAddEvt(monthEventRangeInfo,viewDateArr[_dayIdx].yyyy_mm_dd, _this._setColspanNum(item,7));
							_dayIdx+=7;
						}
					}

					var mod = rangeNum % 7; 

					if(mod > 0){
						monthEventRangeInfo = getAddEvt(monthEventRangeInfo,viewDateArr[_dayIdx].yyyy_mm_dd, _this._setColspanNum(item,mod));
					}
				}
			}else{
				monthEventRangeInfo = getAddEvt(monthEventRangeInfo,tmpEventStart, _this._setColspanNum(item,rangeNum));
			}
		}

		_this.config.eventRangeArrInfo= _this._getRangeEventInfo(monthEventRangeInfo, 'm');	
	}
	// colspan 셋팅.
	,_setColspanNum : function (pRangeItem, pNum){
		var _addObj = $.extend(true,{},pRangeItem);
		_addObj.spanNum = pNum;
		return _addObj; 
	}
	// 캘린더 그리기.
	,drawCalendar : function (year, month , day, resizeFlag){
		var _this = this;

		var _yyyy = _this.config.beforeDate.yyyy
			,mode = _this.options.dayViewMode
			,viewMode = _this.options.viewMode.split('-')[0];
						
		var redrawYear = false; // select 년이 변경 되었을경우.

		if(resizeFlag !== true){
			if(year != _yyyy){
				redrawYear = true; 
				_this._setMemorialDayInfo();
			}

			_this.config.beforeDate ={
				yyyy :year
			}

			if($.isFunction(_this.options.beforeCalendar)){
				_this.options.beforeCalendar.call(_this, {year:year, month:month});
			}
		}
		
		if(viewMode=='mini'){
			_this.miniCalendar({year:year, month:month , day:day, mode:mode});
		}else if(viewMode=='full'){
			_this.fullCalendar({year:year, month:month , day:day, mode:mode});
		}else{
			_this.fullCalendar({year:year, month:month , day:day, mode:mode});
		}
		
		if($.isFunction(_this.options.afterCalendar)){
			_this.options.afterCalendar.call(_this, {year:year, month:month});
		}

		if(_this.options.useYearInput ===true && _this.options.initFlag !== true){
			_this._setInputBoxEvent();
		}
	}
	// html 그리기
	,drawCalendarHtml : function (year , month, html){
		var _this  = this; 
		if(_this.options.initFlag !== true){
			_this.pubcElement.empty().html(html);
		}else{
			$('#'+_this.prefix+' .pubcalendar_year_txt').val(year);
			$('#'+_this.prefix+' .pubcalendar_year_view').empty().html(year);
			$('#'+_this.prefix+' .pubcalendar_month_select').val(parseInt(month,10));
			$('#'+_this.prefix+'pc_body').empty().html(html);
		}
	}
	// 년도 입력 박스 
	, _setInputBoxEvent : function (){
		var _this = this; 

		var _yearTxt = $('#'+_this.prefix+' .pubcalendar_year_txt');
		var _yearView = $('#'+_this.prefix+' .pubcalendar_year_view');
		
		_yearView.on('dblclick',function(){
			_yearView.hide();
			_yearTxt.show();
			_yearTxt.focus();
			_yearTxt.select();
		});

		function _drawCal(){
			_yearTxt.hide();
			_yearView.show();
			var yVal = _yearTxt.val(); 
			if(isNaN(yVal) || yVal.length >  4){
				_yearView.trigger('dblclick');
				return true; 
			}

			_this._loadEventData(yVal , _this.options._date.mm ,1,_this.options.dayViewMode);
		}

		_yearTxt.on('keydown',function(e) { 
			if (e.keyCode == 13){
				_drawCal();
			}
		});
		_yearTxt.focusout (function (){
			_drawCal();
		})
	}
	// 날짜 비교.
	,_compareCalendarDate :function (sDt, eDt){
		var startDt = makeMoment(sDt).toDate();
		startDt.setHours(0, 0, 0, 0);
		var endDt = makeMoment(eDt).toDate();
		endDt.setHours(23, 59, 59, 59);
		
		return Math.ceil((endDt.getTime() - startDt.getTime())/86400000);
	}
	// 시간별 일정 드래그 이벤트 처리.
	,setTimeCalendarEvent :function (){
		var _this = this;

		function getPostionTime(val){
			val = val> 48 ?48 : val;
			var _h = Math.floor(val/2);
			_h = _h==0?12:_h;
			return (_h < 10 ?'0'+_h:_h)+ (val%2 > 0?'30':'00');
		}

		_this.element.on('touchstart.pubc.drag mousedown.pubc.drag','.time-item-wrapper',function (e){

			var sObj = $(this)
				,_idx = sObj.attr('_idx')
				,_date = sObj.attr('date');

			var  startY = e.offsetY;
			var startEvt = e.originalEvent.touches
				,startPageY = startEvt ? startEvt[0].pageY : e.pageY;
			
			var  startH = Math.floor(startY/_TIME_HALF_HEIGHT);
						
			var overHtm = $('<div class="time-over-holder"><div class="time-txt-area"></div></div>');
			$('#'+_this.prefix+' .time-over'+_idx).empty().html(overHtm);
			var timeTxtArea = overHtm.find('.time-txt-area');
			
			var bodyContent = $('#'+_this.prefix+' .time-body-content');

			var selectDt = _this.options.viewDateArr[_idx];

			var selectTime = {mode:'t',start :selectDt,end :selectDt,starthhmm:getPostionTime(startH),endhhmm:getPostionTime(startH+2)} , beforeFirst=-1, beforeEnd = -1
				,startScrollY = bodyContent.scrollTop();
		
			_doc.on('touchmove.pubcmove mousemove.pubcmove',function (e1){

				var oe = e1.originalEvent.touches
					,oy = oe ? oe[0].pageY : e1.pageY
					,scrollTop = bodyContent.scrollTop();

				var endY = oy-startPageY+startY+(scrollTop - startScrollY)
					,endH = Math.ceil(endY/_TIME_HALF_HEIGHT)
					,_sh = startH > endH ? startH+1 :startH;

				var first = Math.min(_sh, endH)
					,end =  Math.max(_sh , endH);

				if(beforeFirst==first && beforeEnd== end) return ;  // end  처리.

				beforeFirst = first;
				beforeEnd=end;

				first = first < 0 ? 0 : first;
				end = end > 48 ? 48 : end;
				
				var _top = first*_TIME_HALF_HEIGHT;	
				var _height =(end - first)*_TIME_HALF_HEIGHT ;
				_height = _height > 0 ?_height:_TIME_HALF_HEIGHT;
				overHtm.css('height',_height).css('top',_top).css('display','block');
				selectTime.starthhmm = getPostionTime(first);
				selectTime.endhhmm = getPostionTime(end);

				timeTxtArea.empty().html(selectTime.starthhmm+'~' +selectTime.endhhmm );
			}).on('touchend.pubcmove mouseup.pubcmove mouseleave.pubcmove', function (e2){
				e2.stopPropagation();
				overHtm.remove();

				_this.config.dragSelect = true;

				_doc.off('touchend.pubcmove mouseup.pubcmove').off('touchmove.pubcmove mousemove.pubcmove mouseleave.pubcmove');
								
				_this.eventWrite(selectTime);
			});

			return false; 
		})
	}
	// 버튼 이벤트 처리.
	,setViewModeBtnEvent : function (){
		var _this =this; 
		
		$('#'+_this.prefix+' .pubc_view_mode_btn').on('click',function (e){
			var sEle = $(this)
				,_mode = sEle.attr('_mode');

			if(sEle.hasClass('pubc-state-active')) return ; 
			
			$('#'+_this.prefix+' .pubc-state-active').removeClass('pubc-state-active');
			sEle.addClass('pubc-state-active');
			
			_this.options.viewMode = _mode=='m' ? 'full-month' : (_mode=='w'?'full-week':'full-day');

			_this._loadEventData(_this.options._date.yyyy,_this.options._date.mm,_this.options._date.dd);
		})

		$('#'+_this.prefix+' .pubc-today-btn').on('click',function (e){
			var sEle = $(this);

			_this._loadEventData(_this.options.todayDate.yyyy,_this.options.todayDate.mm,_this.options.todayDate.dd);
		})
		
	}
	,_layerOpen : function (mode){
		var layerEle = $('#'+this.prefix+' .pubc-dim-layer-area');
		layerEle.attr('view-layer',mode).addClass('open');
	}
	// 일정 작성.
	,eventWrite : function (dayInfo){
		var _this = this;
		
		_this._layerClose();

		if($.isFunction(_this.options.eventWrite)){
			_this.options.eventWrite(dayInfo);
			return false;
		}

		_this._layerOpen("write");
		$('#'+_this.prefix+' #pubc_title').val('')
		$('#'+_this.prefix+' #pubc_start_dt').val(dayInfo.start.yyyy_mm_dd);
		$('#'+_this.prefix+' #pubc_end_dt').val(dayInfo.end.yyyy_mm_dd);
		return ; 
	}
	// 달력 날짜 클릭.
	,dayClick :function (obj){
		var _this = this; 
		if($.isFunction(_this.options.dayClick)){
			_this.options.dayClick(obj);
			return false;
		}
					
		$('#'+_this.prefix+' .pubc-state-active').removeClass('pubc-state-active');
		$('#'+_this.prefix+' .pubc_view_mode_btn[_mode="d"]').addClass('pubc-state-active');
			
		_this.options.viewMode = 'full-day';

		var dayArr = obj.day.split('-');
		_this._loadEventData(dayArr[0],dayArr[1],dayArr[2]);
	}
	// 더보기 클릭.
	,eventMoreClick : function (){
		var _this = this;

		$('#'+_this.prefix).on('click','.pub_calendar_evt_more>.pc_more',function(e){
			var sEle = $(this)
				,_idx = sEle.attr('_idx');

			var dayItem = _this.options.viewDateArr[_idx];
				
			var _day = dayItem.yyyy_mm_dd;
			var dayEvtItem = _this.config.eventRangeArrInfo[_day]
				,itemArr = [];
			if(dayEvtItem){
				for(var key in dayEvtItem){
					var tmpItem = $.extend(true,{},_this.config.eventSources[dayEvtItem[key].pubCID]); 
					tmpItem._range = dayEvtItem[key];
					itemArr.push(tmpItem);
				}
			};

			if($.isFunction(_this.options.eventMoreClick)){
				_this.options.eventMoreClick.call(_this,itemArr);
				return false; 
			}
			viewMoreItem({evt :e, idx:_idx, dayInfo:dayItem, date:_day, items:itemArr});
		});

		function viewMoreItem(pObj){
			var items = pObj.items;
			_this._layerClose(pObj.evt);

			var moreEle = $('#'+_this.prefix+' .pub_calendar_more_area_wrap');
			moreEle.addClass('open');
			
			var sEle = $('#'+_this.prefix+' .pubc-bg[_idx="'+pObj.idx+'"]'); 

			var moreHtm = [];
			moreEle.css('top',sEle.offset().top-10).css('left', sEle.offset().left-_this._position.left).css('width',sEle.width()); 

			moreHtm.push('<div class="more_header"><span>'+pObj.date+'</span><a href="javascript:;"class="more_close">X</a></div><div class="morelist_wrap">');
			for (var i=0; i<items.length;i++ ){
				moreHtm.push('<div class="moreitem"><a href="javascript:;" class="pubc_evt_item pubc_more_evt"  idx="'+i+'" ><div class="pubc_more_evt">'+items[i][_this.options.event.colModel.title]+'</div></a></div>');
			}
			moreHtm.push('</div>');
			moreEle.empty().html(moreHtm.join(''));
			
			moreEle.find('.more_close').on('click',function (e){
				$(document).trigger('click.bs.pubc.data-api');
			});

			moreEle.find('.pubc_evt_item').on('click',function (e){
				var clickItem = items[ $(this).attr('idx')];
				_this.eventClick({evt :e, item:clickItem});
			});
		}
	}
	//일정 클릭.
	,eventClick :function (pSObj){
		var _this = this;

		if($.isFunction(_this.options.eventClick)){
			_this.options.eventClick.call(_this,pSObj);
			return false;
		}

		var item = pSObj.item
			,_w = _this.options.dayEventSize.w ,_h = _this.options.dayEventSize.h
			,position = _this.getLayerPosition(pSObj.evt ,_w,_h , _this._position.left+20)
			,evt = pSObj.evt; 
		
		if(!$(evt.target).hasClass('pubc_more_evt')) _this._layerClose(evt);

		_this._layerOpen("detail");

		
		_this.config.detailItem = item;
		
		var detailInfo = _this.getLang('full')['event_date']+'\n '+makeMoment(item._range.start).format(_this.options.viewDateFormat)+' ~ '+makeMoment(item._range.end).format(_this.options.viewDateFormat);


		$('#'+_this.prefix+' .header-title').text(item[_this.options.event.colModel.title]);
		$('#'+_this.prefix+' .detail_info').text(detailInfo);

		
	}
	// 이벤트 삭제.
	,eventDelete : function (pObj){
		var _this = this
			,eventObj = _this.options.event
			
		if($.isFunction(_this.options.eventDelete)){
			_this.options.eventDelete(pObj);
			return false; 
		}
		
		if(eventObj.type=='local'){
			var delItem = pObj.item
			,_items  = _this.options.event.items;
		
			for(var i=0 ;i <_items.length; i++){
				if(delItem['_pubCID']==_items[i]['_pubCID']){
					_this.options.event.items.splice(i, 1);
					break; 
				}
			}
			_this._loadEventData(_this.options._date.yyyy,_this.options._date.mm,_this.options._date.dd);
		}else{
			$.ajax($.extend({}, {
				type :'get'
				,cache: false
				,dataType: "json"
				,data: pObj.item
				,success: function(events) {
					_this._loadEventData(_this.options._date.yyyy,_this.options._date.mm,_this.options._date.dd);
				}
				,error: function() {
					_this._loadEventData(_this.options._date.yyyy,_this.options._date.mm,_this.options._date.dd);
				}
			},eventObj.del));
		}
	}
	// 이벤트 상세
	,eventDetail : function (pObj){
		var _this = this; 

		if($.isFunction(_this.options.eventDetail)){
			_this.options.eventDetail(pObj);
			return false; 
		}

		var val =[];
		for(var key in pObj.item){
			val.push(key+' : '+pObj.item[key]);
		}
		alert(val.join('\n'));
	}
	//상세 레이어  위치값 구하기.
	,getLayerPosition :  function (evt,_w,_h,rightMargin){
		
		var evtY = evt.pageY
			,evtX = evt.pageX;

		var win_h = window.innerHeight
			,win_w = window.innerWidth;
		
		var left = 0, top=0; 
		if(evt.clientX+_w > win_w){
			left = win_w - _w-rightMargin;
		}else{
			left = evtX-_w/2;
		}
		
		if(evt.clientY+_h > win_h){
			top = evtY-_h-20;
		}else{
			top=evtY;
		}

		left = left < 0 ? 0 :left; 
		top  = top < 0 ? 0 : top;

		return {top :top , left:left};
	}
	// 달력에 보일 날짜 셋팅.
	,_setViewDayInfo :function (){
		var _this =this
			,tdate =  _this.options._date
			,dateInfo = _this.config.dateInfo;

		var first = makeMoment(dateInfo.viewFirst)
			,last = makeMoment(dateInfo.viewLast);
		
		var viewMonth = tdate.mm;

		var solYear = first.year()
			,solMonth= first.month()+1
			,solDay = first.date();

		var date = new Date(solYear, solMonth - 1, 1);	
		var monthArr = getMonthLastDayArr(solYear)
			,startWeekday = date.getDay();
		
		var dateLen = last.diff(first,'days')+1;

		var viewDateArr = [], tmpDayInfo;
		var monthDayIdx = {};
		for (var i=0; i < dateLen; i++){

			tmpDayInfo ={	
				year : solYear 
				, month : solMonth
				, day : solDay
				, yyyy_mm_dd : solYear+'-'+day2(solMonth)+'-'+day2(solDay)
				, monthType: (viewMonth == solMonth ? 'current' : (viewMonth > solMonth ?'prev':'next') )
			};

			monthDayIdx[tmpDayInfo.yyyy_mm_dd]= i; 
			viewDateArr.push(tmpDayInfo);
			
			/* add a day of solar calendar */
			if (solMonth == 12 && solDay == 31)	{
				solYear++;
				solMonth = 1;
				solDay = 1;
				monthArr = getMonthLastDayArr(solYear);
			}else if (monthArr[solMonth - 1] == solDay){
				solMonth++;
				solDay = 1; 
			}else{
				solDay++;
			}
		}
		_this.options.viewDateArr = viewDateArr;
		_this.config.monthWeekNum = dateLen/7; 
		_this.options.viewMonthDayIdx = monthDayIdx;
		
	}
	// 음력일 계산.
	,getMonthDayInfo : function (dateInfoItem , type, leapmonth){

		var _this = this
			,useLunar = _this.options.useLunar
			,viewDateArr = _this.options.viewDateArr
			,viewYear = dateInfoItem.year
			,viewMonth = dateInfoItem.month
			,viewDay = dateInfoItem.day;

		var dateLen = viewDateArr.length;
		
		var monthLunarCal = []; //음력일을 달로 리턴.
		
		// 달력 시작일에 대한 음력일 계산.
		var lapseSeObj ={};
		if(useLunar){
			var _year = viewDateArr[0].year; 
			// 음력 정보 추출.
			var _calInfo = pubCalendarYearInfo(_year);
			lapseSeObj = _this._getLunElapseDay({year:_year, month:viewDateArr[0].month, day:viewDateArr[0].day}, _calInfo);
		}

		var lunYear = lapseSeObj.lyear
			,lunMonth = lapseSeObj.lmonth
			,lunDay = lapseSeObj.lday
			,lunMonthDay = lapseSeObj.lmonthDay
			,lunLeapMonth =0;
		
		//음력 양력 구하기.
		var tmpDayInfo;
		
		for (var i=0; i < dateLen; i++){
			tmpDayInfo = viewDateArr[i];
			
			if(useLunar){ // 음력 사용시
				tmpDayInfo.lunYear = lunYear;
				tmpDayInfo.lunMonth = lunMonth;
				tmpDayInfo.lunDay = lunDay;
				tmpDayInfo.lunLeapMonth = lunLeapMonth;
				monthLunarCal.push(_this._getMemorialObject(tmpDayInfo, i));	
			}else{ // 양력만 사용시.
				monthLunarCal.push(_this._getMemorialObject(tmpDayInfo, i));
				continue; 
			}

			/* add a day of lunar calendar */
			if (lunMonth == 12 &&((lunarMonthTable[lunYear][lunMonth - 1] == 1 && lunDay == 29) ||	(lunarMonthTable[lunYear][lunMonth - 1] == 2 && lunDay == 30))){
				lunYear++;
				lunMonth = 1;
				lunDay = 1;
				lunMonthDay = getLunMonthDay(lunYear, lunMonth);
			}else if (lunDay == lunMonthDay){
				if (lunarMonthTable[lunYear][lunMonth - 1] >= 3&& lunLeapMonth == 0){
					lunDay = 1;
					lunLeapMonth = 1;
				}else{
					lunMonth++;
					lunDay = 1;
					lunLeapMonth = 0;
				}

				lunMonthDay = getLunMonthDay(lunYear, lunMonth, lunLeapMonth);
			}else{
				lunDay++;
			}
		}

		return monthLunarCal;
	}
	// 다국어 정보 구하기.
	,getLang : function (viewMode){
		return this.options.lang[viewMode] || this.options.lang['mini'];
	}
	// 음력월에 대한 정보 셋팅.
	,setLunarMonthTable :function (lunarMonth){
		_lunarMonthTable = $.extend(lunarMonthTable, lunarMonth);
	}
	// 기념일 셋팅.
	,setMemorialDay : function(memorialDays){
		this.options.memorialDays= $.isArray(memorialDays)?_memorialDays.concat(memorialDays):_memorialDays;
	}
	// 기념일 데이타 셋팅
	,_setMemorialDayInfo : function (){
		var _this = this;

		if(_this.options.useMemorialday !== true) return ; 

		var memorialDayInfo = {}
			,memorialDays1=_this.options.memorialDays;

		var mday, tmpMday; 
		var lunMonthInfo = pubCalendarYearInfo(_this.options._date.yyyy); 
		for (var i=0; i< memorialDays1.length ; i++){
			//{date:'0101',desc : '신정' ,isLunar: false ,holiday :  true}
			tmpMday = mday = memorialDays1[i];
			// 음력 기념일 체크 하지 않음.
			if(_this.options.useLunar !== true && mday.isLunar===true){
				continue ; 
			}
			
			if(mday.isLunar===true && mday.date=='_1231'){
				var lmi = _this._getLunarMonthTable(lunMonthInfo.lunYear);
				tmpMday = $.extend({},mday,'');
				/* set the day before 설날 */
				if (lmi[11] == 1){
					tmpMday.date = '12'+29; 
				}else if (lmi[11] == 2){
					tmpMday.date = '12'+30; 
				}else{
					tmpMday.date = '12'+30; 
				}
			}
			memorialDayInfo[tmpMday.date+''+(tmpMday.isLunar===true?'L':'')] = tmpMday;
		}

		_this.options.memorialDayInfo = memorialDayInfo;
	}
	// 음력 데이타 테이블 보기.
	,_getLunarMonthTable : function (year){
		return _lunarMonthTable[year];
	}
	// 음력 계산
	,_getLunElapseDay : function (solDate, lunDate){
		var _lLeapMonth=0;
		
		var solMonthDay = getMonthLastDayArr(solDate.year);
		
		var _solElapseDay = solDate.day;

		for (var i = 0; i < solDate.month-1; i++)
			_solElapseDay += solMonthDay[i];

		
		var lunYear =lunDate.lunYear
			, lunMonth =lunDate.lunMonth
			, lunDay =lunDate.lunDay
			, lunMonthDay =lunDate.lunMonthDay
			, lunLeapMonth =0;

		var result = lunMonthDay-lunDay ; 
		for (var i=0;i < 12; i++ ){
			if (lunMonth == 12){
				lunYear++;
				lunMonth = 1;
				
				lunMonthDay = getLunMonthDay(lunYear, lunMonth);
			}else{
				if (lunarMonthTable[lunYear][lunMonth - 1] >= 3&& lunLeapMonth == 0){
					lunLeapMonth = 1;
				}else{
					lunMonth++;
					lunLeapMonth = 0;
				}

				lunMonthDay = getLunMonthDay(lunYear, lunMonth, lunLeapMonth)
			}

			if((result+lunMonthDay) <= _solElapseDay){
				result += lunMonthDay;
			}else{
				break; 
			}
		}

		return {
			lyear : lunYear 
			,lmonth : lunMonth 
			,lday : _solElapseDay-result-1
			,lmonthDay : lunMonthDay
			,lunElapseDay : result
			,solElapseDay :_solElapseDay
		}; 
	}
	// 기념일 정보 추출
	,_getMemorialObject : function (dayInfo , index){
		var _this = this; 
		
		var tmpClass = "pub-calendar-black" , tmpMemo="";

		/* memorial day */
		var memorial = _this.getMemorialDay(dayInfo);

		/* 쉬지않는 기념일 */
		var memorialDay = false;
		if (memorial && memorial.holiday == false)
			memorialDay = true;

		//일요일이나 공휴일인 경우
		if ((memorial && memorial.holiday)|| index % 7 == 0)
			tmpClass = "pub-calendar-red";
		//토요일인 경우
		else if (index % 7 == 6)
			tmpClass =  "pub-calendar-blue";
		
		//겹치지 않는 기념일
		if (memorial)
			tmpMemo =  memorial.desc;
		
		dayInfo['className']= (dayInfo.monthType=='prev' ? 'prev_month_day ' :(dayInfo.monthType=='next'?'next_month_day ':'')) +tmpClass; // 색
		dayInfo['lunday'] = dayInfo.lunMonth + "." + dayInfo.lunDay; // 음력
		dayInfo['desc'] = tmpMemo; // 기념일 . 
		dayInfo['memorialday'] = memorialDay;
		dayInfo['lunnaview'] = dayInfo.lunDay=="1" || dayInfo.lunDay=="15" ? "inline" :"none";  // 음력 계산. 
		
		return dayInfo; 
	}
	// 기념일 추출.
	,getMemorialDay :function (dayInfo){
		var _this  = this
			,mdi = _this.options.memorialDayInfo;
		
		//양력일 기념일 추출	
		tmpMdi = mdi[day2(dayInfo.month)+''+day2(dayInfo.day)];
		if(tmpMdi &&  tmpMdi.holiday===true) return tmpMdi;
		
		// 년도 포함 기념일 추출
		var tmpMdi = mdi[dayInfo.year+''+day2(dayInfo.month)+''+day2(dayInfo.day)];
		if(tmpMdi &&  tmpMdi.holiday===true) return tmpMdi;

		//음력일 기념일 추출
		tmpMdi = mdi[day2(dayInfo.lunMonth)+''+day2(dayInfo.lunDay)+'L'];
		if(tmpMdi &&  tmpMdi.holiday===true) return tmpMdi;
	}
	//레이어 닫기
	,_layerClose : function (e){
		if(e){
			if (e && e.which === 3) return false;
			if (e.isDefaultPrevented()) return false;
		}

		function getParent($this) {
			var selector = $this.attr('data-target')

			if (!selector) {
			  selector = $this.attr('href')
			  selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
			}

			var $parent = selector && $(selector)

			return $parent && $parent.length ? $parent : $this.parent()
		}

		$('.pubc-layer-area').each(function () {
			var sEle = $(this);
			var $parent = getParent(sEle);
			
			if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return ;
			
			sEle.removeClass('open');		
		});
	}
	// 레이어 유지.
	,_layerActive: function (e){
		e.stopPropagation();
	}
	,destory:function (){
		delete _datastore[this.selector];
	}
};

// 미니 달력. 시작 ------
Plugin.prototype.miniCalendar = function(opt){ 
	var _this = this
		, mode=opt.mode // mode 1 default 양력, 2 title 음력, 3 양력 title 기념일. , 4 양력 title 음력/기념일. 
		, year=opt.year, month=opt.month, day=opt.day
		, useLunar = _this.options.useLunar; 
	
	var calHTML  = [];
	
	year = parseInt(year,10);
	month = parseInt(month,10);
	
	var _lang =_this.getLang('mini');
	if(_this.options.initFlag !== true){
		_this.element.empty().html('<div id="'+_this.prefix+'" class="mini-pubcalendar '+_this.options.theme+'" style="width:'+_this.options.width+'px;"></div>');
		_this.pubcElement = $('#'+_this.prefix);
		
		calHTML.push(_RenderHTML._renderMiniHeaderHtml(year ,month,_lang , _this.options.colWidth));
		calHTML.push('	<tbody id="'+_this.prefix+'pc_body" class="pubcalendar_body">');
	}

	var _tdate = _this.options.todayDate
		,eventRangeArrInfo = _this.config.eventRangeArrInfo
		,thirdPrintDay=1;

	var dayInfoArr=_this.getMonthDayInfo({year :year, month : month, day:1}); // 음력날짜 . 기념일 가져오기.

	var dateItem ; 
	for (var i=0; i< dayInfoArr.length; i++ ){
		dateItem = dayInfoArr[i];

		thirdPrintDay = dateItem.day;
		if(i%7==0){
			calHTML.push((i==0?'':'</tr>')+'<tr>');
		}
		
		var tempTodayDate = dateItem.yyyy_mm_dd;
		
		var chkFlag=false;
		if(_this.options.eventDisplay===true){
			if(eventRangeArrInfo[tempTodayDate]){
				chkFlag = true; 
			}
		}
		calHTML.push('<td>');
	
		var boldClass='';
		if (_tdate.yyyy_mm_dd == tempTodayDate){
			boldClass='font-bold';
		}
		
		// 모드별 날짜 view
		calHTML.push('<div class="'+(chkFlag?_this.options.eventDisplayClass:'')+'"><a href="javascript:;" class="pubcalendar-day-item '+boldClass+' '+dateItem.className+'" _day="'+tempTodayDate+'" _idx="'+i+'"');
		if(mode=="2"){
			calHTML.push(' title="'+dateItem.desc+'">'+thirdPrintDay); // 기념일 타이블 표시.
		}else if(mode=="3" && useLunar){
			calHTML.push(' title="'+dateItem['lunday']+'" >'+thirdPrintDay); //음력 날짜 타이틀표시.
		}else if(mode=="4" && useLunar){
			calHTML.push(' title="'+dateItem['lunday']+(dateItem['desc']!=""?"/"+dateItem.desc:"")+'" >'+thirdPrintDay); //음력 날짜 기념일 타이틀 표시.
		}else{
			calHTML.push('>'+thirdPrintDay); //음력 날짜 , 메모명.
		}
		calHTML.push('</a></div>'); //음력 날짜 , 메모명.
		
		if(_this.options.eventDisplayHtm !==false){
			calHTML.push('<div class="pc-grid-wrap">');
			calHTML.push((chkFlag?_this.options.eventDisplayHtm:'')); //음력 날짜 , 메모명.
			calHTML.push('</div>');
		}
	}

	if(_this.options.initFlag !== true){
		calHTML.push("</tbody></table>");
		
	}
	
	_this.drawCalendarHtml(year,month,calHTML.join(''));
}

// full 달력. 시작 ------
Plugin.prototype.fullCalendar= function(opt){ 

	var _this =this 
		,viewMode = _this.config.dateInfo.mode
		, year=opt.year, month=opt.month, day=opt.day;
	var calHTML  = [];
	
	year = parseInt(year,10);
	month = parseInt(month,10);
	
	var _lang =_this.getLang('full');
	if(_this.options.initFlag !== true){
		_this.element.empty().html('<div id="'+_this.prefix+'" class="full-pubcalendar '+_this.options.theme+'" onselectstart="return false;" style="width:'+_this.options.width+'px;height:'+_this.options.height+'px;"></div>');
		_this.pubcElement = $('#'+_this.prefix);
		
		calHTML.push(_RenderHTML._renderFullCalHeaderHtml(year ,month,_lang , viewMode));
		calHTML.push('<div id="'+_this.prefix+'pc_body" class="full-pubcaldndar-area">');
	}
	
	if(viewMode=='month'){
		calHTML.push(_this._monthCalendar(opt));
	}else{
		calHTML.push(_this._timeCalendar(opt));
	}
	
	if(_this.options.initFlag !== true){
		calHTML.push('</div>'+_RenderHTML._renderEtcHtml(_this));
	}

	_this.drawCalendarHtml(year,month,calHTML.join(''));
	
	var currentTime = makeMoment();

	if(viewMode=='month'){
		$('#'+_this.prefix+' .view-mode-text').hide();
		$('#'+_this.prefix+' .view-mode-month').show();
	}else{
		$('#'+_this.prefix+' .view-mode-month').hide()
		$('#'+_this.prefix+' .view-mode-text').show();


		var hh = currentTime.format('HH')
			,mm = currentTime.format('mm')
			,_top = (parseInt(hh,10)*(_TIME_HALF_HEIGHT*2)+ (_TIME_HALF_HEIGHT*2)/60*parseInt(mm,10)); 
		
		$('#'+_this.prefix+' .current-time-line').css('top',_top);
		
		var timeBodyCont = $('#'+_this.prefix+' .time-body-content');
		var scrollTop =  _top-(timeBodyCont.height()/2);
		timeBodyCont.scrollTop(scrollTop > 0 ?scrollTop : 0);

		if(viewMode=='day'){
			$('#'+_this.prefix+' .view-mode-text').empty().html(_this.config.dateInfo.start);
		}else{
			$('#'+_this.prefix+' .view-mode-text').empty().html(_this.config.dateInfo.start+' ~ '+_this.config.dateInfo.end)
		}
	}
}

// 월 일정 달력.
Plugin.prototype._monthCalendar= function(opt){ 
	var _this = this
		, mode=opt.mode // mode 1 default 양력, 2 title 음력, 3 양력 title 기념일. , 4 양력 title 음력/기념일. 
		, year=opt.year, month=opt.month, day=opt.day
		, useLunar = _this.options.useLunar; 
	var calHTML  = [];
	
	year = parseInt(year,10);
	month = parseInt(month,10);
	
	var _lang =_this.getLang('full');
	
	var _tdate = _this.options.todayDate
		,eventSources = _this.config.eventSources
		,eventRangeArrInfo = _this.config.eventRangeArrInfo
		,thirdPrintDay=1;

	var dayInfoArr=_this.getMonthDayInfo({year :year, month : month, day:1}); // 음력날짜 . 기념일 가져오기.
	
	var dateItem, _desc='';
	var dateLen = dayInfoArr.length, _idx = 0 , weekLoop = _this.config.monthWeekNum;
	var rowHeight = 100/weekLoop, rowMinHeight = _this.getRowHeight('row');

	var _w = _this.options.colWidth;
	var _lang =_this.getLang('full');

	calHTML.push('<table class="full-pubcalendar-tbl" cellpadding="0" cellspacing="0">');	
	calHTML.push( _RenderHTML._renderColgroupHTML(7,_w));
	calHTML.push('  <thead><tr>		');
	calHTML.push('		<td valign="top" class="pubc-week pubc-week-fc pub-calendar-red">'+_lang.sun+'</td>		');
	calHTML.push('		<td valign="top" class="pubc-week">'+_lang.mon+'</td>		');
	calHTML.push('		<td valign="top" class="pubc-week">'+_lang.tue+'</td>		');
	calHTML.push('		<td valign="top" class="pubc-week">'+_lang.wed+'</td>		');
	calHTML.push('		<td valign="top" class="pubc-week">'+_lang.thu+'</td>		');
	calHTML.push('		<td valign="top" class="pubc-week">'+_lang.fri+'</td>		');
	calHTML.push('		<td valign="top" class="pubc-week pubc-week-lc pub-calendar-blue">'+_lang.sat+'</td>		');
	calHTML.push('	</tr></thread>');
	calHTML.push('</table>');
	
	calHTML.push('<div class="pubcalendar_body">');
	for(var i =0 ;i < weekLoop; i++){
				
		calHTML.push('<div class="month-row" style="top: '+(i*rowHeight)+'%;min-height:'+rowMinHeight+'px;height: '+rowHeight+'%">');
		calHTML.push(_RenderHTML._renderBgTableHtml(i, 7));
		calHTML.push('<table cellpadding="0" cellspacing="0" class="pubc-row-grid-table"><thead><tr>');

		var weekDayArr = []
			,maxWeekRow = 0;

		for(var j =0 ;j < 7; j++){
			dateItem = dayInfoArr[_idx];

			thirdPrintDay = dateItem.day;
					
			var tempTodayDate = dateItem.yyyy_mm_dd;

			weekDayArr.push(tempTodayDate);
			
			if(eventRangeArrInfo[tempTodayDate]){
				var _draiLen = Object.keys(eventRangeArrInfo[tempTodayDate]).length; 
				maxWeekRow = maxWeekRow > _draiLen? maxWeekRow : _draiLen;
			}
			
			calHTML.push('<td>');
			var boldClass='';
			if (_tdate.yyyy_mm_dd == tempTodayDate){
				boldClass='font-bold';
			}
			
			// 모드별 날짜 view
			calHTML.push('<div class="day_area" _idx="'+_idx+'"_day="'+tempTodayDate+'"><div style="float:left;"><a href="javascript:;" class="pubcalendar-day-item '+boldClass+' '+dateItem.className+'" _day="'+tempTodayDate+'" ');
			if(mode=="2"){
				_desc = dateItem['desc'] ||'';
				calHTML.push(' title="'+dateItem.desc+'">'+thirdPrintDay); // 메모명.
			}else if(mode=="3" && useLunar){
				_desc = dateItem['lunday'];
				calHTML.push(' title="'+dateItem['lunday']+'">'+thirdPrintDay); //음력 날짜
			}else if(mode=="4" && useLunar){
				_desc = dateItem['lunday']+(dateItem['desc']!=""?"/"+dateItem.desc:"")
				calHTML.push('>'+thirdPrintDay); //음력 날짜 , 메모명.
			}else{
				calHTML.push('>'+thirdPrintDay); //날짜.
			}
			calHTML.push('</a></div><div class="pubc-write-btn"><span class="glyphicon-plus"></span><span class="day_info">'+_desc+'</span></div></div>'); //음력 날짜 , 메모명.

			++_idx;
		}
		calHTML.push('</tr></thead>');
		

		for (var j =0; j< maxWeekRow; j++){
			calHTML.push('<tr>');
			var totColVal=0; 
			for(var k = 0 ;k < 7; k++){
				var tmpDate = weekDayArr[k]; 
				var evtInfo = eventRangeArrInfo[tmpDate];
				
				if(evtInfo){
					var evtItem = evtInfo[j];
					
					if(evtItem && evtItem.isStart) {
						totColVal += evtItem.range;
						var esItem = eventSources[evtItem.pubCID];
						calHTML.push('<td colspan="'+evtItem.range +'"><div class="pubc-item-wrap '+(evtItem.realRangeNum > 1?'range-item':'')+'" style="background-color:'+(esItem[_this.options.event.colModel.color]||(evtItem.realRangeNum > 1?_this.options.backgroundColor:''))+';"><div class="pub_calendar_evt_item" pubc_key="'+evtItem.pubCID+','+tmpDate+','+j+',r">'+esItem[_this.options.event.colModel.title]+'</div><div></td>');
					}
				}

				if(totColVal < k+1){
					totColVal +=1;
					calHTML.push('<td>&nbsp;</td>');
				}
			}
			calHTML.push('</tr>');

			if(j+1 >= this.options.maxEventRow){
				break; 
			}
		}

		calHTML.push('<tr>');
		for(var k = 0 ;k < 7; k++){
			var moreCount = _this.config.dayMoreCount[weekDayArr[k]];

			if((moreCount && moreCount > 0)) {	
				calHTML.push('<td><div class="pub_calendar_evt_more"><a class="pc_more" _idx="'+(i*7+k)+'">+'+moreCount+' more</a></div></td>');
			}else{
				calHTML.push('<td>&nbsp;</td>');
			}
		}
		calHTML.push('</tr>');
		
		calHTML.push('</table></div>');		
	}
	calHTML.push('</div>');

	return calHTML.join('');
}

// week 일정 보기.
Plugin.prototype._timeCalendar= function(opt){ 
	var _this = this
		, mode=opt.mode // mode 1 default 양력, 2 title 음력, 3 양력 title 기념일. , 4 양력 title 음력/기념일. 
		, year=opt.year, month=opt.month, day=opt.day;
	var calHTML  = [];
	
	year = parseInt(year,10);
	month = parseInt(month,10);
	
	var _lang =_this.getLang('full');
	
	var eventRangeArrInfo = _this.config.eventRangeArrInfo
		,dateInfo = _this.config.dateInfo
		,_rangeNum = dateInfo.viewRangeNum
		,viewDateArr = _this.options.viewDateArr
		,colInfo = _this.options.event.colModel
		,eventSources = _this.config.eventSources
		,allDayMaxLen = 1;

	var weekStartDt = makeMoment(_this.config.dateInfo.start);
	var dateItem, _desc='';
	calHTML.push('<div class="pubc-time-calendar">');
	calHTML.push('	<table cellpadding="0" cellspacing="0" class="pubc-time-calendar-header-tbl">');
	calHTML.push('	<tbody>');
	// 헤더 start
	calHTML.push('	  <tr class="header-tr">');
	calHTML.push('		<td class="header-td-first"></td>');
	calHTML.push('		<td colspan="'+_rangeNum+'">');
	calHTML.push('			<div class="pubc-week-header-wrapper"><table cellpadding="0" cellspacing="0" style="width:100%;"><tr>');
	for(var i=0 ;i < _rangeNum ;i++){
		var tmpDate = viewDateArr[i].yyyy_mm_dd; 
		if(eventRangeArrInfo[tmpDate]){
			var _draiLen = Object.keys(eventRangeArrInfo[tmpDate]).length; 
			allDayMaxLen = allDayMaxLen > _draiLen? allDayMaxLen : _draiLen;
		}

		calHTML.push('<td valign="top" scope="col"><a href="javascript:;" class="pubcalendar-day-item" _day="'+tmpDate+'" _idx="'+i+'">'+_Format.weekFormat(weekStartDt,i, _lang)+'</a></td>');
	}
	calHTML.push('			</tr></table></div>');
	calHTML.push('		</td>');
	calHTML.push('	  </tr>');
	// 헤더 end

	// 종일 일정 start
	calHTML.push('	  <tr>');
	calHTML.push('		<td valign="middle" class="pubc-time-all-fc" style="width:60px;">allDay</td>');
	calHTML.push('		<td colspan="'+_rangeNum+'">');
	calHTML.push('			<div class="week-allday-row position-relative"><div class="week-row"><div class="week-day-bg">');
	calHTML.push(_RenderHTML._renderTimeBgTableHtml(0, _rangeNum));
	calHTML.push('			</div>');
	calHTML.push('			<div class="pubc-time-all-day-info">');

	calHTML.push('				<table cellpadding="0" cellspacing="0" class="pubc-row-grid-table">');

	allDayMaxLen = allDayMaxLen < 1 ? 1 :allDayMaxLen;

	for (var j =0; j< allDayMaxLen; j++){
		calHTML.push('<tr>');
		var totColVal = 0 ; 
		for(var k = 0 ;k < _rangeNum; k++){
			var tmpDate = viewDateArr[k].yyyy_mm_dd; 
			var evtInfo = eventRangeArrInfo[tmpDate];
			
			if(evtInfo){
				var evtItem = evtInfo[j];
				
				if(evtItem  && evtItem.isStart) {
					totColVal += evtItem.range;
					var esItem = eventSources[evtItem.pubCID];
					calHTML.push('	<td colspan="'+evtItem.range+'"><div class="allday-item"><div class="pub_calendar_evt_item" pubc_key="'+evtItem.pubCID+','+tmpDate+','+j+',r">'+esItem[colInfo.title]+'</div></div></td>');
				}
			}

			if(totColVal < k+1){
				totColVal +=1;
				calHTML.push('<td>&nbsp;</td>');
			}
		}
		calHTML.push('</tr>');
	}
	calHTML.push('<tr>');
	for(var k = 0 ;k < _rangeNum; k++){
		calHTML.push('<td>&nbsp;</td>');
	}
	calHTML.push('</tr>');
	calHTML.push('			</table></div>');
	calHTML.push('		</td></tr>');
	calHTML.push('	  </tbody>');
	calHTML.push('	</table>');
	calHTML.push('	<hr class="pubc-divider"/>');
	// 종일 일정 end.
	

	// 시간별 일정 시작. 
	calHTML.push('<div class="time-body-content">');
	calHTML.push('	<table cellpadding="0" cellspacing="0" class="">');
	calHTML.push('	<tbody>');
	calHTML.push('	  <tr>');
	calHTML.push('		<td valign="middle" style="width:60px;">');
	calHTML.push('<div class="pubc-time" _time_idx="24"><span>오전 12</span></div>');
	for (var i=1;i <24 ; i++){
		calHTML.push('<div class="pubc-time" _time_idx="'+i+'"><span>'+(i-12 > 0?'오후 '+(i-12):'오전 '+i)+'</span></div>');
	}
	calHTML.push('		</td>');
	calHTML.push('		<td valign="top" colspan="'+_rangeNum+'" height="1px;">');

	calHTML.push('			<div class="position-relative"><div class="week-day-bg">');
	calHTML.push('<table cellpadding="0" cellspacing="0" class="pubc-row-grid-table"><tr>');
	calHTML.push('	<td colspan="'+_rangeNum+'">');	
	for (var i=0;i <24 ; i++){
			calHTML.push('	<div class="pubc-time-row"><div class="puc-time-half-row"></div></div>	');
	}
	calHTML.push('	</td>	');
	calHTML.push('</tr></table>');
	calHTML.push('			</div>');

	calHTML.push('			<div class="position-relative"><div class="pubc-time-event-area" style="position:absolute;">');	
	calHTML.push('				<div class="current-time-line"></div>');
	calHTML.push('				<table cellpadding="0" cellspacing="0" class="pubc-row-bg-table">');
	calHTML.push('					<tr>');
	
	for(var i=0 ;i < _rangeNum ;i++){
		var _date = viewDateArr[i].yyyy_mm_dd; 
		calHTML.push(_RenderHTML.renderTimeItem(_date, i , _this.config.dayEventInfo[_date], colInfo, eventSources , _this.options.timeBackgroundColor));
	}
	
	calHTML.push('					</tr>');
	calHTML.push('				</table>');
	calHTML.push('			</div></div>');

	calHTML.push('		</td></tr>');

	calHTML.push('	  </tbody>');
	calHTML.push('	</table>');
	calHTML.push(' </div>');
	calHTML.push('</div>');

	return calHTML.join('');
}

//날짜 포멧
var _Format = {
	// 주일 보기 날짜
	weekFormat :function (dt, addDay){
		return dt.clone().add(addDay,'day').format('M/D (ddd)');
	}
}

// 달력 html 
var _RenderHTML = {
	// 상세, 더보기 레이어 html 
	_renderEtcHtml :function (pubcObj){
		var strHtm = [];
		
		
		strHtm.push('<div class="pub_calendar_more_area_wrap pubc-layer-area"></div>');
		strHtm.push('<div class="pubc-layer-area pubc-dim-layer-area" view-layer="">');
		strHtm.push('	<div class="pubc-bg-dim"></div>');

		/* 글쓰기 start*/
		strHtm.push('	<div class="pub-write-content pubc-layer">');
		strHtm.push(		'<div class="write_header"><div class="header-title">일정</div><a href="javascript:;"class="close-btn">X</a></div>');
		strHtm.push(		'<div class="write_wrap">');		
		strHtm.push(		'<div class="write_info">');
		strHtm.push(		'<div><input type="text" name="pubc_title" id="pubc_title" value="" style="width:100%;"></div>');
		strHtm.push(pubcObj.getLang('full')['event_date']+'<br/>');
		strHtm.push(			'<input type="text" id="pubc_start_dt" name="pubc_start_dt"/> ~ <input type="text" id="pubc_end_dt" name="pubc_end_dt"/>');
		strHtm.push(		'</div>');
		strHtm.push(		'<div class="write_btn_area"><span class="write_btn pub-button"><a href="javascript:;">'+pubcObj.getLang('full')['save_btn']+'</a></span></div>');
		strHtm.push(		'</div>');
		strHtm.push('	</div>');
		/* 글쓰기 end */

		/* 상세 start*/
		strHtm.push('	<div class="pub-detail-content pubc-layer">');
		strHtm.push(		'<div class="detail_header"><div class="header-title"></div><a href="javascript:;"class="close-btn">X</a></div>');
		strHtm.push(		'<div class="detail_wrap">');		
		strHtm.push(			'<div class="detail_info"></div>');
		strHtm.push(			'<div class="detail_btn_area"><span class="del_btn pub-button"><a href="javascript:;">'+pubcObj.getLang('full')['delete_btn']+'</a></span><span class="detail_btn pub-button"><a href="javascript:;">'+pubcObj.getLang('full')['detail_btn']+'</a></span></div>');
		strHtm.push(		'</div>');
		strHtm.push('	</div>');
		/* 상세 end */

		strHtm.push('</div>');
		
		return strHtm.join('');
	}
	// 일정 소스 만들기.
	,renderTimeItem : function (_date, idx, evt , colInfo, evtSource, bgColor){
	
		if(!evt) evt=[];

		var calHTML = [];
		calHTML.push('	<td class="time-item-grid">');
		calHTML.push('		<div class="time-item-wrapper" _idx="'+idx+'" date="'+_date+'">');
		calHTML.push('		<div class="time-item-area">');

		var evtItem,esItem
			,len = Object.keys(evt).length;
		var evtPubIdIdx = {};
		for(var i=0 ;i <len;i++){
			evtItem = evt[i];
			evtPubIdIdx[evtItem.pubCID] = i; 
			esItem = evtSource[evtItem.pubCID];
			var sdt = makeMoment(evtItem.start);
			var shh = sdt.toDate().getHours();
			var smm = sdt.toDate().getMinutes();
			
			var edt = makeMoment(evtItem.end)
			
			var _top = (shh*2 + (smm >= 30? 1:0))*_TIME_HALF_HEIGHT;	
			var _height =(edt.diff(sdt,'minute')/30)*_TIME_HALF_HEIGHT;
			_height = _height > 0 ?_height:_TIME_HALF_HEIGHT;

			if(evtItem.isBetween===true){
				evtItem.left =evtItem.prevLeftObj.offsetX||0;
				if(evtItem.overNum < 1){
					evtItem.width = evt[evtPubIdIdx[evtItem.betweenNextColIdx]].left - evtItem.left; 
				}else{
					evtItem.width = evtItem.nextColIdx?(evtItem.nextColIdx - evtItem.colIdx) :1;
					evtItem.width = evtItem.width * evtItem.prevLeftObj.width;
				}
				evtItem.offsetX = evtItem.left+evtItem.width;
			}else{
				var _left= evtItem.prevLeftObj.offsetX||0;
				if(evtItem.left != _left){
					evtItem.left = _left;
					evtItem.width = (100-_left)/(evtItem.overNum+1);
					evtItem.offsetX = _left+evtItem.width;
				}else{
					evtItem.offsetX = evtItem.left+evtItem.width;
				}
			}

			calHTML.push('<div class="time-item pub_calendar_evt_item" pubc_key="'+evtItem.pubCID+','+_date+','+i+',t" style="z-index:'+evtItem.colIdx+';top:'+_top+'px;left:'+(evtItem.left)+'%;width:'+evtItem.width+'%;height:'+(_height-6)+'px;background-color:'+(esItem[colInfo.color]||bgColor)+';">');
			calHTML.push(sdt.format('HH:mm')+'-'+edt.format('HH:mm')+' ');
			calHTML.push('<div class="pubc-time-item-title">'+esItem[colInfo.title]+'</div><div class="pubc-resize-bar"></div>');
			
			calHTML.push('</div>');
		}
		calHTML.push('		</div>');
		calHTML.push('		<div class="time-over-wrapper time-over'+idx+'"></div>');
		calHTML.push('	</div></td>');

		return calHTML.join('');
	}
	// mini 달력 header html 
	,_renderMiniHeaderHtml : function (year, month , _lang , _w){
		var calHTML =[]; 
		calHTML.push('	<div style="text-align:center;">');
		calHTML.push('		<a href="javascript:;" class="pubcalendar-move-btn" _mode="p"><span><</span></a>');
		calHTML.push('			<span class="pubcalendar_year_wrap"><input type="text" class="pubcalendar_year_txt" size="4" value="'+year+'"><span class="pubcalendar_year_view">'+year+'</span>'+_lang.year+'</span>');
		calHTML.push('			<span class="pubcalendar_month_wrap">'+getMonthInfo(year, month) +'</span>'+_lang.month);
		calHTML.push('		<a href="javascript:;"  class="pubcalendar-move-btn" _mode="n"><span>></span></a>');			
		calHTML.push('	</div>');
		calHTML.push('	<table class="mini-pubcalendar-tbl">');
		calHTML.push(this._renderColgroupHTML(7,_w));	
		calHTML.push('  <thead><tr>		');
		calHTML.push('		<td valign="top" class="pub-calendar-red">'+_lang.sun+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.mon+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.tue+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.wed+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.thu+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.fri+'</td>		');
		calHTML.push('		<td valign="top" class="pub-calendar-blue">'+_lang.sat+'</td>		');
		calHTML.push('	  </tr></thread>');
		
		return calHTML.join('');
	}
	// 달력 년월 요일 html 
	,_renderFullCalHeaderHtml :function (year, month , _lang, viewMode){
		var calHTML =[]; 
		
		calHTML.push('<div class="pubc_date_info_area pubc-view-'+viewMode+'"><div class="float_right">');
		calHTML.push('		<div class="pubc-button-group">');
		calHTML.push('			<span class="pubc_header_date_area">');
		calHTML.push(_RenderHTML._renderMonthHeaderHtml(year, month, _lang));
		calHTML.push('			</span>');
		calHTML.push('			<button type="button" style="margin:0px 15px 0px 0px" class="pubc-today-btn pubc-state-default pubc-corner-left pubc-corner-right">today</button>');
		calHTML.push('			<button type="button" class="pubc-prev-button pubc-state-default pubc-corner-left pubcalendar-move-btn" _mode="p">');
		calHTML.push('				<span class="pubc-icon pubc-icon-left-single-arrow"></span>');
		calHTML.push('			</button>');
		calHTML.push('			<button type="button" class="pubc-next-button pubc-state-default pubc-corner-right pubcalendar-move-btn" _mode="n">');
		calHTML.push('				<span class="pubc-icon pubc-icon-right-single-arrow"></span>');
		calHTML.push('			</button>');
		calHTML.push('		</div>');
		calHTML.push('		<div class="pubc-button-group">');
		calHTML.push('			<button type="button" class="pubc_view_mode_btn pubc-state-default pubc-corner-left '+(viewMode=='month'?'pubc-state-active':'')+'" _mode="m">month</button>');
		calHTML.push('			<button type="button" class="pubc_view_mode_btn pubc-state-default '+(viewMode=='week'?'pubc-state-active':'')+'" _mode="w">week</button>');
		calHTML.push('			<button type="button" class="pubc_view_mode_btn pubc-state-default pubc-corner-right '+(viewMode=='day'?'pubc-state-active':'')+'" _mode="d">day</button>');
		calHTML.push('		</div>');
		calHTML.push('</div></div>');
		
		return calHTML.join('');
	}
	// full calendar 바탕 테이블 html
	,_renderBgTableHtml :function (i){
		return '<table cellpadding="0" cellspacing="0" class="pubc-row-bg-table"><tr>'
			+ '	<td class="pubc-bg pubc-bg-fc" _idx="'+(i*7)+'"><div class="pubc-bg-area"></div></td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+1)+'"><div class="pubc-bg-area"></div></td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+2)+'"><div class="pubc-bg-area"></div></td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+3)+'"><div class="pubc-bg-area"></div></td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+4)+'"><div class="pubc-bg-area"></div></td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+5)+'"><div class="pubc-bg-area"></div></td>'
			+ '	<td class="pubc-bg pubc-bg-lc" _idx="'+(i*7+6)+'"><div class="pubc-bg-area"></div></td>'
			+ '</tr></table>';
	}
	//time 바탕 테이블 html
	,_renderTimeBgTableHtml :function (idx, pRangeNum){
		var renderHTML = [];
		renderHTML.push('<table cellpadding="0" cellspacing="0" class="pubc-row-bg-table"><tr>');
		for (var i=0; i< pRangeNum; i++ ){
			renderHTML.push('	<td class="pubc-bg '+(i==0?'pubc-bg-fc':'')+' '+(i==pRangeNum-1?'pubc-bg-lc':'')+'" _idx="'+i+'"><div class="pubc-bg-area"></div></td>');
		}
		renderHTML.push('</tr></table>');
		return renderHTML.join('');
	}
	// get colgroup 
	,_renderColgroupHTML :function (pRangeNum, _w){
		var renderHTML = [];

		renderHTML.push(' <colgroup>');
		for (var i=0; i< pRangeNum; i++ ){
			renderHTML.push('  <col style="min-width:'+_w+'px;">');
		}
		renderHTML.push('  </colgroup>');

		return renderHTML.join('');
	}
	// 월 모드 일때 일자 표시
	,_renderMonthHeaderHtml :function (year, month, _lang){
		return '<span class="view-mode-month"><span class="pubcalendar_year_wrap"><input type="text" class="pubcalendar_year_txt" size="4" value="'+year+'"><span class="pubcalendar_year_view">'+year+'</span>'+_lang.year+'</span>'
			+ '<span class="pubcalendar_month_wrap">'+getMonthInfo(year, month) +'</span></span>'
			+ '<span class="view-mode-text"></span></span>'
	}
}

$.pubCalendar = function (selector,options, args) {
	
	if(!selector || $(selector).length < 1){
		return '['+selector + '] selector  not found '; 
	}

	if(typeof options === 'undefined'){
		return _datastore[selector]||{}; 
	}

	var _cacheObject = _datastore[selector]; 
	
	if(!_cacheObject){
		_cacheObject = new Plugin(selector, options);
		_datastore[selector] = _cacheObject;
		return _cacheObject; 
	}

	if(typeof options === 'string'){
		var callObj =_cacheObject[options]; 
		if(typeof callObj ==='undefined'){
			return options+' not found';
		}else if(typeof callObj==='function'){
			return _cacheObject[options].apply(_cacheObject,args);
		}else {
			return typeof callObj==='function'; 
		}
	}

	return _cacheObject;	
};

/**
*기념일 등록. 
*/
$.pubCalendar.setMemorialDay = function(memorialDays){
	_memorialDays = $.isArray(memorialDays)?_memorialDays.concat(memorialDays):_memorialDays;
}

/**
*음력 월 테이블 등록. 
*/
$.pubCalendar.setLunarMonthTable = function(lunarMonth){
	lunarMonthTable = $.extend(lunarMonthTable, lunarMonth);
}

/**
*해당년에 대한 음력 정보 넣기.
*/
$.pubCalendar.setYearLunarInfo = function(lunarInfo){
	yearLunarInfo = $.extend(yearLunarInfo, lunarInfo);
}




if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}

 function objectMerge () {
	var dst = {},src ,p ,args = [].slice.call(arguments, 0);
	
	while (args.length > 0) {
		src = args.splice(0, 1)[0];
		if (Object.prototype.toString.call(src) == '[object Object]') {
			for (p in src) {
				if (src.hasOwnProperty(p)) {
					if (Object.prototype.toString.call(src[p]) == '[object Object]') {
						dst[p] = objectMerge(dst[p] || {}, src[p]);
					} else {
						dst[p] = src[p];
					}
				}
			}
		}
	}
	return dst;
}

function getLunarMonthTable(year){
	return lunarMonthTable[year];
}

// 미니 달력 월 ------------
function getMonthInfo(year,month) {										// 월 정보를 콤보 박스로 표시
	var i = new Number();
	var strHtm =new Array();
	strHtm.push('<select class="pubcalendar_month_select">');
	for (i=1; i<=12; i++) {
		if (i == parseInt(month)) {
			strHtm.push("<option value="+i+" selected>"+i+"</option>");
		} else {
			strHtm.push("<option value="+i+">"+i+"</option>");
		}
	}
	strHtm.push('</select>');

	return strHtm.join("");
}

function day2(d) {	// 2자리 숫자료 변경
	d = parseInt(d,10); 

	return (d < 10) ? "0"+d : d;
}

function makeMoment(day){
	return moment(day);
}

function getAddEvt(pEvt, pYyyyMMdd, pItem){
	if(!pEvt[pYyyyMMdd]){
		pEvt[pYyyyMMdd] =[];
	}
	pEvt[pYyyyMMdd].push(pItem);

	return pEvt;
}

// 일정이 일정보기의 날짜 안에 있는지 체크.
function isBetweenDate(stime , etime , viewFirstTime , viewEndTime){
	if(stime > viewEndTime || etime < viewFirstTime || (stime < viewFirstTime && etime < viewFirstTime)){
		return false; 
	}
	return true; 
}
// 반복일정 등록. 
function addRepeatItem (eventInfoArr,exceptionInfo,item,startDt, endDt,viewFirstTime, viewEndTime ,repeatSTime , repeatETime){
	if(exceptionInfo[startDt.format('YYYY-MM-DD')]===true) return ; 

	if(isBetweenDate(startDt.toDate().getTime()
		,endDt.toDate().getTime()
		,viewFirstTime
		,viewEndTime)
	){
		eventInfoArr.push({
			pubCID	:item._pubCID
			,start : repeatSTime ? startDt.format('YYYY-MM-DD')+' '+repeatSTime : startDt.format('YYYY-MM-DD HH:mm')
			,end : repeatETime ? endDt.format('YYYY-MM-DD')+' '+repeatETime : endDt.format('YYYY-MM-DD HH:mm')
		});
	}
	return eventInfoArr; 
}

// 년 마지막 날 구하기.
function getMonthLastDayArr(year){
	var monthDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (year % 400 == 0) monthDay[1]=29;
	else if (year % 100 == 0) monthDay[1]=28;
	else if (year % 4 == 0) monthDay[1]=29;

	return monthDay;
}

// 음력 월에 마지막날 구하기.
function getLunMonthDay(lunYear, lunMonth, lunLeapMonth){
	if (lunarMonthTable[lunYear][lunMonth - 1] == 1) return  29;
	else if (lunarMonthTable[lunYear][lunMonth - 1] == 2) return  30;
	else if (lunarMonthTable[lunYear][lunMonth - 1] == 3) return  29;
	else if (lunarMonthTable[lunYear][lunMonth - 1] == 4 && lunLeapMonth == 0) return  29;
	else if (lunarMonthTable[lunYear][lunMonth - 1] == 4 && lunLeapMonth == 1) return  30;
	else if (lunarMonthTable[lunYear][lunMonth - 1] == 5 && lunLeapMonth == 0) return  30;
	else if (lunarMonthTable[lunYear][lunMonth - 1] == 5 && lunLeapMonth == 1) return  29;
	else if (lunarMonthTable[lunYear][lunMonth - 1] == 6) return  30;
}


/*
기념일 정보 셋팅.
date : 기념일 날짜 (월일)
desc : 기념일 설명 (달력에 표시할 설명)
isLunar : true : 음력 false : 양력
holiday : true : 빨간날 false : 안빨간날 
type : true : real time setting
*/
var _memorialDays = [
	{date:'0101',desc : '신정' ,isLunar: false ,holiday :  true}
	,{date:'_1231',desc : '설연휴' ,isLunar: true ,holiday :  true}
	,{date:'0101',desc : '설날' ,isLunar: true ,holiday :  true}
	,{date:'0102',desc : '설연휴' ,isLunar: true ,holiday :  true}
	,{date:'0301',desc : '3·1절' ,isLunar: false ,holiday :  true}
	,{date:'0405',desc : '식목일' ,isLunar: false ,holiday :  false}
	,{date:'0408',desc : '석가탄신일' ,isLunar: true ,holiday :  true}
	,{date:'0505',desc : '어린이날' ,isLunar: false ,holiday :  true}
	,{date:'0606',desc : '현충일' ,isLunar: false ,holiday :  true}
	,{date:'0717',desc : '제헌절' ,isLunar: false ,holiday :  false}
	,{date:'0815',desc : '광복절' ,isLunar: false ,holiday :  true}
	,{date:'0814',desc : '추석연휴' ,isLunar: true ,holiday :  true}
	,{date:'0815',desc : '추석' ,isLunar: true ,holiday :  true}
	,{date:'0816',desc : '추석연휴' ,isLunar: true ,holiday :  true}
	,{date:'1003',desc : '개천절' ,isLunar: false ,holiday :  true}
	,{date:'1225',desc : '성탄절' ,isLunar: false ,holiday :  true}
	,{date:'0115',desc : '정월대보름' ,isLunar: true ,holiday :  false}
	,{date:'0505',desc : '단오' ,isLunar: true ,holiday :  false}
	,{date:'1001',desc : '국군의날' ,isLunar: false ,holiday :  false}
	,{date:'1009',desc : '한글날' ,isLunar: false ,holiday :  true}
	,{date:'0625',desc : '6·25전쟁일' ,isLunar: false ,holiday :  false}
	,{date:'0214',desc : '발렌타인데이' ,isLunar: false ,holiday :  false}
	,{date:'0322',desc : '물의날' ,isLunar: false ,holiday :  false}
	,{date:'0401',desc : '만우절' ,isLunar: false ,holiday :  false}
	,{date:'0413',desc : '임시정부수립일' ,isLunar: false ,holiday :  false}
	,{date:'0419',desc : '4·19혁명기념일' ,isLunar: false ,holiday :  false}
	,{date:'0420',desc : '장애인의날' ,isLunar: false ,holiday :  false}
	,{date:'0421',desc : '과학의날' ,isLunar: false ,holiday :  false}
	,{date:'0422',desc : '정보통신의날' ,isLunar: false ,holiday :  false}
	,{date:'0425',desc : '법의날' ,isLunar: false ,holiday :  false}
	,{date:'0428',desc : '충무공탄신일' ,isLunar: false ,holiday :  false}
	,{date:'0501',desc : '근로자의날' ,isLunar: false ,holiday :  false}
	,{date:'0508',desc : '어버이날' ,isLunar: false ,holiday :  false}
	,{date:'0515',desc : '스승의날' ,isLunar: false ,holiday :  false}
	,{date:'0518',desc : '5·18 민주화운동일' ,isLunar: false ,holiday :  false}
	,{date:'0519',desc : '발명의날' ,isLunar: false ,holiday :  false}
	,{date:'0531',desc : '바다의날' ,isLunar: false ,holiday :  false}
	,{date:'0605',desc : '환경의날' ,isLunar: false ,holiday :  false}
	,{date:'0707',desc : '칠월칠석' ,isLunar: false ,holiday :  false}
	,{date:'1002',desc : '노인의날' ,isLunar: false ,holiday :  false}
	,{date:'1015',desc : '체육의날' ,isLunar: false ,holiday :  false}
	,{date:'1024',desc : '국제연합일' ,isLunar: false ,holiday :  false}
	,{date:'1103',desc : '학생독립운동기념일' ,isLunar: false ,holiday :  false}
	,{date:'0918',desc : '철도의날' ,isLunar: false ,holiday :  false}
	,{date:'1109',desc : '소방의날' ,isLunar: false ,holiday :  false}
];

// 음력 데이터 (평달 - 작은달 :1,  큰달:2 )
// (윤달이 있는 달 - 평달이 작고 윤달도 작으면 :3 , 평달이 작고 윤달이 크면 : 4)
// (윤달이 있는 달 - 평달이 크고 윤달이 작으면 :5,  평달과 윤달이 모두 크면 : 6)
var lunarMonthTable = {
	1891 : [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],   /* 1891 */
	1892 : [1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
	1893 : [1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
	1894 : [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
	1895 : [2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
	1896 : [2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
	1897 : [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
	1898 : [2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
	1899 : [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
	1900 : [1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
	1901 : [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],   /* 1901 */
	1902 : [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
	1903 : [1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
	1904 : [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
	1905 : [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
	1906 : [1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
	1907 : [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	1908 : [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
	1909 : [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
	1910 : [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
	1911 : [2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],   /* 1911 */
	1912 : [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
	1913 : [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
	1914 : [2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
	1915 : [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
	1916 : [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	1917 : [2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
	1918 : [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
	1919 : [1, 2, 1, 1, 2, 1, 5, 2, 1, 2, 2, 2],
	1920 : [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
	1921 : [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],   /* 1921 */
	1922 : [2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
	1923 : [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
	1924 : [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
	1925 : [2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
	1926 : [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	1927 : [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
	1928 : [1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
	1929 : [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
	1930 : [1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
	1931 : [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 1931 */
	1932 : [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
	1933 : [1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
	1934 : [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
	1935 : [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	1936 : [2, 1, 4, 1, 1, 2, 2, 1, 2, 2, 2, 1],
	1937 : [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
	1938 : [2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
	1939 : [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
	1940 : [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
	1941 : [2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   /* 1941 */
	1942 : [2, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2],
	1943 : [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	1944 : [2, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
	1945 : [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
	1946 : [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
	1947 : [2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
	1948 : [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
	1949 : [2, 1, 2, 2, 1, 2, 3, 2, 1, 2, 1, 2],
	1950 : [1, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
	1951 : [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   /* 1951 */
	1952 : [1, 2, 1, 2, 4, 1, 2, 2, 1, 2, 1, 2],
	1953 : [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
	1954 : [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
	1955 : [2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
	1956 : [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
	1957 : [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
	1958 : [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
	1959 : [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
	1960 : [2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
	1961 : [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   /* 1961 */
	1962 : [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	1963 : [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
	1964 : [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
	1965 : [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
	1966 : [1, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
	1967 : [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
	1968 : [1, 2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2],
	1969 : [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	1970 : [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
	1971 : [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
	1972 : [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
	1973 : [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
	1974 : [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
	1975 : [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
	1976 : [2, 2, 1, 2, 1, 2, 1, 5, 1, 2, 1, 2],
	1977 : [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
	1978 : [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	1979 : [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
	1980 : [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
	1981 : [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
	1982 : [2, 1, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2],
	1983 : [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
	1984 : [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
	1985 : [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
	1986 : [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
	1987 : [2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1, 2],
	1988 : [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	1989 : [2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2],
	1990 : [1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2, 2],
	1991 : [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
	1992 : [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
	1993 : [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
	1994 : [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
	1995 : [1, 2, 2, 1, 2, 1, 2, 5, 2, 1, 1, 2],
	1996 : [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1],
	1997 : [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	1998 : [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
	1999 : [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
	2000 : [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
	2001 : [2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
	2002 : [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
	2003 : [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
	2004 : [1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
	2005 : [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	2006 : [2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
	2007 : [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
	2008 : [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
	2009 : [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
	2010 : [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
	2011 : [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
	2012 : [2, 1, 2, 5, 2, 2, 1, 1, 2, 1, 2, 1],
	2013 : [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
	2014 : [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
	2015 : [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
	2016 : [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
	2017 : [1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 2, 2],
	2018 : [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
	2019 : [2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],
	2020 : [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
	2021 : [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
	2022 : [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
	2023 : [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
	2024 : [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	2025 : [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
	2026 : [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
	2027 : [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
	2028 : [2, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
	2029 : [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
	2030 : [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
	2031 : [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	2032 : [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
	2033 : [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
	2034 : [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2],
	2035 : [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
	2036 : [2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
	2037 : [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
	2038 : [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
	2039 : [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
	2040 : [2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1],
	2041 : [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
	2042 : [1, 5, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
	2043 : [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
	2044 : [2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2],
	2045 : [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
	2046 : [2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
	2047 : [2, 1, 2, 2, 4, 1, 2, 1, 1, 2, 1, 2],
	2048 : [1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1],
	2049 : [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
	2050 : [1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2, 1], 
	2051 : [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
	2052 : [1, 2, 1, 1, 2, 1, 1, 5, 2, 2, 2, 2],
	2053 : [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
	2054 : [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
	2055 : [1, 2, 2, 1, 2, 4, 1, 1, 2, 1, 2, 1],
	2056 : [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
	2057 : [1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1],
	2058 : [2, 1, 2, 4, 2, 1, 2, 1, 2, 2, 1, 1],
	2059 : [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	2060 : [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1],
	2061 : [2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2, 1],
	2062 : [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
	2063 : [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
	2064 : [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
	2065 : [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
	2066 : [1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2],
	2067 : [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
	2068 : [2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
	2069 : [1, 2, 1, 5, 1, 2, 1, 2, 2, 2, 1, 2],
	2070 : [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
	2071 : [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2], 
	2072 : [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
	2073 : [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
	2074 : [2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2, 1],
	2075 : [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
	2076 : [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],
	2077 : [2, 1, 2, 3, 2, 1, 2, 2, 2, 1, 2, 1],
	2078 : [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
	2079 : [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
	2080 : [2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2, 2],
	2081 : [1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2], 
	2082 : [1, 2, 2, 2, 1, 2, 3, 2, 1, 1, 2, 2],
	2083 : [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
	2084 : [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
	2085 : [1, 2, 1, 1, 6, 1, 2, 2, 1, 2, 1, 2],
	2086 : [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
	2087 : [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
	2088 : [1, 2, 1, 5, 1, 2, 1, 1, 2, 2, 2, 1],
	2089 : [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
	2090 : [2, 2, 2, 1, 2, 1, 1, 5, 1, 2, 2, 1],
	2091 : [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1], 
	2092 : [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
	2093 : [1, 2, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1],
	2094 : [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
	2095 : [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
	2096 : [2, 1, 2, 3, 2, 1, 1, 2, 2, 2, 1, 2],
	2097 : [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
	2098 : [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
	2099 : [2, 5, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2],
	2100 : [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1]
};

var yearLunarInfo = {
	/* 해당년에대한 01월01일 에 대한 음력 (lunYear:년, lunMonth:월, lunDay:일 , lunMonthDay :lunMonth의 대한 마지막날) solMonthDay : 2월 마지막 날 */
	1900 :  {lunYear:1899, lunMonth:12, lunDay:1, lunMonthDay:30, solMonthDay:28}
	,1901 :  {lunYear:1900, lunMonth:11, lunDay:11, lunMonthDay:29, solMonthDay:28}
	,1902 :  {lunYear:1901, lunMonth:11, lunDay:22, lunMonthDay:30, solMonthDay:28}
	,1903 :  {lunYear:1902, lunMonth:12, lunDay:3, lunMonthDay:30, solMonthDay:28}
	,1904 :  {lunYear:1903, lunMonth:11, lunDay:14, lunMonthDay:29, solMonthDay:29}
	,1905 :  {lunYear:1904, lunMonth:11, lunDay:26, lunMonthDay:30, solMonthDay:28}
	,1906 :  {lunYear:1905, lunMonth:12, lunDay:7, lunMonthDay:30, solMonthDay:28}
	,1907 :  {lunYear:1906, lunMonth:11, lunDay:17, lunMonthDay:29, solMonthDay:28}
	,1908 :  {lunYear:1907, lunMonth:11, lunDay:28, lunMonthDay:30, solMonthDay:29}
	,1909 :  {lunYear:1908, lunMonth:12, lunDay:10, lunMonthDay:30, solMonthDay:28}
	,1910 :  {lunYear:1909, lunMonth:11, lunDay:20, lunMonthDay:29, solMonthDay:28}
	,1911 :  {lunYear:1910, lunMonth:12, lunDay:1, lunMonthDay:29, solMonthDay:28}
	,1912 :  {lunYear:1911, lunMonth:11, lunDay:13, lunMonthDay:30, solMonthDay:29}
	,1913 :  {lunYear:1912, lunMonth:11, lunDay:24, lunMonthDay:29, solMonthDay:28}
	,1914 :  {lunYear:1913, lunMonth:12, lunDay:6, lunMonthDay:30, solMonthDay:28}
	,1915 :  {lunYear:1914, lunMonth:11, lunDay:16, lunMonthDay:29, solMonthDay:28}
	,1916 :  {lunYear:1915, lunMonth:11, lunDay:26, lunMonthDay:29, solMonthDay:29}
	,1917 :  {lunYear:1916, lunMonth:12, lunDay:8, lunMonthDay:29, solMonthDay:28}
	,1918 :  {lunYear:1917, lunMonth:11, lunDay:19, lunMonthDay:30, solMonthDay:28}
	,1919 :  {lunYear:1918, lunMonth:11, lunDay:30, lunMonthDay:30, solMonthDay:28}
	,1920 :  {lunYear:1919, lunMonth:11, lunDay:11, lunMonthDay:30, solMonthDay:29}
	,1921 :  {lunYear:1920, lunMonth:11, lunDay:23, lunMonthDay:30, solMonthDay:28}
	,1922 :  {lunYear:1921, lunMonth:12, lunDay:4, lunMonthDay:30, solMonthDay:28}
	,1923 :  {lunYear:1922, lunMonth:11, lunDay:15, lunMonthDay:30, solMonthDay:28}
	,1924 :  {lunYear:1923, lunMonth:11, lunDay:25, lunMonthDay:29, solMonthDay:29}
	,1925 :  {lunYear:1924, lunMonth:12, lunDay:7, lunMonthDay:29, solMonthDay:28}
	,1926 :  {lunYear:1925, lunMonth:11, lunDay:17, lunMonthDay:29, solMonthDay:28}
	,1927 :  {lunYear:1926, lunMonth:11, lunDay:28, lunMonthDay:30, solMonthDay:28}
	,1928 :  {lunYear:1927, lunMonth:12, lunDay:9, lunMonthDay:30, solMonthDay:29}
	,1929 :  {lunYear:1928, lunMonth:11, lunDay:21, lunMonthDay:30, solMonthDay:28}
	,1930 :  {lunYear:1929, lunMonth:12, lunDay:2, lunMonthDay:30, solMonthDay:28}
	,1931 :  {lunYear:1930, lunMonth:11, lunDay:13, lunMonthDay:30, solMonthDay:28}
	,1932 :  {lunYear:1931, lunMonth:11, lunDay:24, lunMonthDay:30, solMonthDay:29}
	,1933 :  {lunYear:1932, lunMonth:12, lunDay:6, lunMonthDay:30, solMonthDay:28}
	,1934 :  {lunYear:1933, lunMonth:11, lunDay:16, lunMonthDay:29, solMonthDay:28}
	,1935 :  {lunYear:1934, lunMonth:11, lunDay:26, lunMonthDay:29, solMonthDay:28}
	,1936 :  {lunYear:1935, lunMonth:12, lunDay:7, lunMonthDay:29, solMonthDay:29}
	,1937 :  {lunYear:1936, lunMonth:11, lunDay:19, lunMonthDay:30, solMonthDay:28}
	,1938 :  {lunYear:1937, lunMonth:11, lunDay:30, lunMonthDay:30, solMonthDay:28}
	,1939 :  {lunYear:1938, lunMonth:11, lunDay:11, lunMonthDay:29, solMonthDay:28}
	,1940 :  {lunYear:1939, lunMonth:11, lunDay:22, lunMonthDay:29, solMonthDay:29}
	,1941 :  {lunYear:1940, lunMonth:12, lunDay:4, lunMonthDay:29, solMonthDay:28}
	,1942 :  {lunYear:1941, lunMonth:11, lunDay:15, lunMonthDay:30, solMonthDay:28}
	,1943 :  {lunYear:1942, lunMonth:11, lunDay:25, lunMonthDay:29, solMonthDay:28}
	,1944 :  {lunYear:1943, lunMonth:12, lunDay:6, lunMonthDay:29, solMonthDay:29}
	,1945 :  {lunYear:1944, lunMonth:11, lunDay:18, lunMonthDay:30, solMonthDay:28}
	,1946 :  {lunYear:1945, lunMonth:11, lunDay:28, lunMonthDay:29, solMonthDay:28}
	,1947 :  {lunYear:1946, lunMonth:12, lunDay:10, lunMonthDay:30, solMonthDay:28}
	,1948 :  {lunYear:1947, lunMonth:11, lunDay:21, lunMonthDay:30, solMonthDay:29}
	,1949 :  {lunYear:1948, lunMonth:12, lunDay:3, lunMonthDay:30, solMonthDay:28}
	,1950 :  {lunYear:1949, lunMonth:11, lunDay:13, lunMonthDay:29, solMonthDay:28}
	,1951 :  {lunYear:1950, lunMonth:11, lunDay:24, lunMonthDay:30, solMonthDay:28}
	,1952 :  {lunYear:1951, lunMonth:12, lunDay:5, lunMonthDay:30, solMonthDay:29}
	,1953 :  {lunYear:1952, lunMonth:11, lunDay:16, lunMonthDay:29, solMonthDay:28}
	,1954 :  {lunYear:1953, lunMonth:11, lunDay:27, lunMonthDay:30, solMonthDay:28}
	,1955 :  {lunYear:1954, lunMonth:12, lunDay:8, lunMonthDay:30, solMonthDay:28}
	,1956 :  {lunYear:1955, lunMonth:11, lunDay:19, lunMonthDay:30, solMonthDay:29}
	,1957 :  {lunYear:1956, lunMonth:12, lunDay:1, lunMonthDay:30, solMonthDay:28}
	,1958 :  {lunYear:1957, lunMonth:11, lunDay:12, lunMonthDay:30, solMonthDay:28}
	,1959 :  {lunYear:1958, lunMonth:11, lunDay:22, lunMonthDay:29, solMonthDay:28}
	,1960 :  {lunYear:1959, lunMonth:12, lunDay:3, lunMonthDay:29, solMonthDay:29}
	,1961 :  {lunYear:1960, lunMonth:11, lunDay:15, lunMonthDay:30, solMonthDay:28}
	,1962 :  {lunYear:1961, lunMonth:11, lunDay:25, lunMonthDay:29, solMonthDay:28}
	,1963 :  {lunYear:1962, lunMonth:12, lunDay:6, lunMonthDay:29, solMonthDay:28}
	,1964 :  {lunYear:1963, lunMonth:11, lunDay:17, lunMonthDay:30, solMonthDay:29}
	,1965 :  {lunYear:1964, lunMonth:11, lunDay:29, lunMonthDay:30, solMonthDay:28}
	,1966 :  {lunYear:1965, lunMonth:12, lunDay:10, lunMonthDay:29, solMonthDay:28}
	,1967 :  {lunYear:1966, lunMonth:11, lunDay:21, lunMonthDay:30, solMonthDay:28}
	,1968 :  {lunYear:1967, lunMonth:12, lunDay:2, lunMonthDay:30, solMonthDay:29}
	,1969 :  {lunYear:1968, lunMonth:11, lunDay:13, lunMonthDay:29, solMonthDay:28}
	,1970 :  {lunYear:1969, lunMonth:11, lunDay:24, lunMonthDay:30, solMonthDay:28}
	,1971 :  {lunYear:1970, lunMonth:12, lunDay:5, lunMonthDay:30, solMonthDay:28}
	,1972 :  {lunYear:1971, lunMonth:11, lunDay:15, lunMonthDay:29, solMonthDay:29}
	,1973 :  {lunYear:1972, lunMonth:11, lunDay:27, lunMonthDay:29, solMonthDay:28}
	,1974 :  {lunYear:1973, lunMonth:12, lunDay:9, lunMonthDay:30, solMonthDay:28}
	,1975 :  {lunYear:1974, lunMonth:11, lunDay:19, lunMonthDay:29, solMonthDay:28}
	,1976 :  {lunYear:1975, lunMonth:12, lunDay:1, lunMonthDay:30, solMonthDay:29}
	,1977 :  {lunYear:1976, lunMonth:11, lunDay:12, lunMonthDay:29, solMonthDay:28}
	,1978 :  {lunYear:1977, lunMonth:11, lunDay:22, lunMonthDay:29, solMonthDay:28}
	,1979 :  {lunYear:1978, lunMonth:12, lunDay:3, lunMonthDay:29, solMonthDay:28}
	,1980 :  {lunYear:1979, lunMonth:11, lunDay:14, lunMonthDay:30, solMonthDay:29}
	,1981 :  {lunYear:1980, lunMonth:11, lunDay:26, lunMonthDay:30, solMonthDay:28}
	,1982 :  {lunYear:1981, lunMonth:12, lunDay:7, lunMonthDay:30, solMonthDay:28}
	,1983 :  {lunYear:1982, lunMonth:11, lunDay:18, lunMonthDay:30, solMonthDay:28}
	,1984 :  {lunYear:1983, lunMonth:11, lunDay:29, lunMonthDay:30, solMonthDay:29}
	,1985 :  {lunYear:1984, lunMonth:11, lunDay:11, lunMonthDay:30, solMonthDay:28}
	,1986 :  {lunYear:1985, lunMonth:11, lunDay:21, lunMonthDay:29, solMonthDay:28}
	,1987 :  {lunYear:1986, lunMonth:12, lunDay:2, lunMonthDay:29, solMonthDay:28}
	,1988 :  {lunYear:1987, lunMonth:11, lunDay:12, lunMonthDay:29, solMonthDay:29}
	,1989 :  {lunYear:1988, lunMonth:11, lunDay:24, lunMonthDay:30, solMonthDay:28}
	,1990 :  {lunYear:1989, lunMonth:12, lunDay:5, lunMonthDay:30, solMonthDay:28}
	,1991 :  {lunYear:1990, lunMonth:11, lunDay:16, lunMonthDay:30, solMonthDay:28}
	,1992 :  {lunYear:1991, lunMonth:11, lunDay:27, lunMonthDay:30, solMonthDay:29}
	,1993 :  {lunYear:1992, lunMonth:12, lunDay:9, lunMonthDay:30, solMonthDay:28}
	,1994 :  {lunYear:1993, lunMonth:11, lunDay:20, lunMonthDay:30, solMonthDay:28}
	,1995 :  {lunYear:1994, lunMonth:12, lunDay:1, lunMonthDay:30, solMonthDay:28}
	,1996 :  {lunYear:1995, lunMonth:11, lunDay:11, lunMonthDay:29, solMonthDay:29}
	,1997 :  {lunYear:1996, lunMonth:11, lunDay:22, lunMonthDay:29, solMonthDay:28}
	,1998 :  {lunYear:1997, lunMonth:12, lunDay:3, lunMonthDay:29, solMonthDay:28}
	,1999 :  {lunYear:1998, lunMonth:11, lunDay:14, lunMonthDay:30, solMonthDay:28}
	,2000 :  {lunYear:1999, lunMonth:11, lunDay:25, lunMonthDay:30, solMonthDay:29}
	,2001 :  {lunYear:2000, lunMonth:12, lunDay:7, lunMonthDay:29, solMonthDay:28}
	,2002 :  {lunYear:2001, lunMonth:11, lunDay:18, lunMonthDay:29, solMonthDay:28}
	,2003 :  {lunYear:2002, lunMonth:11, lunDay:29, lunMonthDay:30, solMonthDay:28}
	,2004 :  {lunYear:2003, lunMonth:12, lunDay:10, lunMonthDay:30, solMonthDay:29}
	,2005 :  {lunYear:2004, lunMonth:11, lunDay:21, lunMonthDay:29, solMonthDay:28}
	,2006 :  {lunYear:2005, lunMonth:12, lunDay:2, lunMonthDay:29, solMonthDay:28}
	,2007 :  {lunYear:2006, lunMonth:11, lunDay:13, lunMonthDay:30, solMonthDay:28}
	,2008 :  {lunYear:2007, lunMonth:11, lunDay:23, lunMonthDay:29, solMonthDay:29}
	,2009 :  {lunYear:2008, lunMonth:12, lunDay:6, lunMonthDay:30, solMonthDay:28}
	,2010 :  {lunYear:2009, lunMonth:11, lunDay:17, lunMonthDay:30, solMonthDay:28}
	,2011 :  {lunYear:2010, lunMonth:11, lunDay:27, lunMonthDay:29, solMonthDay:28}
	,2012 :  {lunYear:2011, lunMonth:12, lunDay:8, lunMonthDay:29, solMonthDay:29}
	,2013 :  {lunYear:2012, lunMonth:11, lunDay:20, lunMonthDay:30, solMonthDay:28}
	,2014 :  {lunYear:2013, lunMonth:12, lunDay:1, lunMonthDay:30, solMonthDay:28}
	,2015 :  {lunYear:2014, lunMonth:11, lunDay:11, lunMonthDay:29, solMonthDay:28}
	,2016 :  {lunYear:2015, lunMonth:11, lunDay:22, lunMonthDay:30, solMonthDay:29}
	,2017 :  {lunYear:2016, lunMonth:12, lunDay:4, lunMonthDay:30, solMonthDay:28}
	,2018 :  {lunYear:2017, lunMonth:11, lunDay:15, lunMonthDay:30, solMonthDay:28}
	,2019 :  {lunYear:2018, lunMonth:11, lunDay:26, lunMonthDay:30, solMonthDay:28}
	,2020 :  {lunYear:2019, lunMonth:12, lunDay:7, lunMonthDay:30, solMonthDay:29}
	,2021 :  {lunYear:2020, lunMonth:11, lunDay:18, lunMonthDay:29, solMonthDay:28}
	,2022 :  {lunYear:2021, lunMonth:11, lunDay:29, lunMonthDay:30, solMonthDay:28}
	,2023 :  {lunYear:2022, lunMonth:12, lunDay:10, lunMonthDay:30, solMonthDay:28}
	,2024 :  {lunYear:2023, lunMonth:11, lunDay:20, lunMonthDay:29, solMonthDay:29}
	,2025 :  {lunYear:2024, lunMonth:12, lunDay:2, lunMonthDay:29, solMonthDay:28}
	,2026 :  {lunYear:2025, lunMonth:11, lunDay:13, lunMonthDay:30, solMonthDay:28}
	,2027 :  {lunYear:2026, lunMonth:11, lunDay:24, lunMonthDay:30, solMonthDay:28}
	,2028 :  {lunYear:2027, lunMonth:12, lunDay:5, lunMonthDay:29, solMonthDay:29}
	,2029 :  {lunYear:2028, lunMonth:11, lunDay:17, lunMonthDay:30, solMonthDay:28}
	,2030 :  {lunYear:2029, lunMonth:11, lunDay:28, lunMonthDay:30, solMonthDay:28}
	,2031 :  {lunYear:2030, lunMonth:12, lunDay:8, lunMonthDay:29, solMonthDay:28}
	,2032 :  {lunYear:2031, lunMonth:11, lunDay:19, lunMonthDay:30, solMonthDay:29}
	,2033 :  {lunYear:2032, lunMonth:12, lunDay:1, lunMonthDay:30, solMonthDay:28}
	,2034 :  {lunYear:2033, lunMonth:11, lunDay:11, lunMonthDay:29, solMonthDay:28}
	,2035 :  {lunYear:2034, lunMonth:11, lunDay:22, lunMonthDay:29, solMonthDay:28}
	,2036 :  {lunYear:2035, lunMonth:12, lunDay:4, lunMonthDay:30, solMonthDay:29}
	,2037 :  {lunYear:2036, lunMonth:11, lunDay:16, lunMonthDay:30, solMonthDay:28}
	,2038 :  {lunYear:2037, lunMonth:11, lunDay:26, lunMonthDay:29, solMonthDay:28}
	,2039 :  {lunYear:2038, lunMonth:12, lunDay:7, lunMonthDay:29, solMonthDay:28}
	,2040 :  {lunYear:2039, lunMonth:11, lunDay:17, lunMonthDay:29, solMonthDay:29}
	,2041 :  {lunYear:2040, lunMonth:11, lunDay:29, lunMonthDay:30, solMonthDay:28}
	,2042 :  {lunYear:2041, lunMonth:12, lunDay:10, lunMonthDay:30, solMonthDay:28}
	,2043 :  {lunYear:2042, lunMonth:11, lunDay:21, lunMonthDay:30, solMonthDay:28}
	,2044 :  {lunYear:2043, lunMonth:12, lunDay:2, lunMonthDay:30, solMonthDay:29}
	,2045 :  {lunYear:2044, lunMonth:11, lunDay:14, lunMonthDay:30, solMonthDay:28}
	,2046 :  {lunYear:2045, lunMonth:11, lunDay:25, lunMonthDay:30, solMonthDay:28}
	,2047 :  {lunYear:2046, lunMonth:12, lunDay:6, lunMonthDay:30, solMonthDay:28}
	,2048 :  {lunYear:2047, lunMonth:11, lunDay:16, lunMonthDay:29, solMonthDay:29}
	,2049 :  {lunYear:2048, lunMonth:11, lunDay:28, lunMonthDay:30, solMonthDay:28}
	,2050 :  {lunYear:2049, lunMonth:12, lunDay:8, lunMonthDay:29, solMonthDay:28}
	,2051 :  {lunYear:2050, lunMonth:11, lunDay:19, lunMonthDay:30, solMonthDay:28}
	,2052 :  {lunYear:2051, lunMonth:11, lunDay:30, lunMonthDay:30, solMonthDay:29}
	,2053 :  {lunYear:2052, lunMonth:11, lunDay:12, lunMonthDay:30, solMonthDay:28}
	,2054 :  {lunYear:2053, lunMonth:11, lunDay:23, lunMonthDay:30, solMonthDay:28}
	,2055 :  {lunYear:2054, lunMonth:12, lunDay:4, lunMonthDay:30, solMonthDay:28}
	,2056 :  {lunYear:2055, lunMonth:11, lunDay:15, lunMonthDay:30, solMonthDay:29}
	,2057 :  {lunYear:2056, lunMonth:11, lunDay:26, lunMonthDay:29, solMonthDay:28}
	,2058 :  {lunYear:2057, lunMonth:12, lunDay:7, lunMonthDay:29, solMonthDay:28}
	,2059 :  {lunYear:2058, lunMonth:11, lunDay:17, lunMonthDay:29, solMonthDay:28}
	,2060 :  {lunYear:2059, lunMonth:11, lunDay:28, lunMonthDay:30, solMonthDay:29}
	,2061 :  {lunYear:2060, lunMonth:12, lunDay:10, lunMonthDay:29, solMonthDay:28}
	,2062 :  {lunYear:2061, lunMonth:11, lunDay:21, lunMonthDay:30, solMonthDay:28}
	,2063 :  {lunYear:2062, lunMonth:12, lunDay:2, lunMonthDay:29, solMonthDay:28}
	,2064 :  {lunYear:2063, lunMonth:11, lunDay:13, lunMonthDay:29, solMonthDay:29}
	,2065 :  {lunYear:2064, lunMonth:11, lunDay:25, lunMonthDay:30, solMonthDay:28}
	,2066 :  {lunYear:2065, lunMonth:12, lunDay:6, lunMonthDay:30, solMonthDay:28}
	,2067 :  {lunYear:2066, lunMonth:11, lunDay:16, lunMonthDay:29, solMonthDay:28}
	,2068 :  {lunYear:2067, lunMonth:11, lunDay:27, lunMonthDay:30, solMonthDay:29}
	,2069 :  {lunYear:2068, lunMonth:12, lunDay:9, lunMonthDay:30, solMonthDay:28}
	,2070 :  {lunYear:2069, lunMonth:11, lunDay:19, lunMonthDay:29, solMonthDay:28}
	,2071 :  {lunYear:2070, lunMonth:12, lunDay:1, lunMonthDay:30, solMonthDay:28}
	,2072 :  {lunYear:2071, lunMonth:11, lunDay:12, lunMonthDay:30, solMonthDay:29}
	,2073 :  {lunYear:2072, lunMonth:11, lunDay:23, lunMonthDay:29, solMonthDay:28}
	,2074 :  {lunYear:2073, lunMonth:12, lunDay:4, lunMonthDay:29, solMonthDay:28}
	,2075 :  {lunYear:2074, lunMonth:11, lunDay:15, lunMonthDay:30, solMonthDay:28}
	,2076 :  {lunYear:2075, lunMonth:11, lunDay:25, lunMonthDay:29, solMonthDay:29}
	,2077 :  {lunYear:2076, lunMonth:12, lunDay:7, lunMonthDay:29, solMonthDay:28}
	,2078 :  {lunYear:2077, lunMonth:11, lunDay:18, lunMonthDay:30, solMonthDay:28}
	,2079 :  {lunYear:2078, lunMonth:11, lunDay:29, lunMonthDay:30, solMonthDay:28}
	,2080 :  {lunYear:2079, lunMonth:12, lunDay:10, lunMonthDay:30, solMonthDay:29}
	,2081 :  {lunYear:2080, lunMonth:11, lunDay:22, lunMonthDay:30, solMonthDay:28}
	,2082 :  {lunYear:2081, lunMonth:12, lunDay:3, lunMonthDay:30, solMonthDay:28}
	,2083 :  {lunYear:2082, lunMonth:11, lunDay:14, lunMonthDay:30, solMonthDay:28}
	,2084 :  {lunYear:2083, lunMonth:11, lunDay:24, lunMonthDay:30, solMonthDay:29}
	,2085 :  {lunYear:2084, lunMonth:12, lunDay:6, lunMonthDay:30, solMonthDay:28}
	,2086 :  {lunYear:2085, lunMonth:11, lunDay:16, lunMonthDay:29, solMonthDay:28}
	,2087 :  {lunYear:2086, lunMonth:11, lunDay:27, lunMonthDay:30, solMonthDay:28}
	,2088 :  {lunYear:2087, lunMonth:12, lunDay:8, lunMonthDay:30, solMonthDay:29}
	,2089 :  {lunYear:2088, lunMonth:11, lunDay:20, lunMonthDay:30, solMonthDay:28}
	,2090 :  {lunYear:2089, lunMonth:12, lunDay:1, lunMonthDay:29, solMonthDay:28}
	,2091 :  {lunYear:2090, lunMonth:11, lunDay:12, lunMonthDay:30, solMonthDay:28}
	,2092 :  {lunYear:2091, lunMonth:11, lunDay:23, lunMonthDay:30, solMonthDay:29}
	,2093 :  {lunYear:2092, lunMonth:12, lunDay:4, lunMonthDay:29, solMonthDay:28}
	,2094 :  {lunYear:2093, lunMonth:11, lunDay:15, lunMonthDay:30, solMonthDay:28}
	,2095 :  {lunYear:2094, lunMonth:11, lunDay:25, lunMonthDay:29, solMonthDay:28}
	,2096 :  {lunYear:2095, lunMonth:12, lunDay:6, lunMonthDay:29, solMonthDay:29}
	,2097 :  {lunYear:2096, lunMonth:11, lunDay:18, lunMonthDay:29, solMonthDay:28}
	,2098 :  {lunYear:2097, lunMonth:11, lunDay:29, lunMonthDay:29, solMonthDay:28}
	,2099 :  {lunYear:2098, lunMonth:12, lunDay:11, lunMonthDay:30, solMonthDay:28}
	,2100 :  {lunYear:2099, lunMonth:11, lunDay:21, lunMonthDay:29, solMonthDay:28}
}

function pubCalendarYearInfo(year){
	return yearLunarInfo[year]; 
}

}(jQuery, window, document));

(function () {
  'use strict';
  var _slice = Array.prototype.slice;

  try {
    // Can't be used with DOM elements in IE < 9
    _slice.call(document.documentElement);
  } catch (e) { // Fails in IE < 9
    // This will work for genuine arrays, array-like objects, 
    // NamedNodeMap (attributes, entities, notations),
    // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
    // and will not fail on other DOM objects (as do DOM elements in IE < 9)
    Array.prototype.slice = function(begin, end) {
      // IE < 9 gets unhappy with an undefined end argument
      end = (typeof end !== 'undefined') ? end : this.length;

      // For native Array objects, we use the native slice function
      if (Object.prototype.toString.call(this) === '[object Array]'){
        return _slice.call(this, begin, end); 
      }

      // For array like object we handle it ourselves.
      var i, cloned = [],
        size, len = this.length;

      // Handle negative value for "begin"
      var start = begin || 0;
      start = (start >= 0) ? start : Math.max(0, len + start);

      // Handle negative value for "end"
      var upTo = (typeof end == 'number') ? Math.min(end, len) : len;
      if (end < 0) {
        upTo = len + end;
      }

      // Actual expected size of the slice
      size = upTo - start;

      if (size > 0) {
        cloned = new Array(size);
        if (this.charAt) {
          for (i = 0; i < size; i++) {
            cloned[i] = this.charAt(start + i);
          }
        } else {
          for (i = 0; i < size; i++) {
            cloned[i] = this[start + i];
          }
        }
      }

      return cloned;
    };
  }
}());