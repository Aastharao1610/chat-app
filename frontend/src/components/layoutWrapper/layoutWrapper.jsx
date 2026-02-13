"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import useLoadUser from "@/hooks/useLoader";
import SocketInitializer from "../socketInitializer/socketInitializer";

function AppInitializer({ children }) {
  useLoadUser();
  return <>{children}</>;
}

export default function LayoutWrapper({ children }) {
  return (
    <Provider store={store}>
      <SocketInitializer />
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}
