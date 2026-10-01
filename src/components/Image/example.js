import {
  ImagePanelBody,
  ImageRender,
} from '../components/Image';

import { InspectorControls } from '@wordpress/block-editor';

export default function Edit({ attributes, setAttributes }) {

  const {
    imagePosition = 'right',
    imageId,
    imageUrl,
    imageAlt,
    imageSize,
    imageSizes,
    aspectRatio = '4x3',
    objectPosition = 'center center',
    lazyLoad = false,
  } = attributes;

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

  const onChangeImageSize = (size) => {
    const selected = imageSizes?.[size];

    const fallback =
      imageSizes?.full ||
      imageSizes?.large ||
      imageSizes?.medium;

    setAttributes({
      imageSize: size,
      imageUrl: selected?.url || fallback?.url || imageUrl,
    });
  };

  const onRemoveImage = () => {
    setAttributes({
      imageId: null,
      imageUrl: '',
      imageAlt: '',
      imageSizes: {},
      imageSize: 'full',
    });
  };

  const onSelectURL = (url) => {
    setAttributes({
      imageId: null,
      imageUrl: url,
      imageAlt: '',
      imageSizes: {},
      imageSize: 'full'
    });
  };

  return (
    <>
      <InspectorControls>
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
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ]}
          controls={{
            aspectRatio: true,
            imageSize: true,
            objectPosition: true,
            lazyLoad: true,
          }}
          onSelectImage={onSelectImage}
          onChangeImageSize={onChangeImageSize}
          onRemoveImage={onRemoveImage}
        />
      </InspectorControls>

      <ImageRender
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        ratioClass={aspectRatio}
        objectPosition={objectPosition}
        lazyLoad={lazyLoad}
        imagePosition={imagePosition}
        onSelectImage={onSelectImage}
        onSelectURL={onSelectURL}
        extraWrapperClass="text-image-01-media"
      />
    </>
  );
}