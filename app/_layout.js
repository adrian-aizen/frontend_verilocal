import { Stack } from "expo-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Stack screenOptions={{ headerShown: false }} />
      <Footer />
    </>
  );
}
