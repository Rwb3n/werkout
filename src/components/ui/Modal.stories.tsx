import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
 
import Modal from './Modal'; // Default import
import { Button } from './Button';
 
const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // isOpen and onClose are controlled by the story template
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
type Story = StoryObj<typeof meta>;
 
// Template to manage state
const ModalTemplate: Story = {
  render: (args) => {
    // Use state for isOpen, but control it via Storybook args if needed
    // For interactive stories, directly manipulating args might be better
    // But for simple display, internal state is easier here.
    const [isOpen, setIsOpen] = useState(args.isOpen); 

    // Update internal state if args change (e.g., from controls)
    React.useEffect(() => {
      setIsOpen(args.isOpen);
    }, [args.isOpen]);
 
    const openModal = () => setIsOpen(true);
    // Ensure the template's closeModal updates state AND calls any arg.onClose
    const closeModal = () => {
      setIsOpen(false);
      args.onClose(); // Call the onClose passed in args
    };
 
    return (
      <>
        {/* Button to open the modal when testing interactively */}
        {!isOpen && <Button onClick={openModal}>Open Modal</Button>}
        {/* Render the Modal with state and pass down other args */}
        <Modal {...args} isOpen={isOpen} onClose={closeModal} />
      </>
    );
  },
};
 
export const Default: Story = {
  ...ModalTemplate, // Use the template
  args: { // Override default args from meta if needed
    isOpen: false, // Start closed
    title: 'Default Modal Title',
    children: 'This is the content of the modal. You can put any React nodes here.',
  },
};
 
export const InitiallyOpen: Story = {
  ...ModalTemplate,
  args: {
    isOpen: true, // Start open
    title: 'Initially Open Modal',
    children: 'This modal started in an open state.',
  },
};

export const WithoutTitle: Story = {
  ...ModalTemplate,
  args: {
    isOpen: false,
    title: undefined, // Explicitly set title to undefined
    children: 'This modal does not have an explicit title, but still has a close button.',
  },
};
 
export const LongContent: Story = {
  ...ModalTemplate,
  args: {
    isOpen: false,
    title: 'Modal with Long Content',
    children: (
      <div className="space-y-4">
        <p>This modal demonstrates content that might cause scrolling.</p>
        {[...Array(15)].map((_, i) => (
          <p key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        ))}
      </div>
    ),
  },
}; 