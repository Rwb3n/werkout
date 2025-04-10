import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Example icon

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button'; // Assuming Button component exists

// Define structure for menu items
interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string; // For link items
  icon?: React.ElementType;
  disabled?: boolean;
}

interface DropdownProps {
  buttonLabel: React.ReactNode; // What the trigger button displays
  items: DropdownItem[];
  // Add props for positioning (e.g., 'left', 'right')
  // position?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ buttonLabel, items }) => {
  // TODO: Implement positioning classes based on prop
  const positionClasses = 'origin-top-right right-0'; // Default to right

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button as={Button} variant="outline">
          {buttonLabel}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            "absolute mt-2 w-56 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            positionClasses
          )}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index} disabled={item.disabled}>
                {({ active }) => {
                  const itemClasses = cn(
                    'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    active ? 'bg-accent text-accent-foreground' : 'text-foreground',
                    item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  );

                  // Render as link or button based on props
                  if (item.href) {
                    return (
                      <a href={item.href} className={itemClasses}>
                        {item.icon && <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />}
                        {item.label}
                      </a>
                    );
                  } else {
                    return (
                      <button type="button" className={itemClasses} onClick={item.onClick}>
                        {item.icon && <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />}
                        {item.label}
                      </button>
                    );
                  }
                }}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown; 