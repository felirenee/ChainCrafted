import React, { useEffect } from "react";
// import "./App.css";
import "./index.css";
import Chat from "./components/Chat";
import { Toaster } from "react-hot-toast";

const App = function AppWrapper() {
  return (
    <>
      <main>
        <Chat />
      </main>
      <Toaster />
    </>
  );
};

export default App;
