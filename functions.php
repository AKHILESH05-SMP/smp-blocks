<?php
/**
 * Custom Block Registrations and Editor Enhancements
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registers blocks using the manifest for performance.
 * Updated to use get_template_directory() for Theme context.
 */
function my_theme_register_blocks() {
    $blocks_path = get_template_directory() . '/blocks';
    $manifest_file = $blocks_path . '/blocks-manifest.php';

    if ( ! file_exists( $manifest_file ) ) {
        return;
    }

    // WP 6.8+ Optimized Registration
    if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
        wp_register_block_types_from_metadata_collection( $blocks_path, $manifest_file );
        return;
    }

    // WP 6.7 Optimized Registration
    if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
        wp_register_block_metadata_collection( $blocks_path, $manifest_file );
    }

    // Fallback for older versions
    $manifest_data = require $manifest_file;
    foreach ( array_keys( $manifest_data ) as $block_type ) {
        register_block_type( $blocks_path . "/{$block_type}" );
    }
}
add_action( 'init', 'my_theme_register_blocks' );

/**
 * Register custom block categories
 */
add_filter( 'block_categories_all', function ( $categories ) {
    $custom_categories = [
        [
            'slug'  => 'smp-image-text',
            'title' => __( 'Image & Text', 'theme-domain' ),
        ],
        [
            'slug'  => 'smp-testimonials',
            'title' => __( 'Testimonials', 'theme-domain' ),
        ],
    ];
    return array_merge( $custom_categories, $categories );
} );

/**
 * Enqueue Bootstrap and Custom Styles for the Editor & Frontend
 */
function my_theme_enqueue_block_assets() {
    $dir_url = get_template_directory_uri() . '/assets/';

    // Bootstrap CSS
    wp_enqueue_style(
        'bootstrap',
        $dir_url . 'css/bootstrap.min.css',
        [],
        '5.3.8'
    );

    // Base CSS
    wp_enqueue_style(
        'smp-base',
        $dir_url . 'css/base.css',
        [],
        '1.0'
    );

    // Motionflow CSS
    wp_enqueue_style(
        'motionflow',
        $dir_url . 'css/motionflow.css',
        [],
        '1.0'
    );

    // Bootstrap JS
    wp_enqueue_script(
        'smp-bootstrap-js',
        $dir_url . 'js/bootstrap.bundle.min.js',
        [],
        '5.3.8',
        true
    );

    // Motionflow JS
    wp_enqueue_script(
        'motionflow',
        $dir_url . 'js/motionflow.js',
        ['smp-bootstrap-js'],
        '1.0',
        true
    );
}
add_action( 'enqueue_block_assets', 'my_theme_enqueue_block_assets', 99 );

/**
 * Disable Specific Default Core Blocks
 */
add_filter( 'allowed_block_types_all', function ( $allowed_blocks, $editor_context ) {
    $all_blocks = array_keys( WP_Block_Type_Registry::get_instance()->get_all_registered() );
    
    $disabled_blocks = [
        'core/spacer',
        'core/separator',
        'core/more',
        'core/nextpage',
    ];

    return array_values( array_diff( $all_blocks, $disabled_blocks ) );
}, 10, 2 );


add_action( 'init', 'kf_disable_global_styles_editor' );
function kf_disable_global_styles_editor() {
    // Site Editor se Styles/Global Styles ka option remove karne ke liye
    remove_action( 'enqueue_block_editor_assets', 'wp_enqueue_global_styles_css_custom_property' );
    
    // Agar aap users ko Styles REST API access se bhi rokna chahte hain
    add_filter( 'block_editor_settings_all', function( $editor_settings ) {
        $editor_settings['__experimentalFeatures']['theme'] = false;
        return $editor_settings;
    });
}


function create_block_smp_blocks_block_init() {
	wp_register_block_types_from_metadata_collection( __DIR__ . '/blocks', __DIR__ . '/blocks/blocks-manifest.php' );
}
add_action( 'init', 'create_block_smp_blocks_block_init' );



add_action( 'admin_head', function () {
    $screen = get_current_screen();

    if ( $screen && 'site-editor' === $screen->id ) {
        ?>
        <style>
            [aria-label="Styles"],
            [href*="styles"],
            button[aria-label="Styles"]{
                display:none !important;
            }
        </style>
        <?php
    }
});


require_once get_theme_file_path( '/inc/redux-framework.php' );


// Prevent WordPress from inlining small block stylesheets and force external links
add_filter( 'styles_inline_size_limit', '__return_zero' );


add_filter( 'map_meta_cap', 'jt_map_meta_cap', 10, 3 );
function jt_map_meta_cap( $caps, $cap, $user_id ) {
	if ( 'edit_css' === $cap ) {
		$caps = array( 'do_not_allow' );
	}
	return $caps;
}