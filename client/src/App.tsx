import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { HomePage } from "./pages";
import CreateJoinRoom from "./pages/createJoinRoom";
import OfflineGame from "./pages/offline";
import Room from "./pages/room";
import NotFoundPage from "./pages/404Page";
import SupportPage from "./pages/support";
import HowToPlay from "./pages/HowToPlay";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  { path: "/room", element: <Navigate to="/room/create" /> },
  {
    path: "/room/:roomId",
    element: <Room />,
  },
  {
    path: "/room/create",
    element: <CreateJoinRoom />,
  },
  {
    path: "/room/join",
    element: <CreateJoinRoom />,
  },
  { path: "/game", element: <OfflineGame /> },
  { path: "/support", element: <SupportPage /> },
  { path: "/how-to-play", element: <HowToPlay /> },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        toastOptions={{
          style: {
            fontSize: "0.9rem",
            padding: "3px",
            color: "white",
            fontFamily: "cursive",
            backgroundColor: "hsl(0,0%,40%)",
          },
        }}
      />
    </>
  );
}
