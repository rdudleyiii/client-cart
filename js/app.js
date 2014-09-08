(function( $ ) {
	$.Shop = function( element ) {
		this.$element = $( element ); // top-level element
		this.init();
	};

	$.Shop.prototype = {
		init: function() {
			// initializes properties and methods
		}
	};

	$(function() {
		var shop = new $.Shop( "#site" ); // object's instance
	});

})( jQuery );