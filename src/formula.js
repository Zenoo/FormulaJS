/**
 * Element#matches IE hack
 */
if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector;

/**
 * @deprecated since v1.1.0. Disappears in v1.2.0
 * Use SlickLoader instead
 */
window.LOADER = document.createElement('div');
window.LOADER.classList.add('loadingScreen');
window.LOADER.innerHTML = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-eclipse" style="background: none;"> <path ng-attr-d="{{config.pathCmd}}" ng-attr-fill="{{config.color}}" stroke="none" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#ffffff"></path> <text style="cursor: move;" stroke="#000" xml:space="preserve" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="5" id="svg_4" y="48.875258" x="50" stroke-opacity="null" stroke-width="0" fill="#ffffff"></text> <text xml:space="preserve" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="5" id="svg_5" y="55.010217" x="50" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#ffffff"></text> </svg>';

if(document.body){
	document.body.appendChild(window.LOADER);
}
else{
	let observer = new MutationObserver(function() {
		if (document.body) {
			observer.disconnect();
			document.body.appendChild(window.LOADER);
		}
	});
	observer.observe(document.documentElement, {childList: true});
}

/**
 * @deprecated since v1.1.0. Disappears in v1.2.0
 * Use SlickLoader.enable() instead
 */
window.LOADER.enable = () => {
	console.warn('LOADER is depcrecated. Use SlickLoader instead.');
    window.LOADER.classList.add('active');
    return window.LOADER;
};

/**
 * @deprecated since v1.1.0. Disappears in v1.2.0
 * Use SlickLoader.disable() instead
 */
window.LOADER.disable = () => {
	console.warn('LOADER is depcrecated. Use SlickLoader instead.');
    window.LOADER.classList.remove('active');
    return window.LOADER;
};

/**
 * @deprecated since v1.1.0. Disappears in v1.2.0
 * Use SlickLoader.SetText() instead
 */
window.LOADER.setText = (text1,text2) => {
	console.warn('LOADER is depcrecated. Use SlickLoader instead.');
    let textList = window.LOADER.getElementsByTagName('text');
    if(text1 !== undefined) textList[0].innerHTML = text1;
    if(text2 !== undefined) textList[1].innerHTML = text2;
    return window.LOADER;
};

/**
 * @deprecated since v1.1.0. Disappears in v1.2.0
 * Use SlickLoader.clearText() instead
 */
window.LOADER.clearText = () => {
	console.warn('LOADER is depcrecated. Use SlickLoader instead.');
    let textList = window.LOADER.getElementsByTagName('text');
    textList[0].innerHTML = '';
    textList[1].innerHTML = '';
    return window.LOADER;
};

/** Slickloader class used for the SlickLoader element */
class Slickloader{
	/**
	 * Creates an instance of Slickloader
	 * @param {(Element|String)} parent The wrapper for the SlickLoader module
	 */
	constructor(parent){
		this._waitForBody().then(() => {
			/**
			 * Loader parent element
			 * @private
			 */
			this._parent = parent ? parent instanceof Element ? parent : document.querySelector(parent) : document.body;

			//Errors checking
			if(!this._parent) throw new Error('SlickLoader: '+(typeof parent == 'string' ? 'The selector `'+parent+'` didn\'t match any element.' : 'The element you provided was undefined'));
			if(Array.from(this._parent.children).some(e => e.matches('.slick-loader'))) console.warn('SlickLoader: The loader has already been initialized in this context.');

			/**
			 * The loader element
			 * @type {Element}
			 */
			this.element = document.createElement('div');
			this.element.classList.add('slick-loader');
			this.element.innerHTML = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-eclipse" style="background: none;"> <path ng-attr-d="{{config.pathCmd}}" ng-attr-fill="{{config.color}}" stroke="none" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#ffffff"></path> <text style="cursor: move;" stroke="#000" xml:space="preserve" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="5" id="svg_4" y="48.875258" x="50" stroke-opacity="null" stroke-width="0" fill="#ffffff"></text> <text xml:space="preserve" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="5" id="svg_5" y="55.010217" x="50" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#ffffff"></text> </svg>';
			
			if(parent) this.element.classList.add('slick-loader-inner');

			this._parent.appendChild(this.element);
		});
	}

	/**
	 * Wait for the body tag to be loaded
	 * @private
	 */
	_waitForBody(){
		return new Promise(resolve => {
			if(document.body) resolve();
			else{
				let observer = new MutationObserver(function() {
					if (document.body) {
						observer.disconnect();
						resolve();
					}
				});
				observer.observe(document.documentElement, {childList: true});
			}
		});
	}

	/**
	 * Displays the Slickloader
	 */
	enable(){
		this._waitForBody().then(() => {
			this.element.classList.add('active');
		});

		return this;
	}

	/**
	 * Hides the Slickloader
	 */
	disable(){
		this._waitForBody().then(() => {
			this.element.classList.remove('active');
		});

		return this;
	}

	/**
	 * Set two lines of text at the center of the Slickloader
	 * @param {String} text1 The first line of text
	 * @param {String} text2 The second line of text
	 */
	setText(text1,text2){
		this._waitForBody().then(() => {
			const textList = this.element.getElementsByTagName('text');

			if(text1 !== undefined) textList[0].innerHTML = text1;
			if(text2 !== undefined) textList[1].innerHTML = text2;
		});

		return this;
	}

	/**
	 * Clears any text from the Slickloader
	 */
	clearText(){
		this._waitForBody().then(() => {
			const textList = this.element.getElementsByTagName('text');

			textList[0].innerHTML = '';
			textList[1].innerHTML = '';
		});

		return this;
	}

	/**
	 * Removes any Slickloader mutation from the DOM
	 */
	destroy(){
		this._waitForBody().then(() => {
			this.element.remove();
		});
	}

	/**
     * Removes any Slickloader mutation from the DOM
     * @param {String} selector The selector for the Slickloader parent
     * @static
     */
	static destroy(selector){
		const element = document.querySelector(selector);

		if(element){
			const loader = Array.from(element.children).find(e => e.matches('.slick-loader'));

			if(loader) loader.remove();
		}
	}
}

// Init default SlickLoader
window.SlickLoader = new Slickloader();
