export const scrollLayoutToTop = () => {
  const layoutMain = document.querySelector<HTMLElement>(".layout-main");
  layoutMain?.scrollTo({ top: 0, behavior: "smooth" });
};