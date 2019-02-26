/* exported Formula */

/**
 * Field object
 * @typedef Field
 * @property {String}                         name       The field's pretty name
 * @property {Object.<String, Field>|Boolean} children   Either another level of Fields or a boolean (to use in combination of the 'onFieldExpand' callback)
 * @property {Object}                         customData Custom data for the field (Will be the 'onFieldExpand' callback second argument)
 * @memberof Formula
 * @example
 * {
 *   name: 'Pretty name',
 *   children: {
 *     firstChild: {
 *       name: 'Child name'
 *     },
 *     secondChild: {
 *       name: 'Second child name',
 *       children: true
 *     }
 *   }
 * }
 */

/** Formula class */
class Formula {
	/**
	 * Creates an instance of Formula
	 * @param {(Element|String)}        parent                  The intended wrapper
	 * @param {Object}                  [options]               Optional additional parameters
	 * @param {String[]}                [options.separators]    Characters that will process the inputted String into a new tag
	 * @param {String}                  [options.closers]       A chain of characters that will always trigger a new separate tag
	 * @param {Object.<String, String>} [options.lang]          Dictionary holder (The attribute 'field' is the only one needed right now)
	 * @param {Object.<String, Field>}  [options.customFields]  Custom Fields to display
	 * @param {Function}                [options.onFieldExpand] Callback REQUIRED if you use the 'children: true' Field property. Expects a Field-like object to be returned
	 */
	constructor(parent, options) {
		this._container = parent instanceof Element ? parent : document.querySelector(parent);
		this._options = {
			separators: [' ', 'Enter'],
			closers: '+-*/()%^',
			lang: {
				field: 'Custom Field'
			},
			onFieldExpand: () => ({}),
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
			<div class="formula-js-buttons">
				${this._options.customFields ? `<span class="formula-js-tag field-button">${this._options.lang.field}</span>` : ''}
				${this._options.closers.split('').map(closer => `
					<span class="formula-js-tag single">${closer}</span>
				`)
				.join('')}
			</div>
			${this._options.customFields ? '<div class="formula-js-fields formula-js-field-children"></div>' : ''}
		`;

		this._buildFields(this._container.querySelector('.formula-js-fields'), this._options.customFields);

		this._input = this._container.firstElementChild;
		this._caret = this._input.firstElementChild;
	}

	/**
	 * Build the Custom Field tree
	 * @param {Element} wrapper
	 * @param {Object} fields
	 * @param {String} path
	 * @param {String} prefix
	 * @private
	 */
	_buildFields(wrapper, fields, path = '', prefix){
		// Global UL
		const ul = document.createElement('ul');

		wrapper.appendChild(ul);

		// For each property
		Object.entries(fields).forEach(([field, {name, children, customData}]) => {
			// Field main LI
			const fieldLi = document.createElement('li');

			fieldLi.classList.add('formula-js-field');
			fieldLi.setAttribute('data-field', path + field);
			fieldLi.setAttribute('data-name', prefix ? prefix + ' > ' + name : name);
			fieldLi.innerText = name;
			this._listenToFieldClick(fieldLi);

			ul.appendChild(fieldLi);

			if(children){
				// Field chevron SPAN
				const fieldChevron = document.createElement('span');

				fieldChevron.classList.add('children');
				this._listenToFieldChevronClick(fieldChevron, customData);

				fieldLi.appendChild(fieldChevron);

				// Field children LI
				const fieldChildrenLi = document.createElement('li');

				fieldChildrenLi.classList.add('formula-js-field-children');

				if(children !== true) this._buildFields(fieldChildrenLi, children, field + '.', prefix ? prefix + ' > ' + name : name);

				ul.appendChild(fieldChildrenLi);
			}
		});
	}

	/**
	 * Handle the click on a custom field
	 * @param {HTMLLIElement} field 
	 * @private
	 */
	_listenToFieldClick(field){
		field.addEventListener('click', () => {
			const tag = document.createElement('span');

			tag.setAttribute('data-field', field.getAttribute('data-field'));
			tag.innerText = field.getAttribute('data-name');

			this._caret.insertAdjacentElement('beforebegin', tag);
		});
	}

	/**
	 * Handle the click on a custom field chevron
	 * @param {HTMLSpanElement} chevron 
	 * @param {Object} customData 
	 * @private
	 */
	_listenToFieldChevronClick(chevron, customData){
		chevron.addEventListener('click', e => {
			e.stopPropagation();

			chevron.parentElement.classList.toggle('open');

			// Children not loaded
			if(!chevron.parentElement.nextElementSibling.children.length){
				this._buildFields(
					chevron.parentElement.nextElementSibling,
					Reflect.apply(this._options.onFieldExpand, this, [chevron.parentElement, customData]),
					chevron.parentElement.getAttribute('data-field') + '.',
					chevron.parentElement.getAttribute('data-name')
				);
			}
		});
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

		// Custom Field handler
		if(this._options.customFields){
			this._container.querySelector('.field-button').addEventListener('click', e => {
				// Hide custom fields
				if(e.target.classList.contains('active')){
					e.target.classList.remove('active');
					this._container.querySelector('.formula-js-fields').classList.remove('formula-js-field-open');

					// Close all open fields
					this._container.querySelectorAll('.formula-js-fields .open').forEach(openField => {
						openField.classList.remove('open');
					});
				}else{
					// Show custom fields
					e.target.classList.add('active');
					this._container.querySelector('.formula-js-fields').classList.add('formula-js-field-open');
				}
			});
		}

		// Operator click
		this._container.querySelectorAll('.single').forEach(single => {
			single.addEventListener('click', () => {
				this.add(single.textContent);
			});
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
		return [...this._input.children].map(e => e.getAttribute('data-field') || e.textContent).join(' ');
	}

	/**
	 * Set the Formula manually
	 * @param {String} formulaString The Formula String
	 * @returns {Formula} The current Formula
	 */
	set(formulaString){
		return this.clear().add(formulaString);
	}

	/**
	 * Add to the Formula manually
	 * @param {String} formulaString The Formula String
	 * @returns {Formula} The current Formula
	 */
	add(formulaString){
		// Set the caret
		this._caret.textContent += formulaString;

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