( function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined'
		? ( module.exports = factory() )
		: typeof define === 'function' && define.amd
		? define( factory )
		: ( ( global =
				typeof globalThis !== 'undefined'
					? globalThis
					: global || self ),
		  ( global.MotionFlow = factory() ) );
} )( this, function () {
	'use strict';

	// src/core/utils.js

	function getAttr( el, name, fallback = null ) {
		const val = el.getAttribute( name );
		return val !== null ? val : fallback;
	}

	// src/core/animator.js

	function animateElement( el ) {
		const delay = getAttr( el, 'data-mf-delay' );
		const duration = getAttr( el, 'data-mf-duration' );
		const easing = getAttr( el, 'data-mf-easing', 'ease' );

		if ( delay ) el.style.transitionDelay = delay + 'ms';
		if ( duration ) el.style.transitionDuration = duration + 'ms';
		if ( easing ) el.style.transitionTimingFunction = easing;

		el.classList.add( 'mf-animate' );
	}

	// src/core/observer.js

	function initObserver() {
		const elements = document.querySelectorAll( '[data-mf]' );

		if ( ! elements.length ) return;

		const observer = new IntersectionObserver(
			( entries, obs ) => {
				entries.forEach( ( entry ) => {
					if ( entry.isIntersecting ) {
						animateElement( entry.target );
						obs.unobserve( entry.target );
					}
				} );
			},
			{ threshold: 0.2 }
		);

		elements.forEach( ( el ) => observer.observe( el ) );
	}

	// src/core/parallax.js

	function initParallax() {
		const items = document.querySelectorAll( '[data-mf-parallax]' );
		if ( ! items.length ) return;

		function onScroll() {
			const scrollTop = window.scrollY;

			items.forEach( ( el ) => {
				const speed =
					parseFloat( el.getAttribute( 'data-mf-parallax' ) ) || 0.3;
				el.style.transform = `translateY(${ scrollTop * speed }px)`;
			} );
		}

		window.addEventListener( 'scroll', onScroll );
		onScroll();
	}

	const MotionFlow = {
		init() {
			initObserver();
			initParallax();
		},
	};

	document.addEventListener( 'DOMContentLoaded', () => {
		MotionFlow.init();
	} );

	return MotionFlow;
} );
//# sourceMappingURL=motionflow.js.map
