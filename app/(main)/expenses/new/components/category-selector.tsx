"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CategorySelectorProps {
  categories: Category[];
  onChange: (categoryId: string) => void;
}

export function CategorySelector({
  categories,
  onChange,
}: CategorySelectorProps): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleValueChange = (value: string) => {
    setSelectedCategory(value);
    onChange(value);
  };

  return (
    <Select value={selectedCategory} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span>{category.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
