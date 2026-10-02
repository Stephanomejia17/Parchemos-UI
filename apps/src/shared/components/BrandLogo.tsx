import Image from "next/image";
import logo from "@/public/assets/icono_parchemos.svg";

export function BrandLogo({ className = "h-8 w-8" }: { className?: string }) {
  return <Image src={logo} alt="Parchemos" width={256} height={256} className={className} priority />;
}

