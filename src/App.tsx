import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { SupabaseConnectionTest } from "./components/SupabaseConnectionTest";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
