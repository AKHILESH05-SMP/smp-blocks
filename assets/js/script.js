document.addEventListener( 'DOMContentLoaded', function () {
	/* ============================================================
     SEARCH FUNCTIONALITY — RUN ONLY IF SEARCH ELEMENT EXISTS
  ============================================================ */
	if (
		document.querySelector( '.search-trigger' ) ||
		document.querySelector( '#search-input' )
	) {
		const searchInput = document.querySelector( '#search-input' );

		function toggleSearch() {
			document.body.classList.toggle( 'search-open' );

			if (
				document.body.classList.contains( 'search-open' ) &&
				searchInput
			) {
				setTimeout( () => {
					searchInput.focus();
					searchInput.select();
				}, 150 );
			}
		}

		function closeSearch() {
			document.body.classList.remove( 'search-open' );
		}

		function closeNav() {
			const navCollapse = document.querySelector(
				'.navbar-collapse.show'
			);
			if ( navCollapse ) {
				const bsCollapse =
					bootstrap.Collapse.getInstance( navCollapse );
				if ( bsCollapse ) bsCollapse.hide();
			}
			document.body.classList.remove( 'nav-open' );
		}

		// Search Trigger
		document.querySelectorAll( '.search-trigger' ).forEach( ( trigger ) => {
			trigger.addEventListener( 'click', function ( e ) {
				e.preventDefault();

				if ( document.body.classList.contains( 'nav-open' ) ) {
					closeNav();
					setTimeout( () => {
						toggleSearch();
					}, 300 );
				} else {
					toggleSearch();
				}
			} );
		} );

		// Page Overlay — close both
		document.querySelectorAll( '.page-overlay' ).forEach( ( overlay ) => {
			overlay.addEventListener( 'click', function ( e ) {
				e.preventDefault();
				closeSearch();
				closeNav();
			} );
		} );

		// Bootstrap Nav collapse events
		const navCollapse = document.querySelector( '.navbar-collapse' );

		if ( navCollapse ) {
			navCollapse.addEventListener( 'shown.bs.collapse', function () {
				document.body.classList.add( 'nav-open' );

				if ( document.body.classList.contains( 'search-open' ) ) {
					closeSearch();
				}
			} );

			navCollapse.addEventListener( 'hidden.bs.collapse', function () {
				document.body.classList.remove( 'nav-open' );
			} );
		}
	} // END Search Block

	/* ============================================================
     THEME TOGGLE — RUN ONLY IF themeToggle EXISTS
  ============================================================ */
	if ( document.getElementById( 'themeToggle' ) ) {
		const themeToggle = document.getElementById( 'themeToggle' );
		const html = document.documentElement;

		// Load previous theme
		const savedTheme = localStorage.getItem( 'kitfront-theme' );
		html.setAttribute( 'data-theme', savedTheme ? savedTheme : 'light' );

		// Toggle theme
		themeToggle.addEventListener( 'click', function () {
			let currentTheme = html.getAttribute( 'data-theme' );
			let newTheme = currentTheme === 'light' ? 'dark' : 'light';

			html.setAttribute( 'data-theme', newTheme );
			localStorage.setItem( 'kitfront-theme', newTheme );
		} );
	} // END Theme Toggle Block

	/* ============================================================
     HEADER SCROLL BEHAVIOR — ALWAYS SAFE
     (No element dependencies)
  ============================================================ */
	let lastScrollTop = 0;
	const directionThreshold = 5;
	const scrollStartOffset = 50;

	function handleScroll() {
		let st = window.pageYOffset || document.documentElement.scrollTop;

		if ( st > scrollStartOffset ) {
			document.body.classList.add( 'scrolled' );

			if ( Math.abs( st - lastScrollTop ) > directionThreshold ) {
				if ( st > lastScrollTop ) {
					document.body.classList.add( 'scroll-down' );
					document.body.classList.remove( 'scroll-up' );
				} else {
					document.body.classList.add( 'scroll-up' );
					document.body.classList.remove( 'scroll-down' );
				}
				lastScrollTop = st;
			}
		} else {
			document.body.classList.remove(
				'scroll-down',
				'scroll-up',
				'scrolled'
			);
		}
	}

	window.addEventListener( 'scroll', handleScroll );
	window.addEventListener( 'load', handleScroll );
} ); // END DOMContentLoaded
