(function( $ ) {
	var $t = this.$element;

	$.Shop = function( element ) {
		$t = $( element ); // top-level element
		this.init();
	};

	$.Shop.prototype = {
		init : function() {
			// initializes properties and methods
			this.cartPrefix 	= "winery-";
			this.cartName 		= this.cartPrefix + "cart";
			this.shippingRates 	= this.cartPrefix + "shipping-rates";
			this.total 			= this.cartPrefix + "total";
			this.storage		= sessionStorage;

			this.$formAddToCart 		= $t.find("form.add-to-cart");
			this.$formCart 				= $t.find("#shopping-cart");
			this.$checkoutCart			= $t.find("#checkout-cart");
			this.$checkoutOrderForm 	= $t.find("checkout-order-form");
			this.$shipping 				= $t.find("#sshipping");
			this.$subtotal 				= $t.find("#stotal");
			this.$shoppingCartActions 	= $t.find("#shopping-cart-actions");
			this.$updateCartBtn			= this.$shoppingCartActions.find("#update-cart");
			this.$emptyCartBtn 			= this.$shoppingCartActions.find("#empty-cart");
			this.$userDetails			= $t.find("#paypal-form");

			this.currency 				= "&euro;";
			this.currencyString 		= "€";
			this.paypalCurrency 		= "EUR";
			this.paypalBusinessEmail 	= "dudley9@gmail.com";
			this.paypalURL 				= "https://www.sandbox.paypal.com/cgi-bin/webscr";

			this.requiredFields = {
				expression: {
					value: /^([\w-\.]+)@((?:[\w]+\.)+)([a-z]){2,4}$/
				},
				
				str: {
					value: ""
				}
				
			};
			
		},

		createCart : function () {
			if ( this.storage.getItem( this.cartName ) == null ) {
				var cart 	= {};
				cart.items 	= [];

				this.storage.setItem( this.cartName, this._toJSONString(cart));
				this.storage.setItem( this.shippingRates, "0" );
				this.storage.setItem( this.total, "0");
			}
		},

		_addToCart : function ( values ) {
			var cart 	 = this.storage.getItem( this.cartName);
			var cartObj  = this._toJSONObject( cart );
			var cartCopy = cartObj;
			var items = cartCopy.items;
			items.push( values );

			this.storage.setItem( this.cartName, this._toJSONString( cartCopy ));
		},

		_calculateShipping : function( qty ) {
			var shipping = 0;

			if ( qty >=6 ) {
				shipping = 10;
			}

			if ( qty >= 12 && qty <= 30 ) {
				shipping = 20;
			}

			if ( qty > 30 && qty <= 60 ) {
				shipping = 30;
			}

			if ( qty > 60 ) {
				shipping = 0;
			}

			return shipping;
		},

		_convertNumber : function ( n ) {
			var str = n.toString();
			return str;
		}

		_convertString : function ( numStr ) {
			var num;

			if ( /^[-=]?[0-9]+.[0-9]+$/.test( numStr ) ) {
				num = parseFloat( numStr );
			} else if ( /^d+$/.test( numStr )) {
				num = parseInt( numStr );
			} else {
				num = Number( numStr );
			}

			if ( !isNaN( num )) {
				return num;
			} else {
				console.warn( numStr + " cannot be converted into a number");
				return false;
			}
		},

		_emptyCart : function () {
			this.storage.clear();
		},

		_extractPrice : function ( element ) {
			var self 	= this;
			var text 	= $.trim( element.text() );
			var price 	= text
				.replace( self.currencyString, "")
				.replace(" ", "");

			return price;
		}

		_formatNumber : function ( num, places ) {
			var n = num.toFixed( places)
		},

		_saveFormData :  function ( form ) {
			var self = this;
			var $visibleSet = form.find( "fieldset:visible");

			$visibleSet.each( function () {
				var $set = $( this );
				var _ss = self.storage;

				if ( $set.is("#fieldset-billing" )) {
					var name 	= $( "#name", 	 $set ).val();
					var email 	= $( "#email", 	 $set ).val();
					var city 	= $( "#city", 	 $set ).val();
					var address = $( "#address", $set ).val();
					var zip 	= $( "#zip", 	 $set ).val();
					var country = $( "#country", $set ).val();

					_ss.setItem( "billing-name", 	name );
					_ss.setItem( "billing-email", 	email );
					_ss.setItem( "billing-city", 	city );
					_ss.setItem( "billing-address", address );
					_ss.setItem( "billing-zip", 	zip );
					_ss.setItem( "billing-country", country );
				} else {
					var sName 	  = $( "#sname", 	$set ).val();
					var sEmail 	  = $( "#semail", 	$set ).val();
					var sCity 	  = $( "#scity", 	$set ).val();
					var sAddress  = $( "#saddress", $set ).val();
					var sZip 	  = $( "#szip", 	$set ).val();
					var sCountry  = $( "#scountry", $set ).val();

					_ss.setItem( "shipping-name", 	 name );
					_ss.setItem( "shipping-email", 	 email );
					_ss.setItem( "shipping-city", 	 city );
					_ss.setItem( "shipping-address", address );
					_ss.setItem( "shipping-zip",	 zip );
					_ss.setItem( "shipping-country", country );					
				}
			});
		},

		_toJSONObject : function( str ) {
			var obj = JSON.parse( str );
			return obj;
		},

		_toJSONString : function( obj ) {
			var str = JSON.stringify( obj );
			return str;
		},

		_validateForm : function ( form ) {
			var self 		= this;
			var fields 		= self.requiredFields;
			var $visibleSet = form.find("fieldset:visible");

			form.find(".message").remove();

			$visibleSet.each( function () {
				$( this ).find( ":input" ).each( function () {
					var $input  = $( this );
					var type 	= $input.data( "type" );
					var msg 	= $input.data( "message" );

					if ( type == "string" ) {
						if ( $input.val() == fields.str.value ) {
							$( "<span class='message'/>" ).text( msg )
								.insertBefore( $input );

							valid = false;
						}
					} else {
						if ( !fields.expression.value.test( $input.val() )) {
							$( "<span class='message'/>" ).text( msg )
								.insertBefore( $input );

							valid = false;
						}
					}
				});
			});

			return valid;
		}
	};

	$(function() {
		var shop = new $.Shop( "#site" ); // object's instance
		console.log(shop.$element);
	});

})( jQuery );