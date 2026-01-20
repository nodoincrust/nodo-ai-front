
const ImageViewer = ({ fileUrl, fileName }: any) => (
  <img
    src={fileUrl}
    alt={fileName}
    style={{
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
    }}
  />
);
export default ImageViewer
