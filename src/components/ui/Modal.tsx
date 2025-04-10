import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Example icon, install @heroicons/react if needed

import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  // Add size variants if needed (e.g., sm, md, lg, xl)
  // size?: 'sm' | 'md' | 'lg' | 'xl'; 
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // TODO: Implement size classes based on prop
  // const sizeClasses = {
  //   sm: 'max-w-sm',
  //   md: 'max-w-md',
  //   lg: 'max-w-lg',
  //   xl: 'max-w-xl',
  // };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className={cn(
                  "w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all",
                  // Add size class here: size ? sizeClasses[size] : 'max-w-md'
                )}
              >
                {/* Optional Title and Close Button */}
                {Boolean(title) && (
                  <div className="flex items-start justify-between mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-foreground"
                    >
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center rounded-md bg-transparent p-1.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* If there's no title but we need a close button */}
                {!title && (
                  <div className="flex justify-end mb-4">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-transparent p-1.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* Modal Content */}
                <div>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal; 