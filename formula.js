/* exported Formula */

/** Formula class */
class Formula {
	/**
	 * Creates an instance of Formula
	 * @param {(Element|String)} parent
	 * @param {Object} options
	 */
	constructor(parent, options) {
		this._container = parent instanceof Element ? parent : document.querySelector(parent);
		this._options = {
			separators: [' ', 'Enter'],
			closers: '+-*/()%^',
			...options
		};

		this._build();
		this._listen();
	}

	/**
	 * Build the Formula input
	 * @private
	 */
	_build() {
		this._container.classList.add('formula-js-container');
		this._container.innerHTML = `
			<div class="formula-js-input">
				<div class="formula-js-caret"></div>
			</div>
		`;

		this._input = this._container.firstElementChild;
		this._caret = this._input.firstElementChild;
	}

	/**
	 * Attach event listeners
	 * @private
	 */
	_listen() {
		// Main input style toggling
		this._input.addEventListener('click', e => {
			this._input.classList.add('active');

			// Tag click
			if (e.target.nodeName == 'SPAN') {
				e.target.insertAdjacentElement('afterend', this._caret);
			}
		});

		document.addEventListener('click', e => {
			if (!e.target.closest('.formula-js-input')) this._input.classList.remove('active');
		});

		// Keypresses duplicator
		document.addEventListener('keydown', e => {
			if (this._input.classList.contains('active')) {
				console.log(e);
				// Move the caret in the input
				if ([37, 39].includes(e.keyCode)) {
					if(e.keyCode == 37 && this._caret.previousElementSibling){
						this._caret.previousElementSibling.insertAdjacentElement('beforebegin', this._caret);
					}else if(e.keyCode == 39 && this._caret.nextElementSibling){
						this._caret.nextElementSibling.insertAdjacentElement('afterend', this._caret);
					}
				} else {
					// Separator
					if (this._options.separators.includes(e.key)) {
						if (this._caret.textContent.length) {
							this._processUserInput();
						}
					} else {
						this._handleKey(e);
					}
				}
			}
		});
	}

	/**
	 * Process the user's input after validation
	 * @private
	 */
	_processUserInput() {
		const
			closersRegexParts = this._options.closers
				.split('')
				.map(closer => closer.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
				.reduce((acc, curr) => acc.concat(['(?<='+curr+')', '(?='+curr+')']), []),
			finalSeparators = this._options.separators
				.map(separator => separator == 'Enter' ? '\\n' : separator.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
				.concat(closersRegexParts),
			regex = new RegExp(finalSeparators.join('|'), 'u'),
			content = this._caret.textContent;

		this._caret.textContent = '';

		content.split(regex).forEach(newPart => {
			const part = document.createElement('span');

			part.innerText = newPart;
			this._caret.insertAdjacentElement('beforebegin', part);
		});
	}

	/**
	 * Handle the user's non-separator keydown event
	 * @private
	 */
	_handleKey(event){
		// Printable
		if (event.key.length == 1) {
			// Paste
			if (event.key == 'v' && event.ctrlKey) {
				this._useClipboard();
			} else {
				// User used an auto-closer
				if(this._options.closers.includes(event.key)){
					if (this._caret.textContent.length) {
						this._processUserInput();
					}
					
					this._caret.textContent = event.key;
					this._processUserInput();
				}else{
					// Basic usage
					this._caret.innerHTML += event.key;
				}
			}
		} else {
			// Some sort of control
			switch (event.keyCode) {
				// Backspace
				case 8:
					// There is some text to delete
					if (this._caret.textContent.length) {
						this._caret.textContent = this._caret.textContent.slice(0, -1);
					} else {
						// Remove previous Element if there is one
						if (this._caret.previousElementSibling) {
							this._caret.previousElementSibling.remove();
						}
					}

					break;

				default:
					break;
			}
		}
	}

	/**
	 * Use the clipboard to add multiple tags
	 * @private
	 */
	_useClipboard(){
		navigator.clipboard.readText()
			.then(clipboard => {
				this._caret.innerHTML += clipboard;
				this._processUserInput();
			})
			.catch(err => {
				alert('Error while fetching clipboard: ' + err);
			});
	}

	/**
	 * Get the String value of the Formula
	 * @returns {String} The String representation of the Formula
	 */
	get(){
		return [...this._input.children].map(e => e.textContent).join(' ');
	}

	/**
	 * Set the Formula manually
	 * @param {String} formulaString The Formula String
	 * @returns {Formula} The current Formula
	 */
	set(formulaString){
		this.clear().add(formulaString);

		return this;
	}

	/**
	 * Add to the Formula manually
	 * @param {String} formulaString The Formula String
	 * @returns {Formula} The current Formula
	 */
	add(formulaString){
		// Set the caret
		this._caret.textContent = formulaString;

		// Process the string
		this._processUserInput();

		return this;
	}

	/**
	 * Clear the Formula manually
	 * @returns {Formula} The current Formula
	 */
	clear(){
		// Remove all tags
		this._input.querySelectorAll('span').forEach(span => {
			span.remove();
		});

		// Set the caret
		this._caret.textContent = '';

		return this;
	}

	/**
	 * Removes any Formula mutation from the DOM
	 */
	destroy() {
		this._container.innerHTML = '';
		this._container.classList.remove('formula-js-container');
		this._options = null;
	}

	/**
     * Removes any Formula mutation from the DOM
     * @param {String} selector The selector for the Formula parent
     * @static
     */
	static destroy(selector) {
		const formulaNode = document.querySelector(selector);

		if(formulaNode && formulaNode.classList.contains('formula-js-container')){
			formulaNode.innerHTML = '';
			formulaNode.classList.remove('formula-js-container');
		}
	}
}