import React from 'react';

const extractFilename = (url) => {
  if (!url) return null;
  const match = url.match(/\/([^\/]+\.(jpg|jpeg|png|webp))$/i);
  if (!match) return null;
  // Remove WordPress -e{number} suffix (e.g., vitacoco-360-1-e1637338516672-300x300.jpeg → vitacoco-360-1-300x300.jpeg)
  return match[1].replace(/-e\d+(?=-\d+x\d+\.(jpe?g|png|webp)$)/i, '');
};

const ImageWithLoader = ({ src, alt, className = '', priority = false, width, height, ...props }) => {
  const filename = extractFilename(src);
  const webpPath = filename ? `/images/products/${filename.replace(/\.(jpe?g|png)$/i, '.webp')}` : null;
  const localPath = filename ? `/images/products/${filename}` : null;

  return (
    <picture>
      {webpPath && (
        <source srcSet={webpPath} type="image/webp" />
      )}
      {localPath && localPath !== src && (
        <source srcSet={localPath} />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        width={width || 300}
        height={height || 300}
        className={className}
        {...props}
      />
    </picture>
  );
};

export default ImageWithLoader;
