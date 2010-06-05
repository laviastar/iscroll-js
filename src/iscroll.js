/**
 * 
 * Find more about the scrolling function at
 * http://cubiq.org/iscroll
 *
 * Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 3.3 beta 1- Last updated: 2010.06.04
 * 
 */

(function(){

function iScroll (el, options) {
	this.element = typeof el == 'object' ? el : document.getElementById(el);
	this.wrapper = this.element.parentNode;

	// Check if device has translate3d
	this.is3d = ('m11' in new WebKitCSSMatrix());

	var style = '-webkit-transition-property:-webkit-transform;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);-webkit-transition-duration:0;-webkit-transform:' + (this.is3d ? 'translate3d(0,0,0)' : 'translate(0,0)');
	this.element.setAttribute('style', style);

	// Get options
	this.options = {
		bounce: this.is3d,
		momentum: this.is3d,
		checkDOMChanges: true,
		topOnDOMChanges: false,
		hScrollBar: true,
		vScrollBar: true,
		overflow: 'auto'
	};
	
	if (typeof options == 'object') {
		for (var i in options) {
			this.options[i] = options[i];
		}
	}

	this.wrapper.style.overflow = this.options.overflow;
	
	this.refresh();
	
	window.addEventListener('orientationchange', this, false);
	this.element.addEventListener('touchstart', this, false);

	if (this.options.checkDOMChanges) {
		this.element.addEventListener('DOMSubtreeModified', this, false);
	}
}

iScroll.prototype = {
	x: 0,
	y: 0,
	scrollBarTimeout: null,

	handleEvent: function (e) {
		switch (e.type) {
			case 'touchstart':
				this.touchStart(e);
				break;
			case 'touchmove':
				this.touchMove(e);
				break;
			case 'touchend':
				this.touchEnd(e);
				break;
			case 'webkitTransitionEnd':
				this.transitionEnd(e);
				break;
			case 'orientationchange':
				this.refresh();
				break;
			case 'DOMSubtreeModified':
				this.onDOMModified(e);
				break;
		}
	},
	
	onDOMModified: function (e) {
		this.refresh();
		
		if (this.options.topOnDOMChanges && (this.x!=0 || this.y!=0)) {
			this.scrollTo(0,0,'0');
		}
	},

	refresh: function () {
		this.scrollWidth = this.wrapper.clientWidth;
		this.scrollHeight = this.wrapper.clientHeight;
		this.maxScrollX = this.scrollWidth - this.element.offsetWidth;
		this.maxScrollY = this.scrollHeight - this.element.offsetHeight;

		var resetX = this.x, resetY = this.y;
		if (this.scrollX) {
			if (this.maxScrollX >= 0) {
				resetX = 0;
			} else if (this.x < this.maxScrollX) {
				resetX = this.maxScrollX;
			}
		}
		if (this.scrollY) {
			if (this.maxScrollY >= 0) {
				resetY = 0;
			} else if (this.y < this.maxScrollY) {
				resetY = this.maxScrollY;
			}
		}
		if (resetX!=this.x || resetY!=this.y) {
			this.setTransitionTime('0');
			this.setPosition(resetX, resetY, true);
		}

		this.scrollX = this.element.offsetWidth > this.scrollWidth ? true : false;
		this.scrollY = this.element.offsetHeight > this.scrollHeight ? true : false;

		// Update horizontal scrollbar
		if (this.options.hScrollBar && this.scrollX) {
			this.scrollBarX = (this.scrollBarX instanceof scrollbar) ? this.scrollBarX : new scrollbar('horizontal', this.wrapper);
			this.scrollBarX.init(this.scrollWidth, this.element.offsetWidth);
		} else if (this.scrollBarX) {
			this.scrollBarX = this.scrollBarX.remove();
		}

		// Update vertical scrollbar
		if (this.options.vScrollBar && this.scrollY) {
			this.scrollBarY = (this.scrollBarY instanceof scrollbar) ? this.scrollBarY : new scrollbar('vertical', this.wrapper);
			this.scrollBarY.init(this.scrollHeight, this.element.offsetHeight);
		} else if (this.scrollBarY) {
			this.scrollBarY = this.scrollBarY.remove();
		}
	},

	setPosition: function (x, y, hideScrollBars) { 
		this.x = x;
		this.y = y;

		this.element.style.webkitTransform = this.is3d ? 'translate3d(' + this.x + 'px,' + this.y + 'px,0px)' : 'translate(' + this.x + 'px,' + this.y + 'px)';

		// Move the scrollbars
		if (!hideScrollBars) {
			if (this.scrollBarX) {
				this.scrollBarX.setPosition(this.x);
			}
			if (this.scrollBarY) {
				this.scrollBarY.setPosition(this.y);
			}
		}
	},
	
	setTransitionTime: function(time) {
		time = time || '0';
		this.element.style.webkitTransitionDuration = time;
		
		if (this.scrollBarX) {
			this.scrollBarX.bar.style.webkitTransitionDuration = time + (this.is3d ? ',200ms' : '');
		}
		if (this.scrollBarY) {
			this.scrollBarY.bar.style.webkitTransitionDuration = time + (this.is3d ? ',200ms' : '');
		}
	},
		
	touchStart: function(e) {
	    if (e.targetTouches.length != 1) {
	        return false;
        }

		e.preventDefault();
		e.stopPropagation();

		this.setTransitionTime();

		// Check if the scroller is really where it should be
		if (this.options.momentum) {
			var matrix = new WebKitCSSMatrix(window.getComputedStyle(this.element).webkitTransform);
			if (matrix.e != this.x || matrix.f != this.y) {
				this.element.removeEventListener('webkitTransitionEnd', this, false);
				this.setPosition(matrix.e, matrix.f);
			}
		}

		if (this.scrollBarTimeout) {
			clearTimeout(this.scrollBarTimeout);
			this.scrollBarTimeout = null;
		}

		this.touchStartX = e.touches[0].pageX;
		this.scrollStartX = this.x;

		this.touchStartY = e.touches[0].pageY;
		this.scrollStartY = this.y;

		this.scrollStartTime = e.timeStamp;
		this.moved = false;

		this.element.addEventListener('touchmove', this, false);
		this.element.addEventListener('touchend', this, false);
	},
	
	touchMove: function(e) {
		if (e.targetTouches.length != 1) {
			return false;
		}

		var leftDelta = this.scrollX === true ? e.touches[0].pageX - this.touchStartX : 0,
			topDelta = this.scrollY === true ? e.touches[0].pageY - this.touchStartY : 0,
			newX = this.x + leftDelta,
			newY = this.y + topDelta;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < this.maxScrollX) { 
			newX = this.options.bounce ? Math.round(this.x + leftDelta / 4) : this.x;
		}
		if (newY > 0 || newY < this.maxScrollY) { 
			newY = this.options.bounce ? Math.round(this.y + topDelta / 4) : this.y;
		}

		this.setPosition(newX, newY);

		this.touchStartX = e.touches[0].pageX;
		this.touchStartY = e.touches[0].pageY;
		this.moved = true;

		// Prevent slingshot effect
		if( e.timeStamp-this.scrollStartTime > 250 ) {
			this.scrollStartX = this.x;
			this.scrollStartY = this.y;
			this.scrollStartTime = e.timeStamp;
		}
	},
	
	touchEnd: function(e) {
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);

/*
		if (e.targetTouches.length > 0) {
			return false;
		}
*/
		var time = e.timeStamp - this.scrollStartTime;
		
		if (!this.moved) {
			this.resetPosition();
			
			// Find the last touched element
			var target = e.changedTouches[0].target;
			while (target.nodeType != 1) {
				target = target.parentNode;
			}
			// Create the fake event
			var ev = document.createEvent('MouseEvents');
			ev.initMouseEvent("click", true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);
			target.dispatchEvent(ev);
			return false;
		}

		if (!this.options.momentum || time > 250) {
			this.resetPosition();
			return false;
		}

		var momentumX = this.scrollX === true
			? this.momentum(this.x - this.scrollStartX,
							time,
							this.options.bounce ? -this.x + this.scrollWidth/3 : -this.x,
							this.options.bounce ? this.x + this.element.offsetWidth - this.scrollWidth + this.scrollWidth/3 : this.x + this.element.offsetWidth - this.scrollWidth)
			: { dist: 0, time: 0 };

		var momentumY = this.scrollY === true
			? this.momentum(this.y - this.scrollStartY,
							time,
							this.options.bounce ? -this.y + this.scrollHeight/3 : -this.y,
							this.options.bounce ? this.y + this.element.offsetHeight - this.scrollHeight + this.scrollHeight/3 : this.y + this.element.offsetHeight - this.scrollHeight)
			: { dist: 0, time: 0 };

		if (!momentumX.dist && !momentumY.dist) {
			this.resetPosition();
			return false;
		}

		var newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 1);		// The minimum animation length must be 1ms
		var newPositionX = this.x + momentumX.dist;
		var newPositionY = this.y + momentumY.dist;

		this.scrollTo(newPositionX, newPositionY, newDuration + 'ms');
	},
	
	transitionEnd: function () {
		this.element.removeEventListener('webkitTransitionEnd', this, false);
		this.resetPosition();
	},

	resetPosition: function (time) {
		var resetX = this.x,
		 	resetY = this.y,
			that = this,
			time = time || '600ms';

		if (this.x >= 0) {
			resetX = 0;
		} else if (this.x < this.maxScrollX) {
			resetX = this.maxScrollX;
		}

		if (this.y >= 0) {
			resetY = 0;
		} else if (this.y < this.maxScrollY) {
			resetY = this.maxScrollY;
		}

		if (resetX != this.x || resetY != this.y) {
			this.setTransitionTime(time);
			this.setPosition(resetX, resetY);
		}

		// Hide the scrollbars
		if (this.scrollBarX || this.scrollBarY) {
			if (this.scrollBarTimeout) {
				clearTimeout(this.scrollBarTimeout);
				this.scrollBarTimeout = null;
			}

			this.scrollBarTimeout = setTimeout(function () {
				if (that.scrollBarX) {
					that.scrollBarX.hide();
				}
				if (that.scrollBarY) {
					that.scrollBarY.hide();
				}
			}, 200);
		}
	},

	scrollTo: function (destX, destY, runtime) {
		this.element.addEventListener('webkitTransitionEnd', this, false);	// At the end of the transition check if we are still inside of the boundaries
		this.setTransitionTime(runtime || '450ms');
		this.setPosition(destX, destY);
	},

	momentum: function (dist, time, maxDistUpper, maxDistLower) {
		var friction = 2,
			deceleration = 2.5/*- Math.min(1, (maxDistUpper + maxDistLower) / 1000)*/,
			speed = Math.abs(dist) / time * 1000,
			newDist = speed * speed / friction / 1000,
			newTime = 0;

		// Proportinally reduce speed if we are outside of the boundaries 
		if (dist > 0 && newDist > maxDistUpper) {
			speed = speed * maxDistUpper / newDist;
			newDist = maxDistUpper;
		}
		if (dist < 0 && newDist > maxDistLower) {
			speed = speed * maxDistLower / newDist;
			newDist = maxDistLower;
		}
		
		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: Math.round(newDist), time: Math.round(newTime) };
	}
};

var scrollbar = function (dir, wrapper) {
	this.is3d = ('m11' in new WebKitCSSMatrix());

	this.dir = dir;

	this.bar = document.createElement('div');
	this.bar.className = 'scrollbar ' + dir;

	var style = '-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;opacity:0;' + (this.is3d
		? '-webkit-transition-duration:0,200ms;-webkit-transition-property:-webkit-transform,opacity;-webkit-transform:translate3d(0,0,0)'
		: '-webkit-transition-duration:0;-webkit-transition-property:webkit-transform;-webkit-transform:translate(0,0)');

	this.bar.setAttribute('style', style);
	wrapper.appendChild(this.bar);
}

scrollbar.prototype = {
	init: function (scroll, size) {
		var offset = this.dir == 'horizontal' ? this.bar.offsetWidth - this.bar.clientWidth : this.bar.offsetHeight - this.bar.clientHeight;
		this.maxSize = scroll - 8;		// 8 = distance from top + distance from bottom
		this.size = Math.round(this.maxSize * this.maxSize / size) + offset;
		this.maxScroll = this.maxSize - this.size;
		this.toWrapperProp = this.maxScroll / (scroll - size);
		this.bar.style[this.dir == 'horizontal' ? 'width' : 'height'] = (this.size - offset) + 'px';
	},
	
	setPosition: function (pos, hidden) {
		if (!hidden && this.bar.style.opacity != '1') {
			this.show();
		}

		pos = this.toWrapperProp * pos;
		
		if (pos < 0) {
			pos = 0;
		} else if (pos > this.maxScroll) {
			pos = this.maxScroll;
		}

		if (this.is3d) {
			pos = this.dir == 'horizontal' ? 'translate3d(' + Math.round(pos) + 'px,0,0)' : 'translate3d(0,' + Math.round(pos) + 'px,0)';
		} else {
			pos = this.dir == 'horizontal' ? 'translate(' + Math.round(pos) + 'px,0)' : 'translate(0,' + Math.round(pos) + 'px)';
		}

		this.bar.style.webkitTransform = pos;
	},

	show: function () {
		this.bar.style.opacity = '1';
	},

	hide: function () {
		this.bar.style.opacity = '0';
	},
	
	remove: function () {
		this.bar.parentNode.removeChild(this.bar);
		return null;
	}
};

// Expose iScroll to the world
window.iScroll = iScroll;
})();