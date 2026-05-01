
import React from 'react';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Social Platform Header Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between sticky top-0 z-40 shadow-sm flex-shrink-0">
        {/* Left Section: Logo & Search */}
        <div className="flex items-center space-x-2 min-w-[300px]">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg" 
              alt="Logo" 
              className="w-10 h-10 cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
          <div className="relative hidden xl:block">
            <input 
              type="text" 
              placeholder="Rechercher sur Facebook" 
              className="bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none w-64 text-[15px]"
              disabled
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </div>
          <div className="xl:hidden bg-gray-100 p-2.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
            <i className="fas fa-search text-gray-600"></i>
          </div>
        </div>

        {/* Center Section: Main Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center max-w-[600px] h-full mx-4">
          <div className="flex items-center justify-between w-full h-full">
            <NavItem icon="fa-home" label="Accueil" href="https://www.facebook.com" />
            <NavItem icon="fa-user-group" label="Amis" href="https://www.facebook.com/friends" />
            <NavItem icon="fa-tv" label="Watch" href="https://www.facebook.com/watch" />
            <NavItem icon="fa-shop" label="Marketplace" active href="https://www.facebook.com/marketplace" />
            <NavItem icon="fa-gamepad" label="Gaming" href="https://www.facebook.com/gaming" />
          </div>
        </nav>

        {/* Right Section: Profile & Actions */}
        <div className="flex items-center justify-end space-x-2 min-w-[300px]">
          <div className="bg-gray-100 p-2.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" title="Menu">
            <i className="fas fa-th text-gray-700"></i>
          </div>
          <a href="https://www.facebook.com/messages" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-2.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" title="Messenger">
            <i className="fab fa-facebook-messenger text-gray-700"></i>
          </a>
          <div className="bg-gray-100 p-2.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" title="Notifications">
            <i className="fas fa-bell text-gray-700"></i>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-gray-200 cursor-pointer hover:brightness-95 transition-all ml-1">
            <img 
              src="https://media.istockphoto.com/id/2171382633/fr/vectoriel/icône-de-profil-utilisateur-symbole-de-personne-anonyme-graphique-davatar-vierge.jpg?s=612x612&w=0&k=20&c=xc5c3QmH-iTo7EbRzADsYTAWV4-H6ghiA17qOv1kmao=" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Marketplace Sidebar */}
        <aside className="w-[360px] bg-white border-r border-gray-200 p-4 hidden lg:block overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <div className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
              <i className="fas fa-cog text-gray-700"></i>
            </div>
          </div>
          
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Rechercher sur le Marketplace" 
              className="bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none w-full text-[15px]"
              disabled
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-500"></i>
          </div>

          <div className="space-y-1">
            <SidebarItem icon="fa-store" label="Tout parcourir" active href="https://www.facebook.com/marketplace" />
            <SidebarItem icon="fa-bell" label="Notifications" href="https://www.facebook.com/marketplace/notifications" />
            <SidebarItem icon="fa-inbox" label="Boîte de réception" href="https://www.facebook.com/marketplace/messaging" />
            <SidebarItem icon="fa-shopping-bag" label="Achats" href="https://www.facebook.com/marketplace/you/buying" />
            <SidebarItem icon="fa-tag" label="Ventes" href="https://www.facebook.com/marketplace/you/selling" />
          </div>
          
          <button className="w-full bg-blue-100 text-[#0866FF] font-semibold py-2 rounded-lg mt-6 hover:bg-blue-200 transition-colors">
            + Créer une annonce
          </button>

          <div className="border-t border-gray-200 mt-6 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-[17px]">Filtres</h2>
              <button className="text-[#0866FF] text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded">Réinitialiser</button>
            </div>
            <p className="text-[#0866FF] font-medium text-[15px] mt-2 cursor-pointer hover:underline">Paris, IDF · Dans un rayon de 65 km</p>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4">
             <h2 className="font-bold text-gray-900 text-[17px] mb-4">Catégories</h2>
             <div className="space-y-1">
               <CategoryItem icon="fa-car" label="Véhicules" href="https://www.facebook.com/marketplace/category/vehicles" />
               <CategoryItem icon="fa-house" label="Location immobilière" href="https://www.facebook.com/marketplace/category/propertyrentals" />
               <CategoryItem icon="fa-mobile-screen-button" label="Électronique" href="https://www.facebook.com/marketplace/category/electronics" />
               <CategoryItem icon="fa-couch" label="Maison" href="https://www.facebook.com/marketplace/category/home" />
               <CategoryItem icon="fa-puzzle-piece" label="Loisirs" href="https://www.facebook.com/marketplace/category/hobbies" />
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#F0F2F5] overflow-y-auto flex flex-col">
          <div className="flex-1 max-w-6xl mx-auto p-4 md:p-8 w-full">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, href }: { icon: string, label: string, active?: boolean, href: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex-1 h-full flex items-center justify-center group cursor-pointer relative"
    title={label}
  >
    <div className={`
      w-full h-[90%] flex items-center justify-center rounded-lg mx-1 transition-colors
      ${active ? '' : 'hover:bg-gray-100'}
    `}>
      <i className={`
        fas ${icon} text-2xl transition-colors
        ${active ? 'text-[#0866FF]' : 'text-gray-500 group-hover:text-gray-600'}
      `}></i>
    </div>
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0866FF] rounded-t-full"></div>
    )}
  </a>
);

const SidebarItem = ({ icon, label, active = false, href }: { icon: string, label: string, active?: boolean, href: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition ${active ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
  >
    <div className={`w-9 h-9 flex items-center justify-center rounded-full ${active ? 'bg-[#0866FF] text-white' : 'bg-gray-200 text-gray-700'}`}>
      <i className={`fas ${icon} text-[15px]`}></i>
    </div>
    <span className={`text-[15px] font-semibold ${active ? 'text-[#0866FF]' : 'text-gray-900'}`}>{label}</span>
  </a>
);

const CategoryItem = ({ icon, label, href }: { icon: string, label: string, href: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
  >
    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-700">
      <i className={`fas ${icon} text-[15px]`}></i>
    </div>
    <span className="text-[15px] font-medium text-gray-900">{label}</span>
  </a>
);
