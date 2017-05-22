/**
 * pubContextMenu: v0.0.1
 * ========================================================================
 * Copyright 2016 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
*/
;(function ($, window, document, undefined) {

    var pluginName = "pubMouseleavebg"
		,initialized = false
		,_datastore = {}
		,pubContextElement= false
		,isContextView = false
        ,defaults = {
			fadeSpeed: 100			
			,filter: function ($obj) {
				// Modify $obj, Do not return
			}
			,bgiframe:true
			,above: 'auto'
			,preventDoubleContext: true
			,compress: true
			,selectCls : 'item_select'
			,callback:function (key){
				alert(key)
			}
			,beforeSelect :function (item){
				
			}
		};
        
    function Plugin(element, options) {
        this.selector = (typeof element=='object') ? element.selector : element;
		this.contextId = 'mouseleavebg-'+new Date().getTime();
        this.options = $.extend({}, defaults, options);
		
		this.init();
		return element; 
    }

	Plugin.prototype ={
		init :function(){
			var _this = this; 

			_this.addBgTemplate();

			_this.initEvt();

		}
		,initEvt : function (){
			var _this  = this; 

			
			$(this.selector).on('mouseenter',function (e){
				_this.context.hide();
			});

			$(this.selector).on('mouseleave',function (e){
				_this.context.show();
			});

			_this.context.on('mouseenter',function (e){
				_this.context.hide();
			});

			_this.context.on('mouseleave',function (e){
				_this.context.show();
			});
		}
		,updatedefaults:function (opts){
			defaults = $.extend({}, defaults, opts);
		}
		,addBgTemplate : function (){
			var strHtm = [];
			
			var zIdx = $(this.selector).css('zIndex');

			zIdx = isNaN(zIdx) ? 0 : (parseInt(zIdx,10)+1); 
			strHtm.push('<div id="'+this.contextId+'" style="z-index:'+zIdx+';position:relative;display:none;width:'+$(this.selector).width()+'px;">');
			strHtm.push('<div style="position:absolute;top:0px;left:0px;width:100%;height:'+$(this.selector).height()+'px;">');
			
			strHtm.push('<div class="bg-iframe-overlay" style="display:block;position:absolute;;z-index:1;top:0px;left:0px;width:100%;height:100%;opacity:0;"></div>');
			strHtm.push('<iframe class="bgiframe"frameborder="0"tabindex="-1"src="javascript:false;"style="opacity:0;width:100%;height:100%;display:block;position:absolute;z-index:-1;"></iframe>');
			strHtm.push('</div></div>');

			$(this.selector).before(strHtm.join(''));

			this.context = $('#'+this.contextId);
		}
		
	};

    $[ pluginName ] = function (selector,options) {

		if(!selector){
			return ; 
		}

		var _cacheObject = _datastore[selector];

		if(typeof options === 'undefined'){
			return _cacheObject||{}; 
		}
		
		if(!_cacheObject){
			_cacheObject = new Plugin(selector, options);
			_datastore[selector] = _cacheObject;
			return _cacheObject; 
		}else if(typeof options==='object'){
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

})(jQuery, window, document);
