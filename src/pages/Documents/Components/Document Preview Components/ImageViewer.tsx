
const ImageViewer = ({ fileUrl, fileName, onLoadError }: any) => (
  <img
    src={fileUrl}
    alt={fileName}
    onError={() => onLoadError?.()}
    style={{
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
    }}
  />
);
export default ImageViewer
