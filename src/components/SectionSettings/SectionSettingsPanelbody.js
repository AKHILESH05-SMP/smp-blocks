import { __ } from "@wordpress/i18n";
import {
	BaseControl,
	CheckboxControl,
	PanelBody,
	SelectControl,
} from "@wordpress/components";


// export const DEFAULT_BG_OPTIONS = [
// 	{ label: __("Default (Transparent)", "smp-blocks"), value: "" },
// 	{ label: __("Light 1", "smp-blocks"), value: "kf-bg-light-1" },
// 	{ label: __("Light 2", "smp-blocks"), value: "kf-bg-light-2" },
// 	{ label: __("Dark 1", "smp-blocks"), value: "kf-bg-dark-1" },
// 	{ label: __("Dark 2", "smp-blocks"), value: "kf-bg-dark-2" },
// 	{ label: __("Primary Solid", "smp-blocks"), value: "kf-bg-primary" },
// ];
const fallbackBgOptions = [
	{ label: __("Default (Transparent)", "smp-blocks"), value: "" },
];

export const DEFAULT_BG_OPTIONS = window.smpDynamicBgOptions || fallbackBgOptions;

export const DEFAULT_PADDING_OPTIONS = [
	{
		label: __("No Padding Top", "smp-blocks"),
		value: "pt-0",
	},
	{
		label: __("No Padding Bottom", "smp-blocks"),
		value: "pb-0",
	},
];

const toggleOption = (selectedOptions, value, checked) =>
	checked
		? [...selectedOptions, value]
		: selectedOptions.filter((item) => item !== value);

const SectionSettingsPanelBody = ({
	bgClass = "",
	selectedPaddingOptions = [],
	paddingOptionsList = DEFAULT_PADDING_OPTIONS,
	backgroundOptions = DEFAULT_BG_OPTIONS,
	setAttributes,
	title = __("Section Settings", "smp-blocks"),
}) => {
	const togglePadding = (value, checked) => {
		setAttributes({
			selectedPaddingOptions: toggleOption(
				selectedPaddingOptions,
				value,
				checked
			),
		});
	};

	return (
		<PanelBody title={title} initialOpen={false}>
			<BaseControl label={__("Padding Options", "smp-blocks")}>
				{paddingOptionsList.map(({ label, value }) => (
					<CheckboxControl
						key={value}
						label={label}
						checked={selectedPaddingOptions.includes(value)}
						onChange={(checked) =>
							togglePadding(value, checked)
						}
					/>
				))}
			</BaseControl>

			<SelectControl
				label={__("Background Color", "smp-blocks")}
				value={bgClass}
				options={backgroundOptions}
				onChange={(bgClass) => setAttributes({ bgClass })}
				help={__(
					"Select a preset background color class for this block.",
					"smp-blocks"
				)}
			/>
		</PanelBody>
	);
};

export default SectionSettingsPanelBody;