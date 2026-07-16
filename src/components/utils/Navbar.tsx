import { useState } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  Input,
  Image,
  Badge,
} from "@heroui/react";
import { Button } from "../ui/heroui";
import { UserDropdown } from "./User";
import { useSession } from "../providers/SessionProvider";
import { IoClose } from "react-icons/io5";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import Theme from "@/components/utils/Theme";
import EngageSpotNotification from "@/components/ui/Notification";
import CartDrawer from "./Cart/CartDrawer";
import { useUserCart } from "@/hooks/react-query/cart";

const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const { data: cartItems } = useUserCart();
  const totalCartItems = cartItems?.length || 0;

  const isHideSearch = () => {
    const listRoutes = ["/catalog"];
    return listRoutes.some((route) => pathname.includes(route));
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search");
    if (search) {
      setIsSearchOpen(false);
      router.push(`/catalog?q=${search}`);
    }
  };

  return (
    <form onSubmit={onSearch}>
      {isSearchOpen && (
        <div className="fixed top-2 left-3 right-3 z-50 flex items-center gap-2 py-1 rounded-xl">
          <Input
            autoFocus
            isClearable
            placeholder="Cari Costummu...."
            variant="faded"
            radius="sm"
            type="search"
            name="search"
            startContent={<FaSearch size={16} className="text-primary" />}
          />
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Close search"
            startContent={<IoClose size={20} />}
            onPress={() => setIsSearchOpen(false)}
          />
        </div>
      )}

      <HeroUINavbar
        isBordered
        className="border-b-default-300"
        classNames={{ wrapper: "content-wrapper" }}
      >
        {!isSearchOpen && (
          <>
            <NavbarContent justify="start">
              <NavbarBrand>
                <Image
                  src="/logo.jpg"
                  alt="logo"
                  width={45}
                  height={45}
                  onClick={() => router.push("/")}
                />
              </NavbarBrand>
            </NavbarContent>
            <NavbarContent
              as="div"
              className="items-center gap-1 md:gap-2"
              justify="end"
            >
              {!isHideSearch() && (
                <>
                  <div className="hidden sm:block">
                    <Input
                      placeholder="Cari Alat..."
                      startContent={
                        <FaSearch size={16} className="text-primary" />
                      }
                      type="search"
                      variant="flat"
                      radius="sm"
                      name="search"
                    />
                  </div>
                  <div className="sm:hidden">
                    <Button
                      variant="light"
                      isIconOnly
                      startContent={
                        <FaSearch size={16} className="text-primary" />
                      }
                      onPress={() => setIsSearchOpen(true)}
                      aria-label="Search Button Mobile"
                    />
                  </div>
                </>
              )}
              {user ? (
                <>
                  <Badge
                    content={totalCartItems}
                    isInvisible={totalCartItems === 0}
                    color="primary"
                    showOutline={false}
                    size="sm"
                  >
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={() => setIsCartOpen(true)}
                      aria-label="Shopping Cart"
                    >
                      <FaShoppingCart size={20} />
                    </Button>
                  </Badge>
                  <EngageSpotNotification />
                  <UserDropdown />
                </>
              ) : (
                <>
                  <Theme />
                  <Button
                    color="primary"
                    aria-label="Login"
                    onPress={() => router.push("/auth/login")}
                  >
                    Login
                  </Button>
                </>
              )}
            </NavbarContent>
          </>
        )}
        {/* Move closer if necessary */}
      </HeroUINavbar>

      {/* Cart Drawer */}
      {user && (
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </form>
  );
};

export default Navbar;
