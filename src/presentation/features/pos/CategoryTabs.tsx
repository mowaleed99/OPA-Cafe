import { cn } from '../../lib/utils';
import type { Category } from '../../../core/entities/category';

interface CategoryTabsProps {
  categories: Category[];
  selected: string | null; // null = "All"
  onSelect: (categoryId: string | null) => void;
}

export default function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  const tabs = [{ id: null, name: 'All' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
      {tabs.map((tab) => {
        const isActive = selected === tab.id;
        return (
          <button
            key={tab.id ?? '__all__'}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap border',
              isActive
                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                : 'bg-card border-border text-foreground hover:bg-muted/50'
            )}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
