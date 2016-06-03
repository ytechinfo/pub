/**
 * pubCalendar v0.0.1
 * ========================================================================
 * Copyright 2016 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
*/ 
;(function($, window, document) {
"use strict";
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
	,{date:'1009',desc : '한글날' ,isLunar: false ,holiday :  false}
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

function day2(d) {																// 2자리 숫자료 변경
	var str = new String();
	d = parseInt(d,10); 

	return (d < 10) ? "0"+d : d;
}

function getYyyyMmDd(d) {
	return d.year+'-' +day2(d.month)+'-'+day2(d.day);
}

var _$d = new Date();
var _initialized = false	
,_lunarMonthTable = {}
,_datastore ={}
,_defaultOption ={
	useLunar : true		// 음력 기념일 사용여부.
	,useYearInput : true //year 변경시 더블클릭하면 input 박스 나타날지 여부.
	,todayDate : _$d.getFullYear() +'-' +(_$d.getMonth() + 1)+'-'+ _$d.getDate()
	,maxEventRow : 3
	,useMemorialday : true // 기념일 보기 여부 
	,width :200		// 달력 넓이
	,height:300
	,colWidth : 25	// 달력 컬럼 넓이
	,viewMode : 3	// mode 1 default 양력, 2 기념일설명, 3 음력. , 4 음력/기념일. 
	,eventDisplay : true // 이벤트 표시 여부. // mini 달력일 경우만 해당
	,eventDisplayHtm : '<span>O</span>' // 이벤트 표시 html // mini 달력일 경우만 해당
	,memorialDayInfo : {}
	,eventDisplayClass:'select' // 이벤트 표시 css 클래스
	,theme :'pub-calendar-default' // 달력 테마
	,memorialDays:[]	// 기념일
	,prefixId :'pubCID_' // 내부 적으로 관리 되는 id
	,dayMoreClick : false	// 더보기 버튼 클릭 이벤트.
	,dayEventClick : false // 일정 클릭.
	,_date :{
		yyyy:''
		,mm:''
	}
	,lang : {
		mini : {	sun:'일',mon:'월',tue:'화',wed:'수',thu:'목',fri:'금',sat:'토'
			,year :'년'	,month :'월'
		}
		,full : {	sun:'Sun',mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat'
			,year :''	,month :''
		}
	}
	,event: {
		type :'local' //local or ajax
		,colModel : {
			start : 'start'
			,title : 'title'
			,end : 'end'
		}
	}
	,beforeCalendar :function (){} // 그리기 전 이벤트
	,afterCalendar :function (date){} // 달력 그린후 이벤트
	,dayClick : function (date){} // 달력 클릭 이벤트
}; 

function Plugin(element, options) {
	this._initialize(element, options);
	return this; 
}

Plugin.prototype ={
	/**
     * @method _initialize
     * @description 그리드 초기화.
     */
	_initialize :function(element,options){
		var _this = this ; 
		_this.selector = element;
		_this.prefix = 'pubcalendar'+new Date().getTime();
		_this.element = $(element);
		
		_defaultOption.dayMoreClick = _this.dayMoreClick; 
		_defaultOption.dayEventClick = _this.dayEventClick; 

		_this.options=$.extend({}, _defaultOption, options);
		_this.setMemorialDay(options.memorialDays);
		_this.setLunarMonthTable();
		
		_this.config = {
			beforeDate :{yyyy:'',mm:''}
		};
		_this.config.eventSources={};
		_this.config.dateRangeArrInfo={};
		
		var todayDateArr = _this.options.todayDate.split("-"); // 오늘 날짜
		
		var tdate = { 
			yyyy : todayDateArr[0]
			,mm : todayDateArr[1]
			,dd : todayDateArr[2]
		};
		
		_this.options.todayDate =tdate;
		_this._setMonthViewDayInfo(true);
		_this._loadEventData(tdate.yyyy, tdate.mm, tdate.dd);
	}
	// 이벤트 데이타 로드.
	,_loadEventData : function (pYear, pMonth, pDday){
		var _this = this
			,eventObj = _this.options.event; 
		
		//음력은 아래와 같이 체크 함
		if(_this.options.useLunar && (pYear < 1901 || pYear > 2100) ){
			alert('날짜 범위를 벗어났습니다.\n음력날자는 1901년부터 2100까지만 지원합니다.');
			return ; 
		}

		function goDraw(evtData){
			
			_this.options._date = {
				yyyy : pYear
				,mm : pMonth
				,dd :pDday
			};
			if(_this.options.initFlag === true) _this._setMonthViewDayInfo();

			_this._setEventData(evtData);
			_this.drawCalendar(pYear, pMonth, pDday);
			
			if(_this.options.initFlag !==true){
				_this.initEvt();
			}
			_this.options.initFlag = true; 
		}
		
		if(eventObj.type=='local'){
			goDraw(_this.options.event.items);
		}else{
			$.ajax({
				data: {
					start : pYear+'-'+pMonth+'-'+pDday
					,end : ''
				}
				,dataType: 'json'
				,cache: false
				,success: function(events) {
					goDraw(_this.options.event.items);
				}
				,error: function() {
					goDraw([]);
				}
				,complete: function() {
					
				}
			});
		}
	}
	// 달력 이벤트 초기화
	,initEvt : function (){
		var _this = this; 

		$('#'+_this.prefix+' .pubcalendar-move-btn').on('click',function (){
			var sEle = $(this)
				,mode = sEle.attr('_mode');


			var intPrevYear =0,	intPrevMonth = 0, intNextYear = 0,	intNextMonth = 0
				,year = parseInt(_this.options._date.yyyy,10)
				,month = parseInt(_this.options._date.mm,10);

			switch(month) {
				case 1:
						intPrevYear = year -1;
						intPrevMonth = 12;
						intNextYear = year;
						intNextMonth = 2;
						break;
				case 12:
						intPrevYear = year;
						intPrevMonth = 11;
						intNextYear = year + 1;
						intNextMonth = 1;
						break;
				default:
						intPrevYear = year;
						intPrevMonth = month - 1;
						intNextYear = year;
						intNextMonth = month + 1;
						break;
			}
			
			if(mode =='p'){
				_this._loadEventData(intPrevYear,intPrevMonth,1);
			}else{
				_this._loadEventData(intNextYear,intNextMonth,1);
			}
		});

		$('#'+_this.prefix+' .pubcalendar_year_select').on('change',function (e){
			var sEle = $(this);
			_this._loadEventData(sEle.val(),_this.options._date.mm,1);
		});

		$('#'+_this.prefix+' .pubcalendar_month_select').on('change',function (e){
			var sEle = $(this);
			_this._loadEventData(_this.options._date.yyyy , sEle.val(),1);
		});
	}
	// 다국어 정보 구하기.
	,getLang : function (type){
		return this.options.lang[type] || this.options.lang['mini'];
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
		var lunMonthInfo = getCalendarInfo(_this.options._date.yyyy); 
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
	// 일정 이벤트 정보 등록.
	,_setEventData : function (evts){
		
		var _this = this;

		if(evts.length < 1)  return ;

		var viewDateArr = _this.options.viewDateArr
			,viewMonthDayIdx= _this.options.viewMonthDayIdx
			,dateLen = viewDateArr.length
			,colModel = _this.options.event.colModel; 
		
		evts.sort(function (a,b){
			var v1= new Date(a[colModel.start])
				,v2 = new Date(b[colModel.start])
				,v1time = v1.getTime()
				,v2time = v2.getTime();
			return v1time < v2time ? -1 : v1time > v2time ? 1 : 0;
		});

		var monthFirstDay =getYyyyMmDd(viewDateArr[0])
			,monthLastDay =getYyyyMmDd(viewDateArr[dateLen-1]) ;
		
		var monthFirstDayObj =  new Date(monthFirstDay)
			,monthLastDayObj =  new Date(monthLastDay);
		monthFirstDayObj.setHours(0, 0, 0, 0);
		monthLastDayObj.setHours(23, 59, 59, 59);
		
		var monthFirstTime = monthFirstDayObj.getTime();
		var monthLastTime = monthLastDayObj.getTime();

		var _sDt = new Date()
			, _eDt = new Date()
			,_sTime,_eTime;
		
		var eventSources = {}
			, item 
			, events ={};

		var _sDt = new Date()
			, _eDt = new Date()
			, _sTime,_eTime;

		function getAddEvt(pEvt, pYyyyMMdd, pItem){
			if(!pEvt[pYyyyMMdd]){
				pEvt[pYyyyMMdd] =[];
			}
			pEvt[pYyyyMMdd].push(pItem);

			return pEvt; 
		}

		var monthEventRangeInfo = {};

		// 일정 데이타 계산
		for (var i=0 ; i < evts.length ; i++){
			item = evts[i];
			
			if(item[colModel.start]){
				var yyyyMMdd, rangeNum , _monthDayIdx, _rangeItem;
				
				item[colModel.end] = item[colModel.end] || item[colModel.start];
				_sDt = new Date(item[colModel.start]);
				_sTime = _sDt.getTime();
				_eDt = new Date(item[colModel.end]);
				_eTime = _eDt.getTime();

				yyyyMMdd = _sTime < monthFirstTime ? monthFirstDay : item[colModel.start].substring(0,10);
				item._pubCID = _this.options.prefixId+i;
				_rangeItem = {pubCID:item._pubCID};
				
				eventSources[item._pubCID] = item;
				events = getAddEvt(events,yyyyMMdd, item);

				if(_sTime > monthLastTime || _eTime < monthFirstTime){
					continue; 
				}

				if(item[colModel.start] == item[colModel.end]){
					monthEventRangeInfo = getAddEvt(monthEventRangeInfo,yyyyMMdd, _this._setColspanNum(_rangeItem,1));
					continue; 
				}
			
				rangeNum = _this._compareCalendarDate(_sTime < monthFirstTime?monthFirstDay:item[colModel.start], (_eTime > monthLastTime? monthLastDay :item[colModel.end]));
				item.realRangeNum = _this._compareCalendarDate(item[colModel.start], item[colModel.end]);
				item.rangeNum = rangeNum;

				if(rangeNum > 1){
					_monthDayIdx = viewMonthDayIdx[yyyyMMdd];
					
					var _weekLastNum = ((Math.floor(_monthDayIdx/7)+1)*7); 

					if(_monthDayIdx+rangeNum < _weekLastNum) {
						monthEventRangeInfo = getAddEvt(monthEventRangeInfo,yyyyMMdd, _this._setColspanNum(_rangeItem,rangeNum));
						continue; 
					}

					var firstSpan = _weekLastNum-_monthDayIdx; 
					monthEventRangeInfo = getAddEvt(monthEventRangeInfo,yyyyMMdd, _this._setColspanNum(_rangeItem,firstSpan));
					rangeNum = rangeNum-firstSpan;
					
					if(rangeNum > 0){
						var _dayIdx = _monthDayIdx+firstSpan;
						var n = Math.floor(rangeNum/7);
						
						if(n > 0){
							for (var l =0; l < n ;l++){
								monthEventRangeInfo = getAddEvt(monthEventRangeInfo,getYyyyMmDd(viewDateArr[_dayIdx]), _this._setColspanNum(_rangeItem,7));
								_dayIdx+=7;
							}
						}

						var mod = rangeNum % 7; 

						if(mod > 0){
							monthEventRangeInfo = getAddEvt(monthEventRangeInfo,getYyyyMmDd(viewDateArr[_dayIdx]), _this._setColspanNum(_rangeItem,mod));
						}
					}
				}else{
					monthEventRangeInfo = getAddEvt(monthEventRangeInfo,yyyyMMdd, _this._setColspanNum(_rangeItem,rangeNum));
				}
			}
		}

		// 일정이 있을때 일정 정보 계산.
		if(Object.keys(events).length > 0){
			var evtArr, _dItem, evtItem , _day
				,dateRangeInfo=[],dateRangeArrInfo={},rangeItem, rangeItem2;
			
			var dayRowIdx ={}, _prevDayInfo = {};
			var isStartFlag = false; 
			// 연속 일정 계산.
			for (var i=0; i < dateLen ;i++){
				// 로직 처리 할것 날짜의 대한것.
				_dItem = viewDateArr[i];
				_day = getYyyyMmDd(_dItem); 
				evtArr = monthEventRangeInfo[_day];

				if(i!=0 && i%7==0) {
					dateRangeInfo = [];
				}

				if(evtArr){
					for (var j=0; j<evtArr.length; j++){
						evtItem = evtArr[j];
						rangeItem2 = {
							pubCID :  evtItem.pubCID	// 일 날짜.
							,range : evtItem.spanNum	//이벤트 연속 기간
							,isStart :true			// 일정 시작 여부
						};
						dateRangeInfo.push(rangeItem2);
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
						_rowIdx = _prevDayInfo[rangeItem.pubCID];
						
						if(typeof sequenceMap[_day] === 'undefined'){
							sequenceMap[_day] = [];
						}
						sequenceMap[_day].push(_rowIdx);
					}else{
						if(typeof sequenceMap[_day] !== 'undefined'){
							var dayArr = sequenceMap[_day];

							for (var y =0; y < _rowIdx; y++){
								if(dayArr[y] > y){
									sequenceMap[_day].push(y);
									sequenceMap[_day].sort(function(a,b) { return a - b; });
									_rowIdx = y; 
									break; 
								}
							}
						}						
					}
					
					if(!dateRangeArrInfo[_day]){
						dateRangeArrInfo[_day] = {};
					}
					
					dateRangeArrInfo[_day][_rowIdx]={
						pubCID :  rangeItem.pubCID
						,range : rangeItem.range
						,rowIdx : _rowIdx
						,isStart : isStart
					}

					_prevDayInfo[rangeItem.pubCID] = _rowIdx;
					rangeItem.isStart  = false; 
					rangeItem.range = rangeItem.range == 1 ? -1 : rangeItem.range -1;
					dateRangeInfo[z] = rangeItem; 
				}
			}
		}
		
		//console.log(dateRangeArrInfo);
		
		_this.config.dateRangeArrInfo=dateRangeArrInfo;
		_this.config.eventSources=eventSources;
		
	}
	// colspan 셋팅.
	,_setColspanNum : function (pRangeItem, pNum){
		var _addObj = $.extend(true,{},pRangeItem);
		_addObj.spanNum = pNum;
		return _addObj; 
	}
	// 캘린더 그리기.
	,drawCalendar : function (year, month , day){
		var _this = this;
		
		var _yyyy = _this.config.beforeDate.yyyy
			,mode = _this.options.viewMode;
						
		var redrawYear = false; // select 년이 변경 되었을경우.
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
		var calHTML = [];
		if(_this.options.type=='mini'){
			calHTML = _this.miniCalendar({year:year, month:month , day:day, mode:mode});
		}else if(_this.options.type=='full'){
			calHTML = _this.fullCalendar({year:year, month:month , day:day, mode:mode});
		}else{
			calHTML = _this.fullCalendar({year:year, month:month , day:day, mode:mode});
		}
		
		if(_this.options.initFlag !== true){
			$(_this.selector).empty().html(calHTML.join(""));
		}else{
			if(redrawYear){
				$('#'+_this.prefix+' .pubcalendar_year_txt [type=text]').val(year);
				$('#'+_this.prefix+' .pubcalendar_year_view').html(year);
			}

			$('#'+_this.prefix+' .pubcalendar_month_select').val(parseInt(month,10));
			$('#'+_this.prefix+' .pubcalendar_body').empty().html(calHTML.join(""));
		}
		
		if($.isFunction(_this.options.afterCalendar)){
			_this.options.afterCalendar.call(_this, {year:year, month:month});
		}
		
		if($.isFunction(_this.options.dayClick)){
			$('#'+_this.prefix+' .pubcalendar-day-item').on('click',function(){
				var sEle = $(this)
					,_day = sEle.attr('_day')
					,_idx = sEle.attr('_idx');
				
				var dayItem = _this.config.dateRangeArrInfo[_day]
					,itemArr = [];
				if(dayItem){
					for(var key in dayItem){
						itemArr.push(_this.config.eventSources[dayItem[key].pubCID]);
					}
				}

				_this.options.dayClick({
					day : _day
					,items : itemArr
				});
			})
		}

		if(_this.options.type=='full'){
			_this.setFullCalendarEvent();
		}
		
		if(_this.options.useYearInput ===true && _this.options.initFlag !== true){
			_this._setInputBoxEvent();
		}
	}
	, _setInputBoxEvent : function (){
		var _this = this; 

		var _yearTxtSpanEle =$('#'+_this.prefix+' .pubcalendar_year_txt'); 
		var _yearTxt = $('#'+_this.prefix+' .pubcalendar_year_txt [type=text]');
		var _yearView = $('#'+_this.prefix+' .pubcalendar_year_view');
		
		_yearView.on('dblclick',function(){
			_yearView.hide();
			_yearTxtSpanEle.show();
			_yearTxt.focus();
			_yearTxt.select();
		});

		function _drawCal(){
			_yearTxtSpanEle.hide();
			_yearView.show();
			var yVal = _yearTxt.val(); 
			if(isNaN(yVal) || yVal.length >  4){
				_yearView.trigger('dblclick');
				return true; 
			}

			_this._loadEventData(yVal , $('#'+_this.prefix+' .pubcalendar_month_select').val() ,1,_this.options.viewMode);
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
	// full calendar 이벤트 처리.
	,setFullCalendarEvent:function(){
		var _this  = this; 

		if($.isFunction(_this.options.dayMoreClick)){
			$('#'+_this.prefix+' .pub_calendar_evt_more>.pc_more').on('click',function(e){
				var sEle = $(this)
					,_idx = sEle.attr('_idx');

				var dayItem = _this.options.viewDateArr[_idx];
					
				var _day = getYyyyMmDd(dayItem);
				var dayEvtItem = _this.config.dateRangeArrInfo[_day]
					,itemArr = [];
				if(dayEvtItem){
					for(var key in dayEvtItem){
						itemArr.push(_this.config.eventSources[dayEvtItem[key].pubCID]);
					}
				}
				
				_this.options.dayMoreClick.call(_this,{evt :e, idx:_idx, dayInfo:dayItem, date:_day, items:itemArr});
			})
		}

		if($.isFunction(_this.options.dayEventClick)){
			$('#'+_this.prefix+' .pub_calendar_evt_item').on('click',function(e){
				var clickItem = _this.config.eventSources[$(this).attr('pubc_id')];
				_this.options.dayEventClick.call(_this,{evt :e, item:clickItem});
			})
		}
	 }
	// 미니 달력. 시작 ------
	,miniCalendar : function(opt){ 
		var _this = this
			, mode=opt.mode // mode 1 default 양력, 2 title 음력, 3 양력 title 기념일. , 4 양력 title 음력/기념일. 
			, year=opt.year, month=opt.month, day=opt.day
			, useLunar = _this.options.useLunar; 
		
		var calHTML  = [];
		
		year = parseInt(year,10);
		month = parseInt(month,10);
		
		var _lang =_this.getLang('mini');
		if(_this.options.initFlag !== true){
			
			calHTML.push('<div id="'+_this.prefix+'" class="mini-pubcalendar '+_this.options.theme+'" style="width:'+_this.options.width+'px;">');
			calHTML.push(_this._renderMiniHeaderHtml(year ,month,_lang , _this.options.colWidth));
			calHTML.push('	<tbody class="pubcalendar_body">');
		}

		var _tdate = _this.options.todayDate
			,dateRangeArrInfo = _this.config.dateRangeArrInfo
			,thirdPrintDay=1;

		var dayInfoArr=_this.getMonthDayInfo({year :year, month : month, day:1}); // 음력날짜 . 기념일 가져오기.

		var dateItem ; 
		for (var i=0; i< dayInfoArr.length; i++ ){
			dateItem = dayInfoArr[i];

			thirdPrintDay = dateItem.day;
			if(i%7==0){
				if(i==0){
					calHTML.push('<tr>');
				}else{
					calHTML.push('</tr><tr>');
				}
			}
			
			var tempTodayDate = dateItem.year+"-"+day2(dateItem.month)+"-"+day2(dateItem.day);
			
			var chkFlag=false;
			if(_this.options.eventDisplay===true){
				if(dateRangeArrInfo[tempTodayDate]){
					chkFlag = true; 
				}
			}
			calHTML.push('<td>');
			var boldClass='';
			if (_tdate.yyyy == year && _tdate.mm == month && _tdate.dd == i + 1){
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
			calHTML.push("</div>");
		}

		return calHTML;
	}
	// full 달력. 시작 ------
	,fullCalendar : function(opt){ 
		var _this = this
			, mode=opt.mode // mode 1 default 양력, 2 title 음력, 3 양력 title 기념일. , 4 양력 title 음력/기념일. 
			, year=opt.year, month=opt.month, day=opt.day;
		var calHTML  = [];
		
		year = parseInt(year,10);
		month = parseInt(month,10);
		
		var _lang =_this.getLang('full');
		if(_this.options.initFlag !== true){
			
			calHTML.push('<div id="'+_this.prefix+'" class="full-pubcalendar '+_this.options.theme+'" style="width:'+_this.options.width+'px;height:'+_this.options.height+'px;">');
			calHTML.push(_this._renderFullCalHeaderHtml(year ,month,_lang , _this.options.colWidth));
			calHTML.push('<div class="pubcalendar_body" id="'+_this.prefix+'pc_body">');
		}

		var _tdate = _this.options.todayDate
			,eventSources = _this.config.eventSources
			,dateRangeArrInfo = _this.config.dateRangeArrInfo
			,thirdPrintDay=1;

		var dayInfoArr=_this.getMonthDayInfo({year :year, month : month, day:1}); // 음력날짜 . 기념일 가져오기.
		
		var dateItem, _desc='';
		var dateLen = dayInfoArr.length, _idx = 0;
		var rowHeight = 100/( dateLen/7);

		for(var i =0 ;i < 7; i++){
			if(_idx >= dateLen) break; 
					
			calHTML.push('<div class="month-row" style="top: '+(i*rowHeight)+'%; height: '+((i+1)*rowHeight)+'%">');
			calHTML.push(_this._renderBgTableHtml(i));
			calHTML.push('<table cellpadding="0" cellspacing="0" class="pubc-row-grid-table"><thead><tr>');

			var weekDayArr = []
				,maxWeekRow = 0;

			for(var j =0 ;j < 7; j++){
				dateItem = dayInfoArr[_idx];

				thirdPrintDay = dateItem.day;
						
				var tempTodayDate = dateItem.year+"-"+day2(dateItem.month)+"-"+day2(dateItem.day);

				weekDayArr.push(tempTodayDate);
				
				if(dateRangeArrInfo[tempTodayDate]){
					var _draiLen = Object.keys(dateRangeArrInfo).length; 
					maxWeekRow = maxWeekRow > _draiLen? maxWeekRow : _draiLen;
				}
				
				calHTML.push('<td>');
				var boldClass='';
				if (_tdate.yyyy == year && _tdate.mm == month && _tdate.dd == i + 1){
					boldClass='font-bold';
				}
				
				// 모드별 날짜 view
				calHTML.push('<div class="day_area"><a href="javascript:;" class="pubcalendar-day-item '+boldClass+' '+dateItem.className+'" _day="'+tempTodayDate+'" ');
				if(mode=="2"){
					_desc = dateItem['desc'] ||'';
					calHTML.push(' title="'+dateItem.desc+'">'+thirdPrintDay); //음력 날짜 , 메모명.
				}else if(mode=="3" && useLunar){
					_desc = dateItem['desc'] ||'';
					calHTML.push(' title="'+dateItem.desc+'">'+thirdPrintDay); //음력 날짜 , 메모명.
				}else if(mode=="4" && useLunar){
					_desc = dateItem['lunday']+(dateItem['desc']!=""?"/"+dateItem.desc:"")
					calHTML.push('>'+thirdPrintDay); //음력 날짜 , 메모명.
				}else{
					calHTML.push('>'+thirdPrintDay); //음력 날짜 , 메모명.
				}
				calHTML.push('</a><span class="day_info">'+_desc+'</span></div>'); //음력 날짜 , 메모명.

				++_idx;
				
			}
			calHTML.push('</tr></thead>');

			var arrMaxRowColNum = {}, evtChkFlag = false;
			for (var j =0; j< maxWeekRow; j++){
				calHTML.push('<tr>');
				var totColVal = 0 ; 
				evtChkFlag = false; 
				for(var k = 0 ;k < 7; k++){
					
					var evtInfo = dateRangeArrInfo[weekDayArr[k]];
					
					if(evtInfo){
						evtChkFlag = true; 
						var evtItem = evtInfo[j];
						
						if(evtItem && evtItem.isStart) {
							totColVal += evtItem.range;
							var esItem = eventSources[evtItem.pubCID];
							
							calHTML.push('<td colspan="'+evtItem.range +'"><div class="pub_calendar_evt_item" pubc_id="'+evtItem.pubCID+'">'+esItem[_this.options.event.colModel.title]+'</div></td>');
						}
					}

					if(totColVal < k+1){
						totColVal +=1;
						calHTML.push('<td>&nbsp;</td>');
					}
				}
				calHTML.push('</tr>');

				if(!evtChkFlag) break; 

				if(j+1 >= _this.options.maxEventRow){
					for(var k = 0 ;k < 7; k++){
						var evtInfo = dateRangeArrInfo[weekDayArr[k]];
						var evtLen = evtInfo?Object.keys(evtInfo).length:0; 
						if((evtLen > _this.options.maxEventRow)) {	
							calHTML.push('<td><div class="pub_calendar_evt_more"><a class="pc_more" _idx="'+(i*7+k)+'">+'+(evtLen - _this.options.maxEventRow)+' more</a></div></td>');
						}else{
							totColVal +=1; 
							calHTML.push('<td>&nbsp;</td>');
						}
					}
					break; 
				}
			}
			calHTML.push('</table></div>');		
		}

		if(_this.options.initFlag !== true){
			calHTML.push('</div><div class="pub_calendar_more_area_wrap"></div></div>');
			//calHTML.push("");
		}

		return calHTML;
	}
	// mini 달력 header html 
	,_renderMiniHeaderHtml : function (year, month , _lang , _w){
		var calHTML =[]; 
		calHTML.push('	<div style="text-align:center;">');
		calHTML.push('		<a href="javascript:;" class="pubcalendar-move-btn" _mode="p"><span><</span></a>');
		calHTML.push('			<span class="pubcalendar_year_wrap"><span class="pubcalendar_year_txt"><input type="text" size="4" value="'+year+'"></span><span class="pubcalendar_year_view">'+year+'</span>'+_lang.year);
		calHTML.push('			<span class="pubcalendar_month_wrap">'+getMonthInfo(year, month) +'</span>'+_lang.month);
		calHTML.push('		<a href="javascript:;"  class="pubcalendar-move-btn" _mode="n"><span>></span></a>');			
		calHTML.push('	</div>');
		calHTML.push('	<table class="mini-pubcalendar-tbl">');
		calHTML.push('	  <colgroup>');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('  </colgroup>');
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
	,_renderFullCalHeaderHtml :function (year, month , _lang , _w){
		var calHTML =[]; 
		calHTML.push('	<div style="text-align:center;">');
		calHTML.push('		<a href="javascript:;" class="pubcalendar-move-btn" _mode="p"><span><</span></a>');
		calHTML.push('			<span class="pubcalendar_year_wrap"><span class="pubcalendar_year_txt"><input type="text" size="4" value="'+year+'"></span><span class="pubcalendar_year_view">'+year+'</span>'+_lang.year);
		calHTML.push('			<span class="pubcalendar_month_wrap">'+getMonthInfo(year, month) +'</span>'+_lang.month);
		calHTML.push('		<a href="javascript:;"  class="pubcalendar-move-btn" _mode="n"><span>></span></a>');			
		calHTML.push('	</div>');
		calHTML.push('	<table class="full-pubcalendar-tbl">');
		calHTML.push('	  <colgroup>');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('		<col style="min-width:'+_w+'px;">');
		calHTML.push('  </colgroup>');
		calHTML.push('  <thead><tr>		');
		calHTML.push('		<td valign="top" class="pub-calendar-red">'+_lang.sun+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.mon+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.tue+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.wed+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.thu+'</td>		');
		calHTML.push('		<td valign="top" class="">'+_lang.fri+'</td>		');
		calHTML.push('		<td valign="top" class="pub-calendar-blue">'+_lang.sat+'</td>		');
		calHTML.push('	  </tr></thread></table>');

		return calHTML.join('');
	}
	// 바탕 테이블 html
	,_renderBgTableHtml :function (i){
		return '<table cellpadding="0" cellspacing="0" class="pubc-row-bg-table"><tr>'
			+ '	<td class="pubc-bg pubc-bg-fc" _idx="'+(i*7)+'">&nbsp;</td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+1)+'">&nbsp;</td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+2)+'">&nbsp;</td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+3)+'">&nbsp;</td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+4)+'">&nbsp;</td>'
			+ '	<td class="pubc-bg" _idx="'+(i*7+5)+'">&nbsp;</td>'
			+ '	<td class="pubc-bg pubc-bg-lc" _idx="'+(i*7+6)+'">&nbsp;</td>'
			+ '</tr></table>';
	}
	,_compareCalendarDate :function (sDt, eDt){
		var startDt = new Date(sDt);
		startDt.setHours(0, 0, 0, 0);
		var endDt = new Date(eDt);
		endDt.setHours(23, 59, 59, 59);
		
		return Math.ceil((endDt.getTime() - startDt.getTime())/86400000);

		//return  (endDt.getTime() - startDt.getTime())/86400000;
	}
	// 더보기 클릭.
	,dayMoreClick : function (obj){
		var _this = this 
			,items = obj.items;

		var moreEle = $('#'+_this.prefix+' .pub_calendar_more_area_wrap');

		var sEle = $('#'+_this.prefix+' .pubc-bg[_idx="'+obj.idx+'"]'); 

		var moreHtm = [];

		moreEle.css('top',sEle.offset().top-10).css('left', sEle.offset().left-10).css('width',sEle.width()); 

		moreHtm.push('<div class="more_header"><span>'+obj.date+'</span><a href="javascript:;"class="more_close">X</a></div><div class="morelist_wrap">');
		for (var i=0; i<items.length;i++ ){
			moreHtm.push('<div class="moreitem"><a href="javascript:;" class="pubc_evt_item" idx="'+i+'">'+items[i][_this.options.event.colModel.title]+'</a></div>');
		}
		moreHtm.push('</div>');
		moreEle.html(moreHtm.join(''));
		
		moreEle.show();
		moreEle.find('.more_close').on('click',function (){
			moreEle.hide();
		});

		moreEle.find('.pubc_evt_item').on('click',function (e){
			var clickItem = items[$(this).attr('idx')];

			if($.isFunction(_this.options.dayEventClick)){
				_this.options.dayEventClick.call(_this,{evt :e, item:clickItem});
			}
		});
	}
	//일정 클릭.
	,dayEventClick :function (sObj){
		var _this = this 
			,item = sObj.item;
		
		console.log(sObj)
		
	}
	// 두 날짜간의 날짜 비교 . 
	,compCalendarDate : function (firstDate, secondDate){
			
		var tmpYear=0, tmpMon=0, tmpDay=0;
		var checkMon , fTmpMon, STmpMon;
		var fDay = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
		var sDay = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
		var fTmpDate = firstDate.split("-");
		var sTmpDate = secondDate.split("-");

		var firstYear = parseInt(fTmpDate[0],10);
		var secondYear =parseInt(sTmpDate[0],10);

		fDay[1]=(((firstYear % 4 == 0) && (firstYear % 100 != 0)) || (firstYear % 400 == 0))?29:28;
		sDay[1]=(((secondYear % 4 == 0) && (secondYear % 100 != 0)) || (secondYear % 400 == 0))?29:28;
						
		tempYear =(firstYear -secondYear )*365 ;
		tmpDay = parseInt(fTmpDate[2],10) -parseInt(sTmpDate[2],10);
		fTmpMon = parseInt(fTmpDate[1],10);
		STmpMon = parseInt(sTmpDate[1],10);
		checkMon =  fTmpMon>=STmpMon ?fTmpMon:STmpMon;
		
		for(var i =0 ; i <checkMon ; i++){
			if(i < fTmpMon){
				tmpMon = tmpMon+ fDay[i];
			}
			if(i < STmpMon){
				tmpMon = tmpMon- sDay[i];
			}
		}
		return tempYear+tmpMon+tmpDay;
	}
	// 달력에 보일 날짜 셋팅.
	,_setMonthViewDayInfo :function (initFlag){
		var _this =this; 
				
		var tdate = initFlag===true ? _this.options.todayDate : _this.options._date;
		
		var viewMonth = tdate.mm; 

		var solYear = tdate.yyyy
			,solMonth= tdate.mm
			,solDay = 1;
			
		var monthDayInfo = _this._getMonthDayArr(solYear, solMonth)
			,monthArr = monthDayInfo.monthArr
			,startWeekday = monthDayInfo.startWeekday;

		var intLastDay =  monthArr[solMonth - 1]
			,prevMonth = solMonth == 1?12:(solMonth - 1)
			,prevLastDay = monthArr[prevMonth-1];
		
		// 선택한 달의 이전 날짜 구하기.
		if(startWeekday > 0){
			solYear = prevMonth==12 ? solYear-1 : solYear;
			solMonth = prevMonth;
			solDay= prevLastDay - (startWeekday-1);
		}

		var _sumMonthDay = startWeekday + intLastDay;
		var dateLen = _sumMonthDay+(_sumMonthDay%7==0?0: 7-(_sumMonthDay%7));
		var viewDateArr = [], tmpDayInfo;
		var monthDayIdx = {};
		for (var i=0; i < dateLen; i++){

			tmpDayInfo ={	
				year : solYear 
				, month : solMonth
				, day : solDay
				, monthType: (viewMonth == solMonth ? 'current' : (viewMonth > solMonth ?'prev':'next') )
			};

			monthDayIdx[getYyyyMmDd(tmpDayInfo)]= i; 
			viewDateArr.push(tmpDayInfo);
			
			/* add a day of solar calendar */
			if (solMonth == 12 && solDay == 31)	{
				solYear++;
				solMonth = 1;
				solDay = 1;

				/* set monthDay of Feb */
				if (solYear % 400 == 0)
					monthArr[1] = 29;
				else if (solYear % 100 == 0)
					solMonthDay[1] = 28;
				else if (solYear % 4 == 0)
					monthArr[1] = 29;
				else
					monthArr[1] = 28;
			}else if (monthArr[solMonth - 1] == solDay){
				solMonth++;
				solDay = 1; 
			}else{
				solDay++;
			}
		}
		_this.options.viewDateArr = viewDateArr;
		_this.options.viewMonthDayIdx = monthDayIdx;
		
	}
	// 양력 달 마지막날 & 요일 정보 구하기.
	,_getMonthDayArr :function (year, month){
		var monthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		/* set monthDay of Feb */
		if (year % 400 == 0)
			monthDay[1] = 29;
		else if (year % 100 == 0)
			monthDay[1] = 28;
		else if (year % 4 == 0)
			monthDay[1] = 29;
		else
			monthDay[1] = 28;

		var date = new Date(year, month - 1, 1);
		
		return {
			monthArr : monthDay
			,startWeekday : date.getDay()
		}
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
			var _calInfo = getCalendarInfo(_year);
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
				
				if (lunarMonthTable[lunYear][lunMonth - 1] == 1)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 2)
					lunMonthDay = 30;
			}else if (lunDay == lunMonthDay){
				if (lunarMonthTable[lunYear][lunMonth - 1] >= 3&& lunLeapMonth == 0){
					lunDay = 1;
					lunLeapMonth = 1;
				}else{
					lunMonth++;
					lunDay = 1;
					lunLeapMonth = 0;
				}

				if (lunarMonthTable[lunYear][lunMonth - 1] == 1)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 2)
					lunMonthDay = 30;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 3)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 4 && lunLeapMonth == 0)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 4 && lunLeapMonth == 1)
					lunMonthDay = 30;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 5 && lunLeapMonth == 0)
					lunMonthDay = 30;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 5 && lunLeapMonth == 1)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 6)
					lunMonthDay = 30;
			}else{
				lunDay++;
			}
		}

		return monthLunarCal;
	}
	// 음력 계산
	,_getLunElapseDay : function (solDate, lunDate){
		var _lLeapMonth=0;
		
		var solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		/* set monthDay of Feb */
		if (solDate.year % 400 == 0)
			solMonthDay[1] = 29;
		else if (solDate.year % 100 == 0)
			solMonthDay[1] = 28;
		else if (solDate.year % 4 == 0)
			solMonthDay[1] = 29;
		else
			solMonthDay[1] = 28;
		
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
			/* add a day of lunar calendar */

			if (lunMonth == 12){
				lunYear++;
				lunMonth = 1;
				
				if (lunarMonthTable[lunYear][lunMonth - 1] == 1)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 2)
					lunMonthDay = 30;
			}else{
				if (lunarMonthTable[lunYear][lunMonth - 1] >= 3&& lunLeapMonth == 0){
					lunLeapMonth = 1;
				}else{
					lunMonth++;
					lunLeapMonth = 0;
				}

				if (lunarMonthTable[lunYear][lunMonth - 1] == 1)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 2)
					lunMonthDay = 30;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 3)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 4 && lunLeapMonth == 0)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 4 && lunLeapMonth == 1)
					lunMonthDay = 30;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 5 && lunLeapMonth == 0)
					lunMonthDay = 30;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 5 && lunLeapMonth == 1)
					lunMonthDay = 29;
				else if (lunarMonthTable[lunYear][lunMonth - 1] == 6)
					lunMonthDay = 30;
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
		dayInfo['sunday'] = index%7;
		dayInfo['memorialday'] = memorialDay;
		dayInfo['lunnaview'] = dayInfo.lunDay=="1" || dayInfo.lunDay=="15" ?  "inline" :"none";  // 음력 계산. 
		
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
	,destory:function (){
		delete _datastore[this.selector];
	}
};

$.pubCalendar = function (selector,options, args) {
	
	if(!selector || $(selector).length < 1){
		return '['+selector + '] selector  not found '; 
	}

	if(typeof options === undefined){
		return _datastore[selector]; 
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

}(jQuery, window, document));


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

function getCalendarInfo(year){
	var reval = {
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
	
	return reval[year]; 
}
