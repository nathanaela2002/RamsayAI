
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  name: string;
  image: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${name.toLowerCase()}`);
  };

  return (
    <div 
      className="category-card h-40 rounded-xl overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 w-full p-4 z-10">
        <h3 className="text-xl font-bold text-white">{name}</h3>
      </div>
    </div>
  );
};

export default CategoryCard;
