export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  featured: boolean;
  available: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
  mostOrdered: boolean;
  seasonal: boolean;
}
