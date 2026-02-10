import { JSX, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Action menu item interface
 */
interface ActionMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

/**
 * Props for ActionMenu component
 */
interface ActionMenuProps {
  items: ActionMenuItem[];
  vehicleId: number;
}

/**
 * Action menu component with "..." icon
 * Shows dropdown menu on click with action options
 * Responsive and accessible design
 */
export const ActionMenu = ({ items, vehicleId }: ActionMenuProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Handle click outside to close menu
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also handle escape key
      const handleEscape = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  /**
   * Toggle menu open/close
   */
  const toggleMenu = (): void => {
    setIsOpen((prev) => !prev);
  };

  /**
   * Handle menu item click
   */
  const handleItemClick = (item: ActionMenuItem): void => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      {/* Three dots icon button */}
      <button
        type="button"
        onClick={toggleMenu}
        className={`p-1.5 md:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          isOpen ? 'bg-gray-100 text-gray-700' : ''
        }`}
        aria-label="Actions menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, index) => (
            <button
              key={`${vehicleId}-${index}`}
              type="button"
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : item.className ||
                    'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
