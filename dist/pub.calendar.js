/*
 * pubCalendar v0.0.1
 * ========================================================================
 * Copyright 2016 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
*/
;(function($, window, document) {
"use strict";

var _initialized = false
,

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
		
	}
	/**
     * @method setOptions
     * @description 옵션 셋팅.
     */
	,setOptions : function(options){
		var _this = this; 
		
		if($.isArray(options.tbodyItem)){
			delete _this.options.tbodyItem;
		}

		$.extend(true, _this.options, options);
		this.options.tbodyItem = options.tbodyItem ? options.tbodyItem : _this.options.tbodyItem;

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
     * @method destory
     * @description 해제.
     */
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