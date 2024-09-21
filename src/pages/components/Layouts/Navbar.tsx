import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { useState } from 'react'
import { RiMenu2Line, RiTwitterXLine } from 'react-icons/ri'
import { MobileSidebar } from './MobileSidebar'
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu'
import { Button } from '@/components/ui/button'
import { BsJournalText } from 'react-icons/bs'
import { BiHomeSmile } from 'react-icons/bi'
import { MdRedeem } from 'react-icons/md'

const Navbar = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false)
  const menuItems = [
    {
      icon: <BiHomeSmile size={20} />,
      name: 'Home',
      link: '/',
    },
    {
      icon: <MdRedeem size={18} />,
      name: 'Redeem',
      link: '/redeem',
    },
    {
      icon: <RiTwitterXLine size={18} />,
      name: 'Twitter/X',
      link: 'https://x.com/heekowave',
    },
    {
      icon: <BsJournalText size={18} />,
      name: 'Writings',
      link: 'https://heekowave.substack.com',
    },
  ]

  return (
    <>
      <NavigationMenu className="mx-auto navigation-menu">
        <NavigationMenuList className="container items-center justify-between w-screen pt-2 nav-container">
          <NavigationMenuItem className="py-4 text-2xl font-semibold text-primary-foreground font-headings">
            Heekowave
          </NavigationMenuItem>

          <NavigationMenuItem className="mr-auto">
            <button
              className="menu-button lg:hidden"
              onClick={() => setShowSidebar(true)}
            >
              {showSidebar ? null : <RiMenu2Line size={30} color="#EBE8E2" />}

              {/* <FaBear /> */}
            </button>
          </NavigationMenuItem>

          <div className="nav-menu-items text-primary-foreground">
            {menuItems.map((item, i) => (
              <NavigationMenuLink
                className="flex items-center justify-center h-full gap-2 py-4 text-base hover:animate-bounce"
                href={item.link}
                key={i}
                target={item.name === 'Home' ? '_parent' : '_blank'}
              >
                {item.icon} {item.name}
              </NavigationMenuLink>
            ))}
            <Button variant="nav" className="btn-primary hover:animate-pulse">
              Stay In Touch
            </Button>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
      {showSidebar && (
        <MobileSidebar menuItems={menuItems} setShowSidebar={setShowSidebar} />
      )}
    </>
  )
}

export default Navbar
