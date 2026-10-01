import {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
	memo,
	useReducer,
} from "@wordpress/element";
import { Modal, Spinner } from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";

// ─── Constants ───────────────────────────────────────────────────────────────
const ICON_GRID_LIMIT = 300; // icons rendered per batch; more load as the grid is scrolled
const FALLBACK_VERSION = "6.5.1";
const customIcons = "Custom Icons";
const apiBase = "/smp/v1/custom-icons";

async function getDefaultVersion() {
	// Use the version selected in the official Font Awesome plugin settings.
	return (
		window.__FontAwesomeOfficialPlugin__?.options?.version || FALLBACK_VERSION
	);
}

const CATEGORY_KEYWORDS = {
	Business: [
		"money",
		"building",
		"business",
		"chart",
		"office",
		"briefcase",
		"commerce",
		"currency",
	],
	Communication: [
		"message",
		"phone",
		"envelope",
		"comment",
		"speech",
		"chat",
		"bullhorn",
	],
	Design: [
		"paint",
		"pencil",
		"palette",
		"crop",
		"vector",
		"bezier",
		"brush",
		"fill",
		"layer",
	],
	Education: [
		"book",
		"graduation",
		"school",
		"pen",
		"student",
		"chalkboard",
		"read",
	],
	Environment: [
		"leaf",
		"tree",
		"sun",
		"earth",
		"cloud",
		"water",
		"recycle",
		"nature",
	],
	Lifestyle: [
		"coffee",
		"music",
		"heart",
		"home",
		"bicycle",
		"game",
		"film",
		"camera",
	],
	Science: [
		"flask",
		"atom",
		"dna",
		"microscope",
		"magnet",
		"robot",
		"bug",
		"code",
		"satellite",
	],

	Social: [
		"user",
		"people",
		"share",
		"thumbs",
		"hand",
		"smile",
		"star",
		"like",
		"person",
	],

	Travel: [
		"plane",
		"map",
		"car",
		"hotel",
		"compass",
		"globe",
		"train",
		"bus",
		"location",
	],
};
const CATEGORIES = [
	"All Icons",
	"Brands",
	"Business",
	"Communication",
	"Design",
	"Education",
	"Environment",
	"Lifestyle",
	"Science",
	"Social",
	"Travel",
	"Other",
	customIcons,
];

// ─── Styles ───────────────────────────────────────────────────────────────────
// Everything is namespaced with `smp-il-` so it cannot leak into (or be broken
// by) the WordPress admin styles. The native modal header is hidden because the
// picker renders its own header (logo, search, close).
const MODAL_STYLES = `
	/* ── WP modal shell ── */
	.smp-react-modal.components-modal__frame,.smp-react-modal.components-modal__frame:focus,.smp-react-modal.components-modal__frame:focus-visible{width:min(1280px,96vw)!important;max-width:none!important;min-width:0!important;height:min(860px,92vh)!important;max-height:none!important;border-radius:24px!important;overflow:hidden!important;border:1px solid #f3f4f6!important;outline:none!important;box-shadow:0 4px 20px -2px rgba(0,0,0,.05),0 25px 50px -12px rgba(0,0,0,.25)!important}
	.smp-react-modal .components-modal__header{display:none!important}
	.smp-react-modal .components-modal__content{position:relative!important;padding:0!important;margin:0!important;height:100%!important;max-height:none!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
	.smp-react-modal .components-modal__content::before{display:none!important}

	/* ── Root ── */
	.smp-il{position:absolute;inset:0;overflow:hidden;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1f2937;display:flex;flex-direction:column;background:#fff;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
	.smp-il *,.smp-il *::before,.smp-il *::after{box-sizing:border-box}
	.smp-il button{font-family:inherit;margin:0}
	.smp-il button:focus-visible,.smp-il [role=button]:focus-visible{outline:2px solid #6b4ce6;outline-offset:2px}
	/* ── Header ── */
	.smp-il-header{min-height:80px;flex:none;padding:0 32px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#fff;z-index:30}
	.smp-il-brand{display:flex;align-items:center;gap:16px;width:280px;flex:none}
	.smp-il-logo{width:48px;height:48px;flex:none;border-radius:16px;background:#6b4ce6;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 12px -2px rgba(107,76,230,.3)}
	.smp-il-title{font-size:16px;font-weight:700;color:#111827;letter-spacing:-.01em;line-height:1;margin:0 0 4px}
	.smp-il-subtitle{font-size:11px;font-weight:500;color:#9ca3af;letter-spacing:.025em;text-transform:uppercase;margin:0;line-height:1.3}
	.smp-il-search-wrap{flex:1;max-width:500px}
	.smp-il-search{display:flex;align-items:center;width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:9999px;padding:10px 16px;transition:all .15s}
	.smp-il-search:focus-within{background:#fff;border-color:#6b4ce6;box-shadow:0 0 0 4px #f5f3ff}
	.smp-il-search > svg{color:#9ca3af;margin-right:8px;flex:none}
	.smp-il .smp-il-search input.smp-il-search-input{flex:1;min-width:0;width:100%;height:auto;min-height:0;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;color:#374151;outline:none;-webkit-user-select:text;user-select:text}
	.smp-il .smp-il-search input.smp-il-search-input::placeholder{color:#9ca3af}
	.smp-il-search-tools{display:flex;align-items:center;gap:8px;margin-left:8px}
	.smp-il-clear{display:flex;align-items:center;justify-content:center;padding:4px;border:0;border-radius:9999px;background:#e5e7eb;color:#9ca3af;cursor:pointer;transition:all .15s}
	.smp-il-clear:hover{background:#d1d5db;color:#4b5563}
	.smp-il-header-right{display:flex;align-items:center;justify-content:flex-end;width:280px;flex:none}
	.smp-il-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:0;border-radius:9999px;background:transparent;color:#9ca3af;cursor:pointer;transition:all .15s;padding:0}
	.smp-il-close:hover{color:#374151;background:#f3f4f6}

	/* ── Mobile bars ── */
	.smp-il-mobtabs{display:none;flex:none;border-bottom:1px solid #e5e7eb;background:#f9fafb;padding:12px 16px;z-index:20}
	.smp-il-mobsearch{display:none;flex:none;border-bottom:1px solid #e5e7eb;background:#fff;padding:8px 16px;z-index:20}
	.smp-il-mobsearch .smp-il-search{padding:8px 16px}

	/* ── Segmented control ── */
	.smp-il-seg{background:#f3f4f6;border-radius:9999px;padding:4px;display:flex;gap:4px}
	.smp-il-seg-btn{flex:1;display:flex;align-items:center;justify-content:center;padding:6px 12px;border:0;border-radius:9999px;background:transparent;font-size:12px;font-weight:600;line-height:1.5;color:#6b7280;text-align:center;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1)}
	.smp-il-seg-btn.active{background:#fff;color:#111827;box-shadow:0 1px 3px rgba(0,0,0,.1)}
	.smp-il-seg-btn:hover:not(.active){color:#374151}
	.smp-il-seg-btn.active .smp-il-seg-none{color:#6b4ce6}

	/* ── 3-column layout ── */
	.smp-il-layout{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);overflow:hidden;background:#fafafa}
	.smp-il-col{display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain}
	.smp-il-layout[data-tab="categories"] > .smp-il-col-icons,.smp-il-layout[data-tab="categories"] > .smp-il-col-style,
	.smp-il-layout[data-tab="icons"] > .smp-il-col-cats,.smp-il-layout[data-tab="icons"] > .smp-il-col-style,
	.smp-il-layout[data-tab="styling"] > .smp-il-col-cats,.smp-il-layout[data-tab="styling"] > .smp-il-col-icons{display:none}

	/* ── Column 1: categories ── */
	.smp-il-col-cats{border-right:1px solid #e5e7eb;background:#f8f9fc}
	.smp-il-cats-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;position:sticky;top:0;background:rgba(248,249,252,.92);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);z-index:10}
	.smp-il-eyebrow{font-size:10px;font-weight:700;color:#6b7280;letter-spacing:.1em;text-transform:uppercase}
	.smp-il-pill-count{background:rgba(229,231,235,.6);color:#4b5563;font-size:10px;font-weight:700;padding:2px 10px;border-radius:9999px}
	.smp-il-nav{display:flex;flex-direction:column;gap:4px;padding:0 12px 24px}
	.smp-il-cat{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 16px;border:0;border-radius:12px;background:transparent;font-size:12px;font-weight:500;color:#6b7280;text-align:left;cursor:pointer;transition:all .15s}
	.smp-il-cat:not(.active):hover{color:#1f2937;background:rgba(243,244,246,.5)}
	.smp-il-cat.active{font-weight:700;color:#111827;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05),0 0 0 1px #e5e7eb}
	.smp-il-cat-name{display:flex;align-items:center;gap:8px;min-width:0}
	.smp-il-cat-name svg{color:#6b4ce6;flex:none}
	.smp-il-cat-badge{flex:none;background:#e5e7eb;color:#6b7280;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px}
	.smp-il-cat.active .smp-il-cat-badge{background:#f3e8ff;color:#6b4ce6}

	/* ── Column 2: icon grid ── */
	.smp-il-col-icons{background:#fff;position:relative}
	.smp-il-gridhead{flex:none;position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 32px;background:rgba(255,255,255,.9);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid #f3f4f6;z-index:10}
	.smp-il-gridhead-left{display:flex;align-items:center;gap:12px;min-width:0}
	.smp-il-count{font-size:11px;font-weight:700;color:#374151;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
	.smp-il-badge{background:#f3e8ff;color:#6b4ce6;font-size:10px;font-weight:700;padding:2px 10px;border-radius:9999px;text-transform:uppercase;letter-spacing:.025em;white-space:nowrap}
	.smp-il-hint{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:600;color:#6b7280;white-space:nowrap}
	.smp-il-dot{width:6px;height:6px;border-radius:9999px;background:#34d399;box-shadow:0 0 8px rgba(52,211,153,.8)}
	.smp-il-gridbody{padding:32px}
	.smp-il-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:20px}
	.smp-il-card{position:relative;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:20px;border:1px solid #e5e7eb;border-radius:20px;background:#fff;cursor:pointer;transition:all .3s}
	.smp-il-card:hover{border-color:#d8b4fe;box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)}
	.smp-il-card.selected{border-color:#6b4ce6;background:rgba(250,245,255,.3);box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1),0 0 0 1px rgba(168,85,247,.2)}
	.smp-il-card-icon{width:40px;height:40px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:#374151;transition:color .3s}
	.smp-il-card:hover .smp-il-card-icon,.smp-il-card.selected .smp-il-card-icon{color:#6b4ce6}
	.smp-il-card-icon i{font-size:28px;line-height:1}
	.smp-il-card-icon img{width:32px;height:32px;object-fit:contain;filter:drop-shadow(0 1px 1px rgba(0,0,0,.08));pointer-events:none;user-select:none}
	.smp-il-card-name{width:100%;padding:0 4px;font-size:12px;font-weight:700;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
	.smp-il-card-sub{width:100%;margin-top:6px;font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
	.smp-il-del{position:absolute;top:8px;right:8px;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid #e5e7eb;border-radius:9999px;box-shadow:0 1px 2px rgba(0,0,0,.05);color:#ef4444;cursor:pointer;z-index:10;transition:all .15s}
	.smp-il-del:hover{background:#fef2f2;color:#dc2626;border-color:#fecaca}

	/* ── Upload card ── */
	.smp-il-upload{margin-bottom:32px}
	.smp-il-upload-card{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;border:2px dashed #e9d5ff;border-radius:20px;background:#faf5ff;cursor:pointer}
	.smp-il-upload-card:disabled{opacity:.6;cursor:not-allowed}
	.smp-il-upload-icon{position:relative;z-index:1;width:56px;height:56px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:9999px;color:#6b4ce6}
	.smp-il-upload-title{position:relative;z-index:1;display:block;margin-bottom:4px;font-size:14px;font-weight:700;color:#1f2937}
	.smp-il-upload-sub{position:relative;z-index:1;display:block;font-size:12px;font-weight:500;color:#6b7280}
	.smp-il-upload-cta{position:relative;z-index:1;display:inline-block;margin-top:16px;padding:6px 16px;background:#fff;border:1px solid #f3e8ff;border-radius:9999px;font-size:12px;font-weight:700;color:#6b4ce6}
	.smp-il-error{margin-top:12px;padding:8px 12px;background:#fff5f5;border:1px solid #f5c6cb;border-radius:12px;font-size:12px;font-weight:500;color:#c0392b}

	/* ── Empty / loading ── */
	.smp-il-empty,.smp-il-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;text-align:center}
	.smp-il-loading{gap:10px;color:#6b7280;font-size:13px;font-weight:500}
	.smp-il-empty-icon{width:64px;height:64px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;background:#f9fafb;border-radius:16px;color:#d1d5db}
	.smp-il-empty-title{margin:0 0 4px;font-size:14px;font-weight:700;color:#1f2937}
	.smp-il-empty-sub{margin:0;font-size:12px;font-weight:500;color:#6b7280}

	/* ── Column 3: styling ── */
	.smp-il-col-style{border-left:1px solid #e5e7eb;background:#fafafa;position:relative}
	.smp-il-style-head{flex:none;position:sticky;top:0;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:24px;background:rgba(250,250,250,.92);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid #f3f4f6;z-index:10}
	.smp-il-style-title{margin:0;font-size:15px;font-weight:700;color:#111827;letter-spacing:-.01em}
	.smp-il-style-sub{margin:4px 0 0;font-size:11px;font-weight:500;color:#9ca3af;letter-spacing:.025em}
	.smp-il-reset{flex:none;padding:6px 12px;border:0;border-radius:9999px;background:#f3f4f6;font-size:11px;font-weight:600;color:#9ca3af;cursor:pointer;transition:all .15s}
	.smp-il-reset:hover{color:#6b4ce6;background:#faf5ff}
	.smp-il-style-body{padding:24px;display:flex;flex-direction:column;gap:32px;transition:opacity .2s}
	.smp-il-style-body.disabled{opacity:.5;pointer-events:none}
	.smp-il-field-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding:0 4px}
	.smp-il-label{display:block;margin:0;font-size:10px;font-weight:700;color:#6b7280;letter-spacing:.1em;text-transform:uppercase}
	.smp-il-field-head + .smp-il-colorbox{margin-top:0}
	.smp-il-label.block{margin-bottom:12px;padding:0 4px}
	.smp-il-linkbtn{padding:0;border:0;background:transparent;font-size:10px;font-weight:700;color:#6b4ce6;cursor:pointer;transition:color .15s}
	.smp-il-linkbtn:hover{color:#6b21a8}
	.smp-il-colorbox{border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05)}
	.smp-il-colorbanner{position:relative;width:100%;height:112px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .3s}
	.smp-il-colorbanner input[type=color]{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:pointer}
	.smp-il-colortip{padding:6px 16px;background:rgba(0,0,0,.2);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.1);border-radius:9999px;color:#fff;font-size:11px;font-weight:600;letter-spacing:.025em;box-shadow:0 1px 2px rgba(0,0,0,.05);pointer-events:none}

	/* ── Footer ── */
	.smp-il-footer{min-height:84px;flex:none;padding:0 32px;border-top:1px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 -4px 20px -10px rgba(0,0,0,.05);z-index:30}
	.smp-il-preview{display:flex;align-items:center;gap:16px;min-width:0}
	.smp-il-preview-tile{position:relative;width:56px;height:56px;flex:none;display:flex;align-items:center;justify-content:center;border:1px solid #f3f4f6;border-radius:16px;background:rgba(249,250,251,.5);box-shadow:inset 0 2px 4px 0 rgba(0,0,0,.03);overflow:hidden}
	.smp-il-checker{position:absolute;inset:0;opacity:.5;background-image:conic-gradient(#fff 25%,#f3f3f3 0 50%,#fff 0 75%,#f3f3f3 0);background-size:8px 8px}
	.smp-il-preview-icon{position:relative;z-index:1;width:100%;height:100%;display:flex;align-items:center;justify-content:center;transition:all .3s}
	.smp-il-preview-icon img{width:36px;height:36px;object-fit:contain}
	.smp-il-preview-empty{color:#d1d5db;font-size:20px;font-weight:700;line-height:1}
	.smp-il-preview-title{display:flex;align-items:center;gap:8px;margin-bottom:2px;font-size:14px;font-weight:700;color:#111827}
	.smp-il-tag{padding:2px 8px;border-radius:9999px;background:#f3e8ff;color:#6b4ce6;font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
	.smp-il-preview-sub{margin:0;font-size:11px;font-weight:500;color:#9ca3af}
	.smp-il-actions{display:flex;align-items:center;gap:12px;flex:none}
	.smp-il-btn{padding:10px 20px;border:0;border-radius:9999px;font-size:13px;font-weight:600;line-height:1.4;cursor:pointer;transition:all .2s}
	.smp-il-btn-cancel{background:#f9fafb;color:#4b5563}
	.smp-il-btn-cancel:hover{background:#f3f4f6}
	.smp-il-btn-insert{padding:10px 28px;background:#6b4ce6;color:#fff;font-weight:700;box-shadow:0 4px 6px -1px rgba(107,76,230,.25)}
	.smp-il-btn-insert:hover:not(:disabled){background:#7e22ce;transform:translateY(-2px);box-shadow:0 10px 15px -3px rgba(107,76,230,.3)}
	.smp-il-btn-insert:disabled{background:#c4b5fd;box-shadow:none;cursor:not-allowed}

	/* ── Toast ── */
	.smp-il-toast{position:absolute;left:50%;bottom:100px;transform:translate(-50%,16px);display:flex;align-items:center;gap:8px;padding:12px 20px;background:rgba(17,24,39,.95);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border-radius:9999px;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);color:#fff;font-size:12px;font-weight:600;white-space:nowrap;opacity:0;pointer-events:none;transition:all .3s;z-index:50}
	.smp-il-toast.show{opacity:1;transform:translate(-50%,0)}
	.smp-il-toast svg{color:#34d399;flex:none}

	/* ── Breakpoints ── */
	@media (min-width:1024px){
		.smp-il-layout{grid-template-columns:minmax(0,3fr) minmax(0,6fr) minmax(0,3fr)}
		.smp-il-layout > .smp-il-col{display:flex!important}
	}
	@media (min-width:1280px){
		.smp-il-layout{grid-template-columns:minmax(0,2fr) minmax(0,7fr) minmax(0,3fr)}
	}
	@media (max-width:1023px){
		.smp-il-header,.smp-il-footer{padding-left:24px;padding-right:24px}
		.smp-il-mobtabs{display:block}
		.smp-il-gridhead{padding:14px 20px}
		.smp-il-gridbody{padding:20px}
		.smp-il-brand,.smp-il-header-right{width:auto}
	}
	@media (max-width:767px){
		.smp-react-modal.components-modal__frame{width:100vw!important;height:100vh!important;border-radius:0!important}
		.smp-il-search-wrap{display:none}
		.smp-il-mobsearch{display:block}
		.smp-il-header{min-height:64px}
		.smp-il-logo{width:40px;height:40px;border-radius:14px}
		.smp-il-hint{display:none}
		.smp-il-footer{padding-left:16px;padding-right:16px}
		.smp-il-preview-text{display:none}
		.smp-il-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
	}
	@media (prefers-reduced-motion:reduce){
		.smp-il *{transition:none!important;animation:none!important}
	}
`;
const TRIGGER_STYLES = `
  .smp-icon-trigger{position:relative;overflow:hidden;transition:all .3s ease}
  .smp-icon-overlay{position:absolute;bottom:-100%;left:0;width:100%;height:100%;background:rgba(34,113,177,.9);color:#fff;display:flex;justify-content:center;align-items:center;transition:bottom .3s ease-in-out;font-size:13px;font-weight:500;z-index:5}
  .smp-icon-trigger:hover .smp-icon-overlay{bottom:0}
  @keyframes smp-fade-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  .smp-custom-card{animation:smp-fade-in .15s ease}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Convert API names into readable labels without changing their stored keys.
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const toLabel = (k) => capitalize(k.replace(/-/g, " "));
const ALLOWED_ROTATIONS = new Set(["90", "180", "270"]);
const ALLOWED_FLIPS = new Set(["horizontal", "vertical", "both"]);
const MAX_ICON_UPLOAD_SIZE = 250 * 1024;
const SAFE_RELATIVE_PATH_RE = /^\/[\w\-./~!$&'()*+,;=:@%]+$/i;
const UNSAFE_PROTOCOL_RE =
	/^(?:javascript:|vbscript:|file:|data:text\/html|data:application\/javascript)/i;
const UNSAFE_SVG_RE =
	/<\s*(?:script|iframe|object|embed|foreignObject)|\bon\w+\s*=|(?:href|xlink:href)\s*=\s*["']?\s*(?:javascript:|vbscript:|data:)/i;
const SVG_ROOT_RE = /<\s*svg(?:\s|>)/i;
const HEX_COLOR_RE = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
const DEFAULT_SWATCH = "#333333";

// Remove executable SVG content before any uploaded SVG is accepted.
export const sanitizeSvgMarkup = (svg) => {
	if (typeof svg !== "string") return "";
	let safe = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
	safe = safe.replace(/on\w+\s*=\s*(?:["'][^"']*["']|[\w\-]+)/gi, "");
	safe = safe.replace(
		/href\s*=\s*(?:["'])?\s*(?:javascript:|vbscript:|data:text\/html)/gi,
		'href=""',
	);
	safe = safe.replace(
		/<\s*(?:script|iframe|object|embed|foreignObject)[\s\S]*?>/gi,
		"",
	);
	return safe;
};

// Only allow safe image URLs; Font Awesome class strings must not be treated as URLs.
export const isImageUrl = (value) => {
	if (typeof value !== "string" || value.trim() === "") return false;

	const url = value.trim();
	if (url.length > 2048 || url.includes(" ")) return false;
	if (UNSAFE_PROTOCOL_RE.test(url)) return false;
	if (url.startsWith("//") || url.startsWith("data:")) return false;
	if (url.startsWith("/")) return SAFE_RELATIVE_PATH_RE.test(url);

	try {
		const parsed = new URL(url, window.location.origin);
		return (
			(parsed.protocol === "http:" || parsed.protocol === "https:") &&
			!/^[a-z0-9_-]+(?:\s+[a-z0-9_-]+)*$/i.test(url)
		);
	} catch {
		return false;
	}
};

const isIconClassName = (value) =>
	typeof value === "string" &&
	value.length <= 200 &&
	/^[a-z0-9_-]+(?:\s+[a-z0-9_-]+)*$/i.test(value);

// <input type="color"> only understands #rrggbb.
const toColorInputValue = (color) => {
	if (!HEX_COLOR_RE.test(color || "")) return DEFAULT_SWATCH;
	if (color.length === 4) {
		return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
	}
	return color;
};

const copyToClipboard = async (text) => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		try {
			const el = document.createElement("textarea");
			el.value = text;
			el.style.position = "fixed";
			el.style.left = "-9999px";
			document.body.appendChild(el);
			el.select();
			const ok = document.execCommand("copy");
			document.body.removeChild(el);
			return ok;
		} catch {
			return false;
		}
	}
};

// Work out which sidebar categories a Font Awesome icon belongs to (done once
// per icon when the library loads, so switching categories stays instant).
const getIconCategories = (icon) => {
	const cats = [];
	const name = icon.name.toLowerCase();
	const terms = icon.keywords.map((k) => k.toLowerCase());
	const hits = (kws) =>
		kws.some((k) => name.includes(k) || terms.some((t) => t.includes(k)));

	if (icon.styleType === "brands") cats.push("Brands");
	const keywordCats = Object.entries(CATEGORY_KEYWORDS)
		.filter(([, kws]) => hits(kws))
		.map(([cat]) => cat);
	cats.push(...keywordCats);
	if (icon.styleType !== "brands" && keywordCats.length === 0)
		cats.push("Other");
	return cats;
};

// ─── Inline SVG icons (from the design) ───────────────────────────────────────
function Svg({ size = 16, children, ...rest }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			aria-hidden="true"
			focusable="false"
			{...rest}
		>
			{children}
		</svg>
	);
}
const round = { strokeLinecap: "round", strokeLinejoin: "round" };
const LogoIcon = () => (
	<Svg size={24}>
		<path
			{...round}
			strokeWidth="2"
			d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
		/>
	</Svg>
);
const SearchIcon = ({ size = 16 }) => (
	<Svg size={size}>
		<path
			{...round}
			strokeWidth="2.5"
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</Svg>
);
const XIcon = ({ size = 12, strokeWidth = 3 }) => (
	<Svg size={size}>
		<path {...round} strokeWidth={strokeWidth} d="M6 18L18 6M6 6l12 12" />
	</Svg>
);
const PlusCircleIcon = () => (
	<Svg size={14} fill="currentColor" stroke="none">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
		<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z" />
	</Svg>
);
const MediaIcon = () => (
	<Svg size={24}>
		<path
			{...round}
			strokeWidth="2"
			d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
		/>
	</Svg>
);

const CheckIcon = () => (
	<Svg size={16}>
		<path {...round} strokeWidth="2.5" d="M5 13l4 4L19 7" />
	</Svg>
);
const NoneIcon = () => (
	<Svg size={16} className="smp-il-seg-none" strokeWidth="2.5">
		<circle cx="12" cy="12" r="9" />
		<path d="m4.93 4.93 14.14 14.14" />
	</Svg>
);
const FlipHIcon = () => (
	<Svg size={16} strokeWidth="2">
		<path {...round} d="M8 7h8m0 0l-3-3m3 3l-3 3m-8 7h8m-8 0l3-3m-3 3l3 3" />
	</Svg>
);
const FlipVIcon = () => (
	<Svg size={16} strokeWidth="2">
		<path {...round} d="M7 8v8m0 0l-3-3m3 3l3-3m7-8v8m0-8l-3 3m3-3l3 3" />
	</Svg>
);
const FlipBothIcon = () => (
	<Svg size={16} strokeWidth="2">
		<path {...round} d="M4 4l16 16m0-6v6h-6M4 10V4h6" />
	</Svg>
);

// ─── Custom Icons persistence (API/.json Cache) ───────────────────────────────
function saveMyIcons(icons) {
	// Persist the small custom-icon index so uploaded choices survive reloads.
	apiFetch({
		path: apiBase,
		method: "POST",
		data: { icons },
	}).catch((err) => console.error("Failed to save icons:", err));
}

// ─── WordPress Media Library ──────────────────────────────────────────────────
function openWPMediaLibrary(onSelect, onError) {
	// Use the WordPress media frame so permissions and attachment handling stay native.
	if (!window.wp?.media) {
		onError?.("WordPress Media Library is not available on this page.");
		return;
	}
	if (window._smpMediaFrame) {
		window._smpMediaFrame.off();
		window._smpMediaFrame = null;
	}
	const frame = window.wp.media({
		title: "Select or Upload Icon",
		button: { text: "Use as Icons" },
		multiple: true,
		library: { type: ["image/svg+xml", "image/png", "image/jpeg"] },
	});

	frame.on("select", async () => {
		const attachments = frame
			.state()
			.get("selection")
			.map((model) => model.toJSON());
		const allowed = ["image/svg+xml", "image/png", "image/jpeg"];
		const validAttachments = attachments.reduce((valid, attachment) => {
			const mime = attachment.mime || "";
			const sizeBytes = Number(
				attachment.filesize || attachment?.media_details?.filesize || 0,
			);
			const rawUrl =
				typeof attachment.url === "string" ? attachment.url.trim() : "";

			if (!allowed.includes(mime)) return valid;
			if (!isImageUrl(rawUrl)) return valid;
			if (sizeBytes > MAX_ICON_UPLOAD_SIZE) return valid;
			valid.push({
				id: `custom_${attachment.id}`,
				attachmentId: attachment.id,
				name:
					attachment.title || attachment.filename || `Icon ${attachment.id}`,
				src: rawUrl,
				mimeType: mime,
				isCustom: true,
			});
			return valid;
		}, []);

		const checkedAttachments = await Promise.all(
			validAttachments.map(async (attachment) => {
				if (attachment.mimeType !== "image/svg+xml") return attachment;
				try {
					const response = await fetch(
						new URL(attachment.src, window.location.origin).href,
					);
					if (!response.ok) return null;
					const contentLength = Number(response.headers.get("content-length"));
					if (contentLength > MAX_ICON_UPLOAD_SIZE) return null;

					const svgText = await response.text();
					if (
						svgText.length > MAX_ICON_UPLOAD_SIZE ||
						!SVG_ROOT_RE.test(svgText) ||
						UNSAFE_SVG_RE.test(svgText)
					)
						return null;
					return sanitizeSvgMarkup(svgText).length >= 10 ? attachment : null;
				} catch {
					return null;
				}
			}),
		);

		const safeAttachments = checkedAttachments.filter(Boolean);
		if (safeAttachments.length === 0) {
			onError?.(
				"Please select valid SVG, PNG, or JPG/JPEG files smaller than 250 KB.",
			);
			return;
		}

		onSelect(safeAttachments);
	});
	window._smpMediaFrame = frame;
	frame.open();
}
//
// ─── Reducer ──────────────────────────────────────────────────────────────────
function customIconsReducer(state, action) {
	// Keep add/remove persistence in one place instead of duplicating it in the UI.
	switch (action.type) {
		case "INIT":
			return Array.isArray(action.payload) ? action.payload : [];
		case "ADD": {
			const additions = action.payload.filter(
				(icon) => !state.some((i) => i.attachmentId === icon.attachmentId),
			);
			if (additions.length === 0) return state;
			const next = [...additions.reverse(), ...state];
			saveMyIcons(next);
			return next;
		}
		case "REMOVE": {
			const next = state.filter((i) => i.id !== action.id);
			saveMyIcons(next);
			return next;
		}
		default:
			return state;
	}
}

// ─── Icon Library Hook ────────────────────────────────────────────────────────
let iconCache = [];
let iconLoadPromise = null;
function useIconLibrary() {
	// Share the downloaded Font Awesome metadata between picker instances.
	const [icons, setIcons] = useState(iconCache);
	const [isLoading, setIsLoading] = useState(iconCache.length === 0);
	const [loadingText, setLoadingText] = useState("Loading Library...");

	useEffect(() => {
		if (iconCache.length > 0) return;

		const loadFreeCDN = async (version) => {
			setLoadingText("Loading Icons...");
			const res = await fetch(
				`https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@${version}/metadata/icons.json`,
			);
			if (!res.ok) throw new Error("Network error");
			const data = await res.json();
			return Object.entries(data).flatMap(([key, icon]) =>
				icon.styles.map((style) => ({
					label: `${toLabel(key)} (${capitalize(style)})`,
					name: key,
					styleType: style,
					value: `fa-${style} fa-${key}`,
					keywords: icon.search?.terms ?? [],
					isCustom: false,
				})),
			);
		};
		if (!iconLoadPromise) {
			iconLoadPromise = getDefaultVersion().then(loadFreeCDN);
		}
		iconLoadPromise
			.then((data) => {
				iconCache = data;
				setIcons(data);
				setIsLoading(false);
			})
			.catch((err) => {
				console.error(err);
				iconLoadPromise = null;
				setIsLoading(false);
			});
	}, []);

	return { icons, isLoading, loadingText };
}

// ─── WP Media Upload Card ─────────────────────────────────────────────────────
const WPMediaButton = memo(function WPMediaButton({
	onOpenLibrary,
	error,
	wpLoading,
}) {
	return (
		<div className="smp-il-upload">
			<button
				type="button"
				className="smp-il-upload-card"
				onClick={onOpenLibrary}
				disabled={wpLoading}
			>
				<span className="smp-il-upload-icon">
					<MediaIcon />
				</span>
				<span className="smp-il-upload-title">Choose from WordPress Media</span>
				<span className="smp-il-upload-sub">
					Upload custom SVG, PNG, or select from library
				</span>
				<span className="smp-il-upload-cta">Browse Library &rarr;</span>
			</button>
			{error && (
				<div className="smp-il-error" role="alert">
					{error}
				</div>
			)}
		</div>
	);
});

// ─── Icon Card ────────────────────────────────────────────────────────────────
const IconCard = memo(function IconCard({ icon, isSel, onSelect, onDelete }) {
	const selKey = icon.isCustom ? icon.id : icon.value;
	const title = icon.isCustom ? icon.name : icon.label;
	return (
		<div
			className={`smp-il-card${isSel ? " selected" : ""}`}
			role="button"
			tabIndex={0}
			aria-pressed={isSel}
			title={title}
			onClick={() => onSelect(selKey)}
			onKeyDown={(e) => {
				if (
					(e.key === "Enter" || e.key === " ") &&
					e.target === e.currentTarget
				) {
					e.preventDefault();
					onSelect(selKey);
				}
			}}
		>
			{icon.isCustom && (
				<button
					type="button"
					className="smp-il-del"
					aria-label={`Delete ${icon.name}`}
					title="Delete uploaded icon"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(icon.id);
					}}
				>
					<XIcon size={12} strokeWidth={2.5} />
				</button>
			)}
			<div className="smp-il-card-icon">
				{icon.isCustom ? (
					<img src={icon.src} alt={icon.name} />
				) : (
					<i className={icon.value} aria-hidden="true" />
				)}
			</div>
			<div className="smp-il-card-name">
				{icon.isCustom ? icon.name : toLabel(icon.name)}
			</div>
			<div className="smp-il-card-sub">
				{icon.isCustom ? "Custom" : icon.cats[0]}
			</div>
		</div>
	);
});

// ─── Styling Inspector (right column) ─────────────────────────────────────────
const ROTATION_OPTIONS = [
	{ v: "", title: "No rotation", node: <NoneIcon /> },
	{ v: "90", title: "90°", node: "90°" },
	{ v: "180", title: "180°", node: "180°" },
	{ v: "270", title: "270°", node: "270°" },
];
const FLIP_OPTIONS = [
	{ v: "", title: "No flip", node: <NoneIcon /> },
	{ v: "horizontal", title: "Horizontal flip", node: <FlipHIcon /> },
	{ v: "vertical", title: "Vertical flip", node: <FlipVIcon /> },
	{ v: "both", title: "Both directions", node: <FlipBothIcon /> },
];

const StylingPanel = memo(function StylingPanel({
	options,
	onChange,
	isImage,
	disabled,
	onToast,
}) {
	const updateOption = (key, val) => onChange({ ...options, [key]: val });
	const color = HEX_COLOR_RE.test(options.color || "") ? options.color : "";

	const handleReset = () => {
		onChange({ ...options, color: "", rotation: "", flip: "" });
		onToast("Styling reset");
	};

	return (
		<aside className="smp-il-col smp-il-col-style smp-il-scroll">
			<div className="smp-il-style-head">
				<div>
					<h2 className="smp-il-style-title">Icon Styling</h2>
					<p className="smp-il-style-sub">
						{disabled
							? "Select an icon to start styling"
							: "Color and orientation transforms"}
					</p>
				</div>
				<button type="button" className="smp-il-reset" onClick={handleReset}>
					Reset
				</button>
			</div>

			<div className={`smp-il-style-body${disabled ? " disabled" : ""}`}>
				{!isImage && (
					<div>
						<div className="smp-il-field-head">
							<label className="smp-il-label" htmlFor="smp-il-color-input">
								Color
							</label>
							<button
								type="button"
								className="smp-il-linkbtn"
								onClick={() => updateOption("color", "")}
							>
								Clear
							</button>
						</div>
						<div className="smp-il-colorbox">
							<div
								className="smp-il-colorbanner"
								style={{ backgroundColor: color || DEFAULT_SWATCH }}
							>
								<input
									id="smp-il-color-input"
									type="color"
									value={toColorInputValue(color)}
									onChange={(e) => updateOption("color", e.target.value)}
								/>
								<div className="smp-il-colortip">Tap to pick color</div>
							</div>
						</div>
					</div>
				)}

				<div>
					<span className="smp-il-label block">Rotation</span>
					<div className="smp-il-seg" role="group" aria-label="Rotation">
						{ROTATION_OPTIONS.map((opt) => {
							const isActive = (options.rotation || "") === opt.v;
							return (
								<button
									type="button"
									key={opt.v || "none"}
									className={`smp-il-seg-btn${isActive ? " active" : ""}`}
									aria-pressed={isActive}
									title={opt.title}
									onClick={() => updateOption("rotation", opt.v)}
								>
									{opt.node}
								</button>
							);
						})}
					</div>
				</div>

				<div>
					<span className="smp-il-label block">Flip</span>
					<div className="smp-il-seg" role="group" aria-label="Flip">
						{FLIP_OPTIONS.map((opt) => {
							const isActive = (options.flip || "") === opt.v;
							return (
								<button
									type="button"
									key={opt.v || "none"}
									className={`smp-il-seg-btn${isActive ? " active" : ""}`}
									aria-pressed={isActive}
									title={opt.title}
									onClick={() => updateOption("flip", opt.v)}
								>
									{opt.node}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</aside>
	);
});

// ─── Main IconPicker Component ────────────────────────────────────────────────
export default function IconPicker({ label, value, onChange, help }) {
	// Keep the modal draft separate from the saved block value until Insert is pressed.
	const [isModalOpen, setIsModalOpen] = useState(false);

	const currentValue =
		typeof value === "object" && value !== null
			? value
			: { icon: value || "", color: "", rotation: "", flip: "" };

	const [tempSelected, setTempSelected] = useState("");
	const [customizerOptions, setCustomizerOptions] = useState(currentValue);

	// Search is debounced so filtering a large icon library does not run on every keystroke.
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState("All Icons");
	const [mobileTab, setMobileTab] = useState("icons");
	const [uploadError, setUploadError] = useState("");
	const [wpLoading, setWpLoading] = useState(false);
	const [toast, setToast] = useState({ msg: "", show: false });

	const debounceRef = useRef(null);
	const toastRef = useRef(null);
	const searchRef = useRef(null);
	const iconsColRef = useRef(null);

	const [myIcons, dispatchMyIcons] = useReducer(customIconsReducer, []);
	const { icons, isLoading, loadingText } = useIconLibrary();

	// Fetch from API on load
	useEffect(() => {
		apiFetch({ path: apiBase })
			.then((data) => dispatchMyIcons({ type: "INIT", payload: data || [] }))
			.catch((err) => console.error("Error fetching icons:", err));
	}, []);

	const showToast = useCallback((msg) => {
		clearTimeout(toastRef.current);
		setToast({ msg, show: true });
		toastRef.current = setTimeout(
			() => setToast((t) => ({ ...t, show: false })),
			2500,
		);
	}, []);
	useEffect(() => () => clearTimeout(toastRef.current), []);

	// Safe Fallback added to prevent losing uploaded icons!
	// Convert persisted image URLs back to custom icon IDs when possible.
	const resolveValueToTemp = useCallback(
		(savedValue) => {
			if (!savedValue) return "";
			if (isImageUrl(savedValue)) {
				const match = myIcons.find((i) => i.src === savedValue);
				return match ? match.id : savedValue;
			}
			return savedValue;
		},
		[myIcons],
	);

	// Convert a temporary library selection into the value saved by the block.
	const resolveTempToValue = useCallback(
		(temp) => {
			if (!temp) return "";
			if (temp.startsWith("custom_")) {
				const ci = myIcons.find((i) => i.id === temp);
				return ci ? ci.src : "";
			}
			return temp;
		},
		[myIcons],
	);

	const handleSearchChange = useCallback((e) => {
		const val = e.target.value;
		setSearch(val);
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => setDebouncedSearch(val), 200);
	}, []);

	const handleClearSearch = useCallback(() => {
		clearTimeout(debounceRef.current);
		setSearch("");
		setDebouncedSearch("");
		searchRef.current?.focus();
	}, []);

	useEffect(() => () => clearTimeout(debounceRef.current), []);

	// Categorise every Font Awesome icon once, when the library loads.
	const iconMeta = useMemo(
		() =>
			icons.map((icon) => ({
				...icon,
				cats: getIconCategories(icon),
				haystack: [icon.label, icon.name, ...icon.keywords]
					.join("\n")
					.toLowerCase(),
			})),
		[icons],
	);

	const categoryCounts = useMemo(() => {
		const counts = {
			"All Icons": iconMeta.length,
			[customIcons]: myIcons.length,
		};
		iconMeta.forEach((icon) =>
			icon.cats.forEach((c) => {
				counts[c] = (counts[c] || 0) + 1;
			}),
		);
		return counts;
	}, [iconMeta, myIcons]);

	// Filter by category and query, then cap the rendered grid for performance.
	const filteredIcons = useMemo(() => {
		const query = debouncedSearch.trim().toLowerCase();
		if (activeCategory === customIcons)
			return myIcons.filter(
				(icon) => !query || icon.name.toLowerCase().includes(query),
			);
		return iconMeta.filter(
			(icon) =>
				(activeCategory === "All Icons" ||
					icon.cats.includes(activeCategory)) &&
				(!query || icon.haystack.includes(query)),
		);
	}, [iconMeta, myIcons, debouncedSearch, activeCategory]);
	const [visibleCount, setVisibleCount] = useState(ICON_GRID_LIMIT);
	const visibleIcons = useMemo(
		() =>
			activeCategory === customIcons
				? filteredIcons
				: filteredIcons.slice(0, visibleCount),
		[filteredIcons, visibleCount, activeCategory],
	);

	// New category or search: back to the top of the grid with a fresh first batch.
	useEffect(() => {
		setVisibleCount(ICON_GRID_LIMIT);
		iconsColRef.current?.scrollTo?.({ top: 0 });
	}, [activeCategory, debouncedSearch]);

	// Render the next batch when the grid is scrolled near its end.
	const handleIconsScroll = useCallback(
		(e) => {
			const el = e.currentTarget;
			if (el.scrollTop + el.clientHeight >= el.scrollHeight - 600) {
				setVisibleCount((c) =>
					Math.min(c + ICON_GRID_LIMIT, filteredIcons.length),
				);
			}
		},
		[filteredIcons.length],
	);

	// Initialize the draft with the current icon whenever the picker opens.
	const openModal = useCallback(() => {
		setTempSelected(resolveValueToTemp(currentValue.icon));
		setCustomizerOptions(currentValue);
		setMobileTab("icons");
		setIsModalOpen(true);
	}, [currentValue, resolveValueToTemp]);

	// Reset transient search and upload state when the modal closes.
	const closeModal = useCallback(() => {
		clearTimeout(debounceRef.current);
		setIsModalOpen(false);
		setSearch("");
		setDebouncedSearch("");
		setUploadError("");
	}, []);

	// Validate and commit the draft only after the user explicitly inserts it.
	const handleInsert = useCallback(() => {
		const saveVal = resolveTempToValue(tempSelected);
		const safeIcon =
			saveVal && (isImageUrl(saveVal) || isIconClassName(saveVal))
				? saveVal
				: "";
		if (safeIcon) {
			const nextOptions = {
				...customizerOptions,
				color: HEX_COLOR_RE.test(customizerOptions.color || "")
					? customizerOptions.color
					: "",
				rotation: ALLOWED_ROTATIONS.has(customizerOptions.rotation || "")
					? customizerOptions.rotation
					: "",
				flip: ALLOWED_FLIPS.has(customizerOptions.flip || "")
					? customizerOptions.flip
					: "",
				icon: safeIcon,
			};
			onChange(nextOptions);
		}
		closeModal();
	}, [
		onChange,
		tempSelected,
		customizerOptions,
		resolveTempToValue,
		closeModal,
	]);

	const handleMediaSelect = useCallback(
		(attachments) => {
			setWpLoading(false);
			setUploadError("");
			dispatchMyIcons({ type: "ADD", payload: attachments });
			const lastAttachment = attachments[attachments.length - 1];
			setTempSelected(lastAttachment?.id || "");
			setActiveCategory(customIcons);
			showToast(
				attachments.length === 1
					? "Media imported successfully!"
					: `${attachments.length} media icons imported successfully!`,
			);
		},
		[showToast],
	);

	const handleOpenMediaLibrary = useCallback(() => {
		setUploadError("");
		setWpLoading(true);
		setTimeout(() => setWpLoading(false), 500);
		openWPMediaLibrary(handleMediaSelect, (err) => {
			setWpLoading(false);
			setUploadError(err);
		});
	}, [handleMediaSelect]);

	const handleRemoveCustom = useCallback(
		(id) => {
			dispatchMyIcons({ type: "REMOVE", id });
			if (tempSelected === id) setTempSelected("");
			const ci = myIcons.find((i) => i.id === id);
			if (ci && currentValue.icon === ci.src) onChange({});
			showToast("Asset removed");
		},
		[tempSelected, currentValue.icon, myIcons, onChange, showToast],
	);

	const handleCategoryClick = useCallback((cat) => {
		setActiveCategory(cat);
		if (window.matchMedia?.("(max-width: 1023px)").matches)
			setMobileTab("icons");
	}, []);

	// Cmd/Ctrl + K focuses the search field while the picker is open.
	// Font Awesome icons use classes for rotation and flip transformations.
	const getPreviewClasses = (baseIcon, options) => {
		const classes = [];
		if (baseIcon && !isImageUrl(baseIcon) && isIconClassName(baseIcon))
			classes.push(baseIcon);
		if (ALLOWED_ROTATIONS.has(options.rotation))
			classes.push(`fa-rotate-${options.rotation}`);
		if (ALLOWED_FLIPS.has(options.flip)) {
			if (options.flip === "both")
				classes.push("fa-flip-horizontal", "fa-flip-vertical");
			else classes.push(`fa-flip-${options.flip}`);
		}
		return classes.join(" ");
	};

	// Uploaded images need CSS transforms because Font Awesome classes cannot transform them.
	const getImageTransformStyle = (options) => {
		const rotate = ALLOWED_ROTATIONS.has(options.rotation)
			? Number(options.rotation)
			: 0;
		const flipX =
			options.flip === "horizontal" || options.flip === "both" ? -1 : 1;
		const flipY =
			options.flip === "vertical" || options.flip === "both" ? -1 : 1;
		return {
			transform: `rotate(${rotate}deg) scaleX(${flipX}) scaleY(${flipY})`,
			transformOrigin: "center center",
		};
	};

	const previewColor = customizerOptions.color || "#333";
	const isMyIcons = activeCategory === customIcons;
	const hasSelection = !!tempSelected;
	const footerPreviewUrl = tempSelected.startsWith("custom_")
		? myIcons.find((i) => i.id === tempSelected)?.src
		: null;
	const isImagePreview = !!footerPreviewUrl || isImageUrl(tempSelected);
	const libraryFailed = !isLoading && icons.length === 0;

	const searchField = (inputRef, placeholder, withTools) => (
		<div className="smp-il-search">
			<SearchIcon />
			<input
				ref={inputRef}
				type="text"
				className="smp-il-search-input"
				placeholder={placeholder}
				aria-label="Search icons"
				value={search}
				onChange={handleSearchChange}
			/>
			{withTools && (
				<div className="smp-il-search-tools">
					{search && (
						<button
							type="button"
							className="smp-il-clear"
							aria-label="Clear search"
							onClick={handleClearSearch}
						>
							<XIcon />
						</button>
					)}
				</div>
			)}
		</div>
	);

	return (
		<div style={{ marginBottom: 15 }}>
			<style>{TRIGGER_STYLES}</style>

			{label && (
				<label
					style={{
						display: "block",
						fontSize: 11,
						fontWeight: "bold",
						textTransform: "uppercase",
						marginBottom: 8,
						color: "#757575",
					}}
				>
					{" "}
					{label}{" "}
				</label>
			)}

			<div
				className="smp-icon-trigger"
				role="button"
				onClick={openModal}
				style={{
					height: 80,
					cursor: "pointer",
					backgroundColor: currentValue.icon ? "#fff" : "#f8f9fa",
					border: "1px solid #ddd",
					borderRadius: 4,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<div className="smp-icon-overlay">
					{currentValue.icon ? "Edit Icon" : "Choose Icon"}
				</div>
				{currentValue.icon && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onChange({});
						}}
						style={{
							position: "absolute",
							top: 5,
							right: 5,
							background: "#fff",
							border: "1px solid #ddd",
							borderRadius: "50%",
							width: 22,
							height: 22,
							cursor: "pointer",
							zIndex: 10,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
						>
						<i
							className="fa-solid fa-trash"
							style={{ fontSize: 10, color: "#666" }}
						/>
					</button>
				)}
				 
				{!currentValue.icon && (
					<i
						className="fa-solid fa-plus"
						style={{ fontSize: 20, color: "#6c757d" }}
					/>
				)}

				{currentValue.icon && isImageUrl(currentValue.icon) && (
					<img
						src={currentValue.icon}
						alt="icon"
						style={{
							width: 36,
							height: 36,
							objectFit: "contain",
							...getImageTransformStyle(currentValue),
						}}
					/>
				)}
				{currentValue.icon && !isImageUrl(currentValue.icon) && (
					<i
						className={getPreviewClasses(currentValue.icon, currentValue)}
						style={{ fontSize: 30, color: currentValue.color || "#333" }}
					/>
				)}
			</div>

			{help && (
				<div style={{ fontSize: 12, color: "#6c757d", marginTop: 4 }}>
					{help}
				</div>
			)}

			{/* The picker draws its own header, so the native WP modal header is hidden via CSS. */}
			{isModalOpen && (
				<Modal
					className="smp-react-modal"
					title="Icon Library"
					onRequestClose={closeModal}
					style={{
						width: "min(1280px, 96vw)",
						maxWidth: "none",
						height: "min(860px, 92vh)",
						maxHeight: "none",
					}}
				>
					{/* The WP Modal is portaled to <body>, so its CSS must live inside the modal itself. */}
					<style>{MODAL_STYLES}</style>
					<div className="smp-il">
						{/* ── Header ── */}
						<header className="smp-il-header">
							<div className="smp-il-brand">
								<div className="smp-il-logo">
									<LogoIcon />
								</div>
								<div className="smp-il-brand-text">
									<div className="smp-il-title">Icon Library</div>
									<p className="smp-il-subtitle">
										Vector Assets &amp; Customizer
									</p>
								</div>
							</div>

							<div className="smp-il-search-wrap">
								{searchField(
									searchRef,
									"Search icons (e.g. arrow, user, cloud)...",
									true,
								)}
							</div>

							<div className="smp-il-header-right">
								<button
									type="button"
									className="smp-il-close"
									title="Close"
									aria-label="Close"
									onClick={closeModal}
								>
									<XIcon size={20} strokeWidth={2} />
								</button>
							</div>
						</header>

						{/* ── Mobile tab bar + search ── */}
						<div className="smp-il-mobtabs">
							<div className="smp-il-seg" role="tablist">
								{[
									["categories", "Categories"],
									["icons", "Icons"],
									["styling", "Styling"],
								].map(([key, text]) => (
									<button
										type="button"
										role="tab"
										key={key}
										aria-selected={mobileTab === key}
										className={`smp-il-seg-btn${
											mobileTab === key ? " active" : ""
										}`}
										onClick={() => setMobileTab(key)}
									>
										{text}
									</button>
								))}
							</div>
						</div>
						<div className="smp-il-mobsearch">
							{searchField(null, "Search...", false)}
						</div>

						{/* ── 3-column layout ── */}
						<div className="smp-il-layout" data-tab={mobileTab}>
							{/* Column 1: categories */}
							<aside className="smp-il-col smp-il-col-cats smp-il-scroll">
								<div className="smp-il-cats-head">
									<span className="smp-il-eyebrow">Categories</span>
									<span className="smp-il-pill-count">{CATEGORIES.length}</span>
								</div>
								<nav className="smp-il-nav" aria-label="Icon categories">
									{CATEGORIES.map((cat) => {
										const isActive = activeCategory === cat;
										const count = categoryCounts[cat] || 0;
										return (
											<button
												type="button"
												key={cat}
												className={`smp-il-cat${isActive ? " active" : ""}`}
												aria-current={isActive ? "true" : undefined}
												onClick={() => handleCategoryClick(cat)}
											>
												<span className="smp-il-cat-name">
													{cat === customIcons && <PlusCircleIcon />}
													{cat}
												</span>
												<span className="smp-il-cat-badge">
													{isLoading && cat !== customIcons ? "…" : count}
												</span>
											</button>
										);
									})}
								</nav>
							</aside>

							{/* Column 2: icon grid */}
							<main
								className="smp-il-col smp-il-col-icons smp-il-scroll"
								ref={iconsColRef}
								onScroll={handleIconsScroll}
							>
								<div className="smp-il-gridhead">
									<div className="smp-il-gridhead-left">
										<span className="smp-il-count">
											{isLoading && !isMyIcons
												? "Loading"
												: `Showing ${filteredIcons.length.toLocaleString()} icon${
														filteredIcons.length !== 1 ? "s" : ""
												  }`}
										</span>
										<span className="smp-il-badge">{activeCategory}</span>
									</div>
									<div className="smp-il-hint">
										<span className="smp-il-dot" />
										Click to customize
									</div>
								</div>

								<div className="smp-il-gridbody">
									{isMyIcons && (
										<WPMediaButton
											onOpenLibrary={handleOpenMediaLibrary}
											error={uploadError}
											wpLoading={wpLoading}
										/>
									)}

									{isLoading && !isMyIcons ? (
										<div className="smp-il-loading">
											<Spinner />
											<span>{loadingText}</span>
										</div>
									) : visibleIcons.length === 0 ? (
										<div className="smp-il-empty">
											<div className="smp-il-empty-icon">
												<SearchIcon size={32} />
											</div>
											{libraryFailed && !isMyIcons ? (
												<>
													<p className="smp-il-empty-title">
														Icon library could not be loaded
													</p>
													<p className="smp-il-empty-sub">
														Check your connection, then close and reopen the
														picker
													</p>
												</>
											) : isMyIcons && !debouncedSearch.trim() ? (
												<>
													<p className="smp-il-empty-title">
														No custom icons yet
													</p>
													<p className="smp-il-empty-sub">
														Browse the WordPress Media Library to add your first
														one
													</p>
												</>
											) : (
												<>
													<p className="smp-il-empty-title">No icons found</p>
													<p className="smp-il-empty-sub">
														Try searching for something else
													</p>
												</>
											)}
										</div>
									) : (
										<div className="smp-il-grid">
											{visibleIcons.map((icon) => {
												const selKey = icon.isCustom ? icon.id : icon.value;
												return (
													<IconCard
														key={selKey}
														icon={icon}
														isSel={tempSelected === selKey}
														onSelect={setTempSelected}
														onDelete={handleRemoveCustom}
													/>
												);
											})}
										</div>
									)}
								</div>
							</main>

							{/* Column 3: styling inspector */}
							<StylingPanel
								options={customizerOptions}
								onChange={setCustomizerOptions}
								isImage={isImagePreview}
								disabled={!hasSelection}
								onToast={showToast}
							/>
						</div>

						{/* ── Footer ── */}
						<footer className="smp-il-footer">
							<div className="smp-il-preview">
								<div className="smp-il-preview-tile">
									<div className="smp-il-checker" />
									<div className="smp-il-preview-icon">
										{!hasSelection ? (
											<span className="smp-il-preview-empty">–</span>
										) : isImagePreview ? (
											<img
												src={footerPreviewUrl || tempSelected}
												alt="preview"
												style={getImageTransformStyle(customizerOptions)}
											/>
										) : (
											<i
												className={getPreviewClasses(
													tempSelected,
													customizerOptions,
												)}
												style={{
													fontSize: 30,
													color: previewColor,
													transition: "all 0.3s",
												}}
											/>
										)}
									</div>
								</div>
								<div className="smp-il-preview-text">
									<div className="smp-il-preview-title">
										Live Preview
										{hasSelection && isImagePreview && (
											<span className="smp-il-tag">Custom WP</span>
										)}
									</div>
									<p className="smp-il-preview-sub">
										{hasSelection ? "Styling applied" : "No icon selected"}
									</p>
								</div>
							</div>

							<div className="smp-il-actions">
								<button
									type="button"
									className="smp-il-btn smp-il-btn-cancel"
									onClick={closeModal}
								>
									Cancel
								</button>
								<button
									type="button"
									className="smp-il-btn smp-il-btn-insert"
									disabled={!hasSelection}
									onClick={handleInsert}
								>
									Insert Icon
								</button>
							</div>
						</footer>

						{/* ── Toast ── */}
						<div
							className={`smp-il-toast${toast.show ? " show" : ""}`}
							role="status"
							aria-live="polite"
						>
							<CheckIcon />
							<span>{toast.msg}</span>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}
