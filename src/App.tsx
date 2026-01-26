import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import SupabaseDiagnostic from "./components/SupabaseDiagnostic";

function App() {
  return <RouterProvider router={router} />;
  <SupabaseDiagnostic />
}

export default App;
