import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
 
import Modal from './Modal'; // Use default import
import { Button } from './Button';
 
const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for props if needed
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    children: { control: 'text' }, // Example text content
  },
  // Define default args for the component used in the template
  args: {
    isOpen: false, // Default state managed by template
    onClose: () => {}, // Placeholder onClose managed by template
    title: 'Default Modal Title',
    children: 'Default modal content.',
  }
} satisfies Meta<typeof Modal>;
 
export default meta;
type Story = StoryObj<typeof Modal>;
 
// Helper component to manage modal state for the story
const ModalWrapper: React.FC<{ initialOpen?: boolean; title?: string; children: React.ReactNode }> = ({ initialOpen = false, title = "Default Modal Title", children }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  // Optionally sync with args if controls change isOpen
  useEffect(() => {
     setIsOpen(initialOpen);
  }, [initialOpen]);

  return (
    <>
      <Button onClick={openModal}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={closeModal} title={title}>
        {children}
      </Modal>
    </>
  );
};
 
// Default story using the wrapper
export const Default: Story = {
  args: {
    title: 'Information',
  },
  render: (args) => { // Let Storybook infer args type, provide defaults inside
    const initialOpen = args?.isOpen ?? false;
    const title = args?.title ?? 'Default Title';
    return (
      <ModalWrapper initialOpen={initialOpen} title={title}>
        <p>This is the content of the modal. You can put any React elements here.</p>
        <p>It will automatically close when you click outside or press Escape.</p>
        <div className="mt-4">
          <Button onClick={() => alert('Action performed!')}>Do Something</Button>
        </div>
      </ModalWrapper>
    );
  }
};
 
export const InitiallyOpen: Story = {
  args: {
    isOpen: true, 
    title: 'Already Open Modal',
  },
   render: (args) => { // Let Storybook infer args type
    const initialOpen = args?.isOpen ?? false;
    const title = args?.title ?? 'Default Title';
    return (
      <ModalWrapper initialOpen={initialOpen} title={title}>
          <p>This modal was open when the story loaded.</p>
      </ModalWrapper>
    );
  }
};

export const WithoutTitle: Story = {
  args: {
    isOpen: false,
    title: undefined, // Explicitly undefined
    children: 'This modal does not have an explicit title, but still has a close button.',
  },
  render: (args) => {
    const initialOpen = args?.isOpen ?? false;
    // Title defaults inside ModalWrapper if undefined
    return (
      <ModalWrapper initialOpen={initialOpen} title={args?.title}>
        <p>{args?.children}</p>
      </ModalWrapper>
    );
  }
};
 
export const LongContent: Story = {
  args: {
    isOpen: false,
    title: 'Modal with Long Content',
    children: (
      <>
        <p>This modal contains a lot of text to demonstrate scrolling behavior...</p>
        {/* Repeat paragraph or add more content */}
        <p>...</p> 
      </>
    ),
  },
  render: (args) => {
     const initialOpen = args?.isOpen ?? false;
     const title = args?.title ?? 'Default Title';
    return (
      <ModalWrapper initialOpen={initialOpen} title={title}>
         {args?.children}
      </ModalWrapper>
    );
  }
}; 