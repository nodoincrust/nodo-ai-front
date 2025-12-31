import { RouterProvider } from "react-router-dom";
import router from "./routes";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoaderProvider } from "./CommonComponents/Loader/loader";

function App() {
  return (
    <LoaderProvider>
      <RouterProvider router={router} />
    </LoaderProvider>
  );
}

export default App;