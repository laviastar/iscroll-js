(function(){function d(j,f){this.element=typeof j=="object"?j:document.getElementById(j);this.wrapper=this.element.parentNode;var h="-webkit-transition-property:-webkit-transform;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);-webkit-transition-duration:0;-webkit-transform:"+(c?"translate3d(0,0,0)":"translate(0,0)");this.element.setAttribute("style",h);this.options={bounce:c,momentum:c,checkDOMChanges:true,topOnDOMChanges:false,hScrollbar:c,vScrollbar:c,scrollbarClass:null,fadeScrollbar:b||a,overflow:"auto",};if(typeof f=="object"){for(var g in f){this.options[g]=f[g]}}this.wrapper.style.overflow=this.options.overflow;this.refresh();window.addEventListener("resize",this,false);this.element.addEventListener("touchstart",this,false);if(this.options.checkDOMChanges){this.element.addEventListener("DOMSubtreeModified",this,false)}}d.prototype={x:0,y:0,dist:0,handleEvent:function(f){switch(f.type){case"touchstart":this.touchStart(f);break;case"touchmove":this.touchMove(f);break;case"touchend":this.touchEnd(f);break;case"webkitTransitionEnd":this.transitionEnd(f);break;case"resize":case"orientationchange":this.refresh();break;case"DOMSubtreeModified":this.onDOMModified(f);break}},onDOMModified:function(f){this.refresh();if(this.options.topOnDOMChanges&&(this.x!=0||this.y!=0)){this.scrollTo(0,0,"0")}},refresh:function(){this.scrollWidth=this.wrapper.clientWidth;this.scrollHeight=this.wrapper.clientHeight;this.maxScrollX=this.scrollWidth-this.element.offsetWidth;this.maxScrollY=this.scrollHeight-this.element.offsetHeight;var g=this.x,f=this.y;if(this.scrollX){if(this.maxScrollX>=0){g=0}else{if(this.x<this.maxScrollX){g=this.maxScrollX}}}if(this.scrollY){if(this.maxScrollY>=0){f=0}else{if(this.y<this.maxScrollY){f=this.maxScrollY}}}if(g!=this.x||f!=this.y){this.setTransitionTime("0");this.setPosition(g,f,true)}this.scrollX=this.element.offsetWidth>this.scrollWidth?true:false;this.scrollY=this.element.offsetHeight>this.scrollHeight?true:false;if(this.options.hScrollbar&&this.scrollX){this.scrollBarX=(this.scrollBarX instanceof e)?this.scrollBarX:new e("horizontal",this.wrapper,this.options.scrollbarClass,this.options.fadeScrollbar);this.scrollBarX.init(this.scrollWidth,this.element.offsetWidth)}else{if(this.scrollBarX){this.scrollBarX=this.scrollBarX.remove()}}if(this.options.vScrollbar&&this.scrollY){this.scrollBarY=(this.scrollBarY instanceof e)?this.scrollBarY:new e("vertical",this.wrapper,this.options.scrollbarClass,this.options.fadeScrollbar);this.scrollBarY.init(this.scrollHeight,this.element.offsetHeight)}else{if(this.scrollBarY){this.scrollBarY=this.scrollBarY.remove()}}},setPosition:function(f,h,g){this.x=f;this.y=h;this.element.style.webkitTransform=c?"translate3d("+this.x+"px,"+this.y+"px,0px)":"translate("+this.x+"px,"+this.y+"px)";if(!g){if(this.scrollBarX){this.scrollBarX.setPosition(this.x)}if(this.scrollBarY){this.scrollBarY.setPosition(this.y)}}},setTransitionTime:function(f){f=f||"0";this.element.style.webkitTransitionDuration=f;if(this.scrollBarX){this.scrollBarX.bar.style.webkitTransitionDuration=f+(c&&this.options.fadeScrollbar?",300ms":",0")}if(this.scrollBarY){this.scrollBarY.bar.style.webkitTransitionDuration=f+(c&&this.options.fadeScrollbar?",300ms":",0")}},touchStart:function(g){g.preventDefault();g.stopPropagation();this.moved=false;this.dist=0;this.setTransitionTime("0");if(this.options.momentum){var f=new WebKitCSSMatrix(window.getComputedStyle(this.element).webkitTransform);if(f.e!=this.x||f.f!=this.y){this.element.removeEventListener("webkitTransitionEnd",this,false);this.setPosition(f.e,f.f);this.moved=true}}this.touchStartX=g.touches[0].pageX;this.scrollStartX=this.x;this.touchStartY=g.touches[0].pageY;this.scrollStartY=this.y;this.scrollStartTime=g.timeStamp;this.element.addEventListener("touchmove",this,false);this.element.addEventListener("touchend",this,false)},touchMove:function(i){var g=this.scrollX===true?i.touches[0].pageX-this.touchStartX:0,f=this.scrollY===true?i.touches[0].pageY-this.touchStartY:0,j=this.x+g,h=this.y+f;this.dist+=Math.abs(this.touchStartX-i.touches[0].pageX)+Math.abs(this.touchStartY-i.touches[0].pageY);this.touchStartX=i.touches[0].pageX;this.touchStartY=i.touches[0].pageY;if(j>0||j<this.maxScrollX){j=this.options.bounce?Math.round(this.x+g/3):j>=0?0:this.maxScrollX}if(h>0||h<this.maxScrollY){h=this.options.bounce?Math.round(this.y+f/3):h>=0?0:this.maxScrollY}if(this.dist>5){this.setPosition(j,h);this.moved=true}},touchEnd:function(l){this.element.removeEventListener("touchmove",this,false);this.element.removeEventListener("touchend",this,false);var i=l.timeStamp-this.scrollStartTime;if(!this.moved){this.resetPosition();var m=l.changedTouches[0].target;while(m.nodeType!=1){m=m.parentNode}var n=document.createEvent("MouseEvents");n.initMouseEvent("click",true,true,l.view,1,m.screenX,m.screenY,m.clientX,m.clientY,l.ctrlKey,l.altKey,l.shiftKey,l.metaKey,0,null);m.dispatchEvent(n);return false}if(!this.options.momentum||i>250){this.resetPosition();return false}var g=this.scrollX===true?this.momentum(this.x-this.scrollStartX,i,this.options.bounce?-this.x+this.scrollWidth/3:-this.x,this.options.bounce?this.x+this.element.offsetWidth-this.scrollWidth+this.scrollWidth/3:this.x+this.element.offsetWidth-this.scrollWidth):{dist:0,time:0};var f=this.scrollY===true?this.momentum(this.y-this.scrollStartY,i,this.options.bounce?-this.y+this.scrollHeight/3:-this.y,this.options.bounce?this.y+this.element.offsetHeight-this.scrollHeight+this.scrollHeight/3:this.y+this.element.offsetHeight-this.scrollHeight):{dist:0,time:0};if(!g.dist&&!f.dist){this.resetPosition();return false}var h=Math.max(Math.max(g.time,f.time),1);var k=this.x+g.dist;var j=this.y+f.dist;this.scrollTo(k,j,h+"ms")},transitionEnd:function(){this.element.removeEventListener("webkitTransitionEnd",this,false);this.resetPosition()},resetPosition:function(h){var i=this.x,g=this.y,f=this,h=h||"500ms";if(this.x>=0){i=0}else{if(this.x<this.maxScrollX){i=this.maxScrollX}}if(this.y>=0){g=0}else{if(this.y<this.maxScrollY){g=this.maxScrollY}}if(i!=this.x||g!=this.y){this.scrollTo(i,g,h)}else{if(this.scrollBarX||this.scrollBarY){if(this.scrollBarX){this.scrollBarX.hide()}if(this.scrollBarY){this.scrollBarY.hide()}}}},scrollTo:function(g,f,h){this.element.addEventListener("webkitTransitionEnd",this,false);this.setTransitionTime(h||"450ms");this.setPosition(g,f)},momentum:function(m,g,k,f){var j=2.5,l=1.2,h=Math.abs(m)/g*1000,i=h*h/j/1000,n=0;if(m>0&&i>k){h=h*k/i/j;i=k}if(m<0&&i>f){h=h*f/i/j;i=f}i=i*(m<0?-1:1);n=h/l;return{dist:Math.round(i),time:Math.round(n)}}};var e=function(f,j,h,i){this.dir=f;this.fade=i;this.bar=document.createElement("div");var g="position:absolute;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;opacity:0;"+(c?"-webkit-transition-duration:0"+(i?",300ms":"")+";-webkit-transition-delay:0,0;-webkit-transition-property:-webkit-transform,opacity;-webkit-transform:translate3d(0,0,0);":"-webkit-transition-duration:0;-webkit-transition-property:webkit-transform;-webkit-transform:translate(0,0);")+(this.dir=="horizontal"?"bottom:2px;left:1px":"top:1px;right:2px");if(h){this.bar.className=h+" "+f}else{g+=";z-index:10;background:rgba(0,0,0,0.5);"+(f=="horizontal"?"-webkit-border-radius:3px 2px;min-width:6px;min-height:5px":"-webkit-border-radius:2px 3px;min-width:5px;min-height:6px")}this.bar.setAttribute("style",g);j.appendChild(this.bar)};e.prototype={init:function(f,g){var h=this.dir=="horizontal"?this.bar.offsetWidth-this.bar.clientWidth:this.bar.offsetHeight-this.bar.clientHeight;this.maxSize=f-8;this.size=Math.round(this.maxSize*this.maxSize/g)+h;this.maxScroll=this.maxSize-this.size;this.toWrapperProp=this.maxScroll/(f-g);this.bar.style[this.dir=="horizontal"?"width":"height"]=(this.size-h)+"px"},setPosition:function(g,f){if(!f&&this.bar.style.opacity!="1"){this.show()}g=this.toWrapperProp*g;if(g<0){g=0}else{if(g>this.maxScroll){g=this.maxScroll}}if(c){g=this.dir=="horizontal"?"translate3d("+Math.round(g)+"px,0,0)":"translate3d(0,"+Math.round(g)+"px,0)"}else{g=this.dir=="horizontal"?"translate("+Math.round(g)+"px,0)":"translate(0,"+Math.round(g)+"px)"}this.bar.style.webkitTransform=g},show:function(){if(c){this.bar.style.webkitTransitionDelay="0,0"}this.bar.style.opacity="1"},hide:function(){if(c){this.bar.style.webkitTransitionDelay="0,200ms"}this.bar.style.opacity="0"},remove:function(){this.bar.parentNode.removeChild(this.bar);return null}};var c=("m11" in new WebKitCSSMatrix());var b=navigator.appVersion.match(/iphone/gi)?true:false;var a=navigator.appVersion.match(/ipad/gi)?true:false;window.iScroll=d})();