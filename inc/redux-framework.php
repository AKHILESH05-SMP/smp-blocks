<?php

/**
 * Theme Options Config — Redux Framework
 */

if (class_exists('Redux') && ! class_exists('Theme_Options_Config')) :

    class Theme_Options_Config
    {

        private string $opt  = 'smp_theme_options';
        private string $file = 'theme-variables.css';

        // ─────────────────────────────────────────────────────────────────────────
        // BOOT
        // ─────────────────────────────────────────────────────────────────────────

        public function __construct()
        {
            $custom = get_template_directory() . '/redux-custom-fields/field_responsive_size.php';
            if (file_exists($custom)) require_once $custom;

            Redux::set_args($this->opt, [
                'display_name'  => 'Theme Options',
                'menu_title'    => 'Theme Options',
                'page_title'    => 'Theme Options',
                'menu_type'     => 'menu',
                'page_slug'     => 'theme_options',
                'dev_mode'      => false,
                'customizer'    => true,
                'save_defaults' => true,

                // ── Prevent Redux from generating duplicate Google Font links ──
                'disable_google_fonts_link' => true,
                'async_typography'          => false,
                'google_fonts'              => false,
            ]);

            foreach ($this->sections() as $section) {
                Redux::set_section($this->opt, $section);
            }

            // Seed before Redux loads the option value for the admin page.
            $this->seed_repeater_defaults();

            $flush = [$this, 'flush_css'];

            add_action("redux/options/{$this->opt}/saved",         $flush, 20, 1);
            add_action("redux/options/{$this->opt}/reset",         $flush, 20, 1);
            add_action("redux/options/{$this->opt}/reset_section", $flush, 20, 1);
            add_action('enqueue_block_assets', [$this, 'enqueue'], 99);
            add_action('wp_head',            [$this, 'fallback'], 100);
            add_filter("redux/options/{$this->opt}/defaults", [$this, 'filter_repeater_defaults']);
            add_action('admin_footer', [$this, 'reset_new_background_row_title']);

            // Add block editor assets to pass data to JavaScript
            add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets'], 99);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // REPEATER DEFAULTS
        // ─────────────────────────────────────────────────────────────────────────

        /**
         * Default rows for the Background Colors repeater.
         * Labels are chosen so the auto-generated slugs (light-1, dark-1, ...)
         * match the old fixed --kf-bg-light-1 / --kf-bg-dark-1 variable names.
         */

        private function default_bg_colors(): array
        {
            return [
                ['title' => 'Light 1', 'bg_label' => 'Light 1', 'bg_color' => '#fff1f5', 'bg_text_color' => '#1c1d25'],
                ['title' => 'Light 2', 'bg_label' => 'Light 2', 'bg_color' => '#fff6e8', 'bg_text_color' => '#1c1d25'],
                ['title' => 'Light 3', 'bg_label' => 'Light 3', 'bg_color' => '#f5f7f9', 'bg_text_color' => '#1c1d25'],
                ['title' => 'Dark 1',  'bg_label' => 'Dark 1',  'bg_color' => '#111827', 'bg_text_color' => '#ffffff'],
                ['title' => 'Dark 2',  'bg_label' => 'Dark 2',  'bg_color' => '#1f2937', 'bg_text_color' => '#ffffff'],
            ];
        }

        public function seed_repeater_defaults(): void
        {
            // Bumped to v12: provide grouped values for repeater header binding.
            $flag = 'kf_repeater_defaults_seeded_v12';

            if (get_option($flag)) return;

            $opts = get_option($this->opt, []);

            $repeater_defaults = [
                'kf_brand_colors' => ['redux_repeater_data' => [
                    ['title' => 'Primary',   'brand_label' => 'Primary',   'brand_color' => '#ff2056'],
                    ['title' => 'Secondary', 'brand_label' => 'Secondary', 'brand_color' => '#fe9a00'],
                ]],
                'kf_gradient_colors' => ['redux_repeater_data' => [
                    ['title' => 'Gradient 1', 'grad_label' => 'Gradient 1', 'grad_gradient' => ['from' => '#ff2056', 'to' => '#c4003a']],
                    ['title' => 'Gradient 2', 'grad_label' => 'Gradient 2', 'grad_gradient' => ['from' => '#fe9a00', 'to' => '#d97706']],
                ]],
                'kf_bg_colors' => ['redux_repeater_data' => $this->default_bg_colors()],
            ];

            $repeater_fields = [
                'kf_brand_colors' => ['brand_label', 'brand_color'],
                'kf_gradient_colors' => ['grad_label', 'grad_gradient'],
                'kf_bg_colors' => ['bg_label', 'bg_color', 'bg_text_color'],
            ];
            foreach ($repeater_fields as $key => $fields) {
                $repeater_defaults[$key] = $this->group_repeater_defaults(
                    $this->normalize_repeater($repeater_defaults[$key]),
                    $fields
                );
            }

            foreach ($repeater_defaults as $key => $rows) {
                $existing = $this->normalize_repeater($opts[$key] ?? []);
                $needs_titles = false;
                foreach ($existing as $row) {
                    if (!isset($row['title'])) {
                        $needs_titles = true;
                        break;
                    }
                }
                $is_grouped = isset($opts[$key][$repeater_fields[$key][0]])
                    && is_array($opts[$key][$repeater_fields[$key][0]]);
                if (count($existing) < count($this->normalize_repeater($rows)) || $needs_titles || !$is_grouped) {
                    $opts[$key] = $rows;
                }
            }

            update_option($this->opt, $opts);
            update_option($flag, 1);
            $this->write_css($opts);
        }

        public function filter_repeater_defaults(array $defaults): array
        {
            $defaults['kf_bg_colors'] = $this->group_repeater_defaults($this->default_bg_colors(), ['bg_label', 'bg_color', 'bg_text_color']);

            return $defaults;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // SECTIONS  (data-driven — add / remove here only)
        // ─────────────────────────────────────────────────────────────────────────

        private function sections(): array
        {
            return [
                // 1 · Core Colors
                ['title' => '1. Core Colors', 'icon' => 'el el-adjust-alt', 'fields' => [
                    $this->f_color('--kf-body-bg',  'Body Background', '#ffffff'),
                    $this->f_color('--kf-body-text', 'Body Text',      '#1c1d25'),
                    $this->f_color('--kf-white',     'White',          '#ffffff'),
                    $this->f_color('--kf-black',     'Black',          '#1c1d25'),
                ]],

                // 2 · Layout
                ['title' => '2. Layout', 'icon' => 'el el-website', 'fields' => [
                    [
                        'id' => '--kf-container-width',
                        'type' => 'dimensions',
                        'title' => 'Container Max Width (px)',
                        'unit' => false,
                        'height' => false,
                        'default' => ['width' => '1600']
                    ],
                ]],

                ['title' => '3. Brand Colors', 'icon' => 'el el-star', 'fields' => [
                    $this->f_repeater('kf_brand_colors', 'Brand Colors', 'brand_label', [
                        $this->f_text('brand_label', 'Label', 'e.g. Primary, Accent, CTA', 'Brand Color'),
                        $this->f_color('brand_color', 'Color', '#ff2056'),
                    ], [
                        ['brand_label' => 'Primary',   'brand_color' => '#ff2056'],
                        ['brand_label' => 'Secondary', 'brand_color' => '#fe9a00'],
                    ]),
                ]],

                // 4 · Background Colors
                ['title' => '4. Background Colors', 'icon' => 'el el-photo', 'fields' => [
                    $this->f_repeater('kf_bg_colors', 'Background Colors', 'bg_label', [
                        $this->f_text('bg_label', 'Label', 'e.g. Light 1, Hero Section, Footer', 'Background'),
                        $this->f_color('bg_color', 'Background Color', '#ffffff'),
                        $this->f_color('bg_text_color', 'Text Color', '#1c1d25'),
                    ], $this->default_bg_colors()),
                ]],

                // 5 · Gradient Colors
                ['title' => '5. Gradient Colors', 'icon' => 'el el-magic', 'fields' => [
                    $this->f_repeater('kf_gradient_colors', 'Gradient Presets', 'grad_label', [
                        $this->f_text('grad_label', 'Label', 'e.g. Gradient 1', 'Gradient'),
                        [
                            'id' => 'grad_gradient',
                            'type' => 'color_gradient',
                            'title' => 'Gradient',
                            'transparent' => false,
                            'gradient-type' => true,
                            'default' => ['from' => '#ff2056', 'to' => '#fe9a00']
                        ],
                    ], [
                        ['grad_label' => 'Gradient 1', 'grad_gradient' => ['from' => '#ff2056', 'to' => '#c4003a']],
                        ['grad_label' => 'Gradient 2', 'grad_gradient' => ['from' => '#fe9a00', 'to' => '#d97706']],
                    ]),
                ]],

                // 6 · Button Colors
                ['title' => '6. Button Colors', 'icon' => 'el el-ok-circle', 'fields' => [
                    $this->f_link('--kf-btn-primary-bg',   'Primary BG',   ['regular' => '#ff2056', 'hover' => '#e61c4d']),
                    $this->f_link('--kf-btn-secondary-bg', 'Secondary BG', ['regular' => '#fe9a00', 'hover' => '#e58b00']),
                    $this->f_link('--kf-btn-light-bg',     'Light BG',     ['regular' => '#f8f9fa', 'hover' => '#f3f4f6']),
                    $this->f_link('--kf-btn-dark-bg',      'Dark BG',      ['regular' => '#111827', 'hover' => '#1f2937']),
                ]],

                // 7 · Font Families
                ['title' => '7. Font Families', 'icon' => 'el el-font', 'fields' => [
                    $this->f_font('--kf-heading-font',           'Heading Font',           'Bricolage Grotesque', 'sans-serif'),
                    $this->f_font('--kf-heading-font-secondary', 'Secondary Heading Font', 'Cormorant',           'serif'),
                    $this->f_font('--kf-body-font',              'Body Font',              'DM Sans',             'sans-serif'),
                ]],

                // 8 · Typography Sizes
                ['title' => '8. Typography Sizes', 'icon' => 'el el-text-height', 'fields' => [
                    $this->f_responsive('--kf-font-h1',   'H1',   ['large_desktop' => '68', 'desktop' => '62', 'tablet' => '52', 'mobile' => '42', 'line_height' => '1.1', 'unit' => 'px']),
                    $this->f_responsive('--kf-font-h2',   'H2',   ['large_desktop' => '54', 'desktop' => '48', 'tablet' => '40', 'mobile' => '34', 'line_height' => '1.1', 'unit' => 'px']),
                    $this->f_responsive('--kf-font-h3',   'H3',   ['large_desktop' => '42', 'desktop' => '36', 'tablet' => '32', 'mobile' => '28', 'line_height' => '1.2', 'unit' => 'px']),
                    $this->f_responsive('--kf-font-h4',   'H4',   ['large_desktop' => '34', 'desktop' => '30', 'tablet' => '28', 'mobile' => '26', 'line_height' => '1.2', 'unit' => 'px']),
                    $this->f_responsive('--kf-font-h5',   'H5',   ['large_desktop' => '28', 'desktop' => '26', 'tablet' => '24', 'mobile' => '22', 'line_height' => '1.3', 'unit' => 'px']),
                    $this->f_responsive('--kf-font-h6',   'H6',   ['large_desktop' => '22', 'desktop' => '22', 'tablet' => '20', 'mobile' => '20', 'line_height' => '1.3', 'unit' => 'px']),
                    $this->f_responsive('--kf-font-body', 'Body', ['large_desktop' => '18', 'desktop' => '18', 'tablet' => '16', 'mobile' => '16', 'line_height' => '1.6', 'unit' => 'px']),
                ]],

                // 9 · Spacing
                ['title' => '9. Spacing', 'icon' => 'el el-resize-vertical', 'fields' => [
                    $this->f_responsive(
                        '--kf-section-padding',
                        'Section Padding',
                        ['large_desktop' => '100', 'desktop' => '80', 'tablet' => '65', 'mobile' => '50', 'unit' => 'px'],
                        ['show_line_height' => false]
                    ),
                    $this->f_spacing_bottom('--kf-heading-margin-bottom',   'Heading Bottom Margin',   '24'),
                    $this->f_spacing_bottom('--kf-paragraph-margin-bottom', 'Paragraph Bottom Margin', '24'),
                ]],

                // 10 · Shadows & FX
                ['title' => '10. Shadows & FX', 'icon' => 'el el-magic', 'fields' => [
                    ['id' => '--kf-transition', 'type' => 'text', 'title' => 'Global Transition', 'default' => 'all 0.3s ease-out'],
                    $this->f_shadow('--kf-box-shadow',    'Box Shadow Normal', ['h-offset' => '0px', 'v-offset' => '8px',  'blur' => '10px', 'spread' => '-6px', 'color' => 'rgba(0,0,0,0.08)']),
                    $this->f_shadow('--kf-box-shadow-sm', 'Box Shadow Small',  ['h-offset' => '0px', 'v-offset' => '2px',  'blur' => '6px',  'spread' => '-3px', 'color' => 'rgba(0,0,0,0.08)']),
                    $this->f_shadow('--kf-box-shadow-lg', 'Box Shadow Large',  ['h-offset' => '0px', 'v-offset' => '20px', 'blur' => '25px', 'spread' => '-5px', 'color' => 'rgba(0,0,0,0.05)']),
                ]],
            ];
        }

        // ─────────────────────────────────────────────────────────────────────────
        // FIELD BUILDERS  (reusable, composable)
        // ─────────────────────────────────────────────────────────────────────────

        private function f_color($id, $title, $default): array
        {
            return ['id' => $id, 'type' => 'color', 'title' => $title, 'default' => $default, 'transparent' => false];
        }

        private function f_text($id, $title, $placeholder = '', $default = ''): array
        {
            $f = ['id' => $id, 'type' => 'text', 'title' => $title];
            if ($placeholder) $f['placeholder'] = $placeholder;
            if ($default !== '') $f['default'] = $default;
            return $f;
        }

        private function f_link($id, $title, $default): array
        {
            return ['id' => $id, 'type' => 'link_color', 'title' => $title, 'active' => false, 'default' => $default];
        }

        private function f_font($id, $title, $family, $backup): array
        {
            return [
                'id' => $id,
                'type' => 'typography',
                'title' => $title,
                'font-size' => false,
                'line-height' => false,
                'text-align' => false,
                'font-style' => false,
                'font-weight' => false,
                'subsets' => false,
                'color' => false,
                'default' => ['font-family' => $family, 'font-backup' => $backup],
            ];
        }

        private function f_responsive($id, $title, $default, $extra = []): array
        {
            return array_merge(['id' => $id, 'type' => 'responsive_size', 'title' => $title, 'default' => $default], $extra);
        }

        private function f_shadow($id, $title, $default): array
        {
            return ['id' => $id, 'type' => 'box_shadow', 'title' => $title, 'default' => $default];
        }

        private function f_spacing_bottom($id, $title, $bottom): array
        {
            return [
                'id' => $id,
                'type' => 'spacing',
                'mode' => 'margin',
                'title' => $title,
                'all' => false,
                'top' => false,
                'right' => false,
                'left' => false,
                'bottom' => true,
                'units' => false,
                'default' => ['bottom' => $bottom],
            ];
        }

        private function group_repeater_defaults(array $rows, array $fields): array
        {
            foreach ($rows as &$row) {
                if (!isset($row['title'])) {
                    $row['title'] = $row[$fields[0]] ?? '';
                }
            }
            unset($row);

            $grouped = ['redux_repeater_data' => $rows];

            foreach ($fields as $field) {
                $grouped[$field] = array_map(
                    static fn($row) => $row[$field] ?? '',
                    $rows
                );
            }

            return $grouped;
        }

        private function f_repeater($id, $title, $bind, $fields, $default): array
        {
            return [
                'id' => $id,
                'type' => 'repeater',
                'title' => $title,
                'item_name' => 'Item',
                'bind_title' => $bind,
                'group_values' => true,
                'fields' => $fields,
                'default' => $this->group_repeater_defaults($default, array_column($fields, 'id')),
            ];
        }

        // ─────────────────────────────────────────────────────────────────────────
        // HOOKS & ENQUEUE
        // ─────────────────────────────────────────────────────────────────────────
        public function flush_css($options): void
        {
            ob_start();
            $saved = get_option($this->opt, []);
            $this->write_css(!empty($saved) ? $saved : $options);
            ob_end_clean();
        }

        public function enqueue(): void
        {
            $google_fonts_url = $this->get_google_fonts_url();
            if (!empty($google_fonts_url)) {
                wp_enqueue_style('kf-google-fonts', $google_fonts_url, [], null);
            }

            $path = $this->css_path();
            if (!file_exists($path)) $this->write_css();
            if (file_exists($path)) {
                wp_enqueue_style('kf-theme-vars', $this->css_url(), [], get_option('kf_css_ver', '1'));
            }
        }

        public function fallback(): void
        {
            if (wp_style_is('kf-theme-vars', 'enqueued')) return;
            $opts = get_option($this->opt, []);
            if (! empty($opts)) {
                echo "\n<style id=\"kf-theme-vars-inline\">\n" . $this->build_css($opts) . "</style>\n";
            }
        }

        public function enqueue_editor_assets(): void
        {
            $opts = get_option($this->opt, []);

            $bg_options = [
                ['label' => __('Default (Transparent)', 'smp-blocks'), 'value' => '']
            ];

            // 1. Background Colors (Dynamic Slugs matched exactly to Labels)
            $bgs = $this->normalize_repeater($opts['kf_bg_colors'] ?? []);
            $used_slugs     = [];
            $custom_counter = 0;
            foreach ($bgs as $i => $row) {
                $label = $this->background_label($row);
                $info  = $this->background_class_info($label, $custom_counter, $used_slugs);
                if (! $info['skip_rule']) $custom_counter++;

                $bg_options[] = [
                    'label' => $label !== '' ? $label : 'Background ' . $info['index'],
                    'value' => $info['class']
                ];
            }

            // 2. Brand Colors
            $brands = $this->normalize_repeater($opts['kf_brand_colors'] ?? []);
            foreach ($brands as $i => $row) {
                $label = trim((string) ($row['brand_label'] ?? $row['title'] ?? ''));
                $bg_options[] = [
                    'label' => $label !== '' ? $label : 'Brand ' . ($i + 1),
                    'value' => 'kf-bg-brand-' . ($i + 1)
                ];
            }

            // 3. Gradient Colors
            $grads = $this->normalize_repeater($opts['kf_gradient_colors'] ?? []);
            foreach ($grads as $i => $row) {
                $label = trim((string) ($row['grad_label'] ?? $row['title'] ?? ''));
                $bg_options[] = [
                    'label' => $label !== '' ? $label : 'Gradient ' . ($i + 1),
                    'value' => 'kf-bg-gradient-' . ($i + 1)
                ];
            }

            // Pass the options to a global JavaScript variable for the block editor
            wp_add_inline_script(
                'wp-blocks',
                'window.smpDynamicBgOptions = ' . wp_json_encode($bg_options) . ';',
                'before'
            );
        }

        public function reset_new_background_row_title(): void
        {
            if (! isset($_GET['page']) || 'theme_options' !== $_GET['page']) return;
?>
            <script>
                jQuery(function($) {
                    $(document).on('click', '.redux-container-repeater[data-id="kf_bg_colors"] .redux-repeaters-add', function() {
                        setTimeout(function() {
                            const row = $('.redux-container-repeater[data-id="kf_bg_colors"] .redux-repeater-accordion-repeater:last');
                            row.find('.slide-title').val('');
                            row.find('.bind_title').val('').trigger('change');
                        }, 0);
                    });
                });
            </script>
        <?php
        }

        // ─────────────────────────────────────────────────────────────────────────
        // CSS — FILE
        // ─────────────────────────────────────────────────────────────────────────

        private function css_dir(): string
        {
            return get_template_directory() . '/assets/css';
        }

        private function css_path(): string
        {
            return $this->css_dir() . '/' . $this->file;
        }
        private function css_url(): string
        {
            return get_template_directory_uri() . '/assets/css/' . $this->file;
        }
        private function write_css($opts = null): bool
        {
            $opts = $opts ?? get_option($this->opt, []);
            if (empty($opts)) return false;

            $dir = $this->css_dir();
            if (! file_exists($dir)) wp_mkdir_p($dir);

            if (@file_put_contents($this->css_path(), $this->build_css($opts)) !== false) {
                update_option('kf_css_ver', time());
                return true;
            }
            return false;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // CSS — BUILD
        // ─────────────────────────────────────────────────────────────────────────

        private function build_css(array $opts): string
        {
            $lines = ['/* Auto-generated — do not edit manually. Last updated: ' . current_time('Y-m-d H:i:s') . ' */', '', ':root {',];

            foreach ($opts as $key => $val) {
                if (str_starts_with($key, '--kf-')) {
                    array_push($lines, ...$this->to_css($key, $val));
                }
            }

            $repeaters = [
                'kf_brand_colors' => ['key' => 'brand_color', 'prefix' => '--kf-brand-color', 'label' => 'Brand Colors']
            ];

            foreach ($repeaters as $opt_key => $cfg) {
                $rows = $this->normalize_repeater($opts[$opt_key] ?? []);
                if (empty($rows)) continue;
                $lines[] = "\n\t/* === {$cfg['label']} === */";
                foreach ($rows as $i => $row) {
                    $color = $this->parse_color($row[$cfg['key']] ?? '');
                    if ($color) $lines[] = "\t{$cfg['prefix']}-" . ($i + 1) . ": {$color};";
                }
            }

            // === Background Colors (dynamic repeater — bg + matching text color) ===
            //
            // NOTE ON NAMING (see background_class_info() for the full contract):
            //   - $info['slug']   raw, unprefixed slug — always used to build the
            //                     CSS variable "--kf-bg-{slug}", so it can never
            //                     end up double-prefixed.
            //   - $info['class']  ALWAYS "kf-bg-{slug}" — for legacy rows (Light 1,
            //                     Dark 1, ...), for a labeled custom row
            //                     (e.g. "Red" → "kf-bg-red-1"), and for a
            //                     blank-label row ("kf-bg-2"). A label alone
            //                     never produces a bare class like ".red".
            //   - $custom_counter numbers ONLY the custom (non-legacy) rows, so the
            //                     first background added after the 5 seeded
            //                     defaults is "-1", not "-6".
            //   - $info['skip_rule'] true only for the 5 hardcoded legacy slugs,
            //                     whose ".kf-bg-light-1 { background: ... }" rule
            //                     already exists in the theme's main stylesheet,
            //                     so we don't emit a duplicate here.

            $bgs = $this->normalize_repeater($opts['kf_bg_colors'] ?? []);
            $background_rules = [];
            if (! empty($bgs)) {
                $lines[] = "\n\t/* === Background Colors === */";
                $used_slugs     = [];
                $custom_counter = 0;
                foreach ($bgs as $i => $row) {
                    $label = $this->background_label($row);
                    $info  = $this->background_class_info($label, $custom_counter, $used_slugs);
                    if (! $info['skip_rule']) $custom_counter++;

                    $bg_color   = $this->parse_color($row['bg_color'] ?? '');
                    $text_color = $this->parse_color($row['bg_text_color'] ?? '');
                    $variable   = 'kf-bg-' . $info['slug'];

                    if ($bg_color)   $lines[] = "\t--{$variable}: {$bg_color};";
                    if ($text_color) $lines[] = "\t--{$variable}-text: {$text_color};";

                    if ($bg_color && ! $info['skip_rule']) {
                        $background_rules[] = ".{$info['class']} { background: var(--{$variable}) !important; }";
                    }
                }
            }

            $grads = $this->normalize_repeater($opts['kf_gradient_colors'] ?? []);
            if (!empty($grads)) {
                $lines[] = "\n\t/* === Gradient Backgrounds === */";

                foreach ($grads as $i => $row) {
                    $g = $row['grad_gradient'] ?? '';
                    if (empty($g)) continue;
                    $n = $i + 1;
                    if (! empty($g['from'])) $lines[] = "\t--kf-gradient-{$n}-start: {$g['from']};";
                    if (! empty($g['to']))   $lines[] = "\t--kf-gradient-{$n}-end: {$g['to']};";
                }

                $lines[] = '';

                foreach ($grads as $i => $row) {
                    $g = $row['grad_gradient'] ?? '';
                    if (empty($g)) continue;
                    $n    = $i + 1;
                    $from = "var(--kf-gradient-{$n}-start)";
                    $to   = "var(--kf-gradient-{$n}-end)";

                    if (($g['gradient-type'] ?? 'linear') === 'radial') {
                        $lines[] = "\t--kf-bg-gradient-{$n}: radial-gradient(circle, {$from}, {$to});";
                    } else {
                        $angle = isset($g['gradient-angle']) && $g['gradient-angle'] !== '' ? (int) $g['gradient-angle'] : 135;
                        $lines[] = "\t--kf-bg-gradient-{$n}: linear-gradient({$angle}deg, {$from}, {$to});";
                    }
                }
            }

            $lines[] = '}';
            if (! empty($background_rules)) {
                $lines[] = '';
                array_push($lines, ...$background_rules);
            }
            return implode("\n", $lines) . "\n";
        }

        // ─────────────────────────────────────────────────────────────────────────
        // CSS — FIELD → LINES  (dispatch pattern)
        // ─────────────────────────────────────────────────────────────────────────

        private function to_css(string $key, $val): array
        {
            if (! is_array($val)) {
                return $val !== '' ? ["\t{$key}: {$val};"] : [];
            }
            if (isset($val['large_desktop']) || isset($val['desktop'])) {
                return $this->css_responsive($key, $val);
            }
            if (isset($val['regular']) || isset($val['hover'])) {
                return $this->css_link($key, $val);
            }
            if (isset($val['font-family'])) {
                return $this->css_font($key, $val);
            }
            if (isset($val['drop-shadow']) || isset($val['inset-shadow'])) {
                return $this->css_shadow_new($key, $val);
            }
            if (isset($val['h-offset']) || isset($val['blur'])) {
                return $this->css_shadow_legacy($key, $val);
            }
            $spacing = $this->css_spacing($key, $val);
            if (!empty($spacing)) return $spacing;
            if (isset($val['color']) || isset($val['rgba']) || isset($val['alpha'])) {
                $c = $this->parse_color($val);
                return $c ? ["\t{$key}: {$c};"] : [];
            }
            return [];
        }

        private function css_responsive(string $key, array $v): array
        {
            $out = [];

            foreach (['large_desktop' => '-large-desktop', 'desktop' => '-desktop', 'tablet' => '-tablet', 'mobile' => '-mobile'] as $bp => $suffix) {
                if (isset($v[$bp]) && $v[$bp] !== '') {
                    $num  = preg_replace('/[^0-9.]/i', '', $v[$bp]);
                    $unit = preg_replace('/[0-9.]/i',  '', $v[$bp]) ?: 'px';
                    $out[] = "\t{$key}{$suffix}: {$num}{$unit};";
                }
            }

            if (! empty($v['line_height']) && str_contains($key, '-font-')) {
                $lh  = preg_replace('/[^0-9.]/i', '', $v['line_height']);
                $out[] = "\t" . str_replace('-font-', '-line-height-', $key) . ": {$lh};";
            }
            return $out;
        }

        private function css_link(string $key, array $v): array
        {
            $out = [];
            if (!empty($v['regular'])) $out[] = "\t{$key}: {$v['regular']};";
            if (!empty($v['hover']))   $out[] = "\t{$key}-hover: {$v['hover']};";
            if (!empty($v['active']))  $out[] = "\t{$key}-active: {$v['active']};";
            if (!empty($v['visited'])) $out[] = "\t{$key}-visited: {$v['visited']};";
            return $out;
        }

        private function css_font(string $key, array $v): array
        {
            $family = trim($v['font-family']);
            if (str_contains($family, ' ') && ! str_contains($family, "'") && ! str_contains($family, '"')) {
                $family = "'{$family}'";
            }
            $backup = ! empty($v['font-backup']) ? ', ' . $v['font-backup'] : '';
            return ["\t{$key}: {$family}{$backup};"];
        }

        private function css_shadow_new(string $key, array $v): array
        {
            $parts = [];
            if (! empty($v['inset-shadow']['checked'])) {
                $s = $v['inset-shadow'];
                $parts[] = "inset {$s['horizontal']}px {$s['vertical']}px {$s['blur']}px {$s['spread']}px {$s['color']}";
            }
            if (! empty($v['drop-shadow']['checked'])) {
                $s = $v['drop-shadow'];
                $parts[] = "{$s['horizontal']}px {$s['vertical']}px {$s['blur']}px {$s['spread']}px {$s['color']}";
            }
            return $parts ? ["\t{$key}: " . implode(', ', $parts) . ";"] : [];
        }

        private function css_shadow_legacy(string $key, array $v): array
        {
            $inset = (! empty($v['inset']) && $v['inset'] == '1') ? 'inset ' : '';
            $h = $v['h-offset'] ?? '0px';
            $b = $v['blur']   ?? '0px';
            $vv = $v['v-offset'] ?? '0px';
            $s = $v['spread'] ?? '0px';
            $c = $v['color'] ?? 'transparent';
            return ["\t{$key}: {$inset}{$h} {$vv} {$b} {$s} {$c};"];
        }

        private function css_spacing(string $key, array $v): array
        {
            $sides  = ['top', 'right', 'bottom', 'left', 'width', 'height'];
            $prefix = ['margin-', 'padding-'];
            $out    = [];
            $specific = (bool) preg_match('/-(top|bottom|left|right|width|height)$/', $key);

            foreach ($sides as $side) {
                foreach (array_merge($prefix, ['']) as $p) {
                    $sk = $p . $side;
                    if (! isset($v[$sk]) || $v[$sk] === '') continue;
                    $val = is_numeric($v[$sk]) ? $v[$sk] . 'px' : $v[$sk];
                    $out[] = $specific ? "\t{$key}: {$val};" : "\t{$key}-{$side}: {$val};";
                    if ($specific) return $out;
                }
            }
            return $out;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────────────────────────────────────

        public function get_google_fonts_url(): string
        {
            $opts = get_option($this->opt, []);
            $fonts = [];

            $system_fonts = ['Arial', 'Verdana', 'Trebuchet MS', 'Georgia', 'Times New Roman', 'Tahoma', 'sans-serif', 'serif'];

            foreach ($opts as $key => $val) {
                if (is_array($val) && !empty($val['font-family'])) {
                    $family = trim(str_replace(['\'', '"'], '', $val['font-family']));

                    if (!in_array($family, $system_fonts, true)) {
                        $fonts[] = 'family=' . str_replace(' ', '+', $family);
                    }
                }
            }

            if (empty($fonts)) {
                return '';
            }

            $fonts = array_unique($fonts);

            return 'https://fonts.googleapis.com/css2?' . implode('&', $fonts) . '&display=swap';
        }

        private function parse_color($v): string
        {
            if (is_array($v)) {
                return (isset($v['alpha']) && (float) $v['alpha'] < 1 && ! empty($v['rgba'])) ? $v['rgba'] : ($v['color'] ?? '');
            }
            return (string) $v;
        }


        private function slugify(string $text): string
        {
            if (function_exists('sanitize_title')) {
                return sanitize_title($text);
            }
            $text = strtolower(trim($text));
            $text = preg_replace('/[^a-z0-9]+/', '-', $text);
            return trim($text, '-');
        }

        private function background_label(array $row): string
        {
            $label = trim((string) ($row['bg_label'] ?? ''));
            return $label !== '' ? $label : trim((string) ($row['title'] ?? ''));
        }

        /**
         * Resolve a background repeater row into its slug / class / skip_rule / index.
         *
         * $custom_counter is a counter you own and pass in — it must only be
         * incremented for rows where skip_rule comes back false (see the two
         * call sites). This keeps numbering scoped to custom rows only: the
         * first background you add after the 5 seeded defaults gets index 1,
         * not 6, regardless of its position in the underlying array.
         *
         * - slug       Raw, unprefixed identifier. Always used to build the CSS
         *              custom property name ("--kf-bg-{slug}"), so the variable
         *              can never end up double-prefixed.
         * - class      The selector class used in the generated ".class { ... }"
         *              rule. ALWAYS "kf-bg-{slug}" — for legacy rows (Light 1,
         *              Light 2, Light 3, Dark 1, Dark 2), for a labeled custom
         *              row (label "Red" → "kf-bg-red-1"), and for a blank-label
         *              row ("kf-bg-2"). A label never produces a bare class
         *              like ".red" on its own.
         * - skip_rule  True only for the 5 hardcoded legacy slugs — their
         *              ".kf-bg-light-1 { background: ... }" style rule already
         *              lives in the theme's main stylesheet, so build_css() must
         *              not emit a duplicate for those.
         * - index      The 1-based custom index actually used (echoes back
         *              $custom_counter + 1 for non-legacy rows; 0 for legacy).
         *
         * @return array{slug: string, class: string, skip_rule: bool, index: int}
         */
        
        private function background_class_info(string $label, int $custom_counter, array &$used_slugs): array
        {
            $legacy_slugs   = ['light-1', 'light-2', 'light-3', 'dark-1', 'dark-2'];
            $label_slug     = $label !== '' ? $this->slugify($label) : '';

            if ($label_slug !== '' && in_array($label_slug, $legacy_slugs, true) && ! in_array($label_slug, $used_slugs, true)) {
                $used_slugs[] = $label_slug;
                return [
                    'slug'      => $label_slug,
                    'class'     => 'kf-bg-' . $label_slug,
                    'skip_rule' => true,
                    'index'     => 0,
                ];
            }

            $index = $custom_counter + 1;
            $slug  = $label_slug !== '' ? $label_slug . '-' . $index : (string) $index;

            $used_slugs[] = $slug;

            return [
                'slug'      => $slug,
                'class'     => 'kf-bg-' . $slug,
                'skip_rule' => false,
                'index'     => $index,
            ];
        }

        private function normalize_repeater($data): array
        {
            if (empty($data) || !is_array($data)) return [];
            $repeater_rows = [];
            if (isset($data['redux_repeater_data']) && is_array($data['redux_repeater_data'])) {
                $repeater_rows = $data['redux_repeater_data'];
                unset($data['redux_repeater_data']);
            }

            if (!empty($repeater_rows)) {
                foreach ($data as $field => $values) {
                    if (!is_array($values) || !is_numeric(array_key_first($values))) continue;
                    foreach ($repeater_rows as $i => &$row) {
                        if (!is_array($row)) $row = [];
                        if (!isset($row[$field]) || $row[$field] === '') {
                            $row[$field] = $values[$i] ?? '';
                        }
                    }
                    unset($row);
                }
                return $repeater_rows;
            }
            static $META = ['placeholder', 'accordion-heading', 'accordion_heading', ''];
            [$num, $uid, $cols] = [[], [], []];
            foreach ($data as $key => $val) {
                if (!is_array($val)) continue;
                if (is_numeric($key)) {
                    $num[] = $val;
                    continue;
                }
                if (in_array((string) $key, $META, true)) {
                    continue;
                }
                is_numeric(array_key_first($val)) ? $cols[$key] = $val : $uid[] = $val;
            }

            if (!empty($num)) return $num;
            if (!empty($uid)) return $uid;
            if (!empty($cols)) {
                $max  = max(array_map('count', $cols));
                $rows = [];
                for ($i = 0; $i < $max; $i++) {
                    $rows[] = array_map(fn($c) => $c[$i] ?? '', $cols);
                }
                return $rows;
            }
            return [];
        }
        
    }

    new Theme_Options_Config();

endif;
