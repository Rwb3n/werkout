import type { Meta, StoryObj } from '@storybook/react';
import { UserIcon, CogIcon, PowerIcon } from '@heroicons/react/20/solid'; // Example icons
import Dropdown from './Dropdown';
import { Button } from './Button'; // Assuming Dropdown uses Button for trigger

// Define the metadata for the Dropdown component stories
const meta: Meta<typeof Dropdown> = {
  title: 'UI/Dropdown',       // Title shown in Storybook sidebar
  component: Dropdown,        // The component being documented
  parameters: {
    layout: 'centered',    // Center the component in the Canvas view
  },
  tags: ['autodocs'],         // Enable automatic documentation generation
  // Define argTypes for controls if needed, e.g.:
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
  // Define default args if needed
  // args: { primary: true },
};

// Export the metadata as the default export
export default meta;

type Story = StoryObj<typeof meta>;

// Define sample items for reuse
const sampleItems = [
  {
    label: 'Profile',
    icon: UserIcon,
    onClick: () => alert('Profile clicked!'),
  },
  {
    label: 'Settings',
    icon: CogIcon,
    href: '#settings', // Example link
  },
  {
    label: 'Sign Out',
    icon: PowerIcon,
    onClick: () => alert('Sign Out clicked!'),
    disabled: false,
  },
  {
    label: 'Disabled Item',
    icon: PowerIcon,
    onClick: () => alert('Should not happen!'),
    disabled: true,
  },
];

// Define individual stories (named exports)

// Example Default Story
export const Default: Story = {
  args: {
    trigger: <Button>Open Dropdown</Button>,
    items: [
      { label: 'Profile', onClick: () => alert('Profile clicked') },
      { label: 'Settings', onClick: () => alert('Settings clicked') },
      { isSeparator: true },
      { label: 'Logout', onClick: () => alert('Logout clicked') },
    ],
  },
};

// Example Story with Different Content
export const WithIcons: Story = {
  args: {
    trigger: <Button>Options</Button>,
    items: [
      // Assuming items can accept icons, adjust Dropdown component if needed
      { label: 'Edit', onClick: () => alert('Edit clicked') },
      { label: 'Delete', onClick: () => alert('Delete clicked') },
    ],
  },
};

export const WithCustomButtonLabel: Story = {
  args: {
    buttonLabel: <span>Account Menu</span>,
    items: sampleItems,
  },
};

export const Empty: Story = {
  args: {
    buttonLabel: 'No Items',
    items: [],
  },
}; 