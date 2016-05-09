/**
 * pub.ep.js v0.0.1
 * ========================================================================
 * Copyright 2015 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
 */

if (typeof window != "undefined") {
    if (typeof window.PubEP == "undefined") {
        window.PubEP = {};
    }
}else{
	if(!PubEP){
		PubEP = {};
	}
}

(function( window, jQuery ) {
	'use strict';

var _$base = {},
_defaultOption ={
	version:'0.1'
	,author:'ytkim'
	,contextPath: (typeof global_page_context_path === 'undefined' ? '/epptl' : global_page_context_path)
	,projectNm:'WOORIFG'
}
,_defaultAjaxOption ={
	method :'post'
	,cache: false
	,dataType: "json"
	,beforeSend : function( xhr ) {
		if(loadDiv)	$(loadDiv).centerLoadingClose();
	}
	,error : function (data, status, err){
			
	}
	,complete: function (data, status, err){
			
	}	
}
,globalOption ={
	httpMethod :{
		get:'get'
		,post:'post'
	},
	openType:{
		'iframe':'iframe'
		,'popup':'popup'
		,'location':'location'
	}
	,defaultPopupMethod:'post'
	,logUrl : '/eplogin/log'
	,defaultPopupPosition : {
		align : 'top'
		,topMargin : 20
		,top:2
		,left:2
		,ieDualCenter : false
		,browser : {
			msie : 40
			,mozilla : 70
			,chrome :70
			,'default' : 70
			,safari : 70
		}
	}
	,globalStyle : {
		'mainmenu.default' : 'WooriStyle'
		,'mainmenu.wooriwork' : 'WooriStyle'
		,'mainmenu.naenwoori' : 'WooriStyle_Orange'
		,'mainmenu.wooripeople' : 'WooriStyle_Purple'
	}
};


/**
 * @method PubEP.getPojectName
 * @description contextpath 가져오기.
 */	
_$base.getContextPath = function (uri){
	return uri?_defaultOption.contextPath+uri:_defaultOption.contextPath; 
}

/**
 * @method PubEP.getPojectName
 * @description 프로젝트 이름 가져오기.
 */	
_$base.getPojectName=function (){
	return _defaultOption.projectNm;
}

/**
 * @method PubEP.cookie
 * @param name 
 * @param val 
 * @param options 
 * @description cookie 처리를 위한 메소드
 */

_$base.cookie = function(name, val, options) {
	if (typeof val != 'undefined') { 
		options = options || {};
		if (val === null) {
			val = '';
			options.expires = -1;
		}
		var expires = '';
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}
		var path = options.path ? '; path=' + (options.path) : '';
		var domain = options.domain ? '; domain=' + (options.domain) : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(val), expires, path, domain, secure].join('');
	} else { // only name given, get cookie
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};
/**
 * @method PubEP.req
 * @description request 처리를 위한 모듈 
 */
_$base.req ={
	/**
	 * @method PubEP.req.ajax
	 * @param option 
	 * @description ajax request 
	 */		
	ajax:function (option){
		
		var loadSelector = option.loadSelector ?option.loadSelector :false; 
		$.ajax($.extend({}, {
			type :'get'
			,cache: false
			,dataType: "json"
			,beforeSend : function( xhr ) {
				if(loadSelector){
					$(loadSelector).centerLoading({
						contentClear:false 
					});
				}
			}
			,error : function (data, status, err){
				if(loadSelector) $(loadSelector).centerLoadingClose();
			}
			,complete: function (data, status, err){
				if(loadSelector) $(loadSelector).centerLoadingClose();
			}	
		},option));
	}
	/**
	 * @method PubEP.resultMessage
	 * @param resData 
	 * @param errorMsgView 
	 * @description request 에대한 result 에러 내용 보기. 
	 */
	,resultMessage :function (resData, errorMsgView){
		if(resData.result_code=='500'){
			if(errorMsgView != false){
				alert(resData.message);
			}
			return false; 
		}
		return true; 
	}
	/**
	 * @method PubEP.getParam
	 * @param type {String} call 하는 타입
	 * @description default 파라미터 
	 */
	,getParam : function (type){
		return {};
	}
	/**
	 * @method PubEP.formData
	 * @param type {String} call 하는 타입
	 * @description get formdata
	 */
	,formData : function (type){
		return (typeof FormData === 'undefined' ? {} : FormData);
	}
};

jQuery.fn.centerLoading = function(options) {
	this.config = {
		closeAutoYn: 'N' ,	
		timeOut:1000,
		action: 'slide',
		height: 0,
		width: 0,
		padding:'0',
		margin :'0',
		top :'0',
		left :'0',
		centerYn:'Y',
		bgColor : '#ffffff',
		loadingImg : '/images/loading.gif',
		cursor:	'wait',
		contentClear : false
	}
	
	var id,w,h;
		
	var config = $.extend({},this.config, options);
	id = this.attr('id');

	w = config.width==0?this.width():config.width;
	h = config.height==0?this.height():config.height;

	if($(this).parent().attr('prevspan') =='Y')	config.contentClear = false;	
		
	var firstDiv = $('<div style="z-index:10;'+(!config.contentClear?"position:absolute;":"")+'width:'+w+'px; height:'+h+';" class="centerLoading"></div>');
	var centerLoading = $('<div style="background-repeat:no-repeat;"></div>');
	centerLoading.css('background-image', 'url("'+config.loadingImg+'")')
				.css('background-position', config.centerYn=='Y'?'center center':'')
				.css('height', h)
				.css('width',w)
				.css('cursor', config.cursor);
	
/*
	var firstDiv = $('<div style="'+(!config.contentClear?"position:absolute;":"")+'width:'+w+'px; height:'+h+';" class="centerLoading"></div>');
	var centerLoading = $('<div style="background-repeat:no-repeat;"></div>');
	centerLoading.css('background-color',config.bgColor)
				.css('background-image', 'url("'+config.loadingImg+'")')
				.css('background-position', config.centerYn=='Y'?'center center':'')
				.css('height', h)
				.css('width',w)
				.css('opacity','0.8')
				.css('cursor', config.cursor);
*/

	firstDiv.html(centerLoading);

	if(!config.contentClear){
		this.prepend(firstDiv);
	}else{
		this.html(firstDiv);
	}

	if(config.content != ""){
		centerLoading.appendTo(config.content);
	}
	
	config.action == 'slide'?jQuery(this).slideDown('slow') : config.action == 'fade'?jQuery(this).fadeIn('slow'):jQuery(this).show();
	
	return this;
};

jQuery.fn.centerLoadingClose= function(options) {
	this.find('.centerLoading').remove();
};



/**
* url open 메소드
* view 필수 항복  url, type , options{gubun:'menu , portlet, sso 등등', gubunkey:'구분키 값'}
* ex : 
* popup ex : _$base.page.view("http://dev.woorifg.com/",'popup',{gubun:'menu', gubunkey:'menu_woori',name:'popup name', mehtod:'get or post',viewOption:'toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400'});
* location ex : _$base.page.view("http://dev.woorifg.com/",'location',{gubun:'menu', gubunkey:'menu_location'});
* 
*/
_$base.logWrite = function (url, type, options){
	var tmpIfno = (typeof ePortalConfig === 'undefined' ? {userInfo:{}} : ePortalConfig); 
	
	if(options.gubun =='SSO'){
		$.ajax({
			url : globalOption.logUrl
			,dataType : "text"
			,data : {
				gubun : options.gubun
				,gubunkey : options.gubunkey
				,url : url
				,browser :  (navigator?navigator.userAgent:'')
				,ip : ''
				,loginfo : tmpIfno.userId
				,userid : tmpIfno.userId
				,ent_code : tmpIfno.userInfo.ENT_CODE
			}
			,success : function(resdata) {}
			,error : function() {}
		});
	}
	
	return false; 
}

_$base.page ={
	popupPostMsg : ''	
	,view : function(url, type, options){
		// yshan 2015-11-30
		
		var tmpIfno = (typeof ePortalConfig === 'undefined' ? {link : {}} : ePortalConfig); 
		
		if(tmpIfno.link){
			$.each(tmpIfno.link, function(key, value){
				var re = new RegExp("{"+key+"}", "g");
				url = url.replace(re, value);
			})
		}
		
		if(options.logwrite !== false){
			_$base.logWrite(url, type, options);
		}
		
		if(globalOption.openType.iframe== type){
			this._iframe(url, options);
		}else if(globalOption.openType.popup== type){
			if(options.addrHide==='true'){
				this._addrHidePopup(url, options);
			}else{
				this._popup(url, options);
			}
		}else{
			this._location(url,options);
		}
	}
	,_location:function (url, options){
		var urlIdx = url.indexOf('?');
		var openUrl = urlIdx > 0 ?url.substring(0,urlIdx):url;
		var tmpParam=getParameter(url , {});
		tmpParam=paramToArray(tmpParam);
		
		url =openUrl+'?'+tmpParam.join('&');
		
		if(options){
			if(options.method=='post'){
				var inputStr = [];
				var tmpLocationHrefForm = $('#locationHrefForm');
				if(tmpLocationHrefForm.length < 1){
					var inputStr = [];//enctype="multipart/form-data"
					inputStr.push('<form action="" method="post" id="pubepLocationHrefForm" name="pubepLocationHrefForm">');
					inputStr.push('</form>');
					$('body').append(inputStr.join(''));
				}
				
				document.pubepLocationHrefForm.action = url; 
				document.pubepLocationHrefForm.submit();
			}else{
				location.href=url;
			}
		}else{
			location.href=url;
		}
	}
	,_popup:function (url, options){
		var _this = this; 
		var targetId = 'PubEP_'+_$base.util.generateUUID().replace(/-/g,'')
			, tmpParam = options.param?options.param:{}
			, tmpMethod = options.method?options.method:globalOption.defaultPopupMethod
			, tmpPopOption = options.viewOption?options.viewOption:''
			, tmpPosition = $.extend({},globalOption.defaultPopupPosition,( $.isPlainObject(options.position)?options.position:{align:options.position} ))
			, tmpName ='PubEP_'+(options.name?( options.name.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-+┼<>@\#$%&\'\"\\(\=]/gi,'') ):targetId.replace(/-/g,''));
		
		var urlIdx = url.indexOf('?');
		var openUrl = urlIdx > 0 ?url.substring(0,urlIdx):url;
		
		tmpPopOption = tmpPopOption.replace(/\s/gi,'');
		
		//console.log(tmpPopOption)

		if(tmpPopOption != ''){
		
			var popupOptArr = tmpPopOption.split(',');
			var tmpItem ,_t=0 , _l=0 ,_w=1050, _h=0, addFlag ,tmpOpt='',addScrollbarOpt = true, addStatusOpt=false; 
				
			for(var i = 0 ;i < popupOptArr.length; i++){
				tmpItem = popupOptArr[i];
				addFlag = true; 
				if(tmpItem.toLowerCase().indexOf('width=')==0){
					_w= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false; 
				}
				if(tmpItem.toLowerCase().indexOf('height=')==0){
					_h= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false;
				}
				if(tmpItem.toLowerCase().indexOf('top=')==0){
					_t= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false;
				}
				if(tmpItem.toLowerCase().indexOf('left=')==0){
					_l= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false;
				} 
				if(tmpItem.toLowerCase().indexOf('scrollbars=')==0){
					addScrollbarOpt= false; 
				}
				if(tmpItem.toLowerCase().indexOf('status=') > -1 && tmpItem.toLowerCase()=='status=1' &&  tmpPosition.browser[$.browser.name] == 40){
					addStatusOpt= true;
				} 
				//console.log("111:"+tmpPosition.browser[$.browser.name]);
				tmpOpt += (addFlag ? ( (tmpOpt==''?'':',') + tmpItem ) : '');
			}
			tmpOpt += addScrollbarOpt?'scrollbars=yes':'';

			if(typeof options.position=='undefined' && _h !=0 ){
				tmpPosition.align='center';
			}
			
			var heightMargin = tmpPosition.browser[$.browser.name]||tmpPosition.browser['default'];
			_h= ( _h==0 ? (screen.availHeight-heightMargin- tmpPosition.topMargin) :_h) ;
			
			_h =addStatusOpt?_h-23:_h; // status바 체크.
			//console.log(addStatusOpt, _h)
			//console.log('111height : '+_h,'topMargin : '+ heightMargin,'heightMargin : '+heightMargin,'availHeight : '+ screen.availHeight);

			if(tmpPosition.align=='top'){
				var tmpTopMargin = tmpPosition.topMargin;
				var aaa = _$base.util.popupPosition(_w,_h, tmpPosition.top, tmpPosition.left, tmpName , tmpPosition.ieDualCenter); 
				
				var ua = window.navigator.userAgent; 
				var old_ie= ua.indexOf('MSIE');
				var new_ie= ua.indexOf('Trident/');
				var _top = 0 , _left = 0 ; 
				
				if(old_ie >-1 || new_ie >-1){
					if(_t!=0){
						aaa.top = _t;
					}else{
						aaa.top = tmpTopMargin;
					}
				}else{
					aaa.top = typeof screen['availTop']!=='undefined' ?screen['availTop'] : (window.screenTop || screen.top);
					if(_t!=0){
						aaa.top = (aaa.top > 0? aaa.top- _t : aaa.top+_t); 
					}else{
						aaa.top = (aaa.top > 0? aaa.top- tmpTopMargin : aaa.top+tmpTopMargin); 
					}
				}
				tmpPopOption = tmpOpt+', width=' + _w + 'px, height=' + _h + 'px, top=' + aaa.top + 'px, left=' + aaa.left+'px';
				
			}else if(tmpPosition.align=='center'){
				
				var aaa = _$base.util.popupPosition(_w,_h, tmpPosition.top, tmpPosition.left, tmpName , tmpPosition.ieDualCenter); 
				
				tmpPopOption = tmpOpt+', width=' + _w + 'px, height=' + _h + 'px, top=' + aaa.top + 'px, left=' + aaa.left+'px';
			}

			//console.log('tmpPopOption : '+tmpPopOption);
		}

		// get method
		if(globalOption.httpMethod.get ==tmpMethod){
			tmpParam=getParameter(url , tmpParam);
			tmpParam=paramToArray(tmpParam);
			
			openUrl =openUrl+'?'+tmpParam.join('&');
			
			try{
				var myWindow=window.open(openUrl,tmpName, tmpPopOption);
				myWindow.focus();
			}catch(e){}
		}else{  // post method
			tmpParam=getParameter(url , tmpParam);
			var inputStr = [];
			inputStr.push('<!doctype html><head>');
			inputStr.push('<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta charset="UTF-8" /></head>');
			inputStr.push('<form action="'+openUrl+'" method="post" id="'+targetId+'" name="'+targetId+'">');
			
			var tmpVal;
			for(var key in tmpParam){
				tmpVal = tmpParam[key];
				
				if(key == "sendMailAsDistribute_tContent"){
					inputStr.push('<input type="hidden" name="'+key+'" value=\"'+((typeof tmpVal==='string')?tmpVal:JSON.stringify(tmpVal))+'\"/>');
				}else{
					inputStr.push('<input type="hidden" name="'+key+'" value=\''+((typeof tmpVal==='string')?tmpVal:JSON.stringify(tmpVal))+'\'/>');
				}
				
				
			}
			inputStr.push('</form>');
			inputStr.push('<script type="text/javascript">try{document.charset="utf-8";}catch(e){}document.'+targetId+'.submit();</'+'script>');
			
			//_this.popupPostMsg = inputStr.join();
			//console.log(inputStr.join());
			
			var tmpPopupObj=window.open('about:blank', tmpName, tmpPopOption);
			
			try{
				tmpPopupObj.document.write(inputStr.join(''));
				tmpPopupObj.focus();
			}catch(e){
				/* 이전 창이 이으면 닫고 다시 열기. 
				tmpPopupObj.close();
				tmpPopupObj=window.open('about:blank', tmpName, tmpPopOption);
				try{
					tmpPopupObj.document.write(inputStr.join(''));
					tmpPopupObj.focus();
				}catch(e1){
					console.log(e1);
				}
				*/
				//console.log('parent',e);
			}
		}
	}
	,_addrHidePopup : function (url,options){
		var targetId = 'PubEP_'+_$base.util.generateUUID().replace(/-/g,'')
			, tmpParam = options.param?options.param:{}
			, tmpMethod = options.method?options.method:globalOption.defaultPopupMethod
			, tmpPopOption = options.viewOption?options.viewOption:''
			, tmpPosition = (options.position ? $.extend(true,globalOption.defaultPopupPosition,( $.isPlainObject(options.position)?options.position:{align:options.position} )) : globalOption.defaultPopupPosition)
			, tmpName ='PubEP_'+(options.name?( options.name.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-+┼<>@\#$%&\'\"\\(\=]/gi,'') ):targetId.replace(/-/g,''));
		
		var urlIdx = url.indexOf('?');
		var openUrl = urlIdx > 0 ?url.substring(0,urlIdx):url;
		
		tmpPopOption = tmpPopOption.replace(/\s/gi,'');
		
		if(tmpPosition.align=='center'){
			var popupOptArr = tmpPopOption.split(',');
			var tmpItem ,_t , _l ,_w, _h, addFlag ,tmpOpt=''; 
				
			for(var i = 0 ;i < popupOptArr.length; i++){
				tmpItem = popupOptArr[i];
				addFlag = true; 
				if(tmpItem.toLowerCase().indexOf('width=')==0){
					_w= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false; 
				}
				if(tmpItem.toLowerCase().indexOf('height=')==0){
					_h= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false;
				}
				if(tmpItem.toLowerCase().indexOf('top=')==0){
					_t= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false;
				}
				if(tmpItem.toLowerCase().indexOf('left=')==0){
					_l= tmpItem.replace(/[^0-9]/g,'');
					addFlag = false;
				} 
		
				tmpOpt += (addFlag ? ( (tmpOpt==''?'':',') + tmpItem ) : '');
			}
			
			var aaa = _$base.util.popupPosition(_w,_h, tmpPosition.top, tmpPosition.left, tmpName,  tmpPosition.ieDualCenter); 
			tmpPopOption = tmpOpt+', width=' + _w + ', height=' + _h + ', top=' + aaa.top + ', left=' + aaa.left;
		}
		
		tmpParam=getParameter(url , tmpParam);
		var urlIdx = url.indexOf('?');
		var openUrl = urlIdx > 0 ?url.substring(0,urlIdx):url;
		var strHtm = [];
		strHtm.push("<HTML>");
		strHtm.push("<meta charset=\"UTF-8\">");
		strHtm.push("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">");
		strHtm.push("  <style>");
		strHtm.push("  html,body{");
		strHtm.push("	height:100%;");
		strHtm.push("	margin:0;");
		strHtm.push("  }");
		strHtm.push("  iframe{");
		strHtm.push("	display:block;");
		strHtm.push("	background:#000;");
		strHtm.push("	border:0;");
		strHtm.push("	width:100%;");
		strHtm.push("	height:100%;");
		strHtm.push("  }");
		strHtm.push("  </style>");
		strHtm.push(" </HEAD>");
		strHtm.push(" <BODY>");

		// get method
		if(globalOption.httpMethod.get ==tmpMethod){
			tmpParam=getParameter(url , tmpParam);
			tmpParam=paramToArray(tmpParam);
			
			openUrl =openUrl+'?'+tmpParam.join('&');

			strHtm.push("  <iframe name=\"iframe_target\" src=\""+openUrl+"\"></iframe>");
		}else{  // post method
			tmpParam=getParameter(url , tmpParam);
			strHtm.push('<form action="'+openUrl+'" method="post" target="iframe_target" id="'+targetId+'" name="'+targetId+'">');
			
			var tmpVal;
			for(var key in tmpParam){
				tmpVal = tmpParam[key];
				strHtm.push('<input type="hidden" name="'+key+'" value=\''+((typeof tmpVal==='string')?tmpVal:JSON.stringify(tmpVal))+'\'/>');
			}
			strHtm.push('</form>');

			strHtm.push("  <iframe name=\"iframe_target\" src=\"\"></iframe>");

			strHtm.push('<script type="text/javascript">try{document.charset="utf-8";}catch(e){}document.'+targetId+'.submit();</'+'script>');
		}

		strHtm.push(" </BODY>");
		strHtm.push("</HTML>");

		var tmpPopupObj=window.open('about:blank', tmpName, tmpPopOption);

		try{
			tmpPopupObj.document.write(strHtm.join(''));
			tmpPopupObj.focus();
		}catch(e){
			//console.log(strHtm.join(''))
			//console.log(e);
		}
	}
	,_iframe:function (url,options){
		if(!options.target) throw SyntaxError('iframe id empty');
		var tmpiframe =$(options.target);
		
		if(tmpiframe.length < 1) throw SyntaxError(options.target+ ' iframe element emtpy');
				
		var tmpParam = options.param?options.param:{};
		tmpParam=getParameter(url , tmpParam);
		
		var urlIdx = url.indexOf('?');
		var openUrl = urlIdx > 0 ?url.substring(0,urlIdx):url;
		
		//if(url== tmpiframe.attr('_view_url') && options.refresh != true) return ; 
		
		tmpiframe.attr('_view_url', url);

		if(options.method == "post"){
			var tmpForm = $("<form></form>");
			var strHtm = [];
			var tmpVal;
			for(var key in tmpParam){
				tmpVal = tmpParam[key];
				strHtm.push('<input type="hidden" name="'+key+'" value=\''+((typeof tmpVal==='string')?tmpVal:JSON.stringify(tmpVal))+'\'/>');
			}
			tmpForm.attr("target", options.target.replace("#", ""));
			tmpForm.attr("method", "post");
			tmpForm.attr("action", openUrl);
			tmpForm.append(strHtm.join(""));
			
			$("#hiddenFormIframe").remove();
			$("body").append("<div id='hiddenFormIframe'></div>");
			$("#hiddenFormIframe").append(tmpForm);
			tmpForm.submit();
		}else{
			
			tmpParam=getParameter(url , tmpParam);
			tmpParam=paramToArray(tmpParam);
			
			openUrl =openUrl+'?'+tmpParam.join('&');
			
			tmpiframe.off("load");
			tmpiframe.on("load", function(){
				tmpiframe.off("load");
				tmpiframe.attr('src', openUrl);
				tmpiframe.show();
			})
			tmpiframe.attr('src', '');
			tmpiframe.hide();
		}
		
		var cstyle=tmpiframe.attr('style');
		
		var tmpStyle = options.viewOption?options.viewOption:'';
		
		var styleArr = tmpStyle.split(';'),cssArr ; 
		
		for(var i = 0 ; i <styleArr.length; i ++){
			cssArr = styleArr[i].split(':');
			if(cssArr.length > 1) tmpiframe.css(cssArr[0],cssArr[1]);
		}
	}
}


_$base.util = {
	/**
	 * @method PubEP.util.calcDate
	 * @param date
	 * @param masks
	 * @description 날짜 계산
	 */
	calcDate:function (date,num,type) {
		
		if(isNaN(num)) return (function (){return this.value;});
		
		var a = new Date(date);
		var format = "yyyy-mm-dd";
		if(type=='m'){
			a.setMonth(a.getMonth() + num);
			format="yyyy-mm";
		}else{
			a.setDate(a.getDate()+num);
		}
		return this.dateFormat(a,format);
	}
	/**
	 * @method PubEP.util.dateFormat
	 * @param date
	 * @param masks
	 * @description 날짜 포켓 변환
	 */
	,dateFormat : function(date, masks, utc , i18n){
		return dateFormat(date, masks, utc , i18n);
	}
	/**
     * @method PubEP.util.removeSpecial
     * @param str
     * @description 특수문자 제거
     */
	,removeSpecial :function (str){
		return str.replace(/[-&\/\\#,+()$~%.'":*?<>{}]/g,'');
	}
	/**
	 * @method PubEP.util.removeSpecial
	 * @param str
	 * @description 돈에 대한 특수문자 제거
	 */
	,removeMoneySpecial :function (str){
		return str.replace(/[-&\/\\#,+()$~%'":*?<>{}]/g,'');
	}
	/**
     * @method PubEP.util.setRangeDate
     * @param sdtObj
     * @param edtObj
     * @param cdt
     * @param rangeNum
     * @description 날자 범위 지정하기
     */
	,setRangeDate :function(sdtObj, edtObj, cdt, rangeNum, type){
		
		if(isNaN(rangeNum)) return false;
		
		var _self = this; 
		var flag = rangeNum >0 ?true:false; 
		
		sdtObj = $(sdtObj);
		edtObj = $(edtObj);
		
		if(flag){
			var sdt = sdtObj.val()
				,tmped = _self.calcDate(sdt, rangeNum,type);
			
			if(parseInt(_self.removeSpecial(sdt), 10) > parseInt(_self.removeSpecial(cdt),10)){
				sdtObj.val(cdt);
				tmped = cdt; 
			}else if(parseInt(_self.removeSpecial(tmped), 10) > parseInt(_self.removeSpecial(cdt),10)){
				tmped = cdt; 
			}
			
			edtObj.val(tmped);
		}else{
			var sdt = edtObj.val()
				,tmped = _self.calcDate(sdt,rangeNum, type);
		
			if(parseInt(_self.removeSpecial(sdt), 10) > parseInt(_self.removeSpecial(cdt),10)){
				edtObj.val(cdt);
				tmped = _self.calcDate(cdt, rangeNum, type);
			}
			sdtObj.val(tmped);
		}
	}
	,generateUUID: function () {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x7|0x8)).toString(16);
		});
		return uuid;
	}
	,popupPosition : function (_w,_h , tr , lr, tmpName ,ieDualCenter){
		_h=  parseInt(_h,10);
		_w = parseInt(_w,10);
		tr = parseInt(tr,10);
		lr = parseInt(lr,10);
		tr =tr? tr :2;
		lr =lr? lr :2;
		
		var dualScreenLeft = window.screenX || window.screenLeft || screen.left
			,dualScreenTop = window.screenY || window.screenTop || screen.top
			, width = window.innerWidth || document.documentElement.clientWidth || screen.width
			, height = window.innerHeight || document.documentElement.clientHeight || screen.height;
		
		var ua = window.navigator.userAgent; 
		var old_ie= ua.indexOf('MSIE');
		var new_ie= ua.indexOf('Trident/');
		var _top = 0 , _left = 0 ; 
		
		if(old_ie >-1 || new_ie >-1){
			if(ieDualCenter){
				
				var dualScreenLeft = window.screenLeft || screen.left
					,dualScreenTop = window.screenTop || screen.top
					,width = window.innerWidth || document.documentElement.clientWidth || screen.width
					,height = window.innerHeight || document.documentElement.clientHeight || screen.height;

				_left = ((width / 2) - (_w / 2)) + dualScreenLeft;
				_top = ((height / 2) - (_h / 2)) + dualScreenTop;
			}else{
				width=window.screen.availWidth;
				height=window.screen.availHeight;
				dualScreenTop= 0 ; 
				dualScreenLeft =0 ; 
				_top = ((height / tr) - (_h / tr))+ dualScreenTop; 
				_top = _top < 0 ? 0 :_top;
				_left = ((width / lr) - (_w / lr)) + dualScreenLeft;
			}
		}else{
			width=window.screen.availWidth;
			height=window.screen.availHeight;
			_top = ((height / tr) - (_h / tr))+ window.screen.availTop;
			_left = ((width / lr) - (_w / lr))+window.screen.availLeft;
		}
		
		return {
			top : _top
			,left :  _left
		}
	}
	,replaceUrl : function (url, param){
		var urlArr = url.match(/(#[a-zA-Z0-9]+)#/gi);
		
		if(urlArr){
			for(var i= 0 ; i < urlArr.length; i ++){
				url = url.replace(urlArr[i], param[urlArr[i].replace(/#/g,'')]);
			}
		}
		return url ; 
	}
	/**
	 * @method PubEP.util.replaceParamUrl
	 * @param url
	 * @param param
	 * @description url 파라미터 셋팅.
	 */
	,replaceParamUrl : function (url , param){
		var _this = this; 
		if(!url) return '';
		
		var queryStr = [];
		
		var urlArr = url.split('?'); 
		if(urlArr.length > 1){
			queryStr.push(urlArr[0]+'?');
			url = urlArr.splice(1).join('?');
		}
		var parameters = url.split('&');
		
		var sParam, sParamArr;
		for(var i = 0 ; i < parameters.length ; i++){
			sParam = parameters[i];
			
			if(i!=0) queryStr.push('&');
			
			queryStr.push(_this.replaceParam(sParam,param));
		}
		return queryStr.join('');
	}
	/**
	 * @method PubEP.util.replageParam
	 * @param str replace string
	 * @param replaceParam 변경함 파라미터 
	 * @description get all attirbute
	 */
	,replaceParam : function (str , replaceParam){
		var matchObj = str.match(/#.*?#/g);
		
		if(matchObj != null){
			var _paramVal = str,tmpKey={},matchKey; 
			for(var j=0 ;j <matchObj.length; j++){
				matchKey = matchObj[j];
				if(typeof replaceParam==='object'){
					if(!tmpKey[matchKey]){
						_paramVal =_paramVal.replace(new RegExp(matchKey,'g'), (replaceParam[matchKey.replace(/#/g,'')]||'') );
						tmpKey[matchKey] = matchKey;
					}
				}else{
					_paramVal =_paramVal.replace(new RegExp(matchKey,'g'), replaceParam );
				}
			}
			return _paramVal;
		}

		return str;
	}
	/**
	 * @method PubEP.util.allAttr
	 * @param attrObj jquery object
	 * @param type 대소문자 
	 * @description get all attirbute
	 */
	,allAttr : function (attrObj,type){
		if(attrObj.length < 1) return {};
		var sItemAttr ={};
		$.each(attrObj.get(0).attributes, function(i, attrib){
			if(type=='lower'){
				sItemAttr[attrib.name.toLowerCase()] = attrib.value;
			}else if(type=='upper'){
				sItemAttr[attrib.name.toLowerCase()] = attrib.value;
			}else{
				sItemAttr[attrib.name] = attrib.value;
			}
		})
		return sItemAttr; 
	}
	/**
	 * @method PubEP.util.allAttrNameLower
	 * @param attrObj jquery object
	 * @description attribute 소문자 이름으로 리턴
	 */
	,allAttrNameLower : function (attrObj){
		return this.allAttr(attrObj ,'lower'); 
	}
	/**
	 * @method PubEP.util.allAttrNameUpper
	 * @param attrObj jquery object
	 * @description attribute 대문자 이름으로 리턴
	 */
	,allAttrNameUpper : function (attrObj){
		return this.allAttr(attrObj ,'upper'); 
	}
	/**
	 * @method PubEP.util.getParameter
	 * @param url string
	 * @param param object
	 * @description url 파라미터를 object로 처리.
	 */
	,getParameter : function (url, param){
		return getParameter(url, param); 
	}
	/**
	 * @method PubEP.util.getTreeModel
	 * @param treeArray
	 * @description 배열을 트리 형식의 데이타로 만들기
	 */
	,getTreeModel : function (treeArray,keyObj){
		var treeItem = {};
		
		var keyInfo = $.extend({},{node_id:'menu_id',pnode_id :'parent_menu_id',node_nm:'title'} ,keyObj);

		var depthObj = {};
		var maxDepth=0 ,tmpDepth=0; 
		
		if(keyInfo.first_node_id){
			var tmpRootNode = {};
			
			tmpRootNode._depth = 0;
			tmpRootNode[keyInfo.node_id] = keyInfo.first_node_id;
			tmpRootNode[keyInfo.pnode_id] = '_root';
			tmpRootNode.treePath= '_root';
			tmpRootNode._children=[];
			treeItem[keyInfo.first_node_id]=tmpRootNode;
			treeArray.unshift(tmpRootNode);
			
		}
		
		for(var i =0 ;i <treeArray.length; i++){
			var o = treeArray[i];

			var pid=o[keyInfo.pnode_id];
			var id=o[keyInfo.node_id];
			
			var tNode ={};
			for(var key in o){
				if(o[key]!==undefined) tNode[key]= o[key];
			}
			
			if(treeItem[pid]){
				tNode._depth= treeItem[pid]._depth+1;
				tNode.treePath = treeItem[pid].treePath+' > '+tNode[keyInfo.node_nm];
			}else{
				tNode.treePath = tNode[keyInfo.node_nm];
				tNode._depth=0;
			}
			
			tNode._children=[];

			tmpDepth=tNode._depth;
			maxDepth = maxDepth <tmpDepth ? tmpDepth: maxDepth;
					
			if(depthObj[tmpDepth]){		
				depthObj[tmpDepth].push(id);
			}else{
				depthObj[tmpDepth] = [];
				depthObj[tmpDepth].push(id);
			}
			
			treeItem[id] = tNode;
		}

		var depthArr;
		var depthArrLen;
		var tmpId, tmpNode;
		for (var i=maxDepth; i > 0; i-- ){
			depthArr=depthObj[i];
			depthArrLen=depthArr.length;
			
			for (var j=0; j< depthArrLen; j++ ){
				tmpId = depthArr[j];
				tmpNode=treeItem[tmpId];
				treeItem[tmpNode[keyInfo.pnode_id]]._children.push(tmpId);

				//delete treeItem[tmpId];
			}
		}

		return treeItem; 
	}
}

/**
 * 숫자 계산  
 */
_$base.math = {
	/**
     * @method PubEP.math.cal
     * @param a
     * @param b
     * @param calType
     * @param fixNum
     * @description 숫자 계산
     */
	cal :function(a, b , calType, fixNum) {
		
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		
		if((a == 0 || b == 0) && '*%/'.indexOf(calType) > -1){
			return 0;
		}
		
		var reval =0.0;
		if(calType=='+'){
			reval= a+b;
		}else if(calType=='-'){
			reval= a-b;
		}else if(calType=='/'){
			reval= a/b;
		}else if(calType=='%'){
			reval= a%b;
		}else if(calType=='*'){
			reval= a*b;
		}
		
		if(fixNum){
			return reval.toFixed(fixNum);
		}else{
			var dotIdxA =(a+'').split('.')[1]; 
			dotIdxA = dotIdxA?dotIdxA.length : 0;
			
			var dotIdxB =(b+'').split('.')[1]; 
			dotIdxB = dotIdxB?dotIdxB.length : 0;
			
			fixNum= dotIdxA >dotIdxB?dotIdxA : dotIdxB;
			
			if(fixNum < 1){
				var revalDot =(reval+'').split('.')[1];
				revalDot = revalDot?revalDot.length : 0;
				fixNum= fixNum >revalDot?fixNum : revalDot;
			}
		}
		
		return fixNum > 0 ? reval.toFixed(fixNum) : reval;
	}
	/**
	 * @method PubEP.math.sum
	 * @param a
	 * @param b
	 * @description 더하기 계산
	 */
	,sum :function(a, b) {
		return a+b;
	}
	/**
	 * @method PubEP.math.arraySum
	 * @param array
	 * @param key
	 * @description 배열 더하기 계산
	 */
	,arraySum :function(array, key) {
		if(array.length < 1) return 0;
		
		var _self = this; 
		
		var result =0.0, tmpVal= 0.0, maxFixed=0,dotIdx
			,flag = key ? true :false; 
		
		$.each(array, function(){
			tmpVal = flag?this[key]:this;
			
			if(isNaN(tmpVal)){
				tmpVal = (tmpVal+'').replace(/[$,]+/g,'');
				tmpVal = isNaN(tmpVal)?0:tmpVal;
			}
			
			dotIdx =(tmpVal+'').split('.')[1]; 
			dotIdx = dotIdx?dotIdx.length : maxFixed;
			maxFixed = maxFixed > dotIdx?maxFixed :dotIdx;
			
			result = (_self.sum(parseFloat(result) , parseFloat(tmpVal))).toFixed(maxFixed); 
		});
		
		return result;
	}
	/**
	 * @method PubEP.math.average
	 * @param array
	 * @param key
	 * @description 배열 평균 구하기 함수
	 */
	,average : function (array, key) {
		if(array.length < 1) return 0;
		var tmpSum = this.arraySum(array,key);
		
		var dotIdx =(tmpSum+'').split('.')[1]; 
		dotIdx = dotIdx?dotIdx.length : 0;
		
		return (tmpSum / array.length).toFixed(dotIdx);
	}
}

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc,i18n) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}
		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? dF.i18n.ttNames['a'] : dF.i18n.ttNames['p'],
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoShortTime:   "HH:MM",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	ttNames: {
		a:'AM'
		,p:'PM'
	},
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

function contains(arr , element) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == element) {
			return true;
		}
	}
	return false;
}

function getParameterVal(name){
	var results = new RegExp('[\?&]'+name+'=([^&#]*)').exec(window.location.href);
	if(results==null){
		return '';
	}else{
		return results[1]||0;
	}
};

function getParameter(url, param){
	if(!url) return {};
	
	var paramSplit  = url.split('?');
	var paramLen = paramSplit.length;
	
	var rtnval = param ? param : {};
	var addStyleFlag = true; 

	if(!rtnval['StyleName']){
		var tmpStyleName = getParameterVal('StyleName');
		
		if(typeof ePortalConfig !== 'undefined'){
			if(!String.prototype.endsWith){
				String.prototype.endsWith= function (searchString, position){
					
					if(!searchString) return false; 
					
					var subjectStr = this.toString();
					
					if(typeof position !=='number' || !isFinite(position) || Math.floor(position) !== position || position > subjectStr.length  ){
						position = subjectStr.length;
					}
					
					position -= searchString.length;
					
					var lastIndex = subjectStr.indexOf(searchString , position)
					
					return lastIndex !== -1 && lastIndex ===position;
				}
			}
			
			if(url.indexOf('/'+ePortalConfig.virtualContext+'/home') > -1 || url.endsWith(ePortalConfig.virtualContext)){
				addStyleFlag = false; 
				tmpStyleName=globalOption.globalStyle['mainmenu.default'];
			}else{
				var tmpUrl = paramSplit[0],urlIncludeFlag = false;
				for(var tmpKey in globalOption.globalStyle){
					if(tmpUrl.indexOf(tmpKey) > -1){
						urlIncludeFlag = true; 
						tmpStyleName = globalOption.globalStyle[tmpKey];
						break; 
					}
				}
				
				if(!urlIncludeFlag){
					tmpStyleName =globalOption.globalStyle[ePortalConfig['currentPageOID']] ? globalOption.globalStyle[ePortalConfig['currentPageOID']] : tmpStyleName;
				}
			}
		}
		tmpStyleName= tmpStyleName?tmpStyleName : globalOption.globalStyle['mainmenu.default'];
		rtnval['StyleName'] =tmpStyleName;
	}
	
	if(paramLen < 2) return rtnval;
	
	var parameters = paramSplit[1].split('&');
	
	var tmpKey='',firstIdx, tmpParam;
	for(var i = 0 ; i < parameters.length ; i++){
		tmpParam = parameters[i];
		firstIdx = tmpParam.indexOf('=');

		if(firstIdx > 0){
			tmpKey = tmpParam.substring(0,firstIdx);
			if(!(tmpKey=='StyleName' && addStyleFlag==false)){
				rtnval[tmpKey]=tmpParam.substring(firstIdx+1);
			}
				
		}
	}

	if(paramLen > 2){
		var lastParam = '';
		for(var i=2; i<paramLen; i ++){
			lastParam = lastParam+'?'+paramSplit[i];
		}
		rtnval[''] = rtnval[tmpKey]+lastParam
	}
	
	return rtnval; 
}

// array으로 변환
function paramToArray(param){
	var tmpArr = new Array();
	var tmpVal;	
	for(var key in param) {
		if(key) {
			tmpVal = param[key];
			tmpArr.push( key+'='+ ( (typeof tmpVal==='string')?tmpVal:JSON.stringify(tmpVal) ) );
		}
	}
	return tmpArr; 
}

window.PubEP = _$base;
window.epDateFormat = dateFormat;
})( window ,jQuery);


/* ========================================================================
 * Bootstrap: dropdown.js v3.3.6
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element, option) {
	this._options = option;
	this.selectParent = '';
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.6'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  Dropdown.prototype.clearMenus= function (e) {
    var _this = this; 
    if (e && e.which === 3) return
    
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      
      
      if (e.isDefaultPrevented()) return
 
	  if($this.data('bs.dropdown')._options && $.isFunction($this.data('bs.dropdown')._options.afterClick)){
		$this.data('bs.dropdown')._options.afterClick($this);
	  }
      $this.attr('aria-expanded', 'false').removeClass('on');
      
      $('.bs-dropdown-iframe-cover').hide();
      
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var _this = this; 
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')
	var _drop_down_idx = $this.attr('_drop_down_idx'); 
	
	if(Dropdown.selectParent != $parent.selector || _drop_down_idx==$parent.attr('_drop_down_idx')){
		Dropdown.prototype.clearMenus();
	}
	Dropdown.selectParent = $parent.selector;

	$parent.attr('_drop_down_idx',$this.attr('_drop_down_idx'));

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', _this.clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()){
 		 if($this.attr('bgiframe')=='true') $($parent.find('.dropdown-menu')).bgiframe();
 		return
 	  }
	  

	  if($this.data('bs.dropdown')._options && $.isFunction($this.data('bs.dropdown')._options.beforeClick)){
		$this.data('bs.dropdown')._options.beforeClick($this);
	  }
	
      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')
		.addClass('on');
      
      $($this.data('bs.dropdown')._options.iframeCoverSelector).each(function (i, item){
		 var sItem = $(this);
		 var tmpNextEle = sItem.next();
		 if(!tmpNextEle.hasClass('bs-dropdown-iframe-cover')){
			 sItem.after('<div class="bs-dropdown-iframe-cover" style="position:absolute;"></div>');
			 tmpNextEle =sItem.next('.bs-dropdown-iframe-cover');
		 }else{
			 tmpNextEle.show();
		 }
		 
		 tmpNextEle
			.css('width',sItem.css('width')).css('height',sItem.height())
			.css('z-index',1).css('left',sItem.position().left)
			.css('top',sItem.position().top);
	 })
	 
      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
	
	  if($this.attr('bgiframe')=='true') $($parent.find('.dropdown-menu')).bgiframe();
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }
  function getUUID(){
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
  }

  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
	option = $.extend({
		opt:(typeof option === 'string')?option:false
		,bgiframe:true
		,iframeCoverSelector : '#gainPage'
	}, option);
    return this.each(function (i,item) {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')
	  $this.attr('bgiframe',option.bgiframe);
	  $this.attr('_drop_down_idx',getUUID());
	  
	  if (!data) {
		  $this.data('bs.dropdown', (data = new Dropdown(this,option)))
		  $this.data('bs.dropdown')['_options'] = option;
	  }
	  if (typeof option.opt == 'string') data[option.opt].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', Dropdown.prototype.clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);



/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version 3.0.1
 *
 * Requires jQuery >= 1.2.6
 */
(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ( typeof exports === 'object' ) {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.fn.bgiframe = function(s) {
        s = $.extend({
            top         : 'auto', // auto == borderTopWidth
            left        : 'auto', // auto == borderLeftWidth
            width       : 'auto', // auto == offsetWidth
            height      : 'auto', // auto == offsetHeight
            opacity     : true,
            src         : 'javascript:false;',
            conditional : true//(navigator.userAgent.toLowerCase().indexOf("msie") != -1) // expression or function. return false to prevent iframe insertion
        }, s);

        // wrap conditional in a function if it isn't already
        if ( !$.isFunction(s.conditional) ) {
            var condition = s.conditional;
            s.conditional = function() { return condition; };
        }
        
        var $iframe = $('<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"style="display:block;position:absolute;z-index:-1;"/>');

        return this.each(function() {
            var $this = $(this);
            if ( !s.conditional(this)) { return; }
            var existing = $this.children('iframe.bgiframe');
            var $el = existing.length === 0 ? $iframe.clone() : existing;
            $el.css({
                'top': s.top == 'auto' ?
                    ((parseInt($this.css('borderTopWidth'),10)||0)*-1)+'px' : prop(s.top),
                'left': s.left == 'auto' ?
                    ((parseInt($this.css('borderLeftWidth'),10)||0)*-1)+'px' : prop(s.left),
                'width': s.width == 'auto' ? (this.offsetWidth + 'px') : prop(s.width),
                'height': s.height == 'auto' ? (this.offsetHeight + 'px') : prop(s.height),
                'opacity': s.opacity === true ? 0 : undefined
            });

            if ( existing.length < 1 ) {
                $this.prepend($el);
            }
        });
    };

    // old alias
    $.fn.bgIframe = $.fn.bgiframe;

    function prop(n) {
        return n && n.constructor === Number ? n + 'px' : n;
    }

}));

/*!
 * jQuery Browser Plugin 0.1.0
 * https://github.com/gabceb/jquery-browser-plugin
 *
 * Original jquery-browser code Copyright 2005, 2015 jQuery Foundation, Inc. and other contributors
 * http://jquery.org/license
 *
 * Modifications Copyright 2015 Gabriel Cebrian
 * https://github.com/gabceb
 *
 * Released under the MIT license
 *
 * Date: 05-07-2015
 */
/*global window: false */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], function ($) {
      return factory($);
    });
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node-like environment
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
}(function(jQuery) {
  "use strict";

  function uaMatch( ua ) {
    // If an UA is not provided, default to the current browser UA.
    if ( ua === undefined ) {
      ua = window.navigator.userAgent;
    }
    ua = ua.toLowerCase();

    var match = /(edge)\/([\w.]+)/.exec( ua ) ||
        /(opr)[\/]([\w.]+)/.exec( ua ) ||
        /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(iemobile)[\/]([\w.]+)/.exec( ua ) ||
        /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

    var platform_match = /(ipad)/.exec( ua ) ||
        /(ipod)/.exec( ua ) ||
        /(windows phone)/.exec( ua ) ||
        /(iphone)/.exec( ua ) ||
        /(kindle)/.exec( ua ) ||
        /(silk)/.exec( ua ) ||
        /(android)/.exec( ua ) ||
        /(win)/.exec( ua ) ||
        /(mac)/.exec( ua ) ||
        /(linux)/.exec( ua ) ||
        /(cros)/.exec( ua ) ||
        /(playbook)/.exec( ua ) ||
        /(bb)/.exec( ua ) ||
        /(blackberry)/.exec( ua ) ||
        [];

    var browser = {},
        matched = {
          browser: match[ 5 ] || match[ 3 ] || match[ 1 ] || "",
          version: match[ 2 ] || match[ 4 ] || "0",
          versionNumber: match[ 4 ] || match[ 2 ] || "0",
          platform: platform_match[ 0 ] || ""
        };

    if ( matched.browser ) {
      browser[ matched.browser ] = true;
      browser.version = matched.version;
      browser.versionNumber = parseInt(matched.versionNumber, 10);
    }

    if ( matched.platform ) {
      browser[ matched.platform ] = true;
    }

    // These are all considered mobile platforms, meaning they run a mobile browser
    if ( browser.android || browser.bb || browser.blackberry || browser.ipad || browser.iphone ||
      browser.ipod || browser.kindle || browser.playbook || browser.silk || browser[ "windows phone" ]) {
      browser.mobile = true;
    }

    // These are all considered desktop platforms, meaning they run a desktop browser
    if ( browser.cros || browser.mac || browser.linux || browser.win ) {
      browser.desktop = true;
    }

    // Chrome, Opera 15+ and Safari are webkit based browsers
    if ( browser.chrome || browser.opr || browser.safari ) {
      browser.webkit = true;
    }

    // IE11 has a new token so we will assign it msie to avoid breaking changes
    if ( browser.rv || browser.iemobile) {
      var ie = "msie";

      matched.browser = ie;
      browser[ie] = true;
    }

    // Edge is officially known as Microsoft Edge, so rewrite the key to match
    if ( browser.edge ) {
      delete browser.edge;
      var msedge = "msedge";

      matched.browser = msedge;
      browser[msedge] = true;
    }

    // Blackberry browsers are marked as Safari on BlackBerry
    if ( browser.safari && browser.blackberry ) {
      var blackberry = "blackberry";

      matched.browser = blackberry;
      browser[blackberry] = true;
    }

    // Playbook browsers are marked as Safari on Playbook
    if ( browser.safari && browser.playbook ) {
      var playbook = "playbook";

      matched.browser = playbook;
      browser[playbook] = true;
    }

    // BB10 is a newer OS version of BlackBerry
    if ( browser.bb ) {
      var bb = "blackberry";

      matched.browser = bb;
      browser[bb] = true;
    }

    // Opera 15+ are identified as opr
    if ( browser.opr ) {
      var opera = "opera";

      matched.browser = opera;
      browser[opera] = true;
    }

    // Stock Android browsers are marked as Safari on Android.
    if ( browser.safari && browser.android ) {
      var android = "android";

      matched.browser = android;
      browser[android] = true;
    }

    // Kindle browsers are marked as Safari on Kindle
    if ( browser.safari && browser.kindle ) {
      var kindle = "kindle";

      matched.browser = kindle;
      browser[kindle] = true;
    }

     // Kindle Silk browsers are marked as Safari on Kindle
    if ( browser.safari && browser.silk ) {
      var silk = "silk";

      matched.browser = silk;
      browser[silk] = true;
    }

    // Assign the name and platform variable
    browser.name = matched.browser;
    browser.platform = matched.platform;
    return browser;
  }

  // Run the matching process, also assign the function to the returned object
  // for manual, jQuery-free use if desired
  window.jQBrowser = uaMatch( window.navigator.userAgent );
  window.jQBrowser.uaMatch = uaMatch;

  // Only assign to jQuery.browser if jQuery is loaded
  if ( jQuery ) {
    jQuery.browser = window.jQBrowser;
  }

  return window.jQBrowser;
}));




(function($, _$base){

	$.fn.imgPopupView = function(options) {

		var defaults = {  
		  	srcAttrName : 'img_src'
		  	,destroy: false
			,imgEvent : 'click'
			,maxWidth : 1024
			,maxHeight: 768
		  	
	  	};  
	 	var opts = $.extend(defaults, options);
	 	
		return this.each(function(i,item){
			var tmpThis = $(this);
			// Remove all Fullsize bound events
			if(opts.destroy == true){
				tmpThis.unbind();
			} else {
				tmpThis.on(opts.imgEvent, function (){
					var imgSrc = '';
					if(item.tagName=='IMG'){
						imgSrc = $(this).attr('src');
					}else{
						imgSrc = $(this).attr(opts.srcAttrName);
					}
					var strHtm = [];
					strHtm.push("<html>");
					strHtm.push("<head>");
					strHtm.push("<title>IMG VIEW</title>");
					strHtm.push("<style>body{margin:0;cursor:hand;}</style>");
					strHtm.push("</head>");
					strHtm.push("<body scroll=auto onload='var width1=document.all.Timage.width;if(width1>"+opts.maxWidth+")width1="+opts.maxWidth+";var height1=document.all.Timage.height;if(height1>"+opts.maxHeight+")height1="+opts.maxHeight+";top.window.resizeTo(width1+20,height1+70);' onclick='top.window.close();'>");
					strHtm.push("<img src=\""+imgSrc+"\" title='클릭하시면 닫힙니다.' name='Timage' id='Timage'>");
					strHtm.push("</body>");
					strHtm.push("</html>");
					
					var aaa =_$base.util.popupPosition(opts.maxWidth,opts.maxHeight); 

					var imagez = window.open('', "image", "width="+ 100 +"px, height="+ 100 +"px, top="+aaa.top+"px,left="+aaa.left+"px,scrollbars=auto,resizable=1,toolbar=0,menubar=0,location=0,directories=0,status=1");
					imagez.document.open(); 
					imagez.document.write(strHtm.join('')) 
					imagez.document.close(); 
				});
			}
		});
	}
})(jQuery, PubEP);  