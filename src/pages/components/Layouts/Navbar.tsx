'use client'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import React, { useState } from 'react'
import { RiMenu2Line, RiTwitterXLine } from 'react-icons/ri'
import { MobileSidebar } from './MobileSidebar'
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu'
import { Button } from '@/components/ui/button'
import { BsJournalText } from 'react-icons/bs'
import { BiHomeSmile } from 'react-icons/bi'

const Navbar = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false)
  const menuItems = [
    {
      icon: <BiHomeSmile size={20} />,
      name: 'Home',
      link: '/',
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
        <NavigationMenuList className="container nav-container w-screen justify-between items-center pt-2">
          <NavigationMenuItem className="text-2xl text-primary-foreground py-4 font-headings font-semibold">
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
                className="flex justify-center items-center gap-2 hover:animate-bounce h-full py-4 text-base"
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
