/*
 * pubGrid v0.0.1
 * ========================================================================
 * Copyright 2015 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
*/
;(function($, window, document) {
"use strict";

var _initialized = false
,_doc = $(document)
,_datastore = {}
,_defaults = {
	fixed:false
	,colWidthFixed:false 
	,headerResize :true // header resize 여부
	,drag:[]
	,scrollWidth : 18
	,resizeCursor : 'e-resize'
	,minWidth : 30
	,headerOptions : {
		view :true
	}
	,height: 200
	,reiszeable:true
	,tColItem : [] //head item
 	,theadGroup : [] // head group 
	,tbodyItem : []  // body item
	,tbodyGroup : [] // body group 
	,tfootItem : []  // foot item
	,rowClick : false //row(tr) click event
	,rowContextMenu : false // row(tr) contextmenu event
}
,agt = navigator.userAgent.toLowerCase()
,_broswer = ((function (){
	if (agt.indexOf("msie") != -1) return 'msie'; 
	if (agt.indexOf("chrome") != -1) return 'chrome'; 
	if (agt.indexOf("firefox") != -1) return 'firefox'; 
	if (agt.indexOf("safari") != -1) return 'safari'; 
	if (agt.indexOf("opera") != -1) return 'opera'; 
	if (agt.indexOf("mozilla/5.0") != -1) return ',ozilla';
	if (agt.indexOf("staroffice") != -1) return 'starOffice'; 
	if (agt.indexOf("webtv") != -1) return 'WebTV'; 
	if (agt.indexOf("beonex") != -1) return 'beonex'; 
	if (agt.indexOf("chimera") != -1) return 'chimera'; 
	if (agt.indexOf("netpositive") != -1) return 'netPositive'; 
	if (agt.indexOf("phoenix") != -1) return 'phoenix'; 
	if (agt.indexOf("skipstone") != -1) return 'skipStone'; 
	if (agt.indexOf("netscape") != -1) return 'netscape'; 
})())
,_broswerVersion = ((function (){
	if(_broswer != 'msie') return -1; 
	var win = window;
	var doc = win.document;
	var input = doc.createElement ("input");
  
    if (win.ActiveXObject === undefined) return null;
    if (!win.XMLHttpRequest) return 6;
    if (!doc.querySelector){
		_defaults.scrollWidth = 21;
		return 7;
	}
    if (!doc.addEventListener){
		_defaults.scrollWidth = 18;
		return 8;
	}
    if (!win.atob){
		_defaults.scrollWidth = 17;
		return 9;
	}

    if (!input.dataset){
		_defaults.scrollWidth = 18;
		return 10;
	}
    return 11;
})());


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
		var _this = this; 
		_this.selector = element;
		_this.prefix = 'pub'+new Date().getTime();
		_this.element = $(element);
		_this.config = {};
		_this.options =$.extend(true, {}, _defaults);
		_this.setOptions(options);
		_this.config.gridElementWidth = _this.element.innerWidth();
		_this.config.gridWidth = _this.config.gridElementWidth+_this.options.scrollWidth;
		_this.config.gridXScrollFlag = false;
		_this._setThead();
		_this.drag; 
		
		_this.drawGrid();
		return this;
	}
	/**
     * @method setOptions
     * @description 옵션 셋팅.
     */
	,setOptions : function(options){
		var _this = this; 
		
		$.extend(true, _this.options, options);

		var _cb = _this.options.rowContextMenu.callback; 

		if(_this.options.rowContextMenu !== false && typeof _this.options.rowContextMenu == 'object'){
			var _cb = _this.options.rowContextMenu.callback; 
			
			if(_cb){
				_this.options.rowContextMenu.callback = function(key,sObj) {
					this.gridItem = _this.getItems(this.element.attr('rowInfo'))
					_cb.call(this,key,sObj);
				}
			}
		}else{
			_this.options.rowContextMenu =false; 
		}
	}
	/**
     * @method _setThead
	 * @param pItem {Object} - 데이타 .
	 * @param drawFlag {Boolean} - 새로 그리기 여부.
     * @description 헤더 label 셋팅.
     */
	,_setThead : function (){
		var _this = this
			,opt = _this.options;
			
		var tci = opt.tColItem
			,thg = opt.theadGroup
			,gridElementWidth =_this.config.gridElementWidth
			,thiItem,thgItem, rowItem, headItem
			,headGroupInfo = [],groupInfo = [], rowSpanNum = {};
		
		if(thg.length < 1){
			thg.push(tci);
		}
		
		var headerItemMap = {};
		
		for(var i=0,j=0;i <thg.length; i++) {
			thgItem = thg[i];
			
			for(j=0 ; j < thgItem.length; j++){
				headerItemMap[i+''+(thgItem[j].key||j)] = thgItem[j];
			}
		}
		
		var tmpThgIdx=0,tmpColIdx=0,tmpThgItem;
		for(var i=0,j=0 ;i <thg.length; i++ ){
			thgItem = thg[i];
			groupInfo = [];
			tmpColIdx = 0;
			tmpThgIdx = 0;

			for(j=0; j<tci.length; j++) {
				thiItem = tci[j];
				if(tmpColIdx > j || tmpThgIdx >= thgItem.length){
					headItem = {r:i,c:j,view:false};
				}else{
					headItem=thgItem[tmpThgIdx];

					console.log(i,rowSpanNum[j],tmpThgIdx,'headItem : ', headItem ,thgItem);

					tmpColIdx +=(headItem['colspan'] || 0);
					headItem['r'] = i;
					headItem['c'] = j;
					headItem['view'] = true;
					headItem['colSpanIdx'] = j;
					headItem['span'] = 'scope="col"';
					headItem['label'] = headItem.label ? headItem.label : thiItem.label;
					
					if(headItem.colspan){
						headItem['colSpanIdx'] = j+headItem.colspan-1;
						headItem['span'] = ' scope="colgroup" colspan="'+headItem.colspan+'" ';
					}


					if(rowSpanNum[j] && rowSpanNum[j] >= i){
						headItem['view'] = false;
					}
					
					if(headItem.rowspan){
						headItem['span'] = ' scope="col" rowspan="'+headItem.rowspan+'" ';
						rowSpanNum[j] = i+ headItem.rowspan -1;
					}
					
					tmpThgIdx +=1;
				}
				groupInfo.push(headItem);
			}
			headGroupInfo.push(groupInfo);
		}
		
		console.log(rowSpanNum);
		console.log(headGroupInfo);

		_this.config.headerInfo = headGroupInfo;

		var colWidth = Math.floor(gridElementWidth/tci.length)
			,_w = 0;
		
		for(var j=0; j<tci.length; j++){
			if(!opt.tColItem[j].width){
				opt.tColItem[j].width =colWidth;
			}

			_w +=opt.tColItem[j].width;
		}
		
		if(_w > gridElementWidth ){
			_this.config.gridXScrollFlag = true;
			_this.config.gridWidth = _w;
		}
	}
	/**
     * @method _setTbody
     * @param pItem {Object} - 데이타 .
	 * @param drawFlag {Boolean} - 새로 그리기 여부.
	 * @description 바디 데이타 셋팅
     */
	,_setTbody : function(){
		var _this = this; 
		this.options.tbodyItem = pItem;
	}
	/**
     * @method _setTfoot
	 * @param pItem {Object} - 데이타 .
	 * @param drawFlag {Boolean} - 새로 그리기 여부. 
     * @description foot 데이타 셋팅
     */
	,_setTfoot : function(){
		var _this = this; 
		this.options.tfootItem = pItem;

	}
	/**
     * @method _getColGroup
	 * @param type {String} - colgroup 타입
     * @description colgroup 구하기.
     */
	,_getColGroup :function (type){
		var _this = this
			,opt = _this.options
			,tci = opt.tColItem
			,thiItem;
		var strHtm = [];
		strHtm.push('<colgroup>');
		for(var i=0 ;i <tci.length; i++){
			thiItem = tci[i];
			var tmpStyle = [];
			tmpStyle.push('width:'+thiItem.width+'px;');
			if(thiItem.viewFlag===false){
				tmpStyle.push('display:none;');
			}
			strHtm.push('	<col id="'+type+i+'" style="'+tmpStyle.join('')+'" />');
		}
		strHtm.push('</colgroup>');

		return strHtm.join('');
		
	}
	/**
     * @method drawGrid
	 * @param  type {String} 그리드 타입.
     * @description foot 데이타 셋팅
     */
	,drawGrid : function (type){
		var _this = this
			,opt = _this.options
			,ci = _this.config
			,tci = opt.tColItem
			,tbi = opt.tbodyItem
			,thiItem;

		type = type ? type :'all';

		// header html 만들기
		function theadHtml(){
			var strHtm = [];

			strHtm.push(_this._getColGroup(_this.prefix+'colHeader'));

			strHtm.push('<thead>');
			if(ci.headerInfo.length > 0 && opt.headerOptions.view){
				var ghArr, ghItem;
			
				for(var i =0,j=0 ; i <ci.headerInfo.length; i++){
					ghArr = ci.headerInfo[i];
					strHtm.push('<tr class="pub-header-tr">');
					for(j=0 ; j <ghArr.length; j++){
						ghItem = ghArr[j];
						if(ghItem.view){
							strHtm.push('	<th '+ghItem.span+' class="'+(_this.prefix+'-htd-'+ghItem.key)+'" '+(ghItem.style?' style="'+ghItem.style+'" ':'')+'>');
							strHtm.push('		<div class="labelWrapper">');
							strHtm.push('			<div class="pub-header-cont">'+ghItem.label+'</div>');
							if(opt.headerResize){
								strHtm.push('			<div class="pub-header-resizer" colspanidx="'+ghItem.colSpanIdx+'"></div>');
							}
							strHtm.push('		</div>');
							strHtm.push('	</th>');
						}
					}
					strHtm.push('</tr>');
				}
			}
			strHtm.push("</thead>");
			return strHtm.join('');
		}
		
		//body html  만들기
		function tbodyHtml(){
			var strHtm = [];
			strHtm.push(_this._getColGroup(_this.prefix+'colbody'));
			strHtm.push('<tbody>');
			if(tbi.length > 0){
				var tbiItem, clickFlag = false;
				for(var i =0 ; i <tbi.length ; i++){
					tbiItem = tbi[i];
					strHtm.push('<tr class="pub-body-tr" rowinfo="'+i+'">');

					for(var j=0 ;j <tci.length; j++){
						thiItem = tci[j];
						clickFlag = thiItem.colClick;
						
						strHtm.push('<td class="pub-body-td '+(_this.prefix+'-btd-'+thiItem.key)+' '+(thiItem.viewFlag===false ? 'pubGrid-disoff':'')+'"><div class="pub-content"><a href="javascript:;" class="'+ (clickFlag?'pub-body-td-click':'') +'" colinfo="'+i+','+j+'">'+tbiItem[thiItem.key]+'</a></div></td>');
					}
				}
			}else{
				strHtm.push('<tr><td colspan="'+tci.length+'"><div class="text-center">NO DATA</div></td></tr>');
			}
			strHtm.push('</tbody>');
			return strHtm.join('');
		}
		
		// foot html 만들기
		function tfootHtml(){
			var strHtm = [];
			strHtm.push("				<tfoot>");
			if(opt.tfootItem.length > 0){
				strHtm.push("					<tr class=\"pub-foot-tr\">");
				strHtm.push("						<td>1.9</td>");
				strHtm.push("						<td>0.003</td>");
				strHtm.push("						<td>40%</td>");
				strHtm.push("					</tr>");				
			}
			strHtm.push("				</tfoot>");
			return strHtm.join('');
		}

		if(type =='all'){
			
			var strHtm = [],
				_gw = _this.config.gridElementWidth -(_this.config.gridXScrollFlag ? 0: _this.options.scrollWidth);
			strHtm.push('<div class="pubGrid-wrapper">');
			strHtm.push('	<div id="'+_this.prefix+'pubGrid-container" class="pubGrid-container" style="width:'+_this.config.gridElementWidth+'px;">');
			strHtm.push('		<div id="'+_this.prefix+'pubGrid-header-wrapper" class="pubGrid-header-wrapper" style="width:'+(_this.config.gridElementWidth)+'px;">');
			strHtm.push('		<div id="'+_this.prefix+'pubGrid-header-container" class="pubGrid-header-container" style="width:'+(_this.config.gridWidth+_this.options.scrollWidth)+'px;">');
			strHtm.push('			<table id="'+_this.prefix+'pubGrid-header" class="pubGrid-header" style="width:'+_gw+'px;" onselectstart="return false">');
			strHtm.push(theadHtml());
			strHtm.push('			</table></div>');	
			strHtm.push('		</div>');
			strHtm.push('		<div class="pubGrid-body-wrapper">');
			strHtm.push('			<div id="'+_this.prefix+'pubGrid-body-container" class="pubGrid-body-container" style="height:'+opt.height+'px;">');
			strHtm.push('				<table id="'+_this.prefix+'pubGrid-body" class="pubGrid-body" style="width:'+_gw+'px;">');
			strHtm.push('				</table>');	
			strHtm.push('			</div>');
			strHtm.push('		</div>');
			strHtm.push('		<div id="'+_this.prefix+'hiddenArea" style="display:none;"></div>');
			strHtm.push('	</div>');

			strHtm.push('</div>');

			_this.element.empty();
			_this.element.html(strHtm.join(''));
			
			_this.config.headerWrapElement = $('#'+_this.prefix +'pubGrid-header-wrapper');
			_this.config.headerElement = $('#'+_this.prefix +'pubGrid-header');
			_this.config.headerContainerElement = $('#'+_this.prefix +'pubGrid-header-container');
			_this.config.bodyElement = $('#'+_this.prefix +'pubGrid-body');
			_this.config.bodyContainerElement = $('#'+_this.prefix +'pubGrid-body-container');
			_this.config.hiddenArea = $('#'+_this.prefix +'hiddenArea');
			
			$(_this.selector+' .pubGrid-body-container').scroll(function (e){
				_this.config.headerWrapElement.scrollLeft($(this).scrollLeft());
			});

			_this.initHeaderResize();
			
			$(_this.selector +' .pubGrid-body').empty().html(tbodyHtml());

		}
		
		if(type =='tbody'){
			$(_this.selector +' .pubGrid-body').empty().html(tbodyHtml());
		}

		_this._initBodyEvent();
	}
	/**
     * @method getItems
	 * @param  idx {String} item index
     * @description item 값 얻기.
     */
	,getItems:function (idx){
		if(idx){
			return this.options.tbodyItem[idx]
		}else{
			return this.options.tbodyItem;
		}
	}
	/**
     * @method getItems
	 * @param  idx {String} item index
     * @description item 값 얻기.
     */
	,_initBodyEvent : function (){
		var _this = this
			 ,_rowTr =$('#'+_this.prefix+'pubGrid-container .pub-body-tr')
			 ,rowClickFlag =false; 
		if(_this.options.rowClick !== false && typeof _this.options.rowClick == 'function'){
			rowClickFlag =true; 
			_rowTr.off('click.pubgridrow');
			_rowTr.on('click.pubgridrow',function (e){
				var selRow = $(this).attr('rowinfo')
				,selItem = _this.options.tbodyItem[selRow];
				_this.options.rowClick.call({
					r:selRow
					,item:selItem
				},selRow,selItem);							
			});
		}

		if(_this.options.rowContextMenu !== false){
			$.pubContextMenu(_rowTr,_this.options.rowContextMenu);
		}
		
		if(!rowClickFlag){
			$('#'+_this.prefix+'pubGrid-container .pub-body-td-click').on('click.pub.gridcol',function (e){
				var selCol = $(this).attr('colinfo').split(',')
					,selRow = selCol[0]
					,colIdx = selCol[1]
					,selItem = _this.options.tbodyItem[selRow];

				_this.options.tColItem[colIdx].colClick.call(this,colIdx,{
					r:selRow
					,c:colIdx
					,item:selItem
				});
				
			});
		}
	}
	/**
     * @method initHeaderResize
     * @description header resize 처리.
     */
	,initHeaderResize:function (){
		var _this = this; 

		$('#'+_this.prefix+'pubGrid-header .pub-header-resizer').on('touchstart.pubresizer mousedown.pubresizer',function (e){
			var oe = e.originalEvent.touches;

			_this.drag = {};
            _this.drag.pageX = oe ? oe[0].pageX : e.pageX;
			_this.drag.ele = $(this);
			_this.drag.colspanidx = _this.drag.ele.attr('colspanidx');
			_this.drag.colHeader= $('#'+_this.prefix+'colHeader'+_this.drag.colspanidx);
			_this.drag.colBody= $('#'+_this.prefix+'colbody'+_this.drag.colspanidx);
			_this.drag.colW = _this.drag.colHeader.attr('_width')?parseInt(_this.drag.colHeader.attr('_width'),10):_this.drag.colHeader.width();
			_this.drag.gridW = _this.config.headerElement.width();
			
			// resize시 select안되게 처리 . cursor처리 
			_doc.attr("onselectstart", "return false");
			_this.config.hiddenArea.append("<style type='text/css'>*{cursor:" + _this.options.resizeCursor + "!important}</style>");

			_doc.on('touchmove.colheaderresize mousemove.colheaderresize', function (e){
				_this.onGripDrag(e,_this);
			}).on('touchend.colheaderresize mouseup.colheaderresize mouseleave.colheaderresize', function (e){
				_this.onGripDragEnd(e,_this);
			});

			return false; 
		})
	}
	/**
     * @method onGripDrag
	 * @param  e {Event} 이벤트
	 * @param  _this {Object} pub그리드 this
     * @description reisze 드래그 처리.
     */
	,onGripDrag : function(e, _this) { 
		
		if (!_this.drag) return false;

		var drag = _this.drag; 
		
		var t = drag.ele
			,oe = e.originalEvent.touches
			,ox = oe ? oe[0].pageX : e.pageX;
		
		var w = drag.colW + (ox - drag.pageX) ;
		
		//console.log(w , ox , drag.pageX, (ox - drag.pageX) )
		if(w > _this.options.minWidth){
			drag.changeColW = w;
			_this.config.gridElementWidth = drag.gridW+(ox - drag.pageX);
			_this.config.headerElement.css('width',(_this.config.gridElementWidth)+'px');
			_this.config.headerContainerElement.css('width',(_this.config.gridElementWidth+_this.options.scrollWidth)+'px');
			_this.config.bodyElement.css('width',(_this.config.gridElementWidth)+'px');

			drag.colHeader.css('width',w+'px');
			drag.colHeader.attr('_width',w);
			drag.colBody.css('width',w+'px');
		}		
			
		return false
	}
	/**
     * @method onGripDragOver
	 * @param  e {Event} 이벤트
	 * @param  _this {Object} pub그리드 this
     * @description reisze 드래그 end
     */
	,onGripDragEnd : function(e,_this) {
		_doc.off('touchend.colheaderresize mouseup.colheaderresize').off('touchmove.colheaderresize mousemove.colheaderresize mouseleave.colheaderresize');
		_doc.removeAttr("onselectstart");
		_this.config.hiddenArea.empty();
		
		if(!_this.drag) return false;
		
		_this.drag=false;

		return false; 
	}
	/**
     * @method destory
     * @description 해제.
     */
	,destory:function (){
		delete _datastore[this.selector];
		//this = {};
	}
	,getDataStore :function (){
		return _datastore; 
	}
};

$.pubGrid = function (selector,options) {
	if(!selector){
		return ; 
	}

	if(typeof options === undefined){
		return _datastore[selector]; 
	}

	var _cacheObject = _datastore[selector]; 
	
	if(!_cacheObject){
		_cacheObject = new Plugin(selector, options);
		_datastore[selector] = _cacheObject;
	}

	if(options){
		if(options === 'string'){
			_cacheObject[options].call();
		}else{
			_cacheObject.setOptions(options);
		}
	}
	return _cacheObject;	
};

}(jQuery, window, document));