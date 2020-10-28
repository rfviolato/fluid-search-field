import React, { FC, ImgHTMLAttributes, useState, useEffect } from "react";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { ImageWrapper, Img, LoadingIcon, LoadingIconWrapper } from "./styled";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  width: number;
  height: number;
}

export const LazyImage: FC<ImageProps> = ({
  src,
  width,
  height,
  className,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState("");
  const [isImageDisplayed, setImageDisplayed] = useState(false);

  useEffect(() => {
    if (!src) {
      return;
    }

    const preloadImg = new Image();
    const onLoad = () => {
      setImageSrc(src);
      setTimeout(() => setImageDisplayed(true), 300);
    };

    preloadImg.onload = onLoad;
    preloadImg.width = width;
    preloadImg.height = height;
    preloadImg.src = src;

    return () => {
      preloadImg.remove();
    };
  }, [src, width, height]);

  return (
    <ImageWrapper>
      <Img
        {...props}
        src={imageSrc}
        isDisplayed={isImageDisplayed}
        alt={props.alt}
        className={className}
      />

      <LoadingIconWrapper isDisplayed={!imageSrc}>
        <LoadingIcon icon={faImage} />
      </LoadingIconWrapper>
    </ImageWrapper>
  );
};
