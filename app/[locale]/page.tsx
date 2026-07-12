import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Catalog } from "@/components/Catalog";
import { CakeConfigurator } from "@/components/CakeConfigurator";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutBar } from "@/components/CheckoutBar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="pb-24">
        <Hero />
        <Catalog />
        <CakeConfigurator />
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutBar />
    </>
  );
}