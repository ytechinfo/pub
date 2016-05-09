/*
 * PubEPUI v0.0.1
 * ========================================================================
 * Copyright 2015 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
 */
if (typeof window != "undefined") {
    if (typeof window.PubEPUI == "undefined") {
        window.PubEPUI = {};
    }
}else{
	if(!PubEPUI){
		PubEPUI = {};
	}
}

(function( window, jQuery, PubEP) {

var _$base = {},
_defaultOption ={
	version:'0.1'
	,author:'ytkim'
	,contextPath: (typeof global_page_context_path === 'undefined' ? '/' : global_page_context_path)
}
,globalOption ={
	openType:{
		'iframe':'iframe'
		,'popup':'popup'
		,'location':'location'
	}
	,defaultOpenType:'popup'
};

_$base.replaceHtm={
	title :function(option){
		
		if(!option){
			return '';
		}
		
		if(typeof option === 'string'){
			return escape(option);
		}else{
			$(option.selector).each(function (i,item){
				var sObj = $(item); 
				sObj.attr('title',unescape(sObj.attr('title')));
			})
		}
	}
}


/**
 * @method PubEP
 * @description dialog
 */
_$base.dialog={
	/**
	 * @method _$base.dialog.mgmtDialog
	 * @param _url {String} dialog url
	 * @param opt {Object} 상세 object
	 * @description 게시판 더보기
	 */	
	mgmtDialog :function (_url , opt){
		var _opener = parent || window;
		
		var options = $.extend(true, {
			targetID : '_main_top_div_id_'
			,title : '설정'
			,width : '480'
			,height : '355'
			,scrolling : 'no'
			,directCall : false
		} ,opt);
		
		var _targetId = options.targetID; 
		
		
		if(_opener.$('#'+_targetId).length < 1){
			_opener.$('body').append('<div id="'+_targetId+'"></div>');
		}
				
		if(options.directCall){
			;
		}else{	
			_url=PubEP.getContextPath(_url)
		}
		
		_opener.$('#'+_targetId).html('<iframe id="'+_targetId+'iframe" name="'+_targetId+'iframe" src="" style="width:'+options.width.replace('px','')+'px;height:'+options.height.replace('px','')+'px" frameborder="0" scrolling="'+options.scrolling+'"></iframe>').dialog({
				  width:'auto'
				, height:'auto'
				, modal: true
				, autoOpen : false
				, resizable : false
				, draggable: true
				, open : function(){
					_opener.PubEP.page.view(_url, "iframe", $.extend({},{target:"#"+_targetId+'iframe', gubun:"dialog", gubunkey:"portletTabConfig",name:decodeURIComponent("게시판 목록 관리")},opt));
				}
				//, buttons: [ { text: "Ok", click: function() { $( this ).dialog( "close" ); } } ]
		}).selectable({disable:true}).dialog("open").parent().find('.ui-dialog-title').html('<h1 class="tit">'+options.title+'</h1><p class="close"><a href="javascript:;">Close</a></p>');

		_opener.$(".ui-dialog-title .close a").on("click", function(){
			_opener.$('html').css('overflow','auto');
			_opener.$('#'+_targetId).dialog("close");
		});
		_opener.$('html').css('overflow','hidden');
		_opener.$('.ui-widget-overlay.ui-front').css('height',$(document).height());
	}
}

/**
 * @method PubEP
 * @description ui 모듈 
 */
_$base.module={
	/**
	 * @method _$base.module.selectBoxMove
	 * @param first {String} 이동할 source
	 * @param second {Object} 이동될 target
	 * @description select box  move
	 */	
	selectBoxMove : function (first,second,opt){
		var defaultOpt = {
			addClass:'select'
			,firstItem : {
				optVal : 'CODE_ID'
				,optTxt : 'CODE_NM'
				,searchAttrName : '_name'
				,searchAttrKey : ''
				,items: []
				,itemKeyIdx : {}
			}
			,secondItem : {
				optVal : 'CODE_ID'
				,optTxt : 'CODE_NM'
				,searchAttrName : '_name'
				,searchAttrKey : ''
				,items: []
				,itemKeyIdx : {}
			}
			,message : {
				addEmpty : false
				,delEmpty : false
			}
			,beforeFirstMove : false
			,afterFirstMove : false
			,beforeSecondMove : false
			,afterSecondMove : false
			,maxSize : -1
			,maxSizeMsg : false
		};
		
		var actionObj ={
			firstSelect : first
			,secondSelect : second
			,options : $.extend(true,defaultOpt,opt)
			,init:function (initOpt){
				var _this = this; 
				
				if(initOpt){
					_this.options = $.extend(true,defaultOpt,initOpt);
				}else{
					_this.options.firstItem.items =[]
					_this.options.secondItem.items=[];
				}
				
				_this._initItem();
				_this.initEvent();
			}
			/**
			 * @method _$base.clickEvent
			 * @param openType 
			 * @param gridOption 
			 * @description 그리드 클릭 이벤트 처리.
			 */	
			,_initItem : function (){
				var _this = this,_opts = _this.options;  
				var len = _opts.firstItem.items.length
					,valKey = _opts.firstItem.optVal
					,txtKey = _opts.firstItem.optTxt
					,searchAttrName = _opts.firstItem.searchAttrName
					,searchAttrKey = _opts.firstItem.searchAttrKey == '' ? txtKey : _opts.firstItem.searchAttrKey
					,tmpItem
					,strHtm = [];
				if( len> 0){
					for(var i=0 ;i < len; i++){
						tmpItem = _opts.firstItem.items[i];
						strHtm.push('<option value="'+tmpItem[valKey]+'" class="'+tmpItem['class']+'" style="'+tmpItem['style']+'" '+searchAttrName+'="'+escape(tmpItem[searchAttrKey])+'">'+tmpItem[txtKey]+'</option>');

						_this.options.firstItem.itemKeyIdx[tmpItem[valKey]] = i;
					}
					$(_this.firstSelect).html(strHtm.join(''));
				}else{
					_this.options.firstItem.items=[];
					$(_this.firstSelect +' option').each(function (i ,item){
						var sObj = $(this);
						var addItem = {};

						addItem[valKey] = sObj.val();
						addItem[txtKey] = sObj.text();
						addItem[searchAttrName] = sObj.attr(searchAttrName);
						addItem['class'] = sObj.attr('class')||'';
						addItem['style'] = sObj.attr('style')||'';
						addItem['class'] = ((addItem['class'].indexOf(_opts.addClass) > -1)?' '+ _opts.addClass : '');
						
						_this.options.firstItem.items.push(addItem);
						_this.options.firstItem.itemKeyIdx[addItem[valKey]] = i;
					});
				}

				len = _opts.secondItem.items.length;
				valKey = _opts.secondItem.optVal;
				txtKey = _opts.secondItem.optTxt;
				searchAttrName = _opts.firstItem.searchAttrName;
				searchAttrKey = _opts.firstItem.searchAttrKey == '' ? txtKey : _opts.firstItem.searchAttrKey;

				if( len> 0){

					for(var i=0 ;i < len; i++){
						tmpItem = _opts.secondItem.items[i];
						strHtm.push('<option value="'+tmpItem[valKey]+'" class="'+tmpItem['class']+'" style="'+tmpItem['style']+'" '+searchAttrName+'="'+escape(tmpItem[searchAttrKey])+'">'+tmpItem[txtKey]+'</option>');
					}
					$(_this.secondSelect).html(strHtm.join(''));
				}else{
					_this.options.secondItem.items=[];
					$(_this.secondSelect +' option').each(function (i ,item){
						var sObj = $(this);
						var addItem = {};

						addItem[valKey] = sObj.val();
						addItem[txtKey] = sObj.text();
						addItem[searchAttrName] = sObj.attr(searchAttrName);
						addItem['class'] = sObj.attr('class');
						addItem['style'] = sObj.attr('style');

						_this.options.secondItem.items.push(addItem);
					});
				}
			}
			,initEvent:function (){
				var _this = this; 
				$(_this.firstSelect).unbind('dblclick');
				$(_this.firstSelect).bind("dblclick", function(){
					actionObj.firstMove();
				});
				
				$(_this.secondSelect).unbind('dblclick');
				$(_this.secondSelect).bind("dblclick", function(){
					actionObj.secondMove();
				});
			}
			,allFirstMove:function (){
				var _this = this; 
				$(_this.firstSelect).children().each(function (i, item){
					$(_this.secondSelect).append('<option value="'+$(item).val()+'">'+$(item).html()+'</option>');
					$(item).remove();
				});
			}
			,firstMove:function (){
				var _this = this; 
				var selectVal = $(_this.firstSelect +' option:selected');
				
				if(selectVal.length >0){
					var tmpVal = '',tmpObj;
					
					selectVal.each(function (i, item){
						tmpObj = $(item);
						tmpVal=tmpObj.val();
						
						if(tmpVal=='_no_data_'){
							return true; 
						}
						
						if($.isFunction(_this.options.beforeFirstMove)){
							_this.options.beforeFirstMove(tmpObj); 
						}
						
						
						if(_this.options.maxSize != -1  && $(actionObj.secondSelect+' option').length >= _this.options.maxSize){
							
							if($.isFunction(_this.options.maxSizeMsg)){
								_this.options.maxSizeMsg();
							}
							
							return false; 
						}
					
						if($(actionObj.secondSelect+' option[value="'+tmpVal+'"]').length == 0){
							$(actionObj.secondSelect).append('<option value="'+tmpVal+'">'+tmpObj.html()+'</option>');

							_this.options.firstItem.items[_this.options.firstItem.itemKeyIdx[tmpVal]]['class'] = (tmpObj.hasClass(_this.options.addClass) ? _this.options.addClass :'') ;
							
							tmpObj.addClass(_this.options.addClass);
						}
						
						if($.isFunction(_this.options.afterFirstMove)){
							_this.options.afterFirstMove(tmpObj); 
						}
					});
				}else{
					if(_this.options.message.addEmpty !== false){
						alert(_this.options.message.addEmpty);
					}
					return ;
				}
			}
			,secondMove:function (){
				var _this = this; 
				var selectVal = $(_this.secondSelect +' option:selected');

				if(selectVal.length >0){
					var removeItem; 
					selectVal.each(function (i, item){
						if($.isFunction(_this.options.beforeSecondMove)){
							_this.options.beforeSecondMove($(item)); 
						}
						
						removeItem = _this.options.firstItem.items[_this.options.firstItem.itemKeyIdx[$(item).val()]];
						if(removeItem){
							removeItem['class']=(removeItem['class']+' ').split(' ').join('|').replace(_this.options.addClass+'|','');
							_this.options.firstItem.items[_this.options.firstItem.itemKeyIdx[$(item).val()]]['class'] = removeItem['class'].replace('|','');
							$(actionObj.firstSelect+' option[value="'+$(item).val()+'"]').removeClass(_this.options.addClass);
						}
						$(item).remove();
						
						if($.isFunction(_this.options.afterSecondMove)){
							_this.options.afterSecondMove($(item)); 
						}
					});
				}else{
					if(_this.options.message.delEmpty !== false){
						alert(_this.options.message.delEmpty);
					}
					return ;
				}
			}
			,getAddItem:function (){
				var reInfo = new Array();
				$(this.secondSelect).children().each(function (i, item){
					reInfo.push($(item).val())
				});

				return reInfo;
			}
			,move:function (type){
				var _this = this; 
				var selectElement = $(_this.secondSelect+' option:selected');
				var len = selectElement.length;  
				if(len ==0) return ; 

				if(type=='up'){			
					var firstIdx = $(_this.secondSelect+' option').index(selectElement[0]);
	
					if(firstIdx < 1) return ;
					
					$(selectElement[len-1]).after($(_this.secondSelect+' option').get(firstIdx-1));
				}else{
					var lastIdx = $(_this.secondSelect+' option').index(selectElement[len-1]);
					var len = $(_this.secondSelect+' option').length; 
					
					if(lastIdx == len) return ; 

					$(selectElement[0]).before($(_this.secondSelect+' option').get(lastIdx+1));
				}
			}
			,lSearch : function (val){
				var _this = this,_opts = _this.options;  
				
				var tmpVal = escape(val);
				var searchAttr = _this.options.firstItem.searchAttrName;

				var len = _opts.firstItem.items.length
					,valKey = _opts.firstItem.optVal
					,txtKey = _opts.firstItem.optTxt
					,searchAttrName = _opts.firstItem.searchAttrName
					,searchAttrKey = (_opts.firstItem.searchAttrKey == '' ? txtKey : _opts.firstItem.searchAttrKey)
					,tmpItem
					,strHtm = [];

				if( len> 0){
					for(var i=0 ;i < len; i++){
						tmpItem = _opts.firstItem.items[i];

						//console.log(tmpItem, tmpVal, searchAttrKey, txtKey ,_opts.firstItem.searchAttrKey, escape(tmpItem[searchAttrKey]));
						if(tmpVal=='' || escape(tmpItem[searchAttrKey]).indexOf(tmpVal) > -1){
							strHtm.push('<option value="'+tmpItem[valKey]+'" '+searchAttrName+'="'+escape(tmpItem[searchAttrKey])+'" class="'+tmpItem['class']+'" style="'+tmpItem['style']+'">'+tmpItem[txtKey]+'</option>');
						}
					}
					$(_this.firstSelect).html(strHtm.join(''));
				}
			}
			,rSearch : function (val){
				
			}
		}
		
		return actionObj; 
	}
	/**
	 * @method _$base.module.getSelectItem
	 * @param selector {String}  selecotr
	 * @description select box 모든 item 구하기.
	 */	
	,getSelectItem :function (selector, options){
		var reInfo = new Array();
		var attr = options.attr;
		var addItem;
		$(selector).children().each(function (i, item){
			addItem ={};
			var sObj = $(item), tmpAttr; 
			for(var i = 0 ; i <attr.length;i++){
				tmpAttr = attr[i];
				addItem[tmpAttr.rename] = sObj.attr(tmpAttr.key)||'';
			}
			addItem['value'] = $(item).val(); 
			addItem['nm'] = $(item).text(); 
			reInfo.push(addItem);
		});

		return reInfo;
	}
	/**
	 * @method _$base.module.selectItemUpDown
	 * @param selector {String} selecotr
	 * @param type {String} 이동할 타입 (위, 아래)
	 * @description select box  move
	 */	
	,selectItemUpDown : function (selector,type){
		var _this = this; 
		var selectElement = $(selector+' option:selected');
		var len = selectElement.length;  
		if(len ==0) return ; 

		if(type=='up'){			
			var firstIdx = $(selector+' option').index(selectElement[0]);

			if(firstIdx < 1) return ;
			
			$(selectElement[len-1]).after($(selector+' option').get(firstIdx-1));
		}else{
			var lastIdx = $(selector+' option').index(selectElement[len-1]);
			var len = $(selector+' option').length; 
			
			if(lastIdx == len) return ; 

			$(selectElement[0]).before($(selector+' option').get(lastIdx+1));
		}
	}
};

(function($) {
	$.fn.pagingNav = function(options, callback) {
		if (!options) {
			$(this).empty();
			return false;
		}
		var currP = options.currPage;
		if (currP == "0")
			currP = 1;
		var preP_is = options.prePage_is;
		var nextP_is = options.nextPage_is;
		var currS = options.currStartPage;
		var currE = options.currEndPage;
		if (currE == "0")
			currE = 1;
		var nextO = 1 * currP + 1;
		var preO = currP - 1;
		var strHTML = new Array();
		strHTML.push('<div class="text-center">');
		strHTML.push(' <ul class="pagination">');
		if (preP_is == "true") {
			strHTML
					.push(' <li><a href="javascript:" class="page-click" pageno="'+preO+'">&laquo;</a></li>');
		} else {
			if (currP <= 1) {
				strHTML
						.push(' <li class="disabled"><a href="javascript:">&laquo;</a></li>');
			} else {
				strHTML
						.push(' <li><a href="javascript:" class="page-click" pageno="'+preO+'">&laquo;</a></li>');
			}
		}
		var no = 0;
		for (no = currS * 1; no <= currE * 1; no++) {
			if (no == currP) {
				strHTML
						.push(' <li class="active"><a href="javascript:">'
								+ no + '</a></li>');
			} else {
				strHTML
						.push(' <li><a href="javascript:" class="page-click" pageno="'+no+'">'
								+ no + '</a></li>');
			}
		}
		if (nextP_is == "true") {
			strHTML
					.push(' <li><a href="javascript:" class="page-click" pageno="'+nextO+'">&raquo;</a></li>');
		} else {
			if (currP == currE) {
				strHTML
						.push(' <li class="disabled"><a href="javascript:">&raquo;</a></li>');
			} else {
				strHTML
						.push(' <li><a href="javascript:" class="page-click" pageno="'+nextO+'">&raquo;</a></li>');
			}
		}
		strHTML.push(' </ul>');
		strHTML.push('</div>');
		this.empty('');
		this.html(strHTML.join(''));
		
		$(this.selector+' .page-click').on('click', function() {
			var sNo = $(this).attr('pageno');
			if (typeof callback == 'function') {
				callback(sNo);
			} else {
				try {
					nextPage(sNo);
				} catch (e) {
				}
			}
		});
		
		return this; 
	};
})(jQuery);


$.fn.errimgload = function(imgOpt) {
	var changeImg = '/images/srch/no_image.gif';
	if(imgOpt){
		if(typeof imgOpt ==='string'){
			changeImg =imgOpt; 
		}else if(typeof imgOpt ==='object'){
			changeImg = imgOpt.changeImg?imgOpt.changeImg:changeImg;
		}
	}
	var base = this; 
	
	return base.each(function() {
		if (this.tagName.toLowerCase() != 'img') return;
		
		var $_orig = $(this);

		$_orig.one('error', function() {
			$_orig.attr('src',changeImg);
		});

		return ; 
	})
};

window.PubEPUI = _$base;
})( window ,jQuery, PubEP);