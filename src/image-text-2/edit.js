import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import {
    useBlockProps,
    InspectorControls,
    RichText,
} from "@wordpress/block-editor";

import { PanelBody, ToggleControl, SelectControl } from "@wordpress/components";

import { ImagePanelBody, ImageRender } from "../components/Image";
import { ButtonPanelBody, ButtonRender } from "../components/Button";
import { SectionSettingsPanelBody } from "../components/SectionSettings";

export default function Edit({ attributes, setAttributes }) {
    const {
        selectedPaddingOptions = [],
        bgClass,

        imagePosition,
        imageId,
        imageUrl,
        imageAlt,
        imageSize,
        imageSizes,
        aspectRatio,
        objectPosition,
        lazyLoad,

        showSubHeading,
        subHeading,
        showHeading,
        headingTag,
        heading,
        showDescription,
        description,

        showButton,
        buttonText,
        buttonUrl,
        buttonTarget,
        buttonStyle,

        showButton2,
        buttonText2,
        buttonUrl2,
        buttonTarget2,
        buttonStyle2,
    } = attributes;

    // Store the selected image and its available sizes.
    const onSelectImage = (media) => {
        const sizes = media?.sizes || {};

        setAttributes({
            imageId: media?.id || 0,
            imageAlt: media?.alt || "",
            imageSizes: sizes,
            imageSize: "full",
            imageUrl: media?.url || "",
        });
    };

    // Update the displayed image URL when a different image size is selected.
    const onChangeImageSize = (size) => {
        const selected = imageSizes?.[size];

        const fallback =
            imageSizes?.full || imageSizes?.large || imageSizes?.medium;

        setAttributes({
            imageSize: size,
            imageUrl: selected?.url || fallback?.url || imageUrl,
        });
    };

    // Clear all image-related attributes.
    const onRemoveImage = () =>
        setAttributes({
            imageId: null,
            imageUrl: "",
            imageAlt: "",
            imageSizes: {},
            imageSize: "full",
        });

    // Store an image provided via a direct URL instead of the media library.
    const onSelectURL = (url) =>
        setAttributes({
            imageId: 0,
            imageUrl: url,
            imageAlt: "",
            imageSizes: {},
            imageSize: "full",
        });

    // Map shared button control attributes to the second button's attribute names.
    const setButton2Attributes = (newAttrs) => {
        const mappedAttrs = {};
        if (newAttrs.showButton !== undefined)
            mappedAttrs.showButton2 = newAttrs.showButton;
        if (newAttrs.buttonText !== undefined)
            mappedAttrs.buttonText2 = newAttrs.buttonText;
        if (newAttrs.buttonUrl !== undefined)
            mappedAttrs.buttonUrl2 = newAttrs.buttonUrl;
        if (newAttrs.buttonTarget !== undefined)
            mappedAttrs.buttonTarget2 = newAttrs.buttonTarget;
        if (newAttrs.buttonStyle !== undefined)
            mappedAttrs.buttonStyle2 = newAttrs.buttonStyle;
        setAttributes(mappedAttrs);
    };

    const sectionClasses = [
        "kf-section",
        "text-image-03-container",
        "position-relative",
        bgClass,
        ...selectedPaddingOptions,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Fragment>
            <InspectorControls>
                <SectionSettingsPanelBody
                    bgClass={bgClass}
                    selectedPaddingOptions={selectedPaddingOptions}
                    setAttributes={setAttributes}
                />

                <ImagePanelBody
                    imagePosition={imagePosition}
                    imageId={imageId}
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    imageSizes={imageSizes}
                    imageSize={imageSize}
                    aspectRatio={aspectRatio}
                    objectPosition={objectPosition}
                    lazyLoad={lazyLoad}
                    setAttributes={setAttributes}
                    imagePositionOptions={[
                        { label: __("Left", "smp-blocks"), value: "left" },
                        { label: __("Right", "smp-blocks"), value: "right" },
                    ]}
                    controls={{
                        imagePosition: true,
                        imageUpload: true,
                        aspectRatio: true,
                        imageSize: true,
                        objectPosition: true,
                        lazyLoad: true,
                    }}
                    onSelectImage={onSelectImage}
                    onChangeImageSize={onChangeImageSize}
                    onRemoveImage={onRemoveImage}
                />

                <PanelBody
                    title={__("Content Settings", "smp-blocks")}
                    initialOpen={false}
                >
                    <ToggleControl
                        label={__("Show Sub Heading", "smp-blocks")}
                        checked={showSubHeading}
                        onChange={(v) => setAttributes({ showSubHeading: v })}
                    />
                    <ToggleControl
                        label={__("Show Heading", "smp-blocks")}
                        checked={showHeading}
                        onChange={(v) => setAttributes({ showHeading: v })}
                    />
                    {showHeading && (
                        <SelectControl
                            label={__("Heading Tag", "smp-blocks")}
                            value={headingTag}
                            options={["h1", "h2", "h3", "h4", "h5", "h6"].map((h) => ({
                                label: h.toUpperCase(),
                                value: h,
                            }))}
                            onChange={(val) => setAttributes({ headingTag: val })}
                        />
                    )}
                    <ToggleControl
                        label={__("Show Description", "smp-blocks")}
                        checked={showDescription}
                        onChange={(v) => setAttributes({ showDescription: v })}
                    />
                </PanelBody>

                <ButtonPanelBody
                    title={__("Button 1 Settings", "smp-blocks")}
                    showButton={showButton}
                    buttonText={buttonText}
                    buttonUrl={buttonUrl}
                    buttonTarget={buttonTarget}
                    buttonStyle={buttonStyle}
                    setAttributes={setAttributes}
                />

                <ButtonPanelBody
                    title={__("Button 2 Settings", "smp-blocks")}
                    showButton={showButton2}
                    buttonText={buttonText2}
                    buttonUrl={buttonUrl2}
                    buttonTarget={buttonTarget2}
                    buttonStyle={buttonStyle2}
                    setAttributes={setButton2Attributes}
                />
            </InspectorControls>

            <div {...useBlockProps({ className: sectionClasses })}>
                <div className="container" data-mf-animation="fade-up">
                    <div className="row">
                        <div className="col-xl-10 mx-auto">
                            <div className="kf-section-heading kf-section-heading-center">
                                
                                {/* Heading Wrapper with Condition */}
                                {(showSubHeading || showHeading) && (
                                    <div className="kf-section-heading-main">
                                        {showSubHeading && (
                                            <RichText
                                                tagName="div"
                                                className="kf-eyebrow"
                                                value={subHeading}
                                                allowedFormats={[]}
                                                onChange={(v) => setAttributes({ subHeading: v })}
                                                placeholder={__("Subheading", "smp-blocks")}
                                            />
                                        )}
                                        {showHeading && (
                                            <RichText
                                                tagName={headingTag}
                                                className="h2"
                                                value={heading}
                                                allowedFormats={[
                                                    "core/bold",
                                                    "core/italic",
                                                    "core/text-color",
                                                ]}
                                                onChange={(v) => setAttributes({ heading: v })}
                                                placeholder={__("Heading", "smp-blocks")}
                                            />
                                        )}
                                    </div>
                                )}
                                
                                {/* Description and Desktop Buttons Wrapper with Condition */}
                                {(showDescription || showButton || showButton2) && (
                                    <div className="kf-section-heading-description">
                                        {showDescription && (
                                            <RichText
                                                tagName="p"
                                                value={description}
                                                allowedFormats={["core/bold", "core/italic", "core/link"]}
                                                onChange={(v) => setAttributes({ description: v })}
                                                placeholder={__("Description", "smp-blocks")}
                                            />
                                        )}
                                        
                                        {(showButton || showButton2) && (
                                            <div className="d-none d-md-flex flex-column flex-md-row gap-3 gap-md-4 mt-2">
                                                {showButton && (
                                                    <ButtonRender
                                                        showButton={showButton}
                                                        buttonUrl={buttonUrl}
                                                        buttonTarget={buttonTarget}
                                                        buttonStyle={buttonStyle}
                                                        buttonText={buttonText}
                                                        setAttributes={setAttributes}
                                                    />
                                                )}
                                                {showButton2 && (
                                                    <ButtonRender
                                                        showButton={showButton2}
                                                        buttonUrl={buttonUrl2}
                                                        buttonTarget={buttonTarget2}
                                                        buttonStyle={buttonStyle2}
                                                        buttonText={buttonText2}
                                                        setAttributes={setButton2Attributes}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xl-10 mx-auto">
                            <ImageRender
                                imageUrl={imageUrl}
                                imageAlt={imageAlt}
                                aspectRatio={aspectRatio}
                                objectPosition={objectPosition}
                                lazyLoad={lazyLoad}
                                onSelectImage={onSelectImage}
                                onSelectURL={onSelectURL}
                                extraWrapperClass="text-image-03-media"
                            />
                            
                            {/* Mobile CTA Buttons */}
                            {(showButton || showButton2) && (
                                <div className="w-100 d-flex flex-column d-md-none gap-3 gap-md-4 mt-4">
                                    {showButton && (
                                        <ButtonRender
                                            showButton={showButton}
                                            buttonUrl={buttonUrl}
                                            buttonTarget={buttonTarget}
                                            buttonStyle={buttonStyle}
                                            buttonText={buttonText}
                                            setAttributes={setAttributes}
                                        />
                                    )}
                                    {showButton2 && (
                                        <ButtonRender
                                            showButton={showButton2}
                                            buttonUrl={buttonUrl2}
                                            buttonTarget={buttonTarget2}
                                            buttonStyle={buttonStyle2}
                                            buttonText={buttonText2}
                                            setAttributes={setButton2Attributes}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}