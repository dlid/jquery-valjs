/*!
 * jQuery johnny5 Form Validation Plugin
 * version: 0.1 2013-08-16
 * Requires jQuery (Version TBA)
 * Copyright (c) 2013 David Lidström
 */
    (function ($, window) {
        var _registeredValidators = [],                     // The global list of registered validators
            _pluginDataPrefix = 'j5',                       // The prefix for element data variables
            _eventNamespace = 'j5',                         // Event namespace
            _validatorsDataName = 'j5v',                    // TBD

            // Events
            _eventNameInvalidField = 'invalidfield',
            _eventNameValidatingForm = 'validatingform',
            _eventNameInvalidForm = 'invalidform',
            _eventNameValidform = 'validform',
            _eventNameSubmitForm = 'submitform',
            _eventNameDisabling = 'disabling',
            _validatorOptionsDataName = 'j5-opt',

            /**
             * List of public methods in the jQuery plugin
             * @type {Object}
             */
            _methods = {
                init: function (_options) {
                    var defaults = {
                        // default properties go here
                        prefix: 'validate',
                        lang : 'en',
                        log: false,
                        novalidate : true,
                        defaultErrorMessage : 'Field value is not valid',

                        alwaysTriggerEvents : false,

                        classes : {
                            'form' : 'j5__form',
                            'field' : 'j5__field',
                            'msg' : 'j5__msg',
                            'label' : 'j5__label',

                            'error' : '--error',
                            'warning' : '--warning',
                            'invalid' : '--invalid',
                            'valid' : '--valid',
                            'unknown' : '--unknown'
                        },

                        classField : 'j5__field',
                        classFieldUnknown : 'j5__field--unknown',
                        classFieldValid : 'j5__field--valid',
                        classFieldInvalid : 'j5__field--invalid',
                        classFieldError : 'j5__field--error',
                        classFieldWarning : 'j5__field--warning',
                        classFieldOff : 'j5__field--off',

                        classForm : 'j5__form',
                        classFormValid : 'j5__form--valid',
                        classFormInvalid : 'j5__form--invalid',
                        classFormUnknown : 'j5__form--unknown',

                        classMsg : 'j5__msg',
                        classMsgError : 'j5__msg--error',
                        classMsgWarning : 'j5__msg--warning',
                        classMsgValid : 'j5__msg--valid',

                        classLabelError : 'j5__lbl--error',
                        classLabelWarning : 'j5__lbl--warning',
                        classLabelValid : 'j5__lbl--valid',

                        submitSelector : "input[type='submit'],button[type='submit'],input[type='image']",
                        classUnvalidated : 'j5-unvalidated',
                        'class' : 'j5-validator',
                        'strings' : {
                            "Field" : "Field"
                        }
                    };
                    _options = $.extend(defaults, _options);

                return this.each(function () {
                    var $_localThis = $(this),
                        _data = $_localThis.data(_pluginDataPrefix + '_data'),
                        $form = null;

                    // If the plugin hasn't been initialized yet
                    if (!_data) {

    		                	if( $_localThis.prop('tagName') == 'FORM') {
    		                		$form = $_localThis;
    		                	} else {
    		                		$form = $_localThis.closest('form')
    		                	}

                        $_localThis.data('j5-iscontext', true).data(_pluginDataPrefix + '_data', {_target : $_localThis, _targetForm : $form, _options : _options} )
                        .addClass(_options['class']);
                        
                        if( _options.novalidate == true ) {
                            $form.attr('novalidate', '');
                        }

                        _methods.bindFormElements( $_localThis, _options );
                    }
                });
            },

            bindFormElements : function(_target, _options) {


                _allElements = _target.find('input,select,textarea');

                var length = _allElements.length,
                    _lBindingPrefix = 'data-' + _options.prefix + '-',
                    _data = _target.data(_pluginDataPrefix + '_data');
                _data['_allElements'] = _allElements;

                _target.data(_pluginDataPrefix + '_data', _data);

                var _ctx = _pluginDataPrefix + '-context';

                 $(_allElements).data('j5-closest', "." + _options['class']);

                // Bind submitbuttons
                
                _target.on("click check", _options.submitSelector, function(e) {

                	var _target = $(this).closest("." + _options['class']),
                		_data = _target.data(_pluginDataPrefix + '_data');

                        var form = _data._targetForm ? _data._targetForm : _target;

                		if( !form.data(_ctx)) {
                			form.data(_ctx, _target);
                        }

                });

                _target.on("keydown", "input", function(e) {
                	if( e.which == 13) {
        			 e.stopPropagation();	
                	 var _target = $(this).closest("." + _options['class']),
                		_data = _target.data(_pluginDataPrefix + '_data'),
                		form = _data._targetForm ? _data._targetForm : _target;
                		form.data(_ctx, _target);

                        // No submit button? Hm, let's just send the form them.. or not...


                	}

                });

                _data._targetForm.on('submit', function(e) {

                	if( $(this).data(_ctx) ) {
                		//e.preventDefault();

    	            	var $_localThis = $(this);
    	            		c = $_localThis.data(_ctx);
                         
                        ev = c.johnny5('validateForm', true, true);

                        if( ev.type == _eventNameInvalidForm) {
                            e.preventDefault();
                        } else {
                            var _data = c.data(_pluginDataPrefix + '_data');
                            var ev = triggerEvent(c, _data._options, _eventNameSubmitForm, {
                                elements : _data._allElements
                            })
                            if( ev.isDefaultPrevented() )
                                e.preventDefault();
                        }

    	            	$_localThis.removeData(_ctx);
                	}

                })

                _target.on('reset.' + _eventNamespace, function() {
                    // Ok, we 
                 //   console.warn("RESET the elements");
                	$(this).removeData(_ctx);
                });

                for( var i=0; i < length; i++ ) {
                    attr = _allElements[i].attributes,
                    alen = attr.length;
                    _lBindings = [];
                    
                    for( var v in _registeredValidators ){
                        if( _registeredValidators.hasOwnProperty(v) ) {
                            if( $.isFunction(_registeredValidators[v].customBind) ) {
                                if( _registeredValidators[v].customBind($(_allElements[i])) == true ) {
                                    bindSingleFormElement( _target, _allElements[i], v, _options );
                                    _lBindings.push(v);
                                }
                            }
                        } 
                    }
                    

                    for( var j = 0; j < alen; j++) {

                        if( attr[j].name.indexOf(_lBindingPrefix) == 0 || attr[j].name.indexOf('data-') == 0 ) {
                            if(attr[j].name.indexOf(_lBindingPrefix) == 0 ) {
                                _currentValidatorName = attr[j].name.substr(_lBindingPrefix.length);
                            } else {
                                _currentValidatorName = attr[j].name.substr(5);
                            }
                            
                            if( _currentValidatorName ) {
                                if( $.inArray(_currentValidatorName, _lBindings) == -1 && _registeredValidators[ _currentValidatorName ] ) {
                                    bindSingleFormElement( _target, _allElements[i], _currentValidatorName, _options, attr[j].value );
                                    _lBindings.push(_currentValidatorName);
                                }
                            }
                        }
                    }

                   

                    if( _lBindings.length > 0 )
                        $(_allElements[i]).attr('data-' + _options.prefix + '-validators', _lBindings.join(' ') );
                }

            },

            
            validateForm : function(_showAsErrors, _returnEvent) {
                var _data = this.data(_pluginDataPrefix + '_data');

                if( _showAsErrors != true)
                    _showAsErrors = false;

                var ev = triggerEvent(this, _data._options, _eventNameValidatingForm)
                _lElementCount = _data._allElements.length,
                _lInvalidElements = [];
                if( !ev.preventDefault()  ) {
                    for( var i=0; i < _lElementCount; i++) {
                        if (typeof $(_data._allElements[i]).data(_validatorsDataName) != 'undefined') {
                            triggerValidation(this, $(_data._allElements[i]), _data._options, ev);
                            if( $(_data._allElements[i]).data(_pluginDataPrefix + 'Ok') == false) {
                                _lInvalidElements.push(
                                    $(_data._allElements[i]).data('j5-err')
                                );
                            }
                        }
                    }
                }

                if( _lInvalidElements.length > 0 ) {
                    ev = triggerEvent(this, _data._options, _eventNameInvalidForm, {
                        fields : _lInvalidElements
                    });

                } else {
                    ev = triggerEvent(this, _data._options, _eventNameValidform);

                }
                if( _returnEvent == true)
                    return ev;
                else 
                    return this;

            },

            triggerValidation : function(a,b,c) {
                var $this = $( this ),
                    closest = $this.closest( $this.data('j5-closest')),
                    _data = closest.data(_pluginDataPrefix + '_data');

                triggerValidation(_data._target, $this, _data._options, null);
               
            },


            log : function(_options, _text) {
            	if( _options.log && window.console && window.console.log ) {
            		console.log(_text);
            	}
            },

            disable : function(_filter, _keepValue) {

                var _data = this.data(_pluginDataPrefix + '_data');

                if( _data == null ) {
                    var elements = [];
                    for( var i=0; i < this.length; i++) {
                        var $elm = $(this[0]);
                        if( $elm.data('j5-closest') ) {
                            var closest = $elm.closest( $elm.data('j5-closest'));
                            if( closest.length == 1 ) {
                                _data = closest.data(_pluginDataPrefix + '_data');
                                elements.push($elm);
                            }
                        }
                    }

                } else {

                    var elements = _filter ? $(_data._allElements).filter(_filter) : _data._allElements; 
                }

                for( var i=0; i < elements.length; i++) {

                    var e = triggerEvent(_data._target, _data._options, 'disablefield', { 
                        field : elements[i]
                    });

                    $(elements[i]).addClass(_data._options.classFieldOff);

                    if( e.isDefaultPrevented() )
                        continue;

                    resetElement( _data._target, $(elements[i]), _data._options, e, _keepValue);
                }
                return this;

            },

            enable : function(_filter) {
                var _data = this.data(_pluginDataPrefix + '_data');

                if( _data == null ) {
                    var elements = [];
                    for( var i=0; i < this.length; i++) {
                        var $elm = $(this[0]);
                        if( $elm.data('j5-closest') ) {
                            var closest = $elm.closest( $elm.data('j5-closest'));
                            if( closest.length == 1 ) {
                                _data = closest.data(_pluginDataPrefix + '_data');
                                elements.push($elm);
                            }
                        }
                    }
                } else {
                    var elements = _filter ? $(_data._allElements).filter(_filter) : _data._allElements; 
                }

                for( var i=0; i < elements.length; i++) {
                    enableElement( _data._target, $(elements[i]), _data._options, null);
                   // if( _trigger ) {
                   //    triggerValidation(_data._target, $(elements[i]), _data._options, e );
                    //}
                }
                 return this;
            },

            addValidator : function(name, _options){

                var defaults = {
                    parameters : [],
                    strings : { '_default' : name + ' default message'},
                    validate : $.noop,
                    onBeforeBind : $.noop,
                    onAfterBind : $.noop,
                    onGetValue : $.noop,
                    data : {}
                };

                if( typeof name == "string" ) {
                    _options = $.extend(defaults, _options);
                    _registeredValidators[name] = _options;
                    $.johnny5.strings['en'][name] = _options.strings;
                } else {
                    if( name != null && typeof name == "object"  ) {
                        for( var k in name ) {
                            if( name.hasOwnProperty(k) ) {
                                _methods.addValidator(k, name[k]);
                            }
                        }
                    } else {
                        $.error('arg[0]!=string');
                    }
                }

            },

            destroy: function () {
                // Remove all events
                
                return this.each(function () {
                    var $_localThis = $(this),
                        _data = $_localThis.data(_pluginDataPrefix + '_data');
                    // That's right, namespaced events!
                    $_localThis.removeData(_pluginDataPrefix + '_data');
                    $_localThis.off('.' + _eventNamespace, 'input');
                });
            }
            // Add more methods here
        };



        function bindSingleFormElement(_target, elm, _currentValidatorName, _options, value) {

            var $elm = $(elm),
                _lElmSelector = null,
                evto = {};

            if( !$elm.prop('name') && !$elm.prop('id') )
                $elm.prop('id', "v-" + guid());

            _lElmSelector = $elm.prop('name') ? "[name='" + $elm.prop('name') + "']" : '#' + $elm.prop('id')

            $(elm).addClass(_options.classField);
            if( $.isFunction(_registeredValidators[_currentValidatorName].onBeforeBind) &&
                _registeredValidators[_currentValidatorName].onBeforeBind($elm, evto) == false ) 
                return;

            if( $.isFunction(_options.onBeforeBind) &&
                _options.onBeforeBind($elm, evto) == false ) 
                return;

            var _lAttachedValidators = $elm.data(_validatorsDataName),
                _lAttachEvents = false;

            // Ok, what do we have? 
            if( !_lAttachedValidators ) {
                $elm.data(_validatorsDataName, [_currentValidatorName]);
                _lAttachEvents = true;
            } else {
                _lAttachedValidators.push(_currentValidatorName);
                $elm.data(_validatorsDataName, _lAttachedValidators);
            }

            var _lValidatorAttributePrefix = 'data-' + _options.prefix + '-' + _currentValidatorName + '-',
                _lAllValidatorOptions = $elm.data(_validatorOptionsDataName), _lValidatorOptions = {},
                _lAttributeList = $elm[0].attributes;

            if( !_lAllValidatorOptions ) _lAllValidatorOptions = {};

            // Set the property value
            if( value )
                _lValidatorOptions[_currentValidatorName] = value;
            else
                _lValidatorOptions[_currentValidatorName] = $elm.attr(_lValidatorAttributePrefix.substr(0, _lValidatorAttributePrefix.length-1));
            
            if( typeof _lValidatorOptions[_currentValidatorName] == 'undefined' &&
             $.isFunction(_registeredValidators[_currentValidatorName].onGetValue) ) {
                var v = _registeredValidators[_currentValidatorName].onGetValue($elm);
                if( typeof v == "object") 
                    _lValidatorOptions = $.extend(_lValidatorOptions, v);
                else 
                    _lValidatorOptions[_currentValidatorName] = v;
            } 

            // Find all attributes matching
            for( var i = 0; i < _lAttributeList.length; i++ ) {
                var a = _lAttributeList[i];
                if( a.name.indexOf( _lValidatorAttributePrefix ) == 0 ) {
                    _lValidatorOptions[a.name.substr( _lValidatorAttributePrefix.length )] = a.value;
                } else if( a.name.indexOf( 'data-' + _currentValidatorName + '-' ) == 0 ) {
                    _lValidatorOptions[a.name.substr( ('data-' + _currentValidatorName +'-').length )] = a.value;
                }
            }

            _lAllValidatorOptions[_currentValidatorName] = _lValidatorOptions;
            $elm.data(_validatorOptionsDataName, _lAllValidatorOptions)

            if( $.isFunction(_registeredValidators[_currentValidatorName].onAfterBind) ) {
                _registeredValidators[_currentValidatorName].onAfterBind($elm, {target : _target, data : _lValidatorOptions} ) ;
            }

            if( _lAttachEvents ) {

                if( $elm.prop('tagName') == "INPUT" || $elm.prop('tagName') == "TEXTAREA" ) {

                    // Store value in order to detect changes properly
                    $elm.addClass(_options.classFieldUnknown).data('j5-val', $(_lElmSelector).val()); 
                 
                    _target.on('click.'+_eventNamespace+' change.'+_eventNamespace+' keyup.'+_eventNamespace+' blur.'+_eventNamespace, _lElmSelector, function(e) {

                        var $_localThis = $(this),
                            cval = $_localThis.data('j5-val');
                        if( $_localThis.prop('type').toLowerCase() == 'checkbox' || 
                            $_localThis.prop('type').toLowerCase() == 'radio') {
                            cval = $_localThis.is(':checked') ? 1 : 0;
                        }

                        if( $_localThis.val() != cval || ($_localThis.hasClass(_options.classFieldUnknown ) && e.type == 'focusout' ) ) {
                            $_localThis.data('j5-val', $_localThis.val());
                            triggerValidation(_target, $_localThis, _options, e );
                            $_localThis.removeClass(_options.classFieldUnknown);
                        }
                    });
                } else if( $elm.prop('tagName') == 'SELECT' ) {
                    
                    _target.on('change.'+_eventNamespace+' click.'+_eventNamespace, _lElmSelector, function(e) {
                        var $_localThis = $(this);
                        if( $_localThis.val() != $(this).data('j5-val') || ($_localThis.hasClass(_options.classFieldUnknown ) && e.type == 'focusout' ) ) {
                            $_localThis.data('j5-val', $_localThis.val());

                        triggerValidation(_target, $_localThis, _options, e );

                        }

                    });

                }


            }

        }


         function enableElement(_target, $elm, _options, evt) {
             //
            // Trigger the event
            //
            var e = triggerEvent(_target, _options, 'enablefield', { 
                field : $elm[0]
            }, evt);

             if( e.isDefaultPrevented() )
                return;

            $elm.removeClass(_options.classFieldOff)

         }

      /**
         * Generates a GUID string.
         * @returns {String} The generated GUID.
         * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
         * @author Slavik Meltser (slavik@meltser.info).
         * @link http://slavik.meltser.info/?p=142
         */
         function guid() {
            function _p8(s) {
                var p = (Math.random().toString(16)+"000000000").substr(2,8);
                return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
            }
            return _p8() + _p8(true) + _p8(true) + _p8();
        }

         /**
          * [resetElement description]
          * @param  {[type]} _target
          * @param  {[type]} $elm
          * @param  {[type]} _options
          * @param  {[type]} evt
          * @param  {[type]} _keepValue
          * @return {[type]}
          */
        function resetElement(_target, $elm, _options, evt, _keepValue) {

            //
            // Trigger the event
            //
            var e = triggerEvent(_target, _options, 'resetfield', { 
                field : $elm[0]
            }, evt);

            if( e.isDefaultPrevented() )
                return;

            // Reset the element..
            if( _keepValue != true )
            $elm.val($elm.prop('defaultValue'));

            resetElementMsg(_target, $elm, _options);
            $elm.removeClass( _options.classFieldValid + " " + _options.classFieldWarning + " " + _options.classFieldError + " " + _options.classFieldInvalid )
            .addClass( _options.classFieldUnknown);
            

        }

        function _(_text, options) {
            if( options.strings[_text] ) {
                return options.strings[_text];
            } else {
                return _text;
            }
        }

        function triggerValidation(_target, $elm, _options, evt) {

            var _lValidations = $elm.data(_validatorsDataName),
                _lErrorMessage = "",
                errorRule = "";


            if( !_lValidations ) {
                return;
            } 

            if( $elm.hasClass(_options.classFieldOff) )
                return;
          
            for(var i=0; i < _lValidations.length; i++) {
                if( $.isFunction(_registeredValidators[_lValidations[i]].validate) ) {
                    var _lValidatorOptions = $elm.data(_validatorOptionsDataName),
                        _validator = _registeredValidators[_lValidations[i]],
                        validatorName = _lValidations[i];

                    var o = {
                        'data' : _lValidatorOptions[_lValidations[i]],
                        'event' : evt
                    };

                    var _lMacros = {};

                    _lMacros['Field'] = $elm.attr('name') ? $elm.attr('name') : $elm.attr('id');

                    // Attempt to find the label for the field in order to 
                    // use it as a macro value
                    if( $elm.attr('id') ) {
                        l = _target.find("label[for='" + $elm.attr('id') + "']");
                        if( l.length > 0) {
                            _lMacros['Field'] = l.text();
                            _lMacros['Label'] = _lMacros['Field'];
                        }
                    }

                    var check = _registeredValidators[_lValidations[i]].validate($elm, o),
                        _dataprefix = 'data-' + _options.prefix + '-' + _lValidations[i],
                        _shortdataprefix = 'data-' + _lValidations[i],
                        attr = [];

                   if( typeof check == 'boolean' && check == true ) {
                    continue;
                   } else {

                    var stringKey = check,
                        validatorMacros = {};

                    if( typeof check == 'object' ) {

                        if( check.length && check.length == 2 && check[0] &&  typeof check[0] == 'string' ) {
                            stringKey = check[0];
                            validatorMacros = check[1];
                        }
                     } else if(typeof check == "string" ) {
                        stringKey = check;                
                    } else {
                        stringKey = '';
                        if( typeof check == 'boolean')
                            stringKey = 'default';
                    }

                    if (stringKey && stringKey != 'default') {
                        attr.push(_dataprefix + '-' + stringKey + '-msg');
                        attr.push(_shortdataprefix + '-' + stringKey + '-msg');
                    }
                    attr.push(_dataprefix + '-msg');
                    attr.push(_shortdataprefix + '-msg');
                    
                    for( var attr_i=0; attr_i < attr.length; attr_i++){
                        if( $elm.attr(attr[attr_i]) ) {
                            _lErrorMessage = $elm.attr(attr[attr_i]);
                            break;
                        }
                    }

                    if( stringKey && !_lErrorMessage ) {
                        // Just the name of the message
                        m = getValidatorString(_options.lang, validatorName, stringKey);
                        if( m )
                            _lErrorMessage = m;
                    }

                    if( !_lErrorMessage )
                        _lErrorMessage = $.johnny5.strings['en']['_default'];


                    if( _lErrorMessage.indexOf('$') != 0) {

                        _lMacros = $.extend( _lMacros, validatorMacros);
                        
                        var _newstring = _lErrorMessage;

                        _pattern = /\{\?([^\|]+)([^\}]+\})/g;
                        _match = null;
                        while( (_match = _pattern.exec(_newstring)) ) {
                            var m = replaceMacros(_match[1], _lMacros, true );
                            if( m != null ) {
                                _newstring = _newstring.replace(_match[0], m);
                            } else {
                                _newstring = _newstring.replace(_match[0], _match[2].substr(0, _match[2].length-1).substr(1));
                            }
                        }

                        _newstring = replaceMacros(_newstring, _lMacros);

                        _lErrorMessage = _newstring;
                  
                    }

                    }
                }
            }

            if( _lErrorMessage.length == 0 ) {
                elementIsValid(_target, $elm, evt, _options);
            } else {
                var _showAsErrors = false;
                if( evt && evt.type == _eventNameValidatingForm) {
                    _showAsErrors = true;
                }

                elementIsInvalid(_target, $elm, evt, _options, errorRule, _lErrorMessage, _showAsErrors);
            }



        }


        function replaceMacros(str, macros, emptyIfNotExists) {
            var _pattern = /\{\$([A-Za-z0-9]+)(\|.+|)\}/g,
                _match,
                _newstring = str;

                if( emptyIfNotExists == true ) {
                    _pattern = /\\?\$([A-Za-z0-9]+)/g;
                     while( (_match = _pattern.exec(str)) ) {
                        if( macros[_match[1]] ) {
                            var t = _match[0];
                                if( t.substr(0,1) == '$' ) {
                                    _newstring = _newstring.replace(t, macros[_match[1]]);
                            }
                        } else {
                            return null;
                        }
                    }
                } else {
                     while( (_match = _pattern.exec(str)) ) {

                        if( macros[_match[1]] ) {   
                            _newstring = _newstring.replace(_match[0], macros[_match[1]]);
                        } else {
                            var rep = "";
                            if( _match[2] ) {
                                rep = _match[2].substr(1);
                            }
                            _newstring = _newstring.replace(_match[0], rep);
                        }
                    }
                }
           

            return _newstring   ;
        }


        function getValidatorString(lang, validatorName, stringName) {
            if( !$.johnny5.strings[lang] ) {
                if( lang != 'en')
                    return getValidatorString('en', validatorName, stringName)
                else 
                    // return default error message if the language was not found
                    return $.johnny5.strings['en']['_default'];
            }

            if( $.johnny5.strings[lang][validatorName] ) {
                if( $.johnny5.strings[lang][validatorName][stringName] ) {
                    return $.johnny5.strings[lang][validatorName][stringName];
                }
            }

            if( lang != 'en')
                return getValidatorString('en', validatorName, stringName)
        
            return null;    
        }


        function bytesToSize(bytes) {
           var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
           if (bytes == 0) return '0 Bytes';
           var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
           return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };


        function elementIsValid(_target, $elm, evt, _options) {

            $elm.data(_pluginDataPrefix + 'Ok', true);
            $elm.data('j5-msg', null);

              if( evt && evt.isPropagationStopped() )
                return;

            // Check if this event should always be triggered
            if( !_options.alwaysTriggerEvents ) {
                if( $elm.data(_pluginDataPrefix + '_elementStatus') == ".")
                    return;
                $elm.data(_pluginDataPrefix + '_elementStatus', ".");
             }

            //
            // Trigger the validated event
            //
            var e = triggerEvent($elm, _options, 'validfield', { 
                field : $elm[0]
            }, evt),
            _lFormGroup,
            _lFeedbackIcon,
            _lErrcontainer;


            if( e.isDefaultPrevented() )
                return;

            $elm.removeClass(_options.classFieldUnknown + " " + _options.classFieldInvalid + " " + _options.classFieldWarning + " " + _options.classFieldError)
            .addClass(_options.classFieldValid);

            resetElementMsg(_target, $elm, _options);
            _target.find("label[for='" + $elm.attr('id') + "']")
            .addClass(_options.classLabelValid);
        }

        function resetElementMsg(_target, $elm, _options) {
              var $s = $elm.parent().prop('tagName') == 'LABEL' ? $elm.parent() : $elm;

            _target.find("label[for='" + $elm.attr('id') + "']")
            .removeClass(_options.classLabelError + ' ' + _options.classLabelWarning + " " + _options.classLabelValid);

            var _lErrcontainer = $s.next('.' + _options.classMsg).first(),
            o = _lErrcontainer.data(_options._pluginDataPrefix + '-orig' );
            if( _lErrcontainer.length != 0) {
             _lErrcontainer.removeClass(_options.classMsgValid + ' ' + _options.classMsgWarning + ' ' + _options.classMsgError);

            if( o ) {
                _lErrcontainer.addClass(_options.classMsgValid).html(o);
            } else
             _lErrcontainer.empty().hide();
            }

        }

        function triggerEvent(_target, _options, name, eData, evt) {
            var _data, _context = _target;

            if( _target.data('j5-closest') ) {
                _context = _target.closest(_target.data('j5-closest'));
            }



            _data = _context.data(_pluginDataPrefix + '_data'),
                o = $.extend({
                        context : _context,
                        form : _data._targetForm[0]
                    }, eData),
                e = jQuery.Event( name + '.' + _eventNamespace );

            if( evt ) {
                o['event'] = evt;
            }

            _target.trigger(e, o);
            return e;
        }

        function elementIsInvalid(_target, $elm, evt, _options, _currentValidatorName, _message, _showAsErrors) {

            $elm.data(_pluginDataPrefix + 'Ok', false);


             if( evt && evt.isPropagationStopped() )
                return;

            // Check if this event should always be triggered
            if( !_options.alwaysTriggerEvents ) {
                if( $elm.data(_pluginDataPrefix + '_elementStatus') == _currentValidatorName + _message + _showAsErrors)
                    return;
                $elm.data(_pluginDataPrefix + '_elementStatus', _currentValidatorName + _message + _showAsErrors);
             }

             $elm.data('j5-err', {
                field : $elm[0],
                message : _message,
                validator : _currentValidatorName
            }); 


            //
            // Trigger the validated event
            //
            var e = triggerEvent($elm, _options, _eventNameInvalidField, { 
                field : $elm[0],
                validator : _currentValidatorName,
                message : _message,
                type : _showAsErrors ? 'error' : 'warning'
            },evt);

            if( e.isDefaultPrevented() )
                return;

            $elm.removeClass(_options.classFieldUnknown + " " +_options.classFieldValid + " " + _options.classFieldWarning + " " + _options.classFieldError)
            .addClass(_options.classFieldInvalid)
            .addClass( _showAsErrors ? _options.classFieldError : _options.classFieldWarning);



            var $s = $elm.parent().prop('tagName') == 'LABEL' ? $elm.parent() : $elm;

            _target.find("label[for='" + $elm.attr('id') + "']")
            .removeClass(_options.classLabelValid + " " + _options.classLabelError + " " + _options.classLabelWarning)
            .addClass(_showAsErrors ? _options.classLabelError : _options.classLabelWarning);


    		 var _lErrcontainer = $s.next('.' + _options.classMsg).first();
    		 if( _lErrcontainer.length == 0) {
    		 		_lErrcontainer = $('<span></span>').data(_options._pluginDataPrefix + '-c', 1).addClass(_options.classMsg).insertAfter($s);
    		 } else {
                if( !_lErrcontainer.data(_options._pluginDataPrefix + '-c') ) {
                    if( !_lErrcontainer.data(_options._pluginDataPrefix + '-orig') )
                        _lErrcontainer.data(_options._pluginDataPrefix + '-orig', _lErrcontainer.html());
                }
             }

    		 _lErrcontainer.removeClass(_options.classMsgValid + ' ' + _options.classMsgWarning + " " + _options.classMsgError)
             .addClass(_showAsErrors ? _options.classMsgError : _options.classMsgWarning).show().html(_message);
        }


        $.fn.johnny5 = function (m) {
            if (_methods[m]) {
                return _methods[m].apply(this, Array.prototype.slice.call(arguments,
                    1));
            } else if (typeof m === 'object' || !m) {
                return _methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + m + ' does not exist on jQuery.johnny5');
            }
        };



        $.johnny5 = {
            strings : {
              'en' : {
                '_default' : 'Field is not valid'
              }
            },
            setStrings : function(lang, translations) {
                
                if( !$.johnny5.strings[lang] )
                    $.johnny5.strings = {};

                for( var validator in translations )
                    if( translations.hasOwnProperty(validator)) {
                        if( !$.johnny5.strings[lang][validator] )
                            $.johnny5.strings[lang][validator] = {};

                        $.johnny5.strings[lang][validator] = $.extend($.johnny5.strings[lang][validator], 
                            translations[validator]);
                    }


            }
        };



        // Add built in validators
        $.fn.johnny5('addValidator', {

            security : {
                strings : {
                    'default' : 'Password does not meet requirements'
                },
                validate : function($elm, _options) {
                    (!_options.data.security) && (_options.data.security = 4);
                    (!_options.data.policy) && (_options.data.policy = 'luns');
                    var specials = '!@#$%^&*()_+|~-=\‘{}[]:";’<>?,./';

                    _options.data.policy = _options.data.policy.toLowerCase();
                    _options.data.security = parseInt(_options.data.security);
                    var _count = 0,
                        _val = $elm.val();


                    if( _options.data.policy.indexOf('l') != -1) {
                        _count += ( _val.match(/[a-z]/) ? 1 : 0 );
                    }

                    if( _options.data.policy.indexOf('u') != -1)
                        _count += ( _val.match(/[A-Z]/) ? 1 : 0 );

                    if( _options.data.policy.indexOf('n') != -1)
                        _count += ( _val.match(/\d/) ? 1 : 0 );


                    if( _options.data.policy.indexOf('s') != -1) {
                        var re = new RegExp("[" + specials.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "]");
                        if( _val.match(re) )
                            _count++;
                    }

                    if( _count < _options.data.security)
                        return 'default';

                    return true;
                }
            },

            //
            // Required Validator
            // macros: $extension
            required : {
                strings : {
                    'default' : 'Field is required',
                    'list' : 'You must select an item',
                    'checkbox' : 'You must check this box',
                    'radio' : 'You must select this option',
                    'extensions' : 'The selected extension ({$extention}) is not allowed'
                },

                /**
                 * [validate description]
                 * @param  {[type]} $elm
                 * @param  {[type]} _options
                 * @return {[type]}
                 */
                validate : function($elm, _options){

                    _options.data = $.extend({
                        'index' : null,
                        'value' : null
                    },_options.data);
                    
                    if( $elm.prop('tagName') == 'SELECT' && $elm.prop('multiple')) {
                        return $elm.find('option:selected').length > 0 ? true : 'list';
                    } else if( $elm.prop('tagName') == 'SELECT' && !$elm.attr('multiple') && _options.data.index) {
                        var index = parseInt(_options.data.index);
                        if( !isNaN(index) )
                            return $elm.find('option:selected').first().index() == index ? 'default' : true;
                        else 
                            $.error("required.index is not a number");
                    } else if( $elm.prop('tagName') == 'SELECT' && !$elm.attr('multiple') && _options.data.value) {
                        return $elm.find('option:selected').first().val() == _options.data.value ? 'default' : true;
                    } else if( $elm.prop('tagName') == 'INPUT' && ($elm.attr('type') == 'checkbox' || $elm.attr('type') == 'radio' )) {
                        return $elm.is(':checked') ? true : 'checkbox';
                    } else if( $.trim($elm.val()).length > 0 && $elm.prop('tagName') == 'INPUT' && $elm.attr('type') == 'file' && _options.data.extensions) {

                      var e = _options.data.extensions.split(','), pattern = "";
                      for( var i=0; i < e.length; i++) {
                        var ext = $.trim(e[i]);
                        if( ext.indexOf('.') == 0)
                            ext =  ext.substr(1);
                        pattern += (pattern?"|":"") +  ext;
                      }

                      var r = new RegExp("\.(" + pattern + ")$");
                      if( r.test($elm.val()) ) 
                        return true;
                      else {
                        if( _options.data['extensions-msg'])
                            return _options.data['extensions-msg'];
                        else 
                            return ['extensions', {
                                extensions : _options.data.extensions,
                                extension : $elm.val().substr( $elm.val().lastIndexOf('.') )
                            }];
                    }

                    }
                    return $.trim($elm.val()).length > 0;
                },
               
                // We want to bind on the html5 required attribute
                customBind : function($elm) {
                    if( $elm.attr('required') ) {
                        return true;
                    }
                },
                onAfterBind : function($elm, _options) {

                    if( $elm.prop('type').toLowerCase() == 'radio') {

                        // Find all radios with the same name
                        var confirm = $elm.data('confirmelement'),
                        target = $(_options.target);

                        var el = target.find("input[type='radio']").not('#' + $elm.attr('id'));
                        
                        el.addClass('required-ref').change(function() {
                            $elm.johnny5('triggerValidation');
                        })
                    }
                }
            },

            /**
             * 
             * @type {Object}
             * Macros: parsed   - value parsed to a number 
             */
            number : {
                strings : {
                    'default' : 'Value is not a number'
                },
                
                validate : function($elm, _options) {

                     if( $elm.val().length == 0 ) 
                        return true;

                    if( _options.data['step'] == "any") {
                        var n = 1.1;n = n.toLocaleString().substring(1, 2);
                        var r = new RegExp("^\\d+(\\" + n + "\\d+|)$");
                        if( !r.test($elm.val()) )
                            return false
                    } else if( !$elm.val().match(/^\d+$/ ) )
                        return false;

                    return true;
                    
                },
                customBind : function($elm) {
                    if( $elm.attr('type') == 'number' && $elm.prop('tagName') == 'INPUT' ) {
                        return true;
                    }
                },
                // For custom bindings the default value may not always
                // be retreived from the data- attribute
                onGetValue : function($elm) {
                    if( $elm.attr('step') ) 
                        return { step : $elm.attr('step') };
                    return { step : 1 };
                }
            },

            /**
             * [url description]
             * @type {Object}
             */
            url : {
                strings : {
                    'default' : 'Not a valid url'
                },
                validate : function($elm, _options) {
                    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test($elm.val());
                },
                customBind : function($elm) {
                    if( $elm.attr('type') == 'url' && $elm.prop('tagName') == 'INPUT' ) {
                        return true;
                    }
                }
            },

            /**
             *
             * Macros: $maxsize - human redable allowed size
             *         $filesize    - human readable file size
             *         $max         - rule value
             * @type {Object}
             */
            max : {
                strings : {
                    'default' : 'Value too large',
                    'number' : 'Number must be {$max} or lower',
                    'select' : 'You can not select more than {$max} item(s)',
                    'file' : 'File size{? ($filesize)|} is larger than {$maxsize|allowed}',
                    'date' : "Date can not be later than {$max}"
                },
                validate : function($elm, _options) {

                    var validators = $elm.data('j5v'),
                        max = _options.data.max;

                    if( $elm.prop('tagName') == 'SELECT' ) {
     
                        if( $elm.attr('multiple') ) {
                            max = parseInt(max);
                            if( $elm.find('option:selected').length > max  )
                                return ['select', {
                                    'max' : max
                                }];
                        }
                        return true;
                    }

                    // No value? Let it validate.
                    // Leave that to the required rule instead
                    if( $elm.val().length == 0 ) 
                        return true;

                    if( $elm.attr('type') == 'file' ) {
                        if( $elm[0].files && $elm[0].files.length > 0 ) {
                            if(  $elm[0].files[0].size > parseInt(_options.data.max)) {
                                 return ['file', {
                                    'max' : max,
                                    'file' : $elm[0].files[0].size,
                                    'maxsize' : bytesToSize(_options.data.max),
                                    'filesize' : bytesToSize($elm[0].files[0].size)
                                }];
                            } else 
                                return true;
                        }
                    }


                    if( $.inArray('date', validators) != -1 ) {
                        var val = new Date($elm.val()),
                            maxdate = new Date(_options.data.max);

                        if(val.getTime() <= maxdate.getTime() )
                            return true
                        else 
                            return 'date';
                    }
                    
                    var max = _options.data.max, val = $elm.val();
                    if( $elm.attr('step') == 'any') {
                        val = parseFloat(val);
                        max = parseFloat(max);
                    } else {
                        val = parseInt(val);
                        max = parseInt(max);
                    }

                    if( val > max )
                        return ["number", { max : max }];

                    return true;

                },
                // For custom bindings the default value may not always
                // be retreived from the data- attribute
                onGetValue : function($elm) {
                    if( $elm.attr('max') ) 
                        return $elm.attr('max');
                    return null;
                },
                customBind : function($elm) {
                    if( $elm.attr('max') ) {
                        return true;
                    }
                }
            },
            min : {
                strings : {
                    'text' : 'Value most be at least {$min} characters',
                    'date' : 'Date must be at least {$min}',
                    'number' : 'Number must be {$min} or higher',
                    'month' : 'Month must be {$min} or higher',
                    'week' : 'Week must be {$min} or higher',
                    'file' : 'File size{? ($filesize)|} is smaller than {$minsize|allowed}',
                    'list' : 'You must select at least {$min} item(s)'
                },
                validate : function($elm, _options) {

                    var _lElementType = $elm.prop('type').toLowerCase(),
                        _min = parseInt(_options.data.min);

                    // Determine datatype
                    if( $elm.prop('tagName') == 'SELECT' ) {
                        if( !$elm.attr('multiple') )
                            return true;

                        if( $elm.find('option:selected').length < _min )
                            return ['list', { min : _min }];
                        return true;

                    }

                    if( _lElementType == 'text') {
                        var _v = $elm.data('j5-opt');
                        if( _v['number'] ) {
                            _lElementType = "number";
                        }
                        if( _v['date'] ) {
                            _lElementType = "date";
                        }
                    } 

                    switch( _lElementType ) {
                        case 'date':
                            var d = new Date($elm.val()),
                                minDate = new Date(_options.data.min);
                                console.warn(minDate);
                                $elm.data('j5-mindate', minDate);
                            if( !isNaN(d.getTime()) ) {
                                if( d.getTime() < minDate.getTime() )
                                    return ['date', {min : _options.data.min }];
                            }
                            // Not a valid date? Then we don't care
                            return true;
                        break;
                         case 'number':
                            var num = parseInt($elm.val()),
                                min = parseInt(_options.data.min);

                            if( !isNaN(num) && !isNaN(min) ) {
                                if( num < min )
                                    return ['number', { min : min} ];
                            }
                        break;
                        case 'file':
                            if( $elm[0].files && $elm[0].files.length > 0 ) {
                                if(  $elm[0].files[0].size < parseInt(_options.data.min)) {
                                     return ['file', {
                                        'min' : min,
                                        'file' : $elm[0].files[0].size,
                                        'minsize' : bytesToSize(_options.data.min),
                                        'filesize' : bytesToSize($elm[0].files[0].size)
                                    }];
                                } else 
                                    return true;
                            }
                        break;
                        default:

                            // No value? Let it validate.
                            // Leave that to the required rule instead
                            if( $elm.val().length == 0 ) 
                                return true;

                            if( $elm.val().length < _min)
                                return ['text', { min : _min}];
                        break;
                    }

                    return true;
                },

                // For custom bindings the default value may not always
                // be retreived from the data- attribute
                onGetValue : function($elm) {
                    if( $elm.attr('min') ) 
                        return $elm.attr('min');
                    return null;
                },
                customBind : function($elm) {

                    if( $elm.attr('min')  ) {
                        return true;
                    }
                }
            },


            /**
             * 
             * @type {Object}
             */
            pattern : {
                strings : {
                    'default' : 'Please match the requested format {$title}'
                },
                validate : function($elm, _options) {
                    if($elm.val().length == 0)  return true;

                    if( _options.data.pattern ) {
                        var r = new RegExp( _options.data.pattern);

                        if( !r.test($elm.val()) ) {
                            return ['default', {
                                title : $elm.attr('title')
                            }];
                        }

                    }
                    return true;
                },
                customBind : function($elm) {

                    if( $elm.attr('pattern') ) {
                        return true;
                    }
                },
                // For custom bindings the default value may not always
                // be retreived from the data- attribute
                onGetValue : function($elm) {
                    if( $elm.attr('pattern') ) 
                        return $elm.attr('pattern');
                    return null;
                }

            },
            confirm : {
                strings : {
                    'default' : 'Values do not match'
                },
                validate : function($elm, _options) {
                    //if($elm.val().length == 0) return true;

                    var confirm = $elm.data('confirmelement');

                   
                    if( confirm ) {
                        if( confirm.val() != $elm.val() )
                            return 'default';
                    }

                    return true;
                },
                onAfterBind : function($elm, _options) {
                    var confirm = $elm.data('confirmelement'),
                    target = $(_options.target);
                    if( _options.data.confirm.indexOf('#') == 0)
                        confirm = $(_options.data.confirm);
                    else {
                        confirm = target.find(_options.data.confirm);
                        if(confirm.length == 0) {
                            confirm = target.find("input[name='" + _options.data.confirm + "']")
                        }
                    }
                    
                    if(!confirm) {
                        $.error("[j5.confirm] Element not found: " + _options.data.confirm);
                    } else {
                        $elm.data('confirmelement', confirm);
                    
                        confirm.keyup('keyup change blur', function() {
                            $elm.johnny5('triggerValidation');
                        })
                    }


                }
            
            },

            email : {
                strings : {
                    'default' : 'Not a valid e-mail address'
                },
                validate : function($elm, _options) {
                    
                    // No value? Let it validate.
                    // Leave that to the required rule instead
                    if( $elm.val().length == 0 ) 
                        return true;

                    if( /^([0-9a-zA-Z]([-\.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/.test($elm.val()) ) {
                        return true;
                    }
                    return 'default';
                },
                beforeBind : function() {
                    // Evaluate if the browser has built in support or not...
                },
                customBind : function($elm) {
                    if( $elm.attr('type') == 'email' && $elm.prop('tagName') == 'INPUT' ) {
                        return true;
                    }
                }

            },
            date : {
                strings : {
                    'default' : 'Not a valid date'
                },
                validate : function($elm, _options) {
                    var d = new Date($elm.val());
                    if ( Object.prototype.toString.call(d) !== "[object Date]" )
                        return 'default';
                    
                    if( isNaN(d.getTime()) )
                        return 'default';

                    return true;
                },
                beforeBind : function() {
                    // Evaluate if the browser has built in support or not...
                },
                customBind : function($elm) {
                    if( $elm.attr('type') == 'date' && $elm.prop('tagName') == 'INPUT' ) {
                        return true;
                    }
                }

            }
        });

         window.johnny5 = {
            defaults : {

            }
        };

    })(jQuery, window);
    console.warn(window);
