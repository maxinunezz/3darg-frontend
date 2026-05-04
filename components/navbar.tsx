"use client"
import React from 'react';
import { Heart, ShoppingCart, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MenuList from './menu-list';
import Image from 'next/image';
import Logo from '../public/3DARG/logos/3dargblack.svg';
import { ToggleTheme } from './ui/toggle-theme';

export const Navbar = () => {
    const router = useRouter();

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-32 flex items-center">
                    <div className="w-1/3 h-auto flex items-center pt-6">
                    <Image src={Logo} width={150} height={150} alt="3DARG logo" />
                    </div>

                    <div className="w-1/3 flex justify-center">
                        <MenuList />
                    </div>

                    <div className="w-1/3 flex items-center justify-end space-x-4">
                        <ShoppingCart
                            strokeWidth={1}
                            className="text-gray-700 hover:text-blue-600 cursor-pointer"
                            onClick={() => router.push('/cart')}
                        />
                        <Heart
                            strokeWidth={1}
                            className="text-gray-700 hover:text-blue-600 cursor-pointer"
                            onClick={() => router.push('/favorites')}
                        />
                        <User
                            strokeWidth={1}
                            className="text-gray-700 hover:text-blue-600 cursor-pointer"
                            onClick={() => router.push('/profile')}
                        />

                        <ToggleTheme />
                    </div>

                </div>
            </div>
        </nav>
    );
};