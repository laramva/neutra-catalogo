import Catalogo from "./pages/Catalogo";
import { ToastProvider } from "./components/Toast";

export default function App() {
  return (
    <ToastProvider>
      <Catalogo />
    </ToastProvider>
  );
}
