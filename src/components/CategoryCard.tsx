import React from "react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  key?: any;
}

const CATEGORY_THUMBNAILS: Record<string, string> = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=80",
  Mobiles:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80",
  Laptops:
    "https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=80",
  Fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80",
  Shoes:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80",
  Books:
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80",
  Accessories:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
  "Home Appliances":
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80",
};

export default function CategoryCard({ name }: CategoryCardProps) {
  const imageUrl =
    CATEGORY_THUMBNAILS[name] ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80";

  return (
    <Link
      to={`/category/${encodeURIComponent(name)}`}
      className="group relative h-40 md:h-48 overflow-hidden rounded-[24px] bg-sand/30 block shadow-xs border border-sand/30"
      id={`category-card-${name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Dimmed Overlay */}
      <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/50 transition-colors" />

      {/* Category Text Title */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
        <h3 className="text-white font-serif font-medium tracking-tight text-xl group-hover:underline">
          {name}
        </h3>
        <p className="text-sand font-sans text-[10px] font-semibold tracking-wider uppercase mt-1">
          Explore Collection ➔
        </p>
      </div>
    </Link>
  );
}
