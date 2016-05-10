/*!
* javascript tree 
* Copyright 2011 , ytkim
*/

function pubTree(divName, subMenuCall) {
	pubTreeConfig.divName = divName;
	pubTreeConfig.subMenuCall = subMenuCall;
}

var pubTreeConfig={
	icon : {
		root				: '../../theme/default/images/tree/base.gif'
		,folder			: '../../theme/default/images/tree/folder.gif'
		,folderOpen	: '../../theme/default/images/tree/folderopen.gif'
		,node				: '../../theme/default/images/tree/page.gif'
		,empty				: '../../theme/default/images/tree/empty.gif'
		,line				: '../../theme/default/images/tree/line.gif'
		,join				: '../../theme/default/images/tree/join.gif'
		,joinBottom	: '../../theme/default/images/tree/joinbottom.gif'
		,plus				: '../../theme/default/images/tree/plus.gif'
		,plusBottom	: '../../theme/default/images/tree/plusbottom.gif'
		,minus				: '../../theme/default/images/tree/minus.gif'
		,minusBottom	: '../../theme/default/images/tree/minusbottom.gif'
		,nlPlus			: '../../theme/default/images/tree/nolines_plus.gif'
		,nlMinus			: '../../theme/default/images/tree/nolines_minus.gif'
	}
	,obj				: ''
	,divName			: ''
	,treeItem		: new Object()
	,selected		: null
	,selectedNode	: null
	,selectedFound	: false
	,completed		: false
	,idArr			: new Array()
	,rootArr		: new Array()
	,topMenuView	:'none'
	,openDepth		: 'all'
	,subMenuCall	:''
	,toggle : function(obj_id){
		var tNode=this.treeItem[obj_id];

		if(this.selectedNode){
			document.getElementById(this.selectedNode.id+'_a').className='pubTreeAtagblur';
		}
		document.getElementById(tNode.id+'_a').className='pubTreeAtagfocus';

		this.selectedNode = tNode;
		var icon = this.icon;
		var imgSel = document.getElementById('c_'+obj_id);

		if(imgSel){
			if(imgSel.childNodes.length >0 || tNode.childCnt > 0){
				var viewYn= imgSel.style.display=='none'?'inline':'none';
				if(tNode.depth !=0 ){
					document.getElementById(obj_id+'_icon').src = tNode.icon =='' || tNode.icon ==undefined?(viewYn !='none'?icon.folderOpen:icon.folder):(viewYn =='none'?(tNode.iconOpen==''||tNode.iconOpen==undefined?tNode.icon:tNode.iconOpen):tNode.icon);
					document.getElementById(obj_id+'_join').src = this.treeItem[tNode.pid].childDataCnt != tNode.sortOrder?((viewYn !='none')?icon.minus:icon.plus):((viewYn !='none')?icon.minusBottom:icon.plusBottom);
				}
				imgSel.style.display =viewYn;
			}
			//console.log(1);
			if(tNode.childCnt > 0 && imgSel.childNodes.length < 1 ) {
				if(pubTreeConfig.subMenuCall){alert(1); pubTreeConfig.subMenuCall(obj_id);}
			}
		}
	}
	,doClick : function(obj_id){

		
		var tNode =	this.treeItem[obj_id];

		if(this.selectedNode){
			document.getElementById(this.selectedNode.id+'_a').className='pubTreeAtagblur';
		}
		document.getElementById(tNode.id+'_a').className='pubTreeAtagfocus';

		if(tNode.url != ''){
			location.href ='javascript:'+tNode.url;
		}
		this.selectedNode = tNode;
	}
}

pubTree.prototype.setOpenDepth = function(depth){	
	pubTreeConfig.openDepth=depth;
}

pubTree.prototype.setImg = function(tNode, display){	
	var treeItem =  pubTreeConfig.treeItem;
	var depth = treeItem[tNode.id].depth;
	var str= new Array();	
	var icon = pubTreeConfig.icon;
	
	var imgYnArr= tNode.imgYn.split(',');
	
	for(var i = 0 ; i <depth ; i ++){
		str.push(((imgYnArr[i]=='false' || imgYnArr[i]=='' )?'<img src="'+icon.empty+'">':'<img src="'+icon.line+'">'));
	}
	str.push( '<img id="'+tNode.id+'_join" src="');

	var flag = display=='block'?true:false;
	
	str.push( (treeItem[tNode.pid].childDataCnt != tNode.sortOrder?(tNode.childDataCnt==0 && tNode.childCnt==0 ? icon.join :(tNode.childDataCnt == 0 && tNode.childCnt > 0 ? icon.plus:(flag?icon.minus:icon.plus))):(tNode.childDataCnt==0 && tNode.childCnt==0 ? icon.joinBottom :(tNode.childDataCnt == 0 && tNode.childCnt > 0 ? icon.plusBottom:(flag?icon.minusBottom:icon.plusBottom)))));
	str.push('" onclick = "pubTreeConfig.toggle(\''+tNode.id+'\')" style = "cursor:hand;">');

	return str.join('');
}

pubTree.prototype.setFolder = function (tNode){
	var treeItem = pubTreeConfig.treeItem;

	var icon = pubTreeConfig.icon;
	
	sNode = treeItem[tNode.id];

	pubTreeConfig.idArr.length==0?(pubTreeConfig.treeItem[sNode.id].childDataCnt=sNode.childDataCnt=0):sNode.childDataCnt;
	
	if(sNode.depth > 0 && sNode != null){
		if(sNode.depth >0){
			if(sNode.childDataCnt>0){
				document.getElementById(sNode.id +'_join').src = (treeItem[sNode.pid].childDataCnt != sNode.sortOrder?(sNode.childDataCnt ==0?icon.join:icon.minus):(sNode.childDataCnt ==0?icon.joinBottom:icon.minusBottom));	
				document.getElementById(sNode.id +'_icon').src = icon.folderOpen;	
			}else{
				document.getElementById(sNode.id +'_join').src = (treeItem[sNode.pid].childDataCnt != sNode.sortOrder?(sNode.childDataCnt ==0?icon.join:icon.minus):(sNode.childDataCnt ==0?icon.joinBottom:icon.minusBottom));	
				document.getElementById(sNode.id +'_icon').src = icon.node;	
			}
		}
	}
}

// ���� Ʈ�� �߰� . 
pubTree.prototype.add = function(o){
	var pid=o.pid;
	var id=o.id;
	
	var tNode = this.createNode(pid);

	for(var key in o){
		if(o[key]!==undefined) tNode[key]= o[key];
	}

	if(pubTreeConfig.treeItem[pid]){
		pubTreeConfig.treeItem[pid].childNodes.push(id);
	}else{
		pubTreeConfig.idArr.push(id);
		pubTreeConfig.rootArr.push(id);
	}
	
	pubTreeConfig.treeItem[pid]?(tNode.sortOrder=pubTreeConfig.treeItem[pid].childDataCnt =(pubTreeConfig.treeItem[pid].childDataCnt+1)):0;
	
	pubTreeConfig.treeItem[id] = tNode;
}

pubTree.prototype.createNode= function (pid){
	var tNode = {
		id :''
		,pid :''
		,name :''
		,url :''
		,title :''
		,target :''
		,icon :''
		,iconOpen :''
		,open :''
		,childDataCnt:0
		,childCnt:0
		,sortOrder:0
		,imgYn:''
		,depth:pubTreeConfig.treeItem[pid]?((pubTreeConfig.treeItem[pid].depth)+1):0
		,childNodes: new Array()
	};

	return tNode;
}

// ���� Ʈ�� �߰� . 
pubTree.prototype.addNode = function(o){
	if(document.getElementById(pid)){
		
		var pid=o.pid;
		var id=o.id;

		var tNode = this.createNode(pid);

		for(var key in o){
			if(o[key]!==undefined) tNode[key]= o[key];
		}
			
		if(pubTreeConfig.treeItem[pid]){
			pubTreeConfig.treeItem[pid].childNodes.push(id);
		}else{
			pubTreeConfig.idArr.push(id);
		}
		
		pubTreeConfig.treeItem[pid]?(tNode.sortOrder=pubTreeConfig.treeItem[pid].childDataCnt =(pubTreeConfig.treeItem[pid].childDataCnt+1)):0;
		
		pubTreeConfig.treeItem[id] = tNode;

		this.addNodeBeforeEnd(tNode);
	}
}

pubTree.prototype.addNodeBeforeEnd = function (tNode) {
	var oElement = document.getElementById('c_'+tNode.pid);
	var sHTML  = this.toString();
	
	this.setFolder(pubTreeConfig.treeItem[tNode.pid]); // ��� ����. 
	
	if (oElement.insertAdjacentHTML != null) {
		oElement.insertAdjacentHTML('BeforeEnd', sHTML);
	}else{
		var df;	
		var r = oElement.ownerDocument.createRange();
		r.selectNodeContents(oElement);
		r.collapse(false);
		df = r.createContextualFragment(sHTML);
		oElement.appendChild(df);
	}
	pubTreeConfig.idArr =new Array();
}

// Ʈ�� �ϳ� ���� . 
pubTree.prototype.delNode = function(id){
	var tNode = pubTreeConfig.treeItem[id];
	if(tNode){
		pubTreeConfig.treeItem[tNode.pid]?(pubTreeConfig.treeItem[tNode.pid].childDataCnt =(pubTreeConfig.treeItem[tNode.pid].childDataCnt-1)):0;
		pubTreeConfig.treeItem[id] = '';
		this.remove(tNode);
	}
}


pubTree.prototype.remove = function(tNode){
	var el = document.getElementById(tNode.id);
	var el1 = document.getElementById('c_'+tNode.id);

	el.parentNode.removeChild(el);
	el1.parentNode.removeChild(el1);
	if(pubTreeConfig.treeItem[tNode.pid]){
		this.setFolder(pubTreeConfig.treeItem[tNode.pid]);
	}
	pubTreeConfig.selectedNode='';
}

pubTree.prototype.isChild = function (obj){
	return obj.length > 0?true:false;
}

pubTree.prototype.toString = function(obj){
	var treeHtml = new Array();
	var id_arr = 	obj?obj:pubTreeConfig.idArr;
	var idArrlLen = id_arr.length;
	var tree_item = pubTreeConfig.treeItem;
	var icon =pubTreeConfig.icon;
	var tmpchildDataCnt ='';
	var tmpDepth = '';
	var childNodeArr;
	var childDataCnt=0;
	var firstNodeFlag = pubTreeConfig.selectedNode==null && pubTreeConfig.divName?true:false;
	
	if(firstNodeFlag && obj===undefined)	treeHtml.push('<div id="pubTreeDiv" class="pubTree" ondrag="return false">')
	
	for(var i = 0 ; i < idArrlLen ; i++){
		
		var tNode = tree_item[id_arr[i]];

		childNodeArr = tNode.childNodes;

		pubTreeConfig.treeItem[id_arr[i]].imgYn = tree_item[tNode.pid]?(tree_item[tNode.pid].imgYn+','+(tree_item[tNode.pid].childDataCnt==tNode.sortOrder?false:true)):'';
		
		tNode=tree_item[id_arr[i]];

		var display = pubTreeConfig.openDepth != 'all' ? (pubTreeConfig.openDepth > tNode.depth?'block':'none') :'block';
		var flag = display=='block'?true:false;
		var iconImg = (tNode.icon =='' || tNode.icon ==undefined) ?(tNode.childDataCnt==0 && tNode.childCnt==0 ? icon.node :(tNode.childDataCnt == 0 && tNode.childCnt > 0 ? icon.folder:(flag?icon.folderOpen:icon.folder))):tNode.icon;

		if(tNode.depth ==0){
			treeHtml.push('<div id="'+tNode.id+'" style="display:'+pubTreeConfig.topMenuView+'"><img id="'+tNode.id+'_icon" src="'+icon.root+'" onclick ="pubTreeConfig.toggle(\''+tNode.id+'\')"> <a href ="javascript:" id = "'+tNode.id+'_a" ondblclick="pubTreeConfig.toggle(\''+tNode.id+'\')" onclick="pubTreeConfig.doClick(\''+tNode.id+'\')" target="'+(tNode.target?tNode.target:'')+'">'+tNode.name+'</a> </div><span id="c_'+tNode.id+'" style="display:inline">'+this.toString(childNodeArr) +'</span>');
		}else{
			if(tNode.childDataCnt ==0){
				treeHtml.push('<div id="'+tNode.id+'" style="display:block">'+this.setImg(tNode, display)+'<img id="'+tNode.id+'_icon" src="'+iconImg+'"> <a href ="javascript:" id="'+tNode.id+'_a" ondblclick="pubTreeConfig.toggle(\''+tNode.id+'\')" onclick="pubTreeConfig.doClick(\''+tNode.id+'\')" target="'+(tNode.target?tNode.target:'')+'">'+tNode.name+'</a> </div><span id="c_'+tNode.id+'" style="display:none"></span>');
				
			}else{
				treeHtml.push('<div id="'+tNode.id+'" style="display:block">'+this.setImg(tNode, display)+'<img id="'+tNode.id+'_icon" src="'+iconImg+'"> <a href="javascript:" id="'+tNode.id+'_a" ondblclick="pubTreeConfig.toggle(\''+tNode.id+'\')" onclick= "pubTreeConfig.doClick(\''+tNode.id+'\')" target="'+(tNode.target?tNode.target:'')+'">'+tNode.name+'</a> </div><span id ="c_'+tNode.id+'" style="display:'+display+'">' +this.toString(childNodeArr) +'</span>');
			}
		}
	}
	
	if(firstNodeFlag && obj===undefined)	treeHtml.push('</div>');
	
	return treeHtml.join('');
}
pubTree.prototype.getSelect= function(){
	var sNode = pubTreeConfig.selectedNode;
	if(sNode !=null && sNode != ''){
		document.getElementById(sNode.id+'_a').className = 'style2';
		return sNode;
	}
}

pubTree.prototype.open= function(){
	var icon = pubTreeConfig.icon;
	var sNode = pubTreeConfig.selectedNode;
	var treeItem = pubTreeConfig.treeItem;
	
	if(sNode==null && pubTreeConfig.divName){
		document.getElementById(pubTreeConfig.divName).innerHTML = this.toString();
	}else{
		if(sNode.id){
			pubTreeConfig.idArr = treeItem[sNode.id].childNodes;
			this.setFolder(sNode);
			document.getElementById('c_'+sNode.id).innerHTML = this.toString();
		}
	}
	pubTreeConfig.idArr =new Array();
	this.getSelect();
}

pubTree.prototype.allOpen= function(){
	var rootArr =  pubTreeConfig.rootArr;
	var treeItem = pubTreeConfig.treeItem;
	var rootArrLen =rootArr.length;
	
	for(var i =0 ; i <rootArrLen ;  i ++){
		var tNode =treeItem[rootArr[i]];

		this.setFolderOpenImg(tNode);
		this.folderOpen(tNode);

	}
}

pubTree.prototype.folderOpen = function (tNode){
	var cNode = tNode.childNodes;
	var cNodeLen = cNode.length;
	var treeItem = pubTreeConfig.treeItem;

	if( cNodeLen > 0 ){
		for(var i=0; i < cNodeLen; i ++){
			var tmpNode = treeItem[cNode[i]];
			this.setFolderOpenImg(tmpNode)
			
			if(tmpNode.childNodes.length >0) this.folderOpen(tmpNode);
			
		}
	}
}

pubTree.prototype.setFolderOpenImg=function (tNode){
	var icon = pubTreeConfig.icon;
	var treeItem = pubTreeConfig.treeItem;

	var c_obj = document.getElementById('c_'+tNode.id);
	if(c_obj != '' && c_obj != undefined){
		
		if(tNode.depth > 0  && tNode.childNodes.length > 0){
			c_obj.style.display='inline';
			document.getElementById(tNode.id+'_icon').src = tNode.icon =='' || tNode.icon ==undefined ? (icon.folderOpen) : (tNode.iconOpen==''||tNode.iconOpen==undefined?tNode.icon:tNode.iconOpen);
			document.getElementById(tNode.id+'_join').src = treeItem[tNode.pid].childDataCnt != tNode.sortOrder?icon.minus:icon.minusBottom;
		}
	}
}

pubTree.prototype.allClose= function(){
	var rootArr =  pubTreeConfig.rootArr;
	var treeItem = pubTreeConfig.treeItem;
	var rootArrLen =rootArr.length;
	
	for(var i =0 ; i <rootArrLen ;  i ++){
		var tNode =treeItem[rootArr[i]];

		this.setFolderCloseImg(tNode);
		this.folderClose(tNode);

	}
}

pubTree.prototype.folderClose = function (tNode){
	var cNode = tNode.childNodes;
	var cNodeLen = cNode.length;
	var treeItem = pubTreeConfig.treeItem;

	if( cNodeLen > 0 ){
		for(var i=0; i < cNodeLen; i ++){
			var tmpNode = treeItem[cNode[i]];
			this.setFolderCloseImg(tmpNode)
			
			if(tmpNode.childNodes.length >0) this.folderClose(tmpNode);
			
		}
	}
}

pubTree.prototype.setFolderCloseImg=function (tNode){
	var icon = pubTreeConfig.icon;
	var treeItem = pubTreeConfig.treeItem;

	var c_obj = document.getElementById('c_'+tNode.id);
	if(c_obj != '' && c_obj != undefined){
		if(tNode.depth > 0  && tNode.childNodes.length > 0){
			c_obj.style.display='none';		
			document.getElementById(tNode.id+'_icon').src = tNode.icon =='' || tNode.icon ==undefined?icon.folder:tNode.icon;
			document.getElementById(tNode.id+'_join').src = treeItem[tNode.pid].childDataCnt != tNode.sortOrder?icon.plus:icon.plusBottom;
		}
	}
}