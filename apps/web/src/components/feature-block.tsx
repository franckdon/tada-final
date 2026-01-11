import type React from "react";
import * as LucideIcons from "lucide-react";

interface FeatureBlockProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({
  icon,
  title,
  description,
}) => {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Circle;
  };

  const Icon = getIcon(icon);
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6 items-start">
      <div className="flex justify-center md:justify-start">
        {/* <img className="w-16 h-16" src={icon} alt="Reliable data" /> */}
        <Icon className="w-16 h-16 font-semibold text-primary" />
      </div>
      <div className="text-center md:text-left">
        <h4 className="text-2xl font-bold mb-2 text-primary">{title}:</h4>
        <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
      </div>
    </div>
  );
};

export default FeatureBlock;
