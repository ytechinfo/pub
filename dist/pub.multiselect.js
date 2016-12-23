/**
 * pubMultiselect v0.0.1
 * ========================================================================
 * Copyright 2016 ytkim
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
*/
;(function ($, window, document, undefined) {

    var pluginName = "pubMultiselect"
		,initialized = false
		,_datastore = {}
        ,defaults = {
			targetSelector : false	//	타켓 selector
			,maxSize : -1	// 추가 가능한 max size
			,maxSizeMsg : false	// 추가 가능한 max size가 넘었을경우 메시지
			,useMultiSelect : false	// ctrl , shift key 이용해서 다중 선택하기 여부
			,useDragMove : true	// drag해서 이동할지 여부.  
			,useDragSort : true // target drag 해서 정렬할지 여부.
			,addPosition : 'last'	// 추가 되는 방향키로 추가시 어디를 추가할지. ex(source, last)
			,pageInfo :{	// 다중으로 관리할경우 처리. 
				max : 1
				,currPage : 1
				,selector : '#page_area'
				,pageNumKey : 'pageNo'
				,emptyMessage : '드래그 해서 추가하세요.'
			}
			,itemSelector :'.pub-select-item'
			,selectCls : 'selected'	// item 선택 클래스.
			,items :[]
			,sourceItem : {
				optVal : 'CODE_ID'	
				,optTxt : 'CODE_NM'
				,searchAttrName : '_name'
				,searchAttrKey : ''
				,items: []
				,click : false	// 클릭시 이벤트
			}
			,targetItem : {
				optVal : 'CODE_ID'
				,optTxt : 'CODE_NM'
				,items: []
				,click : false
				,dblclick : false
			}
			,message : { // 방향키 있을때 메시지 
				addEmpty : false
				,delEmpty : false
			}
			,beforeMove : false 
			,beforeItemMove : false 
			,afterSoucreMove : false
			,beforeTargetMove : false
			,afterTargetMove : false
		};
        
    function Plugin(sourceSelector, options) {
		
		this.elePrefix = pluginName+'-'+new Date().getTime();

        this.options = $.extend(true, defaults, options);

		this.sourceSelector = (typeof sourceSelector=='object') ? sourceSelector.selector : sourceSelector;
		this.targetSelector = (typeof options.targetSelector=='object') ? options.targetSelector.selector : options.targetSelector;

		this.sourceElement = $(this.sourceSelector);
		this.targetElement = $(this.targetSelector);

		this.config ={
			currPage : this.options.pageInfo.currPage
			,pageNumInfo:{}
			,itemKey :{
				sourceIdx :{}
			}
		};
		
		this.init();

		return sourceSelector;
    }

	Plugin.prototype ={
		/**
		 * @method init
		 * @description 자동완성 초기화
		 */	
		init :function(){
			var _this = this;

			_this.addItemList ={'1':{}};
			_this._initPageInfo();
			_this._initItem();
			_this.initEvt();
		}
		/**
		 * @method initEvt
		 * @description 이벤트 초기화
		 */	
		,initEvt : function (){
			var _this = this;
			
			_this.initSourceEvt();
			_this.initTargetEvt();
			
		}/**
		 * @method _initPageInfo
		 * @description 페이지 정보 초기화
		 */	
		,_initPageInfo : function (){
			var _this =this
				,opts = _this.options; 

			if(opts.pageInfo.max > 1){
				var pageHtm = [];
			
				for(var i = 1 ;i <=opts.pageInfo.max; i++){
					_this.config.pageNumInfo[i+''] =[];
					_this.addItemList[i+''] ={};
					pageHtm.push('<a href="javascript:;" class="page-num" data-page="'+i+'"><span class="page-no-text">'+i+'</span></a>');
				}

				$(opts.pageInfo.selector).addClass(_this.elePrefix).empty().html(pageHtm.join(''));
							
				$('.'+_this.elePrefix+' .page-num').on('click',function (e){
					var currEle = $(this);
					var beforeEle = $('.'+_this.elePrefix+' .page-num.selected');

					if(beforeEle.length > 0){
						_this.config.pageNumInfo[beforeEle.attr('data-page')] =[];
						_this.config.pageNumInfo[beforeEle.attr('data-page')].push(selectObj.targetElement.clone().html());

						if(currEle.hasClass('selected')){
							return false; 
						}
					}
					
					beforeEle.removeClass('selected');
					currEle.addClass('selected');

					var currPageNo = currEle.attr('data-page');

					_this.config.currPage = currPageNo; 

					if(opts.pageInfo.emptyMessage !== false && _this.config.pageNumInfo[currPageNo].length < 1){
						selectObj.targetElement.empty().html('<li class="empty-message">'+opts.pageInfo.emptyMessage+'</li>');
					}else{
						selectObj.targetElement.empty().html(_this.config.pageNumInfo[currPageNo].join(''));
					}
				})
				$('.'+_this.elePrefix+' .page-num[data-page="'+_this.config.currPage+'"]').addClass('selected');
			}
		}
		/**
		 * @method _initItem
		 * @description selectbox 정보 초기화 
		 */	
		,_initItem : function (){
			var _this = this
			
			_this.setItem('source',_this.options.sourceItem.items);
			_this.setItem('target',_this.options.targetItem.items);
		}
		/**
		 * @method setItem
		 * @param type {String} selectbox 타입(source or target)
		 * @param items {Array} items array
		 * @description item 그리기.
		 */		
		,setItem :  function (type , items){
			var _this = this
				,_opts = _this.options
				,tmpSourceItem = _opts.sourceItem
				,strHtm = []
				,tmpItem;
			
			var len ,valKey ,txtKey 
				,searchAttrName = tmpSourceItem.searchAttrName
				,searchAttrKey = tmpSourceItem.searchAttrKey == '' ? txtKey : tmpSourceItem.searchAttrKey;

			if(type=='source'){
				tmpSourceItem.items = items;
				len = tmpSourceItem.items.length;
				valKey = tmpSourceItem.optVal;
				txtKey = tmpSourceItem.optTxt;
					
				if(_opts.useSelectOption===true){
					_opts.sourceItem.items=[];
					_this.sourceElement.find(_opts.itemSelector).each(function (i ,item){
						var sObj = $(this);
						var addItem = {};

						addItem[valKey] = sObj.attr('data-val')
						addItem[txtKey] = sObj.text();
						addItem[searchAttrName] = sObj.attr(searchAttrName);
													
						if(_this.addItemList[_this.config.currPage][addItem[valKey]]){
							sObj.addClass(_opts.addItemClass);
						}
						
						_opts.sourceItem.items.push(addItem);
						_this.config.itemKey.sourceIdx[addItem[valKey]] = i;
					});
				}else{
					for(var i=0 ;i < len; i++){
						tmpItem = tmpSourceItem.items[i];
						var tmpSelctOptVal = tmpItem[valKey]; 

						strHtm.push(_this.getItemHtml(type,tmpSelctOptVal, tmpItem));

						_this.config.itemKey.sourceIdx[tmpSelctOptVal] = i;
					}

					_this.sourceElement.empty().html(strHtm.join(''));
				}
				_this._setDragOpt();
			}else{
				var tmpTargetItem= _opts.targetItem
				tmpTargetItem.items = items; 
				len = tmpTargetItem.items.length;
				valKey = tmpTargetItem.optVal;
				txtKey = tmpTargetItem.optTxt;
								
				if(_opts.useSelectOption===true){
					_opts.targetItem.items=[];
					var idx = 0; 
					_this.targetElement.find(_opts.itemSelector).each(function (i ,item){
						var sObj = $(this);
						var addItem = {};

						addItem[valKey] = sObj.val();
						addItem[txtKey] = sObj.text();
						addItem[searchAttrName] = sObj.attr(searchAttrName);
						
						var _key = addItem[valKey]; 
						addItem['_CU'] = 'U';

						_this.addItemList[_this.config.currPage][_key]=addItem; 
						_opts.targetItem.items.push(addItem);
						
						_this.sourceElement.find(_opts.itemSelector+'[data-val="'+addItem[valKey] +'"]').addClass(_opts.addItemClass);
						++idx;
					});
					len = idx; 
				}else{
					var pageNumKey = _opts.pageInfo.pageNumKey;
					for(var i=0 ;i < len; i++){
						tmpItem = tmpTargetItem.items[i];
						
						var tmpSelctOptVal = tmpItem[valKey]; 
						
						if(typeof _this.config.pageNumInfo[tmpItem[pageNumKey]||_this.config.currPage] ==='undefined'){
							_this.config.pageNumInfo[tmpItem[pageNumKey]||_this.config.currPage] = [];
						}

						if(typeof _this.addItemList[tmpItem[pageNumKey]||_this.config.currPage] ==='undefined'){
							throw 'pageInfo undefined '+ pageNumKey+' :'+tmpItem[pageNumKey]+' '; 
						}
						
						tmpItem['_CU'] = 'U';
						_this.addItemList[tmpItem[pageNumKey]||_this.config.currPage][tmpSelctOptVal] =tmpItem;

						_this.config.pageNumInfo[tmpItem[pageNumKey]||_this.config.currPage].push(_this.getItemHtml(type,tmpSelctOptVal, tmpItem))

						_this.sourceElement.find(_opts.itemSelector+'[data-val="'+tmpSelctOptVal+'"]').addClass(_opts.addItemClass);
					}
				
					_this.targetElement.empty().html(_this.config.pageNumInfo[_this.config.currPage].join(''));
				}
				
				if(len < 1){
					_this.sourceElement.find(_opts.itemSelector).removeClass(_opts.addItemClass);
				}
			}
		}
		/**
		 * @method initSourceEvt
		 * @description source 소스 이벤트 초기화
		 */	
		,initSourceEvt : function (){
			var _this = this
				,opts = _this.options;
			
			_this.sourceElement.addClass(_this.elePrefix+'source pub-multiselect-area');
	
			_this.sourceElement.on('click.pub-multiselect',opts.itemSelector, function (e){
				_this._setClickEvent(e, 'source' , $(this));
			})

			_this.sourceElement.on('dblclick.pub-multiselect',opts.itemSelector, function (e){
				_this.soucreMove();
				return ; 
			})

			_this.sourceElement.on('selectstart',function(){ return false; });
			
			_this.targetElement.sortable({
				 scroll: true
				,cancel: ((opts.useDragSort !== false) ?'li:not(.'+opts.selectCls+')' :'li')
				,start:function(e,ui){
					try{
						var uiItem = $(ui.item);
						if(!uiItem.hasClass('ui-draggable')){
							var selectItem = _this.getSelectElement(_this.targetElement);

							if( $.inArray(opts.selectCls,e.currentTarget.classList) < 0 || selectItem.length < 1) {
								//return false;
							}	
						}
					}catch(e){
						console.log(e);
					}
				}
				,update : function (e, ui){
					var uiItem = $(ui.item);
					if(uiItem.hasClass('ui-draggable')){
						var addHtm = _this.soucreMove(true);

						uiItem.replaceWith(addHtm);
					}			
				}
				,change : function (e,ui){
					var uiItem = $(ui.position.top);
				}
			})
		}
		,_setDragOpt : function (){
			var _this = this
				,opts = _this.options;
			
			if(opts.useDragMove !== false){
				_this.sourceElement.find(opts.itemSelector).draggable({
					appendTo: "body"
					,connectToSortable: _this.targetSelector
					,classes: {
						"ui-draggable": opts.selectCls
					}
					,helper: function (event){
						var selectItem = _this.getSelectElement(_this.sourceElement); 
											
						if(selectItem.length  < 1){
							return '<div></div>'; 
						}
						
						var strHtm = [];
						$.each(selectItem, function (i ,item ){
							strHtm.push('<div class="pub-multi-add-item">'+$(item).html()+'</div>')
						}); 	

						return '<div class="pub-multi-add-helper-wrapper">'+strHtm.join('')+'</div>';
					}
					,start:function(e,info){
						var selectItem = _this.getSelectElement(_this.sourceElement);

						if( $.inArray(opts.selectCls,e.currentTarget.classList) < 0 || selectItem.length < 1) {
							e.preventDefault();
							e.stopPropagation();
							return false; 
						}	
					}
					,stop : function (e,ui){
						return true; 	
					}
				});
			}
		}
		/**
		 * @method initTargetEvt
		 * @description target 소스 이벤트 초기화
		 */	
		,initTargetEvt : function (){
			var _this = this
				,opts = _this.options; 
			
			_this.targetElement.addClass(_this.elePrefix+'target pub-multiselect-area');

			_this.targetElement.on('click',opts.itemSelector, function (e){
				_this._setClickEvent(e, 'target', $(this));
			})

			_this.targetElement.on('dblclick.pub-multiselect',opts.itemSelector, function (e){
				if($.isFunction(_this.options.targetItem.dblclick)){
					
					if(_this.options.targetItem.dblclick.call($(this),e, _this.addItemList[_this.config.currPage][_this.getItemVal($(this))]) ===false){
						return false;
					};
				}
				_this.targetElement.find(opts.itemSelector).removeClass(opts.selectCls);
				$(this).addClass(opts.selectCls);
				_this.targetMove();				
			})
			//_this.targetElement.on('selectstart',function(){ return false; });
		}
		/**
		 * @method _setClickEvent
		 * @param e {Event} 이벤트
		 * @param selectType {String} source, target
		 * @param sEle {Element} 선택된 element
		 * @description target 소스 이벤트 초기화
		 */	
		,_setClickEvent : function (e,selectType, sEle){
			var _this = this
				,opts = _this.options
				,evtElement
				,selectItem;

			if(selectType =='source'){
				evtElement = _this.sourceElement;
				selectItem = opts.sourceItem;
			}else{
				evtElement = _this.targetElement;
				selectItem = opts.targetItem;
			}

			var evt =window.event || e; 

			var lastClickEle = evtElement.find(opts.itemSelector+'[data-last-click="Y"]'); 
			var onlyClickFlag = false; 
			if(opts.useMultiSelect ===true){
				if (evt.shiftKey){
					var allItem = evtElement.find(opts.itemSelector); 
					var beforeIdx = allItem.index(lastClickEle)
						,currIdx = allItem.index(sEle);
					
					var source = Math.min(beforeIdx, currIdx)
						,last = Math.max(beforeIdx, currIdx);

					evtElement.find(opts.itemSelector+'.'+ opts.selectCls).removeClass(opts.selectCls);

					for(var i=last; i >= source; i--){
						$(allItem[i]).addClass(opts.selectCls);
					}
				}else{
					lastClickEle.removeAttr('data-last-click');
					if(evt.ctrlKey){
						if(sEle.hasClass(opts.selectCls)){
							sEle.removeClass(opts.selectCls);
						}else{
							sEle.addClass(opts.selectCls);
						}
					}else{
						onlyClickFlag=true; 
					}
				}
			}else{
				onlyClickFlag = true; 
			}

			if(onlyClickFlag){
				if($.isFunction(selectItem.click)){
					selectItem.click.call(sEle , e, _this.addItemList[_this.config.currPage][_this.getItemVal(sEle)]); 
				}
				evtElement.find(opts.itemSelector+'.'+ opts.selectCls).removeClass(opts.selectCls);	
				sEle.addClass(opts.selectCls);
			}

			sEle.attr('data-last-click','Y');	
		}
		/**
		 * @method getAddItem
		 * @description 추가된 아이템 구하기.
		 */	
		,getAddItem:function (itemKey, pageNum){
			var  _this = this;
			
			if(itemKey){
				if(typeof pageNum ==='undefined'){
					return _this.addItemList[_this.config.currPage][itemKey];
				}else{
					return _this.addItemList[pageNum][itemKey];
				}
			}else{
				var reInfo =[];
				
				var currEle = $('.'+_this.elePrefix+' .page-num.selected');
				_this.config.pageNumInfo[currEle.attr('data-page')||_this.config.currPage] =[];
				_this.config.pageNumInfo[currEle.attr('data-page')||_this.config.currPage].push(_this.targetElement.clone().html());

				var pageNumHtm = _this.config.pageNumInfo;
				
				for(var pageHtmKey in pageNumHtm){
					
					var tmpHtmInfo = pageNumHtm[pageHtmKey].join('');

					if(tmpHtmInfo.indexOf('class="empty-message"') > -1) continue; 

					$(tmpHtmInfo).each(function (i ,item){
					
						var tmpPageNo = $(item).attr('data-pageno');
						var addItem = _this.addItemList[tmpPageNo][$(item).attr('data-val')];
						addItem['_pageNum'] = tmpPageNo;
						reInfo.push(addItem); 
					})
				}
				return reInfo;
			}
		}
		/**
		 * @method getSelectElement
		 * @description 선택된 html eleement 얻기.
		 */	
		,getSelectElement : function (evtElement){
			return 	evtElement ? evtElement.find(this.options.itemSelector+'.'+ this.options.selectCls) : this.targetElement.find(this.options.itemSelector+'.'+ this.options.selectCls);
		}
		/**
		 * @method addItemStausUpdate
		 * @param itemKey {String} 아이템 key
		 * @description 등록된 아이템 상태 업데이트.
		 */	
		,addItemStausUpdate : function (itemKey){
			if(this.addItemList[this.config.currPage][itemKey]){
				this.addItemList[this.config.currPage][itemKey]['_CU'] = 'CU';
			}
		}
		/**
		 * @method getItemVal
		 * @param itemEle {Element} value를 구할 element
		 * @description value 구하기.
		 */
		,getItemVal : function (itemEle){
			return itemEle.attr('data-val');
		}
		/**
		 * @method move
		 * @param type {String} up or down
		 * @description 아래위 이동
		 */
		,move :function (type){
			var _this = this; 
			var selectElement =_this.getSelectElement(_this.targetElement);
			var len = selectElement.length;  
			if(len ==0) return ; 

			if(type=='up'){			
				var sourceIdx = _this.targetElement.find(this.options.itemSelector).index(selectElement[0]);

				if(sourceIdx < 1) return ;
				
				$(selectElement[len-1]).after(_this.targetElement.find(this.options.itemSelector).get(sourceIdx-1));
			}else{
				var lastIdx = _this.targetElement.find(this.options.itemSelector).index(selectElement[len-1]);
				var len = _this.targetElement.find(this.options.itemSelector).length; 
				
				if(lastIdx == len) return ; 

				$(selectElement[0]).before(_this.targetElement.find(this.options.itemSelector).get(lastIdx+1));
			}
		}
		/**
		 * @method soucreMove
		 * @param type {Boolean} true or false
		 * @description source -> target 이동.
		 */
		,soucreMove : function (returnFlag){
			var _this = this
				,opts = _this.options; 
			var selectVal =_this.getSelectElement(_this.sourceElement);
			
			if($.isFunction(opts.beforeMove)){
				if(opts.beforeMove('source') === false){
					return ; 
				};
			}
			
			if(selectVal.length >0){
				var tmpVal = '',tmpObj;
				var	strHtm = [];

				var addItemLength = _this.targetElement.find(opts.itemSelector+':not(.ui-draggable)').length
					,addItemCount = addItemLength;

				_this.targetElement.find('.empty-message').remove();

				selectVal.each(function (i, item){
					tmpObj = $(item);
					tmpVal=_this.getItemVal(tmpObj); 
					
					if(opts.duplicateCheck===true && _this.addItemList[_this.config.currPage][tmpVal]){
						return ;
					}
					
					if($.isFunction(opts.beforeItemMove)){
						if(opts.beforeItemMove(tmpObj) === false){
							return ; 
						}; 
					}

					if(opts.maxSize != -1  && addItemCount >= opts.maxSize){
						
						if($.isFunction(opts.maxSizeMsg)){
							opts.maxSizeMsg();
						}else{
							alert(opts.maxSizeMsg);
						}
						if(returnFlag===true){
							return false; 
						}else{
							if(opts.addPosition=='source'){
								_this.targetElement.prepend(strHtm.join(''));
							}else{
								_this.targetElement.append(strHtm.join(''));
							}
						}
						
						return false; 
					}
					addItemCount+=1;

					var selectItem = opts.sourceItem.items[_this.config.itemKey.sourceIdx[tmpVal]]; 
					var _addItem = $.extend(true , {}, selectItem);
					_addItem['_CU'] = 'C';

					_this.addItemList[_this.config.currPage][tmpVal] =_addItem;

					strHtm.push(_this.getItemHtml('target',tmpVal ,selectItem ));
					
					tmpObj.addClass(opts.addItemClass);
										
					if($.isFunction(opts.afterSoucreMove)){
						opts.afterSoucreMove(tmpObj); 
					}
				});

				if(returnFlag===true){
					return strHtm.join('');
				}else{
					if(opts.addPosition=='first'){
						_this.targetElement.prepend(strHtm.join(''));
					}else{
						_this.targetElement.append(strHtm.join(''));
					}
				}
			}else{
				if($.isFunction(opts.message.addEmpty)){
					opts.message.addEmpty.call();
				}else if(opts.message.addEmpty !== false){
					alert(opts.message.addEmpty);
				}
				return ;
			}
		}
		/**
		 * @method getItemVal
		 * @param itemEle {Element} value를 구할 element
		 * @description value 구하기.
		 */
		,targetMove : function (){
			var _this = this; 
			var selectVal = _this.getSelectElement(_this.targetElement);
			
			if($.isFunction(_this.options.beforeMove)){
				if(_this.options.beforeMove('target') === false){
					return ; 
				};
			}

			if(selectVal.length >0){
				var removeItem; 
				selectVal.each(function (i, item){
					if($.isFunction(_this.options.beforeTargetMove)){
						_this.options.beforeTargetMove($(item)); 
					}
					var tmpKey = $(item).attr('data-val'); 
					removeItem = _this.options.sourceItem.items[_this.config.itemKey.sourceIdx[tmpKey]];
					if(removeItem){
						_this.sourceElement.find(_this.options.itemSelector+'[data-val="'+tmpKey+'"]').removeClass(_this.options.addItemClass);
					}
					$(item).remove();
					
					delete _this.addItemList[_this.config.currPage][tmpKey];
					
					if($.isFunction(_this.options.afterTargetMove)){
						_this.options.afterTargetMove(removeItem); 
					}
				});
			}else{
				if(_this.options.message.delEmpty !== false){
					alert(_this.options.message.delEmpty);
				}
				return ;
			}
		}
		/**
		 * @method getItemHtml
		 * @param type {String} source , target
		 * @param seletVal {String} source , target
		 * @param tmpItem {Object} select item
		 * @description 선택된 html 얻기.
		 */	
		,getItemHtml: function (type  , seletVal , tmpItem){
			var _this = this
				, _opts = _this.options
				, sourceItem = _opts.sourceItem
				, txtKey = sourceItem.optTxt
				, searchAttrName = sourceItem.searchAttrName
				, searchAttrKey = sourceItem.searchAttrKey == '' ? txtKey : sourceItem.searchAttrKey;
		
			if(type=='source'){
				var styleClass ='';
				if(_this.addItemList[_this.config.currPage][seletVal]){
					styleClass += ' '+_opts.addItemClass; 
				}

				return '<li data-val="'+seletVal+'" '+searchAttrName+'="'+escape(tmpItem[searchAttrKey])+'" class="pub-select-item '+styleClass+'">'+tmpItem[txtKey]+'</li>'; 
			}else{
				return '<li data-pageno="'+(tmpItem[_opts.pageInfo.pageNumKey]||_this.config.currPage)+'" data-val="'+seletVal+'" '+searchAttrName+'="'+escape(tmpItem[searchAttrKey])+'" class="pub-select-item">'+tmpItem[txtKey]+'</li>'; 
			}
		}
		/**
		 * @method lSearch
		 * @param type {String} 검색할 문자열
		 * @description 왼쪽 아이템 조회. 
		 */	
		,lSearch : function (val){
			var _this = this
				,_opts = _this.options;  
			
			var tmpVal = val;
			var searchAttr = _opts.sourceItem.searchAttrName;

			var len = _opts.sourceItem.items.length
				,valKey = _opts.sourceItem.optVal
				,txtKey = _opts.sourceItem.optTxt
				,searchAttrName = _opts.sourceItem.searchAttrName
				,searchAttrKey = (_opts.sourceItem.searchAttrKey == '' ? txtKey : _opts.sourceItem.searchAttrKey)
				,tmpItem
				,strHtm = [];

			if( len> 0){
				_this.sourceElement.find(_opts.itemSelector).removeClass(_opts.selectCls);
				for(var i=0 ;i < len; i++){
					tmpItem = _opts.sourceItem.items[i];

					if(tmpVal=='' || tmpItem[searchAttrKey].indexOf(tmpVal) > -1){
						$('.'+_this.elePrefix+'source [data-val='+tmpItem[valKey]+']').show();
					}else{
						$('.'+_this.elePrefix+'source [data-val='+tmpItem[valKey]+']').hide();
					}
				}
				//_this.sourceElement.empty().html(strHtm.join(''));
			}
		}
		,destory:function (){
			//$(document).off('contextmenu.pubcontext', this.element).off('click', '.context-event');
		}
		/**
		 * @method getHilightTemplateData:
		 * @param re {RegExp} hilight 할 정규식
		 * @param item {Object} item
		 * @param hilightTemplate {String} hilight template
		 * @description hilight template 정보 얻기.
		 */	
		
	};

    $[ pluginName ] = function (selector,options) {

		if(!selector){
			return ; 
		}

		var _cacheObject = _datastore[selector];

		if(typeof options === undefined){
			return _cacheObject; 
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